import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Canonical QA/live state: 1-500 reserved paper stock (status=manual),
// 501-1200 online pool (700 balls, status=available until sold/released).
const EXPECTED = {
  totalRows: 1200,
  minNumber: 1,
  maxNumber: 1200,
  manualCount: 500,
  availableCount: 700,
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
      manualResult,
      availableResult,
    ] = await Promise.all([
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }),
      supabase.from('ball_drop_balls').select('number').order('number', { ascending: true }).limit(1),
      supabase.from('ball_drop_balls').select('number').order('number', { ascending: false }).limit(1),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'manual'),
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    ]);

    const totalRows = totalResult.count || 0;
    const minNumber = minResult.data?.[0]?.number ?? null;
    const maxNumber = maxResult.data?.[0]?.number ?? null;
    const manualCount = manualResult.count || 0;
    const availableCount = availableResult.count || 0;

    const inventoryOk =
      totalRows === EXPECTED.totalRows &&
      minNumber === EXPECTED.minNumber &&
      maxNumber === EXPECTED.maxNumber &&
      manualCount === EXPECTED.manualCount &&
      availableCount === EXPECTED.availableCount;

    return {
      statusCode: 200,
      body: JSON.stringify({
        inventoryOk,
        totalRows,
        minNumber,
        maxNumber,
        manualCount,
        availableCount,
        expected: EXPECTED,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
