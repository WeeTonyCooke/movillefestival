import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ONLINE_DEFAULT = 700;

export async function handler(event) {
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }
  try {
    const [
      ballDrop,
      bedPush,
      craftFair,
      sponsorships,
      passes,
      ballsSoldResult,
      availableBallNumbers,
      configResult,
    ] = await Promise.all([
      supabase.from('ball_drop_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('bed_push_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('craft_fair_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('sponsorship_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('festival_passes').select('*').order('created_at', { ascending: false }),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('ball_drop_balls').select('ball_number').eq('status', 'available').order('ball_number', { ascending: true }),
      supabase.from('festival_config').select('value').eq('key', 'online_ball_limit').single(),
    ]);

    const onlineBallLimit = configResult.data?.value
      ? parseInt(configResult.data.value, 10)
      : ONLINE_DEFAULT;

    const allAvailableNumbers = (availableBallNumbers.data || []).map(r => r.ball_number);

    // Available numbers are those within the current online limit
    // Online balls are numbered 501–1200; the limit controls how many of those are open for sale.
    // We surface only ball numbers <= 500 + onlineBallLimit (i.e. within the active online allocation).
    const limitCeiling = 500 + onlineBallLimit;
    const availableWithinLimit = allAvailableNumbers.filter(n => n <= limitCeiling);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballDrop:             ballDrop.data             || [],
        bedPush:              bedPush.data              || [],
        craftFair:            craftFair.data            || [],
        sponsorships:         sponsorships.data         || [],
        passes:               passes.data               || [],
        ballsRemaining:       availableWithinLimit.length,
        ballsSold:            ballsSoldResult.count      || 0,
        onlineBallLimit,
        availableBallNumbers: availableWithinLimit,
      }),
    };
  } catch (err) {
    console.error('Admin data error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load data' }) };
  }
}
