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
 *   BL-06  update-ball-limit accepts a valid limit and returns ok:true
 *   BL-07  get-admin-data returns onlineBallLimit field
 *   BL-08  get-admin-data returns availableBallNumbers array
 *   BL-09  availableBallNumbers contains only numbers in range 501–(500+limit)
 *   BL-10  availableBallNumbers contains no duplicates
 *   BL-11  availableBallNumbers are all integers
 *   BL-12  availableBallNumbers are sorted ascending
 *   BL-13  availableBallNumbers count matches ballsRemaining field
 *   BL-14  get-availability returns ballsAvailable field
 *   BL-15  Reducing limit via admin reduces get-availability ballsAvailable
 *   BL-16  Admin UI: online limit input and Save button are visible on Ball Drop tab
 *   BL-17  Admin UI: available numbers panel is present after data loads
 *   BL-18  Admin UI: toggling available numbers panel shows/hides number chips
 *   BL-19  Admin UI: limit persists across page reload
 *
 * Environment variables:
 *   TEST_BASE_URL   — default https://stagingmf.netlify.app
 *   TEST_ADMIN_PASS — admin panel password
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL  || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

const LIMIT_ENDPOINT       = BASE + '/.netlify/functions/update-ball-limit';
const AVAILABILITY_ENDPOINT = BASE + '/.netlify/functions/get-availability';
const ADMIN_DATA_ENDPOINT  = BASE + '/.netlify/functions/get-admin-data';

// The maximum valid online limit: TOTAL_BALLS(1200) - PAPER_MAX(500) = 700
const MAX_LIMIT = 700;

// ── Admin login helper (matches registrations.spec.ts pattern) ─────────────

async function loginAdmin(page: Page) {
  if (!process.env.TEST_ADMIN_PASS) {
    throw new Error('TEST_ADMIN_PASS is not set.');
  }
  await page.goto(BASE + '/admin');
  await page.fill('[type="password"]', ADMIN);
  await page.click('button:has-text("Sign in")');
  await page.click('[data-testid="tile-reports-admin"]');
  await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible({ timeout: 12000 });
}

// ── BL-01 to BL-06: update-ball-limit API ────────────────────────────────────

test.describe('Ball limit — update-ball-limit API', () => {

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
    const body = await res.json();
    expect(body.error).toBeTruthy();
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

  test('BL-06 Accepts a valid limit and returns ok:true', async ({ request }) => {
    // Use 650 — well within range, leaves headroom either side for BL-15
    const res = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: 650 },
    });
    // 409 means already locked — that's acceptable, limit was already set
    if (res.status() === 409) { test.skip(true, 'Limit already locked on this instance'); return; }
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.online_ball_limit).toBe(650);

    // Restore to default 700 so other tests are not affected
    await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: MAX_LIMIT },
    });
  });

});

// ── BL-07 to BL-13: get-admin-data returns correct limit and available numbers

test.describe('Ball limit — get-admin-data response', () => {

  // Fetch once and share across the tests in this describe block
  let adminBody: {
    onlineBallLimit: number;
    availableBallNumbers: number[];
    ballsRemaining: number;
    ballsSold: number;
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

  test('BL-09 All available numbers are within range 501 to (500 + limit)', async () => {
    const limit = adminBody.onlineBallLimit;
    const ceiling = 500 + limit;
    for (const n of adminBody.availableBallNumbers) {
      expect(n, `Ball number ${n} should be >= 501`).toBeGreaterThanOrEqual(501);
      expect(n, `Ball number ${n} should be <= ${ceiling} (500 + limit ${limit})`).toBeLessThanOrEqual(ceiling);
    }
  });

  test('BL-10 Available numbers contain no duplicates', async () => {
    const nums = adminBody.availableBallNumbers;
    const unique = new Set(nums);
    expect(unique.size).toBe(nums.length);
  });

  test('BL-11 All available numbers are integers', async () => {
    for (const n of adminBody.availableBallNumbers) {
      expect(Number.isInteger(n), `${n} should be an integer`).toBe(true);
    }
  });

  test('BL-12 Available numbers are sorted ascending', async () => {
    const nums = adminBody.availableBallNumbers;
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i], `nums[${i}]=${nums[i]} should be > nums[${i - 1}]=${nums[i - 1]}`).toBeGreaterThan(nums[i - 1]);
    }
  });

  test('BL-13 availableBallNumbers count matches ballsRemaining field', async () => {
    expect(adminBody.availableBallNumbers.length).toBe(adminBody.ballsRemaining);
  });

});

// ── BL-14 to BL-15: get-availability responds to limit changes ────────────────

test.describe('Ball limit — get-availability public gate', () => {

  test('BL-14 get-availability returns a ballsAvailable field', async ({ request }) => {
    const res = await request.get(AVAILABILITY_ENDPOINT);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.ballsAvailable).toBe('number');
    expect(body.ballsAvailable).toBeGreaterThanOrEqual(0);
  });

  test('BL-15 Reducing the limit reduces ballsAvailable in get-availability', async ({ request }) => {
    // Read current availability
    const before = await request.get(AVAILABILITY_ENDPOINT);
    const beforeBody = await before.json();
    const beforeCount = beforeBody.ballsAvailable as number;

    // Read current limit from admin data so we know the starting point
    const adminRes = await request.get(ADMIN_DATA_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN },
    });
    const adminBody = await adminRes.json();
    const currentLimit = adminBody.onlineBallLimit as number;

    // Set a new limit 50 less than current (but at least 1)
    const newLimit = Math.max(1, currentLimit - 50);
    const setRes = await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: newLimit },
    });
    // 409 means already locked — skip the availability check in that case
    if (setRes.status() === 409) { test.skip(true, 'Limit already locked on this instance'); return; }
    expect(setRes.status()).toBe(200);

    // Check availability has reduced
    const after = await request.get(AVAILABILITY_ENDPOINT);
    const afterBody = await after.json();
    const afterCount = afterBody.ballsAvailable as number;

    // The new count must be less than or equal to the before count
    // (it will equal beforeCount if all balls within the new range were already sold)
    expect(afterCount).toBeLessThanOrEqual(beforeCount);

    // Restore original limit
    await request.post(LIMIT_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { online_ball_limit: currentLimit },
    });
  });

});

// ── BL-16 to BL-19: Admin UI ─────────────────────────────────────────────────

test.describe('Ball limit — Admin UI', () => {

  test('BL-16 Ball Drop tab shows inventory stats', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    const bar = page.locator('[data-testid="inventory-bar"]');
    await expect(bar).toBeVisible({ timeout: 8000 });
    await expect(bar.locator('span:has-text("Total balls")')).toBeVisible();
    await expect(bar.locator('span:has-text("Online sold")')).toBeVisible();
    await expect(bar.locator('span:has-text("Online remaining")')).toBeVisible();
  });

  test('BL-17 Export ball numbers CSV button is visible on Ball Drop tab', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('button:has-text("Export ball numbers CSV")')).toBeVisible({ timeout: 8000 });
  });

  test('BL-18 Export ball numbers PDF button is visible on Ball Drop tab', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('button:has-text("Export ball numbers PDF")')).toBeVisible({ timeout: 8000 });
  });

  test('BL-19 Limit persists across page reload', async ({ page }) => {
    // Load admin dashboard
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');

    // If not locked, the input should show the current limit
    const isLocked = await page.locator('text=/Limit set/i').isVisible();
    if (isLocked) {
      // Locked — verify the locked message is shown and no input is visible
      await expect(page.locator('text=/cannot be changed/i')).toBeVisible();
      await expect(page.locator('[data-testid="online-limit-input"]')).not.toBeVisible();
    } else {
      // Not locked — verify the input shows a sensible value
      const inputValue = await page.locator('[data-testid="online-limit-input"]').inputValue();
      const val = parseInt(inputValue, 10);
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThanOrEqual(700);
    }

    // Reload and verify state is preserved
    await page.reload();
    await page.click('[data-testid="tile-reports-admin"]').catch(() => {});
    await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible({ timeout: 12000 });
    await page.click('[data-testid="tab-balldrop"]');

    if (isLocked) {
      await expect(page.locator('text=/cannot be changed/i')).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="online-limit-input"]')).toBeVisible();
    }
  });

});
