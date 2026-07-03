import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Canonical QA/live state: 1-500 reserved paper stock (status=manual),
// 501-1200 online pool (700 balls, status=available until sold/released).
const PAPER_START = 1;
const PAPER_END = 500;
const ONLINE_START = 501;
const ONLINE_END = 1200;

// Verifies `numbers` is EXACTLY the contiguous integer range [start, end] —
// no gaps, no duplicates, no numbers outside the range. Count/min/max
// matching alone isn't sufficient: duplicate rows can inflate a count while
// masking a missing number elsewhere (this exact failure mode has happened
// on this project before).
function checkExactRange(numbers, start, end) {
  const expectedCount = end - start + 1;
  const set = new Set(numbers);

  if (set.size !== numbers.length) {
    return { ok: false, issue: `${numbers.length - set.size} duplicate ball number(s)` };
  }
  if (numbers.length !== expectedCount) {
    return { ok: false, issue: `${numbers.length} numbers present, expected ${expectedCount}` };
  }

  const missing = [];
  const outOfRange = [];
  for (let n = start; n <= end; n++) {
    if (!set.has(n)) missing.push(n);
  }
  for (const n of numbers) {
    if (n < start || n > end) outOfRange.push(n);
  }

  if (missing.length > 0) {
    return { ok: false, issue: `missing ${missing.length} number(s), e.g. ${missing.slice(0, 5).join(', ')}` };
  }
  if (outOfRange.length > 0) {
    return { ok: false, issue: `${outOfRange.length} number(s) outside expected range, e.g. ${outOfRange.slice(0, 5).join(', ')}` };
  }
  return { ok: true, issue: null };
}

export async function handler(event) {
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }

  try {
    const [totalResult, manualNumbersResult, availableNumbersResult] = await Promise.all([
      supabase.from('ball_drop_balls').select('*', { count: 'exact', head: true }),
      supabase.from('ball_drop_balls').select('number').eq('status', 'manual'),
      supabase.from('ball_drop_balls').select('number').eq('status', 'available'),
    ]);

    const totalRows = totalResult.count || 0;
    const manualNumbers = (manualNumbersResult.data || []).map(r => r.number);
    const availableNumbers = (availableNumbersResult.data || []).map(r => r.number);

    const manualCheck = checkExactRange(manualNumbers, PAPER_START, PAPER_END);
    const availableCheck = checkExactRange(availableNumbers, ONLINE_START, ONLINE_END);
    const totalOk = totalRows === (PAPER_END - PAPER_START + 1) + (ONLINE_END - ONLINE_START + 1);

    const inventoryOk = totalOk && manualCheck.ok && availableCheck.ok;

    return {
      statusCode: 200,
      body: JSON.stringify({
        inventoryOk,
        totalRows,
        totalExpected: (PAPER_END - PAPER_START + 1) + (ONLINE_END - ONLINE_START + 1),
        manualCount: manualNumbers.length,
        availableCount: availableNumbers.length,
        manualCheckOk: manualCheck.ok,
        manualIssue: manualCheck.issue,
        availableCheckOk: availableCheck.ok,
        availableIssue: availableCheck.issue,
        expected: {
          manualRange: `${PAPER_START}-${PAPER_END}`,
          availableRange: `${ONLINE_START}-${ONLINE_END}`,
        },
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
