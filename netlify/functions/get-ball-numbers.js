import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  try {
    const { data, error } = await supabase
      .from('ball_drop_registrations')
      .select('full_name, email, ball_numbers, quantity, amount_paid')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error || !data) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        fullName: data.full_name,
        email: data.email,
        ballNumbers: data.ball_numbers || [],
        quantity: data.quantity,
        amountPaid: data.amount_paid,
      }),
    };
  } catch (err) {
    console.error('Get ball numbers error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
}
