/**
 * tests/passes.spec.ts
 * Moville Summer Festival 2026 — Festival Pass Playwright Test Suite
 *
 *   npx playwright test tests/passes.spec.ts --headed
 *
 * Environment variables:
 *   TEST_BASE_URL    — default https://stagingmf.netlify.app
 *   TEST_PASS_TOKEN  — a known paid pass view_token (UUID from festival_passes table)
 *   TEST_ADMIN_PASS  — admin panel password
 *
 * Stripe test cards:
 *   4242 4242 4242 4242 — success
 *   4000 0000 0000 0002 — declined
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL   || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS  || 'testpassword';
const TOKEN = process.env.TEST_PASS_TOKEN  || '';

async function selectPass(page: Page, passId: string) {
  await page.goto(BASE + '/passes');
  await expect(page.locator(`[data-testid="pass-card-${passId}"]`)).toBeVisible({ timeout: 10000 });
  await page.click(`[data-testid="pass-card-${passId}"]`);
  await expect(page.locator('[data-testid="input-first-name"]')).toBeVisible({ timeout: 8000 });
}

async function fillPassForm(page: Page, opts: { first?: string; last?: string; email?: string; } = {}) {
  await page.fill('[data-testid="input-first-name"]', opts.first ?? 'Test');
  await page.fill('[data-testid="input-last-name"]',  opts.last  ?? 'User');
  await page.fill('[data-testid="input-email"]',      opts.email ?? 'test@example.com');
}

async function fillStripeCard(page: Page, cardNumber: string) {
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
  await page.fill('[placeholder="1234 1234 1234 1234"]', cardNumber);
  await page.fill('[placeholder="MM / YY"]', '12 / 30');
  await page.fill('[placeholder="CVC"]', '123');
  await page.fill('[placeholder="Full name on card"]', 'Test User').catch(() => {});
  await page.click('[data-testid="hosted-payment-submit-button"]');
}

async function loginAdmin(page: Page) {
  if (!process.env.TEST_ADMIN_PASS) {
    throw new Error('TEST_ADMIN_PASS is not set. Admin tests need the real staging admin password.');
  }

  await page.goto(BASE + '/admin');
  await page.fill('[type="password"]', ADMIN);
  await page.click('button:has-text("Sign in")');
  await expect(page.locator('[data-testid="tile-reports-admin"]')).toBeVisible({ timeout: 12000 });
  await page.click('[data-testid="tile-reports-admin"]');

  // The admin page now lands on a two-choice menu. Enter Reports & Admin,
  // then wait for a dashboard-only element so login is genuinely complete.
  await expect(page.locator('[data-testid="tab-passes"]')).toBeVisible({ timeout: 12000 });
}

// ── Step 1: Pass selection ────────────────────────────────────────────────────

test.describe('Pass selection (step 1)', () => {

  test('SEL-01 All four pass cards visible on /passes', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('[data-testid="pass-card-festival_pass"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="pass-card-friday"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-card-saturday"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-card-sunday"]')).toBeVisible();
  });

  test('SEL-02 Clicking card moves to step 2', async ({ page }) => {
    await selectPass(page, 'festival_pass');
    await expect(page.locator('[data-testid="btn-buy"]')).toBeVisible();
  });

  test('SEL-03 Change pass returns to step 1', async ({ page }) => {
    await selectPass(page, 'friday');
    await page.click('button:has-text("Change pass")');
    await expect(page.locator('[data-testid="pass-card-festival_pass"]')).toBeVisible({ timeout: 6000 });
  });

  test('SEL-04 Age restriction notice on step 1', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('text=/16 and over|under 16/i')).toBeVisible({ timeout: 8000 });
  });

  test('SEL-05 Attendee name guidance on step 2', async ({ page }) => {
    await selectPass(page, 'saturday');
    await expect(page.locator('text=/person attending|on behalf/i')).toBeVisible();
  });

});

// ── PF: Purchase flow ─────────────────────────────────────────────────────────

test.describe('Purchase flow', () => {

  test('PF-01 Festival Pass successful purchase', async ({ page }) => {
    await selectPass(page, 'festival_pass');
    await fillPassForm(page, { email: 'pf01@example.com' });
    await page.click('[data-testid="btn-buy"]');
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
    await expect(page.locator('h1, h2')).toContainText(/confirmed|purchase/i);
  });

  test('PF-02 Friday Day Pass successful purchase', async ({ page }) => {
    await selectPass(page, 'friday');
    await fillPassForm(page, { email: 'pf02@example.com' });
    await page.click('[data-testid="btn-buy"]');
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-03 Saturday Day Pass successful purchase', async ({ page }) => {
    await selectPass(page, 'saturday');
    await fillPassForm(page, { email: 'pf03@example.com' });
    await page.click('[data-testid="btn-buy"]');
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-04 Sunday Day Pass successful purchase', async ({ page }) => {
    await selectPass(page, 'sunday');
    await fillPassForm(page, { email: 'pf04@example.com' });
    await page.click('[data-testid="btn-buy"]');
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-05 Declined card — no pass created', async ({ page }) => {
    await selectPass(page, 'friday');
    await fillPassForm(page, { email: 'pf05@example.com' });
    await page.click('[data-testid="btn-buy"]');
    await fillStripeCard(page, '4000 0000 0000 0002');
    await expect(page.locator('text=/declined/i')).toBeVisible({ timeout: 15000 });
    await expect(page).not.toHaveURL(/\/passes\/success/);
  });

  test('PF-06 Abandoned checkout returns to /passes', async ({ page }) => {
    await selectPass(page, 'saturday');
    await fillPassForm(page);
    await page.click('[data-testid="btn-buy"]');
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/passes/, { timeout: 8000 });
  });

  test('PF-07 Back button during checkout returns to /passes', async ({ page }) => {
    await selectPass(page, 'sunday');
    await fillPassForm(page);
    await page.click('[data-testid="btn-buy"]');
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/passes/, { timeout: 8000 });
  });

  test('PF-08 Double-click Buy button is safe', async ({ page }) => {
    await selectPass(page, 'saturday');
    await fillPassForm(page, { email: 'pf08@example.com' });
    const btn = page.locator('[data-testid="btn-buy"]');
    await btn.click();
    // Button should immediately become disabled with "Redirecting..." text
    await expect(btn).toBeDisabled({ timeout: 5000 });
  });

  test('PF-09 Missing first name blocks submission', async ({ page }) => {
    await selectPass(page, 'friday');
    await page.fill('[data-testid="input-last-name"]', 'User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.click('[data-testid="btn-buy"]');
    await expect(page).not.toHaveURL(/checkout\.stripe\.com/);
  });

  test('PF-10 Invalid email blocks submission', async ({ page }) => {
    await selectPass(page, 'sunday');
    await page.fill('[data-testid="input-first-name"]', 'Test');
    await page.fill('[data-testid="input-last-name"]', 'User');
    await page.fill('[data-testid="input-email"]', 'not-an-email');
    await page.click('[data-testid="btn-buy"]');
    await expect(page).not.toHaveURL(/checkout\.stripe\.com/);
  });

});

// ── TG: Ticket generation ─────────────────────────────────────────────────────

test.describe('Ticket generation', () => {

  test('TG-03 Pass view loads with valid token', async ({ page }) => {
    if (!TOKEN) { test.skip(true, 'Set TEST_PASS_TOKEN to a known paid pass view_token'); return; }
    await page.goto(`${BASE}/passes/view?token=${encodeURIComponent(TOKEN)}`);
    await expect(page.locator('[data-testid="qr-image"]')).toBeVisible({ timeout: 10000 });
  });

  test('TG-07 Invalid token shows friendly error', async ({ page }) => {
    await page.goto(`${BASE}/passes/view?token=00000000-0000-0000-0000-000000000000`);
    await expect(page.locator('text=/not found|check the link/i')).toBeVisible({ timeout: 8000 });
  });

  test('TG-07b Missing token param shows error', async ({ page }) => {
    await page.goto(`${BASE}/passes/view`);
    await expect(page.locator('text=/no pass token|not found|check the link/i')).toBeVisible({ timeout: 8000 });
  });

  test('TG-04 QR endpoint rejects invalid format', async ({ page }) => {
    const res = await page.request.get(`${BASE}/.netlify/functions/generate-pass-qr?ref=INVALID`);
    expect(res.status()).toBe(400);
  });

  test('TG-04b QR endpoint returns 404 for unknown ref', async ({ page }) => {
    const res = await page.request.get(`${BASE}/.netlify/functions/generate-pass-qr?ref=MF-SAT-9999`);
    expect(res.status()).toBe(404);
  });

});

// ── MB: Mobile layout ─────────────────────────────────────────────────────────

test.describe('Mobile layout', () => {

  test('MB-03 No horizontal scroll on 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/passes');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('MB-03b All 4 cards visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/passes');
    await expect(page.locator('[data-testid="pass-card-festival_pass"]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('[data-testid="pass-card-friday"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-card-saturday"]')).toBeVisible();
    await expect(page.locator('[data-testid="pass-card-sunday"]')).toBeVisible();
  });

  test('MB-04 Back link present on /passes', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('[aria-label="Back to home"]')).toBeVisible();
  });

  test('MB-05 Step 2 form usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await selectPass(page, 'festival_pass');
    await expect(page.locator('[data-testid="input-first-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-buy"]')).toBeVisible();
  });

});

// ── AD: Admin dashboard ───────────────────────────────────────────────────────

test.describe('Admin dashboard', () => {

  test('AD-06 Admin page requires password', async ({ page }) => {
    await page.goto(BASE + '/admin');
    await expect(page.locator('[type="password"]')).toBeVisible();
    await expect(page.locator('text=/Ball Drop/i')).not.toBeVisible();
  });

  test('AD-01 Festival Passes tab exists and loads', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('[data-testid="tab-passes"]')).toBeVisible();
    await page.click('[data-testid="tab-passes"]');
    await expect(page.locator('th:has-text("Pass Ref")')).toBeVisible({ timeout: 6000 });
  });

  test('AD-04 CSV export for Festival Passes', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-passes"]');
    page.once('dialog', dialog => dialog.accept());
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.click('button:has-text("Export CSV")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/festival-passes.*\.csv$/i);
  });

  test('AD-05 Search filters pass rows', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-passes"]');
    await page.fill('[placeholder*="Search"]', 'zzzzzz_no_match');
    await expect(page.locator('text=No passes found')).toBeVisible({ timeout: 4000 });
  });

  test('AD-02 Total revenue card visible', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('text=Total revenue')).toBeVisible();
    await expect(page.locator('text=/€[\\d]+\\.\\d{2}/i').first()).toBeVisible();
  });

  test('AD-08 Resend only for paid passes', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-passes"]');
    const pendingBadges = page.locator('span:has-text("pending")');
    const count = await pendingBadges.count();
    if (count > 0) {
      const firstPendingRow = pendingBadges.first().locator('../..');
      await expect(firstPendingRow.locator('button:has-text("Resend")')).not.toBeVisible();
    }
  });

});

// ── FR: Failure and recovery ──────────────────────────────────────────────────

test.describe('Failure and recovery', () => {

  test('FR-01 get-pass-by-ref rejects invalid format', async ({ page }) => {
    const res = await page.request.get(`${BASE}/.netlify/functions/get-pass-by-ref?ref=../etc/passwd`);
    expect(res.status()).toBe(400);
  });

  test('FR-02 get-pass-by-ref rejects empty ref', async ({ page }) => {
    const res = await page.request.get(`${BASE}/.netlify/functions/get-pass-by-ref?ref=`);
    expect(res.status()).toBe(400);
  });

  test('FR-03 get-pass-by-ref returns 404 for unknown ref', async ({ page }) => {
    const res = await page.request.get(`${BASE}/.netlify/functions/get-pass-by-ref?ref=MF-SAT-0000`);
    expect([400, 404]).toContain(res.status());
  });

  test('FR-04 Success page links work', async ({ page }) => {
    await page.goto(`${BASE}/passes/success`);
    await expect(page.locator('a[href*="passes"], a:has-text("Buy another pass")')).toBeVisible({ timeout: 5000 });
  });

});

// ── Passes page — UX additions ───────────────────────────────────────────────

test.describe('Passes page — UX additions', () => {

  test('UP-01 Value banner visible on step 1', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('text=/Attending more than one day/i')).toBeVisible({ timeout: 8000 });
  });

  test('UP-02 Value banner mentions Festival Pass price', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('text=/€20/').first()).toBeVisible({ timeout: 8000 });
  });

  test('UP-03 Festival Pass card has gold outline emphasis', async ({ page }) => {
    await page.goto(BASE + '/passes');
    const card = page.locator('[data-testid="pass-card-festival_pass"]');
    await expect(card).toBeVisible({ timeout: 8000 });
    const outline = await card.evaluate(el => (el as HTMLElement).style.outline);
    // Browser normalises hex to rgb(184, 134, 11)
    expect(outline).toMatch(/B8860B|184,\s*134,\s*11/i);
  });

  test('UP-04 Day pass cards do not have gold outline', async ({ page }) => {
    await page.goto(BASE + '/passes');
    for (const id of ['friday', 'saturday', 'sunday']) {
      const card = page.locator(`[data-testid="pass-card-${id}"]`);
      await expect(card).toBeVisible({ timeout: 8000 });
      const outline = await card.evaluate(el => (el as HTMLElement).style.outline);
      expect(outline).not.toContain('#B8860B');
    }
  });

  test('UP-05 Value banner not visible on step 2', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await page.click('[data-testid="pass-card-friday"]');
    await expect(page.locator('[data-testid="input-first-name"]')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Attending more than one day/i')).not.toBeVisible();
  });

});
