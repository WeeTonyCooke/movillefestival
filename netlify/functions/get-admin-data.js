import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'moville2026';

export async function handler(event) {
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }
  try {
    const [ballDrop, bedPush, craftFair, ballsAvailable] = await Promise.all([
      supabase.from('ball_drop_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('bed_push_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('craft_fair_registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballDrop: ballDrop.data || [],
        bedPush: bedPush.data || [],
        craftFair: craftFair.data || [],
        ballsRemaining: ballsAvailable.count || 0,
      }),
    };
  } catch (err) {
    console.error('Admin data error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load data' }) };
  }
}
