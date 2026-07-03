import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Canonical QA/live state: 1-500 reserved paper stock (status=manual),
// 501-1200 online pool (700 balls, status=available until sold/released).
//
// Aggregate counts alone aren't enough — they can match by coincidence
// while the wrong numbers sit in the wrong buckets (e.g. paper-range
// balls marked available, or online-range balls counted as manual for
// the wrong reason). This check verifies the actual number ranges of
// each status, not just how many rows have it.
const ONLINE_START = 501;
const EXPECTED = {
  totalRows: 1200,
  minNumber: 1,
  maxNumber: 1200,
  manualCount: 500,
  availableCount: 700,
  manualMin: 1,
  manualMax: 500,
  availableMin: ONLINE_START,
  availableMax: 1200,
  manualInOnlineRange: 0,   // online balls (>=501) incorrectly/temporarily marked manual
  availableInPaperRange: 0, // paper balls (<501) incorrectly marked available
};

export async function handler(event) {
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }

  try {
    const [
      totalResult,
      minResult,
      maxResult,
      manualCountResult,
      availableCountResult,
      manualMinResult,
      manualMaxResult,
      availableMinResult,
      availableMaxResult,
      manualInOnlineRangeResult,
      availableInPaperRangeResult,
    ] = await Promise.all([
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }),
      supabase.from('ball_drop_balls').select('number').order('number', { ascending: true }).limit(1),
      supabase.from('ball_drop_balls').select('number').order('number', { ascending: false }).limit(1),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'manual'),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('ball_drop_balls').select('number').eq('status', 'manual').order('number', { ascending: true }).limit(1),
      supabase.from('ball_drop_balls').select('number').eq('status', 'manual').order('number', { ascending: false }).limit(1),
      supabase.from('ball_drop_balls').select('number').eq('status', 'available').order('number', { ascending: true }).limit(1),
      supabase.from('ball_drop_balls').select('number').eq('status', 'available').order('number', { ascending: false }).limit(1),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'manual').gte('number', ONLINE_START),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available').lt('number', ONLINE_START),
    ]);

    const totalRows = totalResult.count || 0;
    const minNumber = minResult.data?.[0]?.number ?? null;
    const maxNumber = maxResult.data?.[0]?.number ?? null;
    const manualCount = manualCountResult.count || 0;
    const availableCount = availableCountResult.count || 0;
    const manualMin = manualMinResult.data?.[0]?.number ?? null;
    const manualMax = manualMaxResult.data?.[0]?.number ?? null;
    const availableMin = availableMinResult.data?.[0]?.number ?? null;
    const availableMax = availableMaxResult.data?.[0]?.number ?? null;
    const manualInOnlineRange = manualInOnlineRangeResult.count || 0;
    const availableInPaperRange = availableInPaperRangeResult.count || 0;

    const inventoryOk =
      totalRows === EXPECTED.totalRows &&
      minNumber === EXPECTED.minNumber &&
      maxNumber === EXPECTED.maxNumber &&
      manualCount === EXPECTED.manualCount &&
      availableCount === EXPECTED.availableCount &&
      manualMin === EXPECTED.manualMin &&
      manualMax === EXPECTED.manualMax &&
      availableMin === EXPECTED.availableMin &&
      availableMax === EXPECTED.availableMax &&
      manualInOnlineRange === EXPECTED.manualInOnlineRange &&
      availableInPaperRange === EXPECTED.availableInPaperRange;

    return {
      statusCode: 200,
      body: JSON.stringify({
        inventoryOk,
        totalRows,
        minNumber,
        maxNumber,
        manualCount,
        availableCount,
        manualMin,
        manualMax,
        availableMin,
        availableMax,
        manualInOnlineRange,
        availableInPaperRange,
        expected: EXPECTED,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
