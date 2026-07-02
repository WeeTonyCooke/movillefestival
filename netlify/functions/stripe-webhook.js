import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

export const config = {
  bodyParser: false,
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return { statusCode: 400, body: `Webhook error: ${err.message}` };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    console.log(`Event ignored: ${stripeEvent.type} (${stripeEvent.id})`);
    return { statusCode: 200, body: 'Event ignored' };
  }

  const session = stripeEvent.data.object;

  // festival_pass uses metadata.type; all other events use metadata.event
  const metaType  = session.metadata?.type;
  const metaEvent = session.metadata?.event;

  try {
    if (metaType === 'festival_pass') {
      await handleFestivalPass(session);
    } else if (metaEvent === 'craft_fair') {
      await handleCraftFair(session);
    } else if (metaEvent === 'bed_push') {
      await handleBedPush(session);
    } else if (metaEvent === 'ball_drop') {
      await handleBallDrop(session);
    } else if (metaEvent === 'sponsorship') {
      await handleSponsorship(session);
    } else {
      console.warn(`checkout.session.completed with unrecognised metadata — session ${session.id}`, session.metadata);
    }
  } catch (err) {
    // Idempotency checks in each handler (ball number allocation, pass ref
    // generation, confirmation_email_sent flags) make Stripe retries safe —
    // so a genuine unexpected exception should return 500, not a clean 200,
    // to trigger Stripe's automatic retry.
    console.error(`Unhandled exception processing session ${session.id}:`, err);
    return { statusCode: 500, body: 'Internal error — Stripe should retry' };
  }

  return { statusCode: 200, body: 'OK' };
}

// ─── Festival Pass ────────────────────────────────────────────────────────────

const PASS_REF_PREFIX = {
  festival_pass: 'MF-FEST',
  friday:        'MF-FRI',
  saturday:      'MF-SAT',
  sunday:        'MF-SUN',
};

const PASS_LABELS = {
  festival_pass: 'Moville Festival Pass',
  friday:        'Friday Day Pass',
  saturday:      'Saturday Day Pass',
  sunday:        'Sunday Day Pass',
};

const PASS_DATES = {
  festival_pass: '8–12 July 2026',
  friday:        '10 July 2026',
  saturday:      '11 July 2026',
  sunday:        '12 July 2026',
};

const PASS_STUB_COLOURS = {
  festival_pass: '#B8860B',
  friday:        '#6BAFA7',
  saturday:      '#F26A4B',
  sunday:        '#6B3FA0',
};

// Amount in cents by pass type — used for recovery inserts
const PASS_AMOUNT = {
  festival_pass: 2000,
  friday:        1000,
  saturday:      1000,
  sunday:        1000,
};

async function handleFestivalPass(session) {
  const { passType, fullName, email } = session.metadata;

  if (!passType || !fullName || !email) {
    console.error('Festival pass webhook: missing metadata', session.metadata);
    return;
  }

  // ── Idempotency ──────────────────────────────────────────────────────────
  // Use .maybeSingle() so a missing row returns null rather than an error.
  const { data: existing, error: lookupError } = await supabase
    .from('festival_passes')
    .select('id, status, pass_ref')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (lookupError) {
    console.error(`Festival pass lookup error (session ${session.id}):`, lookupError);
    return; // Fail loudly — do not proceed without a reliable DB read
  }

  if (existing?.status === 'paid') {
    console.log(`Pass already processed: ${session.id}`);
    return;
  }

  // ── Generate pass ref ────────────────────────────────────────────────────
  const { data: seqData, error: seqError } = await supabase.rpc('next_pass_seq');

  if (seqError || !seqData) {
    console.error(`Pass sequence error (session ${session.id}):`, seqError);
    return;
  }

  const seq     = String(seqData).padStart(4, '0');
  const prefix  = PASS_REF_PREFIX[passType] || 'MF';
  const passRef = `${prefix}-${seq}`;
  const viewToken = randomUUID();

  // ── Persist to DB ─────────────────────────────────────────────────────────
  // Two paths:
  //   A) Row exists (pending) → update to paid.
  //   B) Row missing (checkout DB insert failed) → insert a recovery row.
  //      We must write the ref BEFORE sending email so the view link resolves.
  let dbError;

  if (existing) {
    // Path A — normal case: pending row exists, mark it paid
    const { error } = await supabase
      .from('festival_passes')
      .update({ status: 'paid', pass_ref: passRef, view_token: viewToken })
      .eq('stripe_session_id', session.id);
    dbError = error;
  } else {
    // Path B — recovery: no row found, Stripe confirmed payment, insert now
    console.warn(`Festival pass: no pending row for session ${session.id} — inserting recovery row`);
    const { error } = await supabase
      .from('festival_passes')
      .insert({
        full_name:          fullName,
        email,
        pass_type:          passType,
        amount_paid:        PASS_AMOUNT[passType] || 1000,
        stripe_session_id:  session.id,
        status:             'paid',
        pass_ref:           passRef,
        view_token:         viewToken,
      });
    dbError = error;
  }

  if (dbError) {
    // Fail loudly — do NOT send email if ref wasn't saved; the view link would 404
    console.error(`Festival pass DB error (session ${session.id}, ref not saved — email suppressed):`, dbError);
    return;
  }

  // Send confirmation email
  const siteUrl     = process.env.URL || 'https://movillefestival.com';
  const passViewUrl = `${siteUrl}/passes/view?token=${encodeURIComponent(viewToken)}`;
  const stubColour  = PASS_STUB_COLOURS[passType] || '#1F4E5F';
  const passLabel   = PASS_LABELS[passType]       || 'Festival Pass';
  const passDate    = PASS_DATES[passType]         || '';
  const amountStr   = passType === 'festival_pass' ? '€20' : '€10';

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4E9D8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4E9D8;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <tr>
        <td style="background:#1F4E5F;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
          <p style="margin:0;font-size:26px;font-weight:700;color:#fff;font-family:Georgia,serif;">
            Moville Summer Festival 2026
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.65);letter-spacing:2px;text-transform:uppercase;">
            Your Pass Is Confirmed
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#fff;padding:40px;">
          <p style="margin:0 0 8px;font-size:16px;color:#333;">Hi ${escapeHtml(fullName)},</p>
          <p style="margin:0 0 28px;font-size:16px;color:#333;line-height:1.6;">
            Thanks for your purchase. Tap the button below to view your festival pass.
            Show that pass at the entrance for scanning.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid #eee;">
            <tr>
              <td style="background:${stubColour};padding:18px 24px;">
                <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                  ${passLabel}
                </p>
                <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">${escapeHtml(fullName)}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f9f9;padding:14px 24px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <p style="margin:0 0 2px;font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Date</p>
                      <p style="margin:0;font-size:14px;font-weight:600;color:#1F4E5F;">${passDate}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0 0 2px;font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Pass Ref</p>
                      <p style="margin:0;font-size:17px;font-weight:800;color:#1F4E5F;letter-spacing:1.5px;">${passRef}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            <tr>
              <td align="center">
                <a href="${passViewUrl}"
                   style="display:inline-block;padding:18px 48px;background:#1F4E5F;color:#fff;
                          text-decoration:none;font-size:17px;font-weight:700;border-radius:10px;
                          letter-spacing:0.5px;">
                  View Your Pass &rarr;
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 28px;font-size:13px;color:#888;text-align:center;line-height:1.6;">
            Opens your pass with QR code — ready to scan at the entrance.<br>
            Bookmark it or keep this email so you can open it on the day.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">

          <p style="margin:0 0 8px;font-size:13px;color:#777;line-height:1.6;">
            <strong>Passes are required for ages 16 and over.</strong> Under 16s enter free and do not need a pass.
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#777;line-height:1.6;">
            <strong>The name on this pass must match the person attending.</strong> Passes are not transferable.
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#777;line-height:1.6;">
            <strong>Each pass admits one person.</strong> If others are joining you,
            each person needs their own pass purchased separately.
          </p>
          <p style="margin:0 0 20px;font-size:13px;color:#777;line-height:1.6;">
            Passes are non-refundable unless the event is cancelled by the organisers.
          </p>
          <p style="margin:0;font-size:13px;color:#777;">
            Amount paid: <strong>${amountStr}</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#1F4E5F;padding:24px 40px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);">
            Moville Summer Festival 2026 · movillefestival.com
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.35);">
            Problems with your pass? Email movillefestival@gmail.com
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: 'Moville Festival <noreply@movillefestival.com>',
      to: email,
      subject: `Your ${passLabel} — Moville Summer Festival 2026`,
      html: emailHtml,
    });

    await supabase
      .from('festival_passes')
      .update({ confirmation_email_sent: true })
      .eq('stripe_session_id', session.id);

    console.log(`Pass confirmed: ${passRef} for ${email}`);
  } catch (err) {
    console.error(`Festival pass email error (${passRef}, ${email}):`, err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─── Craft Fair ───────────────────────────────────────────────────────────────

async function handleCraftFair(session) {
  const registrationId = session.metadata?.registration_id;
  if (!registrationId) return;

  const { data: registration, error } = await supabase
    .from('craft_fair_registrations')
    .update({ status: 'paid' })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) { console.error(`Craft Fair update error (registration ${registrationId}):`, error); return; }

  if (registration.confirmation_email_sent) {
    console.log('Confirmation email already sent for', registrationId);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: registration.email,
      subject: 'Your Craft Fair stall is booked — Moville Summer Festival 2026',
      html: craftFairEmail(registration),
    });
    await supabase
      .from('craft_fair_registrations')
      .update({ confirmation_email_sent: true })
      .eq('id', registrationId);
  } catch (err) {
    console.error(`Craft Fair email error (registration ${registrationId}):`, err);
  }
}

async function handleBedPush(session) {
  const registrationId = session.metadata?.registration_id;
  if (!registrationId) return;

  const { data: registration, error } = await supabase
    .from('bed_push_registrations')
    .update({ status: 'paid' })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) { console.error(`Bed Push update error (registration ${registrationId}):`, error); return; }

  if (registration.confirmation_email_sent) {
    console.log('Confirmation email already sent for', registrationId);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: registration.email,
      subject: 'Your Bed Push Race entry is confirmed — Moville Summer Festival 2026',
      html: bedPushEmail(registration),
    });
    await supabase
      .from('bed_push_registrations')
      .update({ confirmation_email_sent: true })
      .eq('id', registrationId);
  } catch (err) {
    console.error(`Bed Push email error (registration ${registrationId}):`, err);
  }
}

async function handleBallDrop(session) {
  const registrationId = session.metadata?.registration_id;
  const quantity = parseInt(session.metadata?.quantity || '1', 10);
  if (!registrationId) return;

  const { data: existing, error: fetchError } = await supabase
    .from('ball_drop_registrations')
    .select('status, ball_numbers')
    .eq('id', registrationId)
    .single();

  if (fetchError) {
    console.error(`Ball Drop fetch error (registration ${registrationId}):`, fetchError);
    return;
  }

  if (existing.status === 'paid' && existing.ball_numbers && existing.ball_numbers.length > 0) {
    console.log('Ball Drop already processed for', registrationId, '— skipping allocation');
    return;
  }

  const { data: ballNumbers, error: claimError } = await supabase
    .rpc('claim_ball_numbers', {
      p_quantity: quantity,
      p_registration_id: registrationId,
    });

  if (claimError || !ballNumbers || ballNumbers.length < quantity) {
    console.error(`Ball allocation error (registration ${registrationId}):`, claimError);
    return;
  }

  const { data: registration, error: updateRegError } = await supabase
    .from('ball_drop_registrations')
    .update({ status: 'paid', ball_numbers: ballNumbers })
    .eq('id', registrationId)
    .select()
    .single();

  if (updateRegError) {
    console.error(`Ball Drop registration update error (registration ${registrationId}):`, updateRegError);
    return;
  }

  if (registration.confirmation_email_sent) {
    console.log('Confirmation email already sent for', registrationId);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: registration.email,
      subject: 'Your Ball Drop numbers — Moville Summer Festival 2026',
      html: ballDropEmail(registration),
    });
    await supabase
      .from('ball_drop_registrations')
      .update({ confirmation_email_sent: true })
      .eq('id', registrationId);
  } catch (err) {
    console.error(`Ball Drop email error (registration ${registrationId}):`, err);
  }
}

async function handleSponsorship(session) {
  const registrationId = session.metadata?.registration_id;
  if (!registrationId) return;

  const { data: sponsorship, error } = await supabase
    .from('sponsorship_registrations')
    .update({ status: 'paid' })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) { console.error(`Sponsorship update error (registration ${registrationId}):`, error); return; }

  if (sponsorship.confirmation_email_sent) {
    console.log('Confirmation email already sent for', registrationId);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: sponsorship.email,
      subject: 'Thank you for sponsoring Moville Summer Festival 2026',
      html: sponsorshipEmail(sponsorship),
    });
    await supabase
      .from('sponsorship_registrations')
      .update({ confirmation_email_sent: true })
      .eq('id', registrationId);
  } catch (err) {
    console.error(`Sponsorship email error (registration ${registrationId}):`, err);
  }
}

// ─── Email templates (unchanged from original) ────────────────────────────────

function ballDropEmail(registration) {
  const name = escapeHtml(registration.full_name);
  const numbers = registration.ball_numbers || [];
  const numbersList = numbers.map(n =>
    `<span style="display:inline-block; background:#1F4E5F; color:#fff; font-weight:bold; font-size:22px; padding:10px 16px; border-radius:6px; margin:4px;">${n}</span>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Ball Drop &middot; Sunday 12 July &middot; Festival Square</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">You're in the Ball Drop!</h2>
        <p>Hi ${name},</p>
        <p>Payment confirmed. Here are your ball number${numbers.length > 1 ? 's' : ''}:</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 24px 20px; margin: 24px 0; text-align: center;">
          <div style="margin-bottom: 12px;">${numbersList}</div>
          <p style="margin: 12px 0 0; font-size: 13px; color: #666;">Keep these safe — the committee will contact winners directly after the draw.</p>
        </div>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Entry</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${numbers.length} ball${numbers.length > 1 ? 's' : ''}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€${(registration.amount_paid / 100).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Event</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Festival Square · Sunday 12 July</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">5.30pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Prizes</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">1st €500 &middot; 2nd €300 &middot; 3rd €150</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>You don't need to be present to win</strong>
          <p style="margin: 4px 0 0;">If your ball is a winner, the festival committee will contact you directly using the details you provided.</p>
        </div>
        <p>Good luck on 12 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

function craftFairEmail(registration) {
  const name = escapeHtml(registration.full_name);
  const business = escapeHtml(registration.business_name);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Craft Fair &middot; Saturday 11 July &middot; Festival Square</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">Your stall is booked!</h2>
        <p>Hi ${name},</p>
        <p>Payment confirmed. Your stall at the Moville Summer Festival Craft Fair is secured.</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your booking</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Stallholder</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${name}</td></tr>
            ${business ? `<tr><td style="padding: 6px 0; color: #666;">Business</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${business}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€20.00</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Saturday 11 July 2026</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Fair opens</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">10am – 2pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Setup from</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">9am</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Venue</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Marquee, Festival Square</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>WhatsApp group</strong>
          <p style="margin: 4px 0 0;">You'll be added to a WhatsApp group with all stallholders for event updates closer to the day.</p>
        </div>
        <div style="border-left: 4px solid #6BAFA7; padding: 12px 16px; margin: 16px 0; background: #f5fafa;">
          <strong>What to know on the day</strong>
          <p style="margin: 4px 0 0;">A 6ft trestle table will be provided. Please note that electricity is not available at this event.</p>
        </div>
        <p>We look forward to seeing you on 11 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

function bedPushEmail(registration) {
  const captain = escapeHtml(registration.captain_name);
  const team = escapeHtml(registration.team_name);
  const org = escapeHtml(registration.organisation);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Bed Push Race &middot; Wednesday 8 July &middot; Quay Street</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">You're registered!</h2>
        <p>Hi ${captain},</p>
        <p>Payment confirmed. Your spot in the Great Bed Push Race is secured.</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your entry</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Team</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${team}</td></tr>
            ${org ? `<tr><td style="padding: 6px 0; color: #666;">Organisation</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${org}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Captain</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${captain}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€50.00</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Wednesday 8 July 2026</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Start time</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">6pm for 6.30pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Venue</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Festival Square &amp; Quay Street</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>Arrive from 6pm. Scrutineering starts at 6.30pm sharp — Festival Square</strong>
          <p style="margin: 4px 0 0;">All beds must pass inspection by Paddy and Paddy before the race. No helmet = no race. Don't be late.</p>
        </div>
        <p>See you on Quay Street on 8 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

function sponsorshipEmail(s) {
  const amount = `€${(s.amount_paid / 100).toFixed(0)}`;
  const business = escapeHtml(s.business_name);
  const contact = escapeHtml(s.contact_name);
  const receiptRef = s.stripe_session_id ? s.stripe_session_id.slice(-8).toUpperCase() : 'N/A';
  const date = new Date(s.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Moville Summer Festival 2026</h1>
        <p style="color: #6BAFA7; margin: 6px 0 0;">8–12 July · Moville, Co. Donegal</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #1F4E5F; margin-top: 0;">Sponsorship Receipt</h2>
        <p>Hi ${contact}, thank you so much for sponsoring Moville Summer Festival 2026. This email is your receipt — we really appreciate your support and it means a lot to the community.</p>
        <div style="background: #f9f6f2; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #F26A4B;">
          <p style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Receipt details</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Receipt ref</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${receiptRef}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Date</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${date}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Sponsor</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${business}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Description</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">Sponsorship — Moville Summer Festival 2026</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Payment method</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">Card</td></tr>
            <tr><td style="padding: 7px 0; color: #666; font-weight: bold; font-size: 15px;">Amount paid</td><td style="padding: 7px 0; font-weight: bold; text-align: right; font-size: 15px; color: #1F4E5F;">${amount}</td></tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #666;">Foyle Festival Committee · movillefestival.com</p>
        <p style="font-size: 13px;">Questions? <a href="mailto:movillefestival@gmail.com" style="color: #1F4E5F;">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}
