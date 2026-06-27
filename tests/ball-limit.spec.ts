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
