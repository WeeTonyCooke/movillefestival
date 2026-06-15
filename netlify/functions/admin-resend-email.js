import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { ballDropEmail, bedPushEmail, craftFairEmail, sponsorshipEmail } from './email-templates.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ── Pass email constants (mirrors stripe-webhook.js) ────────────────────────
const PASS_LABELS = {
  festival_pass: 'Moville Festival Pass',
  friday:        'Friday Day Pass',
  saturday:      'Saturday Day Pass',
  sunday:        'Sunday Day Pass',
};

const PASS_DATES = {
  festival_pass: '8\u201312 July 2026',
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildPassEmail({ full_name, pass_type, pass_ref, amount_paid, view_token }) {
  const siteUrl     = process.env.URL || 'https://movillefestival.com';
  const passViewUrl = view_token
    ? `${siteUrl}/passes/view?token=${encodeURIComponent(view_token)}`
    : `${siteUrl}/passes/view?ref=${encodeURIComponent(pass_ref)}`;
  const stubColour  = PASS_STUB_COLOURS[pass_type] || '#1F4E5F';
  const passLabel   = PASS_LABELS[pass_type]       || 'Festival Pass';
  const passDate    = PASS_DATES[pass_type]         || '';
  const amountStr   = `\u20ac${((amount_paid || 0) / 100).toFixed(0)}`;

  return `<!DOCTYPE html>
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
          <p style="margin:0 0 8px;font-size:16px;color:#333;">Hi ${escapeHtml(full_name)},</p>
          <p style="margin:0 0 28px;font-size:16px;color:#333;line-height:1.6;">
            Thanks for your purchase. Tap the button below to view your festival pass.
            Show that pass at the gate for scanning.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid #eee;">
            <tr>
              <td style="background:${stubColour};padding:18px 24px;">
                <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                  ${passLabel}
                </p>
                <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">${escapeHtml(full_name)}</p>
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
                      <p style="margin:0;font-size:17px;font-weight:800;color:#1F4E5F;letter-spacing:1.5px;">${pass_ref}</p>
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
            Opens your pass with QR code &mdash; ready to scan at the gate.<br>
            Bookmark it or keep this email so you can open it on the day.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
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
            Moville Summer Festival 2026 &middot; movillefestival.com
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
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { event: eventType, id } = body;

  if (!eventType || !id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing event or id' }) };
  }

  try {
    let emailHtml, to, subject;

    if (eventType === 'balldrop') {
      const { data, error } = await supabase.from('ball_drop_registrations').select('*').eq('id', id).single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      emailHtml = ballDropEmail(data);
      to = data.email;
      subject = 'Your Ball Drop numbers \u2014 Moville Summer Festival 2026';

    } else if (eventType === 'bedpush') {
      const { data, error } = await supabase.from('bed_push_registrations').select('*').eq('id', id).single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      emailHtml = bedPushEmail(data);
      to = data.email;
      subject = 'Your Bed Push Race entry is confirmed \u2014 Moville Summer Festival 2026';

    } else if (eventType === 'craftfair') {
      const { data, error } = await supabase.from('craft_fair_registrations').select('*').eq('id', id).single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      emailHtml = craftFairEmail(data);
      to = data.email;
      subject = 'Your Craft Fair stall is booked \u2014 Moville Summer Festival 2026';

    } else if (eventType === 'sponsorship') {
      const { data, error } = await supabase.from('sponsorship_registrations').select('*').eq('id', id).single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      emailHtml = sponsorshipEmail(data);
      to = data.email;
      subject = 'Thank you for sponsoring Moville Summer Festival 2026';

    } else if (eventType === 'festival_pass') {
      // Only resend for paid passes — never for pending rows
      const { data, error } = await supabase
        .from('festival_passes')
        .select('*')
        .eq('id', id)
        .eq('status', 'paid')  // Guard: refuse to resend for unpaid/pending passes
        .single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Paid pass not found' }) };
      if (!data.pass_ref) return { statusCode: 422, body: JSON.stringify({ error: 'Pass reference missing — cannot resend' }) };
      emailHtml = buildPassEmail(data);
      to = data.email;
      subject = `Your ${PASS_LABELS[data.pass_type] || 'Festival Pass'} \u2014 Moville Summer Festival 2026`;

      // Mark resend in DB for audit trail
      await supabase
        .from('festival_passes')
        .update({ confirmation_email_sent: true })
        .eq('id', id);

    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown event type' }) };
    }

    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to,
      subject,
      html: emailHtml,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, sentTo: to }),
    };

  } catch (err) {
    console.error('Resend email error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) };
  }
}
