import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ONLINE_DEFAULT = 700;

export async function handler() {
  try {
    const [ballsAllocated, teamsRegistered, stallsBooked, configResult] = await Promise.all([
      supabase
        .from('ball_drop_balls')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'allocated'),
      supabase
        .from('bed_push_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid'),
      supabase
        .from('craft_fair_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid'),
      supabase
        .from('festival_config')
        .select('value')
        .eq('key', 'online_ball_limit')
        .single(),
    ]);

    const onlineBallLimit = configResult.data?.value
      ? parseInt(configResult.data.value, 10)
      : ONLINE_DEFAULT;

    const sold = ballsAllocated.count ?? 0;
    const ballsAvailable = Math.max(0, onlineBallLimit - sold);

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
