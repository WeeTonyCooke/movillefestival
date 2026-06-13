import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { ballDropEmail, bedPushEmail, craftFairEmail, sponsorshipEmail } from './email-templates.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
    let registration, emailHtml, to, subject;

    if (eventType === 'balldrop') {
      const { data, error } = await supabase
        .from('ball_drop_registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      registration = data;
      emailHtml = ballDropEmail(registration);
      to = registration.email;
      subject = 'Your Ball Drop numbers — Moville Summer Festival 2026';

    } else if (eventType === 'bedpush') {
      const { data, error } = await supabase
        .from('bed_push_registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      registration = data;
      emailHtml = bedPushEmail(registration);
      to = registration.email;
      subject = 'Your Bed Push Race entry is confirmed — Moville Summer Festival 2026';

    } else if (eventType === 'craftfair') {
      const { data, error } = await supabase
        .from('craft_fair_registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      registration = data;
      emailHtml = craftFairEmail(registration);
      to = registration.email;
      subject = 'Your Craft Fair stall is booked — Moville Summer Festival 2026';

    } else if (eventType === 'sponsorship') {
      const { data, error } = await supabase
        .from('sponsorship_registrations')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
      registration = data;
      emailHtml = sponsorshipEmail(registration);
      to = registration.email;
      subject = 'Thank you for sponsoring Moville Summer Festival 2026';

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
