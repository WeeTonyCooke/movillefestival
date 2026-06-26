import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICE_SINGLE = 500;   // €5.00
const PRICE_BUNDLE = 2000;  // €20.00
const TOTAL_ONLINE_BALLS = 700;

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

  const { fullName, email, phone, quantity } = body;
  const qty = parseInt(quantity, 10);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fullName || !email || !emailRe.test(email) || ![1, 5].includes(qty)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing or invalid fields' })
    };
  }

  try {
    // Check availability — only balls with status 'available' are in the online pool
    const { count, error: countError } = await supabase
      .from('ball_drop_balls')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    if (countError) throw countError;

    if (count < qty) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'sold_out', message: 'Not enough balls remaining' })
      };
    }

    const amountPaid = qty === 5 ? PRICE_BUNDLE : PRICE_SINGLE;

    // Create pending registration
    const { data: registration, error: insertError } = await supabase
      .from('ball_drop_registrations')
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        quantity: qty,
        amount_paid: amountPaid,
        status: 'pending',
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
              name: qty === 5
                ? 'Moville Festival Ball Drop — 5 Balls'
                : 'Moville Festival Ball Drop — 1 Ball',
              description: `Ball Drop · Festival Square · Sunday 12 July 2026`,
            },
            unit_amount: amountPaid,
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration_id: registration.id,
        event: 'ball_drop',
        full_name: fullName,
        quantity: qty.toString(),
      },
      success_url: `${process.env.URL || 'https://movillefestival.com'}/ball-drop?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://movillefestival.com'}/ball-drop?status=cancelled`,
    });

    // Save session ID
    await supabase
      .from('ball_drop_registrations')
      .update({ stripe_session_id: session.id })
      .eq('id', registration.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };

  } catch (err) {
    console.error('Ball Drop checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
}
