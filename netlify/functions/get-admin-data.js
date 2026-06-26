import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ONLINE_DEFAULT = 700;
const ONLINE_START = 501;

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
      soldOnlineResult,
      availableOnlineResult,
      manualOnlineResult,
      availableBallNumbers,
      soldBallNumbersResult,
      configResult,
    ] = await Promise.all([
      supabase.from('ball_drop_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('bed_push_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('craft_fair_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('sponsorship_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('festival_passes').select('*').order('created_at', { ascending: false }),
      // Online sold: status=sold, number >= 501
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'sold').gte('number', ONLINE_START),
      // Online available: status=available (all available balls are online pool)
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      // Released for manual sale: status=manual, number >= 501 (excludes original paper 1-500)
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'manual').gte('number', ONLINE_START),
      // Full list of available ball numbers for export
      supabase.from('ball_drop_balls').select('number').eq('status', 'available').order('number', { ascending: true }),
      // Full list of sold ball numbers for export
      supabase.from('ball_drop_balls').select('number').eq('status', 'sold').gte('number', 501).order('number', { ascending: true }),
      supabase.from('festival_config').select('value').eq('key', 'online_ball_limit').single(),
    ]);

    const onlineBallLimit = configResult.data?.value
      ? parseInt(configResult.data.value, 10)
      : ONLINE_DEFAULT;

    const soldOnline = soldOnlineResult.count || 0;
    const availableOnline = availableOnlineResult.count || 0;
    const releasedForManual = manualOnlineResult.count || 0;
    const availableBallNumbersList = (availableBallNumbers.data || []).map(r => r.number);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballDrop:             ballDrop.data      || [],
        bedPush:              bedPush.data       || [],
        craftFair:            craftFair.data     || [],
        sponsorships:         sponsorships.data  || [],
        passes:               passes.data        || [],
        // Ball drop inventory
        onlineBallLimit,
        soldOnline,
        availableOnline,
        releasedForManual,
        // Legacy fields for backwards compatibility
        ballsRemaining:       availableOnline,
        ballsSold:            soldOnline,
        availableBallNumbers: availableBallNumbersList,
        soldBallNumbers: (soldBallNumbersResult.data || []).map(r => r.number),
      }),
    };
  } catch (err) {
    console.error('Admin data error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load data' }) };
  }
}
