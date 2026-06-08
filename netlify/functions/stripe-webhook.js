import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const eventType = session.metadata?.event;

    if (eventType === 'craft_fair') {
      await handleCraftFair(session);
    } else if (eventType === 'bed_push') {
      await handleBedPush(session);
    }
  }

  return { statusCode: 200, body: 'OK' };
}

async function handleCraftFair(session) {
  const registrationId = session.metadata?.registration_id;
  if (!registrationId) return;

  const { data: registration, error } = await supabase
    .from('craft_fair_registrations')
    .update({ status: 'paid' })
    .eq('id', registrationId)
    .select()
    .single();

  if (error) { console.error('Craft Fair update error:', error); return; }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: registration.email,
      subject: 'Your Craft Fair stall is booked — Moville Summer Festival 2026',
      html: craftFairEmail(registration),
    });
  } catch (err) {
    console.error('Craft Fair email error:', err);
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

  if (error) { console.error('Bed Push update error:', error); return; }

  try {
    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: registration.email,
      subject: 'Your Bed Push Race entry is confirmed — Moville Summer Festival 2026',
      html: bedPushEmail(registration),
    });
  } catch (err) {
    console.error('Bed Push email error:', err);
  }
}

function craftFairEmail(registration) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">Moville Summer Festival 2026</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">Your stall is booked!</h2>
        <p>Hi ${registration.full_name},</p>
        <p>Payment confirmed. Your stall at the Moville Summer Festival Craft Fair is secured.</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your booking</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Stallholder</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${registration.full_name}</td></tr>
            ${registration.business_name ? `<tr><td style="padding: 6px 0; color: #666;">Business</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${registration.business_name}</td></tr>` : ''}
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
          <strong>A reminder on the day</strong>
          <p style="margin: 4px 0 0;">A 6ft trestle table will be provided. Please note that electricity is not available at this event.</p>
        </div>
        <p>Questions? Contact Rona at <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.</p>
        <p>We look forward to seeing you on 11 July!</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 · movillefestival.com · movillefestival@gmail.com
      </div>
    </div>
  `;
}

function bedPushEmail(registration) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">Moville Summer Festival 2026</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">You're registered!</h2>
        <p>Hi ${registration.captain_name},</p>
        <p>Payment confirmed. Your spot in the Great Bed Push Race is secured. See you on Quay Street!</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your entry</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Team</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${registration.team_name}</td></tr>
            ${registration.organisation ? `<tr><td style="padding: 6px 0; color: #666;">Organisation</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${registration.organisation}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Captain</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${registration.captain_name}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€50.00</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Wednesday 8 July 2026</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Start time</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">6pm for 6.30pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Venue</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Festival Square &amp; Quay Street</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>🔴 Scrutineering at 6pm sharp — Festival Square</strong>
          <p style="margin: 4px 0 0;">All beds must pass inspection by Paddy and Paddy before the race. No helmet = no race. Don't be late.</p>
        </div>
        <p>Questions? Contact us at <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.</p>
        <p>We look forward to seeing you on 8 July!</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 · movillefestival.com · movillefestival@gmail.com
      </div>
    </div>
  `;
}
