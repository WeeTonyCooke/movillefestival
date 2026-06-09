import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STALL_FEE_CENTS = 2000; // €20.00
const MAX_STALLS = 15;

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

  const { fullName, email, phone, businessName, products, socialMediaConsent } = body;

  // Validate required fields
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fullName || !email || !emailRe.test(email) || !phone || !products) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  if (products.length > 500) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Products description must be 500 characters or fewer' })
    };
  }

  try {
    // Check capacity before proceeding — count both paid and pending to prevent oversell
    const { count, error: countError } = await supabase
      .from('craft_fair_registrations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['paid', 'pending']);

    if (countError) throw countError;

    if (count >= MAX_STALLS) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'sold_out', message: 'All stalls are taken' })
      };
    }

    // Create pending registration
    const { data: registration, error: insertError } = await supabase
      .from('craft_fair_registrations')
      .insert({
        full_name: fullName,
        email,
        phone,
        business_name: businessName || null,
        products,
        social_media_consent: socialMediaConsent || false,
        status: 'pending',
        amount_paid: STALL_FEE_CENTS
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Moville Festival Craft Fair — Stall Booking',
              description: `Stall booking for ${businessName || fullName} · Saturday 11 July 2026`,
            },
            unit_amount: STALL_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration_id: registration.id,
        event: 'craft_fair',
        full_name: fullName,
        business_name: businessName || '',
      },
      success_url: `${process.env.URL || 'https://movillefestival.com'}/craft-fair?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://movillefestival.com'}/craft-fair?status=cancelled`,
    });

    // Save session ID to registration
    await supabase
      .from('craft_fair_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', registration.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error('Checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
}
