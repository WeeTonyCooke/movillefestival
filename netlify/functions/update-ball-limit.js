import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOTAL_BALLS = 1200;
const PAPER_MAX = 500;
const ONLINE_BALL_START = 501;

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
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const val = parseInt(body.online_ball_limit, 10);
  if (isNaN(val) || val < 0 || val > (TOTAL_BALLS - PAPER_MAX)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Limit must be between 0 and ${TOTAL_BALLS - PAPER_MAX}` }),
    };
  }

  // Count online balls already sold (numbers >= ONLINE_BALL_START)
  const { count: soldCount, error: soldError } = await supabase
    .from('ball_drop_balls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sold')
    .gte('number', ONLINE_BALL_START);

  if (soldError) {
    console.error('update-ball-limit sold count error:', soldError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to check sold count' }) };
  }

  if (val < (soldCount || 0)) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: `Online limit cannot be lower than online balls already sold (${soldCount} sold).`,
        sold_online: soldCount,
      }),
    };
  }

  const { error } = await supabase
    .from('festival_config')
    .upsert({ key: 'online_ball_limit', value: String(val) }, { onConflict: 'key' });

  if (error) {
    console.error('update-ball-limit error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save limit' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, online_ball_limit: val, sold_online: soldCount }),
  };
}
