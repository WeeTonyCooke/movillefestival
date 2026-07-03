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
 * Canonical state: 1200 rows, numbers 1-1200, 500 manual (reserved paper
 * stock 1-500), 700 available (online pool 501-1200, before any sales).
 *
 * Aggregate counts alone aren't sufficient — they can match by coincidence
 * while the wrong numbers sit in the wrong buckets. This check also
 * verifies the actual min/max of each status, and that no paper-range
 * ball (1-500) is marked available and no online-range ball (501+) is
 * marked manual.
 */

import type { APIRequestContext } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL   || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

const HEALTH_ENDPOINT = BASE + '/.netlify/functions/check-ball-inventory-health';

const EXPECTED = {
  totalRows: 1200,
  minNumber: 1,
  maxNumber: 1200,
  manualCount: 500,
  availableCount: 700,
  manualMin: 1,
  manualMax: 500,
  availableMin: 501,
  availableMax: 1200,
  manualInOnlineRange: 0,
  availableInPaperRange: 0,
};

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
    inventoryOk,
    totalRows, minNumber, maxNumber, manualCount, availableCount,
    manualMin, manualMax, availableMin, availableMax,
    manualInOnlineRange, availableInPaperRange,
  } = body;

  const report =
    `Inventory Health Check\n\n` +
    `Total rows: ${totalRows} (expected ${EXPECTED.totalRows})\n` +
    `Min number: ${minNumber} (expected ${EXPECTED.minNumber})\n` +
    `Max number: ${maxNumber} (expected ${EXPECTED.maxNumber})\n` +
    `Manual: ${manualCount} (expected ${EXPECTED.manualCount}) — range ${manualMin}-${manualMax} (expected ${EXPECTED.manualMin}-${EXPECTED.manualMax})\n` +
    `Available: ${availableCount} (expected ${EXPECTED.availableCount}) — range ${availableMin}-${availableMax} (expected ${EXPECTED.availableMin}-${EXPECTED.availableMax})\n` +
    `Manual balls in online range (501+): ${manualInOnlineRange} (expected ${EXPECTED.manualInOnlineRange})\n` +
    `Available balls in paper range (<501): ${availableInPaperRange} (expected ${EXPECTED.availableInPaperRange})\n\n` +
    `Result: ${inventoryOk ? 'PASSED' : 'FAILED'}`;

  console.log(report);

  if (!inventoryOk) {
    throw new Error(
      `${report}\n\n` +
      `QA ENVIRONMENT ERROR\n\n` +
      `ball_drop_balls inventory is corrupted.\n\n` +
      `Expected:\n` +
      `- ${EXPECTED.totalRows} total rows\n` +
      `- numbers ${EXPECTED.minNumber}\u2013${EXPECTED.maxNumber}\n` +
      `- ${EXPECTED.manualCount} manual balls, numbered ${EXPECTED.manualMin}\u2013${EXPECTED.manualMax}\n` +
      `- ${EXPECTED.availableCount} available balls, numbered ${EXPECTED.availableMin}\u2013${EXPECTED.availableMax}\n` +
      `- no cross-range contamination (paper marked available, or online marked manual)\n\n` +
      `Please reset the QA inventory before running tests.`
    );
  }
}
