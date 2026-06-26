import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ONLINE_DEFAULT = 700;

export async function handler() {
  try {
    const [availableResult, teamsRegistered, stallsBooked] = await Promise.all([
      supabase
        .from('ball_drop_balls')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available'),
      supabase
        .from('bed_push_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid'),
      supabase
        .from('craft_fair_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid'),

    ]);

    // Count only balls with status 'available' — these are the active online pool
    const ballsAvailable = availableResult.count || 0;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballsAvailable,
        teamsRegistered: teamsRegistered.count ?? 20,
        stallsBooked: stallsBooked.count ?? 15,
      }),
    };
  } catch (err) {
    console.error('Availability check error:', err);
    // Fail closed — block sales if DB is unreachable
    return {
      statusCode: 200,
      body: JSON.stringify({ ballsAvailable: 0, teamsRegistered: 20, stallsBooked: 15 }),
    };
  }
}
