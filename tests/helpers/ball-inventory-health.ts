/**
 * tests/helpers/ball-inventory-health.ts
 *
 * QA pre-flight check for the Ball Drop inventory (ANT-78).
 *
 * We previously had a corrupted QA database where ball_drop_balls contained
 * invalid data (duplicate rows, wrong totals), which caused real test
 * failures to be misdiagnosed as application bugs. This check verifies the
 * table is in its canonical state before any Ball Drop test runs, and fails
 * fast with a clear environment error — not a confusing app-logic failure —
 * if it isn't.
 *
 * Canonical state: manual balls are EXACTLY 1-500 (reserved paper stock),
 * available balls are EXACTLY 501-1200 (online pool, before any sales) —
 * no gaps, no duplicates, no cross-range contamination. Aggregate counts
 * alone aren't sufficient: duplicate rows can inflate a count while
 * masking a missing number elsewhere, which has happened on this project
 * before. This check verifies the full number ranges, not just totals.
 */

import type { APIRequestContext } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL   || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

const HEALTH_ENDPOINT = BASE + '/.netlify/functions/check-ball-inventory-health';

export async function assertBallInventoryHealthy(request: APIRequestContext): Promise<void> {
  const res = await request.get(HEALTH_ENDPOINT, {
    headers: { 'x-admin-password': ADMIN },
  });

  if (!res.ok()) {
    throw new Error(
      `QA pre-flight check could not run — check-ball-inventory-health returned ${res.status()}.\n` +
      `Cannot verify ball_drop_balls state; aborting Ball Drop tests rather than risk false results.`
    );
  }

  const body = await res.json();
  const {
    inventoryOk, totalRows, totalExpected,
    manualCount, manualCheckOk, manualIssue,
    availableCount, availableCheckOk, availableIssue,
    expected,
  } = body;

  const report =
    `Inventory Health Check\n\n` +
    `Total rows: ${totalRows} (expected ${totalExpected})\n` +
    `Manual: ${manualCount} — expected exactly ${expected.manualRange} — ${manualCheckOk ? 'OK' : `FAILED (${manualIssue})`}\n` +
    `Available: ${availableCount} — expected exactly ${expected.availableRange} — ${availableCheckOk ? 'OK' : `FAILED (${availableIssue})`}\n\n` +
    `Result: ${inventoryOk ? 'PASSED' : 'FAILED'}`;

  console.log(report);

  if (!inventoryOk) {
    throw new Error(
      `${report}\n\n` +
      `QA ENVIRONMENT ERROR\n\n` +
      `ball_drop_balls inventory is corrupted.\n\n` +
      `Expected:\n` +
      `- manual balls numbered exactly ${expected.manualRange}, no gaps or duplicates\n` +
      `- available balls numbered exactly ${expected.availableRange}, no gaps or duplicates\n` +
      `- ${totalExpected} total rows\n\n` +
      `Please reset the QA inventory before running tests.`
    );
  }
}
