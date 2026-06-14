// netlify/functions/create-pass-checkout.js
// Creates a Stripe hosted checkout session for a single festival pass.
// One pass per transaction — enforced here and communicated on the purchase page.

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PASS_CONFIG = {
  festival_pass: {
    label: 'Moville Festival Pass',
    subtitle: '8–12 July 2026 — Full Festival',
    price: 2000, // cents
  },
  friday: {
    label: 'Friday Day Pass',
    subtitle: '10 July 2026',
    price: 1000,
  },
  saturday: {
    label: 'Saturday Day Pass',
    subtitle: '11 July 2026',
    price: 1000,
  },
  sunday: {
    label: 'Sunday Day Pass',
    subtitle: '12 July 2026',
    price: 1000,
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { passType, fullName, email } = body;

  if (!passType || !fullName || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'passType, fullName and email are required' }),
    };
  }

  const config = PASS_CONFIG[passType];
  if (!config) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unknown pass type: ${passType}` }),
    };
  }

  const siteUrl = process.env.URL || 'https://movillefestival.com';

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: config.label,
              description: config.subtitle,
            },
            unit_amount: config.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        type: 'festival_pass',
        passType,
        fullName,
        email,
      },
      success_url: `${siteUrl}/passes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/passes`,
    });

    // Insert pending row — webhook will update to paid on completion
    const { error: dbError } = await supabase.from('festival_passes').insert({
      full_name: fullName,
      email,
      pass_type: passType,
      amount_paid: config.price,
      stripe_session_id: session.id,
      status: 'pending',
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      // Don't block the user — the webhook will still fire
      // but log so we can investigate
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('create-pass-checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};
