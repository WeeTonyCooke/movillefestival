import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
      ballsAvailable,
      ballsSoldResult,
    ] = await Promise.all([
      supabase.from('ball_drop_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('bed_push_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('craft_fair_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('sponsorship_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('festival_passes').select('*').order('created_at', { ascending: false }),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballDrop:       ballDrop.data       || [],
        bedPush:        bedPush.data        || [],
        craftFair:      craftFair.data      || [],
        sponsorships:   sponsorships.data   || [],
        passes:         passes.data         || [],
        ballsRemaining: ballsAvailable.count || 0,
        ballsSold:      ballsSoldResult.count || 0,
      }),
    };
  } catch (err) {
    console.error('Admin data error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load data' }) };
  }
}
