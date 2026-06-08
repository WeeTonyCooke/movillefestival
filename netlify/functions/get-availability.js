import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler() {
  try {
    const [ballsAvailable, teamsRegistered, stallsBooked] = await Promise.all([
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ballsAvailable: ballsAvailable.count ?? 700,
        teamsRegistered: teamsRegistered.count ?? 0,
        stallsBooked: stallsBooked.count ?? 0,
      }),
    };
  } catch (err) {
    console.error('Availability check error:', err);
    // On error, return generous counts so we don't block sales
    return {
      statusCode: 200,
      body: JSON.stringify({ ballsAvailable: 700, teamsRegistered: 0, stallsBooked: 0 }),
    };
  }
}
