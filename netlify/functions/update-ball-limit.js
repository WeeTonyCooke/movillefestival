import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOTAL_BALLS = 1200;
const PAPER_MAX = 500;

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

  // Check if already locked
  const { data: lockData } = await supabase
    .from('festival_config')
    .select('value')
    .eq('key', 'online_ball_limit_locked_at')
    .single();

  if (lockData?.value) {
    return {
      statusCode: 409,
      body: JSON.stringify({ error: 'Limit already set and locked', locked_at: lockData.value }),
    };
  }

  const lockedAt = new Date().toISOString();

  const { error } = await supabase
    .from('festival_config')
    .upsert({ key: 'online_ball_limit', value: String(val) }, { onConflict: 'key' });

  if (error) {
    console.error('update-ball-limit error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save limit' }) };
  }

  const { error: lockError } = await supabase
    .from('festival_config')
    .upsert({ key: 'online_ball_limit_locked_at', value: lockedAt }, { onConflict: 'key' });

  if (lockError) {
    console.error('update-ball-limit lock error:', lockError);
    // Limit saved but lock failed — not fatal, log and continue
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, online_ball_limit: val, locked_at: lockedAt }),
  };
}
