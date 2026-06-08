import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        customerName: session.customer_details?.name || '',
        customerEmail: session.customer_email || session.customer_details?.email || '',
        amountTotal: session.amount_total,
        businessName: session.metadata?.business_name || '',
      }),
    };
  } catch (err) {
    console.error('Session retrieval error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve session' }),
    };
  }
}
