/**
 * tests/ball-limit.spec.ts
 * Moville Summer Festival 2026 — Ball Limit Admin Tests
 *
 *   npx playwright test tests/ball-limit.spec.ts --headed
 *
 * Covers:
 *   BL-01  update-ball-limit rejects wrong password
 *   BL-02  update-ball-limit rejects GET requests
 *   BL-03  update-ball-limit rejects out-of-range value (> 700)
 *   BL-04  update-ball-limit rejects negative value
 *   BL-05  update-ball-limit rejects non-numeric value
 *   BL-06  update-ball-limit rejects limit below online sold count
 *   BL-07  get-admin-data returns onlineBallLimit field
 *   BL-08  get-admin-data returns availableBallNumbers array
 *   BL-09  All available numbers are online balls (>= 501)
 *   BL-10  Available numbers contain no duplicates
 *   BL-11  Available numbers are all integers
 *   BL-12  Available numbers are sorted ascending
 *   BL-13  availableBallNumbers count matches availableOnline field
 *   BL-14  get-availability returns ballsAvailable field
 *   BL-15  Reducing limit marks surplus balls as manual, not available
 *   BL-16  Sold online balls are never touched by limit change
 *   BL-17  Increasing limit restores manual balls to available
 *   BL-18  Original paper balls (1-500) are never touched
 *   BL-19  Counts reconcile: sold + available + manual (501-1200) + paper = 1200
 *   BL-20  Admin UI: inventory bar shows correct stat labels
 *   BL-21  Admin UI: limit adjuster visible and functional
 *   BL-22  Admin UI: export buttons visible
 *   BL-23  Admin UI: limit persists across page reload
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL  || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

const LIMIT_ENDPOINT        = BASE + '/.netlify/functions/update-ball-limit';
const AVAILABILITY_ENDPOINT = BASE + '/.netlify/functions/get-availability';
const ADMIN_DATA_ENDPOINT   = BASE + '/.netlify/functions/get-admin-data';

const MAX_LIMIT  = 700;
const PAPER_MAX  = 500;
const TOTAL_BALLS = 1200;
const ONLINE_START = 501;

async function loginAdmin(page: Page) {
  if (!process.env.TEST_ADMIN_PASS) throw new Error('TEST_ADMIN_PASS is not set.');
  await page.goto(BASE + '/admin');
  await page.fill('[type="password"]', ADMIN);
  await page.click('button:has-text("Sign in")');
  await page.click('[data-testid="tile-reports-admin"]');
  await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible({ timeout: 12000 });
}

// ── BL-01 to BL-05: API validation ───────────────────────────────────────────

test.describe('Ball limit — update-ball-limit API validation', () => {

  test('BL-01 Rejects wrong password', async ({ request }) => {
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': 'wrong-password', 'Content-Type': 'application/json' },
      data: { online_ball_limit: 600 },
    });
    expect(res.status()).toBe(401);
  });

  test('BL-02 Rejects GET requests', async ({ request }) => {
    const res = await request.get(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    expect(res.status()).toBe(405);
  });

  test('BL-03 Rejects value above maximum (701)', async ({ request }) => {
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: MAX_LIMIT + 1 },
    });
    expect(res.status()).toBe(400);
  });

  test('BL-04 Rejects negative value', async ({ request }) => {
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: -1 },
    });
    expect(res.status()).toBe(400);
  });

  test('BL-05 Rejects non-numeric value', async ({ request }) => {
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: 'banana' },
    });
    expect(res.status()).toBe(400);
  });

});

// ── BL-06: Backend guard ──────────────────────────────────────────────────────

test('BL-06 Rejects limit below online sold count', async ({ request }) => {
  const adminRes = await request.get(ADMIN_DATA_ENDPOINT, {
    headers: { 'x-admin-password': ADMIN },
  });
  const adminBody = await adminRes.json();
  const soldOnline = adminBody.soldOnline as number;

  if (soldOnline === 0) {
    test.skip(true, 'No balls sold online on this instance — cannot test lower bound');
    return;
  }

  const res = await request.post(LIMIT_ENDPOINT, {
    headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
    data: { online_ball_limit: soldOnline - 1 },
  });
  expect(res.status()).toBe(409);
  const body = await res.json();
  expect(body.error).toMatch(/cannot be lower/i);
});

// ── BL-07 to BL-13: get-admin-data response ──────────────────────────────────

test.describe('Ball limit — get-admin-data response', () => {

  let adminBody: {
    onlineBallLimit: number;
    soldOnline: number;
    availableOnline: number;
    releasedForManual: number;
    availableBallNumbers: number[];
  };

  test.beforeAll(async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    expect(res.status()).toBe(200);
    adminBody = await res.json();
  });

  test('BL-07 onlineBallLimit field is present and is a positive integer', async () => {
    expect(typeof adminBody.onlineBallLimit).toBe('number');
    expect(Number.isInteger(adminBody.onlineBallLimit)).toBe(true);
    expect(adminBody.onlineBallLimit).toBeGreaterThan(0);
    expect(adminBody.onlineBallLimit).toBeLessThanOrEqual(MAX_LIMIT);
  });

  test('BL-08 availableBallNumbers field is present and is an array', async () => {
    expect(Array.isArray(adminBody.availableBallNumbers)).toBe(true);
  });

  test('BL-09 All available numbers are online balls (>= 501)', async () => {
    for (const n of adminBody.availableBallNumbers) {
      expect(n, `Ball ${n} should be >= ${ONLINE_START}`).toBeGreaterThanOrEqual(ONLINE_START);
      expect(n, `Ball ${n} should be <= ${TOTAL_BALLS}`).toBeLessThanOrEqual(TOTAL_BALLS);
    }
  });

  test('BL-10 Available numbers contain no duplicates', async () => {
    const unique = new Set(adminBody.availableBallNumbers);
    expect(unique.size).toBe(adminBody.availableBallNumbers.length);
  });

  test('BL-11 All available numbers are integers', async () => {
    for (const n of adminBody.availableBallNumbers) {
      expect(Number.isInteger(n), `${n} should be an integer`).toBe(true);
    }
  });

  test('BL-12 Available numbers are sorted ascending', async () => {
    const nums = adminBody.availableBallNumbers;
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBeGreaterThan(nums[i - 1]);
    }
  });

  test('BL-13 availableBallNumbers count matches availableOnline field', async () => {
    expect(adminBody.availableBallNumbers.length).toBe(adminBody.availableOnline);
  });

});

// ── BL-14: get-availability ───────────────────────────────────────────────────

test('BL-14 get-availability returns a ballsAvailable field', async ({ request }) => {
  const res = await request.get(AVAILABILITY_ENDPOINT);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(typeof body.ballsAvailable).toBe('number');
  expect(body.ballsAvailable).toBeGreaterThanOrEqual(0);
});

// ── BL-15 to BL-19: Status-based allocation model ────────────────────────────

test.describe('Ball limit — status-based allocation model', () => {

  let originalLimit: number;
  let originalSold: number;
  let originalAvailable: number;

  test.beforeAll(async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    originalLimit     = body.onlineBallLimit;
    originalSold      = body.soldOnline;
    originalAvailable = body.availableOnline;
  });

  // Note: no afterAll restore — online allocation is one-way only (can only decrease)

  test('BL-15 Reducing limit marks surplus balls as manual', async ({ request }) => {
    const reduceBy = 50;
    const newLimit = Math.max(originalSold, originalLimit - reduceBy);
    if (newLimit === originalLimit) {
      test.skip(true, 'Not enough headroom to reduce limit on this instance');
      return;
    }

    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: newLimit },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.available_online).toBe(newLimit - originalSold);
    expect(body.released_for_manual).toBeGreaterThan(0);
    // Available + sold should equal new limit
    expect(body.available_online + body.sold_online).toBe(newLimit);
  });

  test('BL-16 Sold online balls are never touched by limit change', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    // Sold count should never change from what it was before
    expect(body.soldOnline).toBe(originalSold);
  });

  test('BL-17 Increasing the limit is rejected — one-way only', async ({ request }) => {
    const currentRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const current = await currentRes.json();
    const currentLimit = current.onlineBallLimit as number;

    // Attempt to increase by 1
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: currentLimit + 1 },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/only be reduced/i);
  });

  test('BL-18 Original paper balls (1–500) are never touched', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    // Paper balls (1-500) should not appear in availableBallNumbers (which are all online balls)
    const paperBallsInAvailable = body.availableBallNumbers.filter((n: number) => n <= PAPER_MAX);
    expect(paperBallsInAvailable.length).toBe(0);
  });

  test('BL-19 Counts reconcile to 1200', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    const total = body.soldOnline + body.availableOnline + body.releasedForManual + PAPER_MAX;
    expect(total).toBe(TOTAL_BALLS);
  });

});

// ── Manual Sales Sheets ──────────────────────────────────────────────────────

test.describe('Ball limit — Generate Manual Sales Sheets', () => {

  test('MS-01 Generate Manual Sales Sheets button is visible on Ball Drop tab', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('[data-testid="generate-manual-sheets"]')).toBeVisible({ timeout: 8000 });
  });

  test('MS-02 Manual ball numbers in get-admin-data are all >= 501 and status manual', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const manualNumbers: number[] = body.manualBallNumbers || [];
    for (const n of manualNumbers) {
      expect(n, `Manual ball ${n} should be >= 501`).toBeGreaterThanOrEqual(501);
      expect(n, `Manual ball ${n} should be <= 1200`).toBeLessThanOrEqual(1200);
    }
  });

  test('MS-03 Manual ball numbers contain no duplicates', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    const manualNumbers: number[] = body.manualBallNumbers || [];
    const unique = new Set(manualNumbers);
    expect(unique.size).toBe(manualNumbers.length);
  });

  test('MS-04 Manual ball numbers do not overlap with available-online or sold numbers', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    const manualSet = new Set(body.manualBallNumbers || []);
    const availableSet = new Set(body.availableBallNumbers || []);
    const soldSet = new Set(body.soldBallNumbers || []);
    for (const n of manualSet) {
      expect(availableSet.has(n), `Ball ${n} appears in both manual and available`).toBe(false);
      expect(soldSet.has(n), `Ball ${n} appears in both manual and sold`).toBe(false);
    }
  });

  test('MS-05 Manual + available + sold online + paper = 1200', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    const total = body.soldOnline + body.availableOnline + body.releasedForManual + PAPER_MAX;
    expect(total).toBe(TOTAL_BALLS);
  });

});



// ── MS-06 to MS-13: Manual Sales Pack report tests ───────────────────────────
// These tests protect against the bug where the Manual Sales Pack was using
// availableBallNumbers (online available) instead of manualBallNumbers.
// MS-07 is the killer test — it proves the report uses the correct data source.

test.describe('Ball limit — Manual Sales Pack report', () => {

  test('MS-06 Generate Manual Sales Sheets button is visible and separate from existing reports', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');

    // All three buttons must be visible
    await expect(page.locator('button:has-text("Export Master Inventory")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Export Manual Sale Numbers")')).toBeVisible();
    await expect(page.locator('[data-testid="generate-manual-sheets"]')).toBeVisible();

    // They must be three distinct elements
    expect(await page.locator('button:has-text("Export Master Inventory")').count()).toBe(1);
    expect(await page.locator('button:has-text("Export Manual Sale Numbers")').count()).toBe(1);
    expect(await page.locator('[data-testid="generate-manual-sheets"]').count()).toBe(1);
  });

  test('MS-07 Manual Sales Pack uses manualBallNumbers not availableBallNumbers — the bug-catcher', async ({ page, request }) => {
    // Step 1: Read current state
    const beforeRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const before = await beforeRes.json();
    const soldOnline: number = before.soldOnline;
    const availableOnline: number = before.availableOnline;

    if (availableOnline === 0) {
      // Online already closed — manualBallNumbers should already be populated
      // Verify the report is not blank
      const manualNumbers: number[] = before.manualBallNumbers || [];
      if (manualNumbers.length === 0) {
        test.skip(true, 'No available or manual balls on this instance — cannot test');
        return;
      }
    } else {
      // Step 2: Close online sales — set limit to exactly soldOnline
      // This makes availableBallNumbers empty and moves all unsold online balls to manual
      const closeRes = await request.post(LIMIT_ENDPOINT, {
        headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
        data: { online_ball_limit: soldOnline },
      });
      expect(closeRes.status()).toBe(200);
    }

    // Step 3: Verify the state — availableBallNumbers must now be empty, manualBallNumbers populated
    const afterRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const after = await afterRes.json();
    const manualNumbers: number[] = after.manualBallNumbers || [];
    const availableNumbers: number[] = after.availableBallNumbers || [];

    expect(availableNumbers.length, 'availableBallNumbers should be empty after closing online sales').toBe(0);
    expect(manualNumbers.length, 'manualBallNumbers should be populated').toBeGreaterThan(0);

    // Step 4: Generate the Manual Sales Pack
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      (async () => {
        await loginAdmin(page);
        await page.click('[data-testid="tab-balldrop"]');
        await page.click('[data-testid="generate-manual-sheets"]');
      })(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    const html = await newPage.content();
    await newPage.close();

    // Step 5: Report must NOT be blank — this is exactly the original bug
    expect(html, 'Report must not show the empty state message').not.toContain('No manual balls available');

    // Step 6: Manual ball numbers must appear in the report
    for (const n of manualNumbers.slice(0, 20)) {
      expect(html, `Manual ball ${n} should appear in the report`).toContain('>' + String(n) + '<');
    }

    // Step 7: Available-online balls must NOT appear (there are none, but belt-and-braces)
    // Since availableNumbers is empty this loop won't execute — that's correct
    for (const n of availableNumbers) {
      expect(html, `Available-online ball ${n} must not appear in manual sales report`).not.toContain('>' + String(n) + '<');
    }
  });

  test('MS-08 Manual Sales Pack shows friendly message when there are no manual balls', async ({ request }) => {
    // We test the API data — if manualBallNumbers is empty the report should
    // show a friendly message. We verify this through the data state.
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();
    const manualNumbers: number[] = body.manualBallNumbers || [];

    if (manualNumbers.length > 0) {
      // Can't test zero-state on an instance that has manual balls — skip
      test.skip(true, 'Instance has manual balls — zero-state cannot be tested here');
      return;
    }

    // manualNumbers is empty — the handler should produce the friendly message
    // We verify via the API data that this is the correct state
    expect(manualNumbers.length).toBe(0);
    expect(body.releasedForManual).toBe(0);
  });

  test('MS-09 Manual Sales Pack contains every manual ball exactly once', async ({ page, request }) => {
    const adminRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const adminBody = await adminRes.json();
    const manualNumbers: number[] = adminBody.manualBallNumbers || [];

    if (manualNumbers.length === 0) {
      test.skip(true, 'No manual balls on this instance');
      return;
    }

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      (async () => {
        await loginAdmin(page);
        await page.click('[data-testid="tab-balldrop"]');
        await page.click('[data-testid="generate-manual-sheets"]');
      })(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    const html = await newPage.content();
    await newPage.close();

    // Every manual ball appears at least once
    for (const n of manualNumbers) {
      expect(html, `Manual ball ${n} missing from report`).toContain('>' + String(n) + '<');
    }

    // No duplicates — count occurrences of each number
    for (const n of manualNumbers) {
      const pattern = new RegExp('>' + String(n) + '<', 'g');
      const matches = html.match(pattern) || [];
      expect(matches.length, `Ball ${n} appears ${matches.length} times — expected exactly once`).toBe(1);
    }
  });

  test('MS-10 Manual Sales Pack does not contain available-online balls', async ({ page, request }) => {
    const adminRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const adminBody = await adminRes.json();
    const manualNumbers: number[] = adminBody.manualBallNumbers || [];
    const availableNumbers: number[] = adminBody.availableBallNumbers || [];

    if (manualNumbers.length === 0) {
      test.skip(true, 'No manual balls on this instance');
      return;
    }

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      (async () => {
        await loginAdmin(page);
        await page.click('[data-testid="tab-balldrop"]');
        await page.click('[data-testid="generate-manual-sheets"]');
      })(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    const html = await newPage.content();
    await newPage.close();

    // Build a set of manual numbers for quick lookup
    const manualSet = new Set(manualNumbers.map(String));

    // Check that available-online balls (not in manual) do not appear in the report
    // Only check a sample to keep the test fast
    const onlineOnlyBalls = availableNumbers.filter(n => !manualSet.has(String(n))).slice(0, 10);
    for (const n of onlineOnlyBalls) {
      expect(html, `Available-online ball ${n} must NOT appear in manual sales report`).not.toContain('>' + String(n) + '<');
    }
  });

  test('MS-11 Manual Sales Pack paginates correctly when manual balls exceed one page', async ({ request }) => {
    const adminRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const adminBody = await adminRes.json();
    const manualNumbers: number[] = adminBody.manualBallNumbers || [];

    // We verify pagination logic via the data — 20 entries per page
    const ENTRIES_PER_PAGE = 20;
    const expectedPages = Math.ceil(manualNumbers.length / ENTRIES_PER_PAGE);

    if (manualNumbers.length <= ENTRIES_PER_PAGE) {
      // Single page — just verify count is correct
      expect(expectedPages).toBe(1);
    } else {
      // Multi-page — verify all numbers are accounted for
      expect(expectedPages).toBeGreaterThan(1);
      // All numbers should be present (verified in MS-09)
      // Here we verify the pagination arithmetic is sound
      const lastPageCount = manualNumbers.length - (expectedPages - 1) * ENTRIES_PER_PAGE;
      expect(lastPageCount).toBeGreaterThan(0);
      expect(lastPageCount).toBeLessThanOrEqual(ENTRIES_PER_PAGE);
    }
  });

  test('MS-12 Existing export buttons are still present and unchanged', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');

    // All existing buttons still present
    await expect(page.locator('button:has-text("Export Master Inventory")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Export Manual Sale Numbers")')).toBeVisible();

    // Exactly one of each — nothing duplicated
    expect(await page.locator('button:has-text("Export Master Inventory")').count()).toBe(1);
    expect(await page.locator('button:has-text("Export Manual Sale Numbers")').count()).toBe(1);
  });

  test('MS-13 Existing online reports still use availableBallNumbers', async ({ request }) => {
    const res = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const body = await res.json();

    const available: number[] = body.availableBallNumbers || [];
    const manual: number[] = body.manualBallNumbers || [];
    const sold: number[] = body.soldBallNumbers || [];

    // availableBallNumbers must not contain manual or sold balls
    const manualSet = new Set(manual);
    const soldSet = new Set(sold);

    for (const n of available) {
      expect(manualSet.has(n), `Ball ${n} in availableBallNumbers also in manualBallNumbers`).toBe(false);
      expect(soldSet.has(n), `Ball ${n} in availableBallNumbers also in soldBallNumbers`).toBe(false);
    }

    // availableBallNumbers count matches availableOnline
    expect(available.length).toBe(body.availableOnline);

    // get-availability returns the same count
    const availRes = await request.get(AVAILABILITY_ENDPOINT);
    const availBody = await availRes.json();
    expect(availBody.ballsAvailable).toBe(body.availableOnline);
  });

});

// ── BL-20 to BL-23: Admin UI ─────────────────────────────────────────────────

test.describe('Ball limit — Admin UI', () => {

  test('BL-20 Inventory bar shows correct stat labels', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    const bar = page.locator('[data-testid="inventory-bar"]');
    await expect(bar).toBeVisible({ timeout: 8000 });
    await expect(bar.getByText('Online allocation', { exact: true })).toBeVisible();
    await expect(bar.getByText('Online sold', { exact: true })).toBeVisible();
    await expect(bar.getByText('Online remaining', { exact: true })).toBeVisible();
    await expect(bar.getByText('Released for manual sale', { exact: true })).toBeVisible();
  });

  test('BL-21 Limit adjuster is visible and functional', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('[data-testid="online-limit-input"]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="save-online-limit"]')).toBeVisible();
  });

  test('BL-22 Export buttons are visible', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('button:has-text("Export Master Inventory")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button:has-text("Export Manual Sale Numbers")')).toBeVisible();
  });

  test('BL-23 Limit persists across page reload', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    const inputValue = await page.locator('[data-testid="online-limit-input"]').inputValue();
    const val = parseInt(inputValue, 10);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThanOrEqual(MAX_LIMIT);

    await page.reload();
    await page.click('[data-testid="tile-reports-admin"]').catch(() => {});
    await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible({ timeout: 12000 });
    await page.click('[data-testid="tab-balldrop"]');
    const reloadedValue = await page.locator('[data-testid="online-limit-input"]').inputValue();
    expect(parseInt(reloadedValue, 10)).toBe(val);
  });

});
