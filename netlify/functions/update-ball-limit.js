import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOTAL_BALLS = 1200;
const PAPER_MAX = 500;
const ONLINE_START = 501;

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

  const newLimit = parseInt(body.online_ball_limit, 10);
  if (isNaN(newLimit) || newLimit < 0 || newLimit > (TOTAL_BALLS - PAPER_MAX)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Limit must be between 0 and ${TOTAL_BALLS - PAPER_MAX}` }),
    };
  }

  // Count online balls already sold (501–1200, status = 'sold')
  const { count: soldCount, error: soldError } = await supabase
    .from('ball_drop_balls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sold')
    .gte('number', ONLINE_START);

  if (soldError) {
    console.error('update-ball-limit sold count error:', soldError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to check sold count' }) };
  }

  const sold = soldCount || 0;

  // Cannot set limit below number already sold online
  if (newLimit < sold) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: `Online limit cannot be lower than online balls already sold (${sold} sold).`,
        sold_online: sold,
      }),
    };
  }

  // How many balls should remain 'available' online after this change
  const targetAvailable = newLimit - sold;

  // Count currently available online balls
  const { count: currentAvailable, error: availError } = await supabase
    .from('ball_drop_balls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')
    .gte('number', ONLINE_START);

  if (availError) {
    console.error('update-ball-limit available count error:', availError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to check available count' }) };
  }

  const available = currentAvailable || 0;
  // Online allocation is one-way only — cannot increase
  const { data: currentConfig } = await supabase
    .from('festival_config')
    .select('value')
    .eq('key', 'online_ball_limit')
    .single();

  const currentLimit = currentConfig?.value ? parseInt(currentConfig.value, 10) : null;

  if (currentLimit !== null && newLimit > currentLimit) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        error: 'Online allocation can only be reduced. Released manual balls cannot be restored online.',
        current_limit: currentLimit,
      }),
    };
  }

  const diff = targetAvailable - available;

  if (diff < 0) {
    // Reducing — mark surplus available balls as manual (one-way, never reversed)
    const surplus = Math.abs(diff);
    const { data: toRelease, error: fetchError } = await supabase
      .from('ball_drop_balls')
      .select('number')
      .eq('status', 'available')
      .gte('number', ONLINE_START)
      .order('number', { ascending: false })
      .limit(surplus);

    if (fetchError) {
      console.error('update-ball-limit fetch to release error:', fetchError);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch balls to release' }) };
    }

    const numbersToRelease = (toRelease || []).map(r => r.number);

    if (numbersToRelease.length > 0) {
      const { error: releaseError } = await supabase
        .from('ball_drop_balls')
        .update({ status: 'manual' })
        .in('number', numbersToRelease);

      if (releaseError) {
        console.error('update-ball-limit release error:', releaseError);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to release balls to manual' }) };
      }
    }
  }
  // No else — increases are rejected above

  // Save new limit to festival_config
  const { error: configError } = await supabase
    .from('festival_config')
    .upsert({ key: 'online_ball_limit', value: String(newLimit) }, { onConflict: 'key' });

  if (configError) {
    console.error('update-ball-limit config error:', configError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save limit' }) };
  }

  // Return updated counts
  const { count: finalAvailable } = await supabase
    .from('ball_drop_balls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')
    .gte('number', ONLINE_START);

  const { count: finalManual } = await supabase
    .from('ball_drop_balls')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'manual')
    .gte('number', ONLINE_START);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      online_ball_limit: newLimit,
      sold_online: sold,
      available_online: finalAvailable || 0,
      released_for_manual: finalManual || 0,
    }),
  };
}
