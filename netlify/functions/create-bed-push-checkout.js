import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ENTRY_FEE_CENTS = 5000; // €50.00
const MAX_TEAMS = 20;

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

  const { teamName, organisation, captainName, email, phone } = body;

  if (!teamName || !captainName || !email || !phone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  try {
    // Check capacity — count both paid and pending to prevent oversell
    const { count, error: countError } = await supabase
      .from('bed_push_registrations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['paid', 'pending']);

    if (countError) throw countError;

    if (count >= MAX_TEAMS) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'full', message: 'All 20 teams are entered' })
      };
    }

    // Create pending registration
    const { data: registration, error: insertError } = await supabase
      .from('bed_push_registrations')
      .insert({
        team_name: teamName,
        organisation: organisation || null,
        captain_name: captainName,
        email,
        phone,
        status: 'pending',
        amount_paid: ENTRY_FEE_CENTS
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
              name: 'Moville Festival Bed Push Race — Team Entry',
              description: `Team: ${teamName} · Wednesday 8 July 2026`,
            },
            unit_amount: ENTRY_FEE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        registration_id: registration.id,
        event: 'bed_push',
        team_name: teamName,
        captain_name: captainName,
      },
      success_url: `${process.env.URL || 'https://movillefestival.com'}/bed-push?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'https://movillefestival.com'}/bed-push?status=cancelled`,
    });

    // Save session ID
    await supabase
      .from('bed_push_registrations')
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
