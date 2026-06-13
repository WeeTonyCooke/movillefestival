import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { businessName, contactName, email, phone, amountCents, message, socialMediaConsent } = body;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!businessName || !contactName || !email || !emailRe.test(email) || !amountCents) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  if (amountCents < 1000) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Minimum donation is €10' })
    };
  }

  try {
    // Create pending sponsorship record
    const { data: sponsorship, error: insertError } = await supabase
      .from('sponsorship_registrations')
      .insert({
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
        amount_paid: amountCents,
        message: message || null,
        social_media_consent: socialMediaConsent || false,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const amountEuros = (amountCents / 100).toFixed(0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Moville Summer Festival 2026 — Sponsorship',
              description: `Sponsorship from ${businessName}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration_id: sponsorship.id,
        event: 'sponsorship',
        business_name: businessName,
        contact_name: contactName,
      },
      success_url: `${process.env.URL || 'https://movillefestival.com'}/sponsorship?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://movillefestival.com'}/sponsorship?status=cancelled`,
    });

    await supabase
      .from('sponsorship_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', sponsorship.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error('Sponsorship checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
}
