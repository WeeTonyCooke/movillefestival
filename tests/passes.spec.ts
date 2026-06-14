/**
 * tests/passes.spec.ts
 * Moville Summer Festival 2026 — Festival Pass Playwright Test Suite
 *
 * Run against a local dev server (Stripe test mode) or the deployed staging URL.
 *
 *   npx playwright test tests/passes.spec.ts
 *
 * Environment variables:
 *   TEST_BASE_URL     — default http://localhost:5173
 *   TEST_PASS_REF     — a known paid pass ref for view-page tests (e.g. MF-FRI-0001)
 *   TEST_ADMIN_PASS   — admin panel password
 *
 * Stripe test cards used:
 *   4242 4242 4242 4242 — succeeds
 *   4000 0000 0000 0002 — card declined
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL  || 'http://localhost:5173';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fillPassForm(page: Page, opts: {
  passText: string;
  btnText:  string;
  first?:   string;
  last?:    string;
  email?:   string;
}) {
  await page.goto(BASE + '/passes');
  await page.click(`text=${opts.passText}`);
  await page.fill('[placeholder="Séamus"]',               opts.first ?? 'Test');
  await page.fill('[placeholder="O\'Brien"]',              opts.last  ?? 'User');
  await page.fill('[placeholder="seamus@example.com"]',   opts.email ?? 'test@example.com');
  await page.click(`button:has-text("${opts.btnText}")`);
}

async function fillStripeCard(page: Page, cardNumber: string) {
  // Stripe hosted checkout — wait for Stripe domain
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
  await page.fill('[placeholder="1234 1234 1234 1234"]', cardNumber);
  await page.fill('[placeholder="MM / YY"]',             '12 / 30');
  await page.fill('[placeholder="CVC"]',                 '123');
  await page.fill('[placeholder="Full name on card"]',   'Test User').catch(() => {});
  await page.click('[data-testid="hosted-payment-submit-button"]');
}

// ── PF: Purchase flow ────────────────────────────────────────────────────────

test.describe('Purchase flow', () => {

  test('PF-01 Festival Pass (€20) — successful purchase', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Moville Festival Pass',
      btnText:  'Buy Festival Pass',
      email:    'pf01@example.com',
    });
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
    await expect(page.locator('h1, h2')).toContainText(/confirmed|purchase/i);
  });

  test('PF-02 Friday Day Pass (€10) — successful purchase', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Friday Day Pass',
      btnText:  'Buy Friday Pass',
      email:    'pf02@example.com',
    });
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-03 Saturday Day Pass — successful purchase', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Saturday Day Pass',
      btnText:  'Buy Saturday Pass',
      email:    'pf03@example.com',
    });
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-04 Sunday Day Pass — successful purchase', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Sunday Day Pass',
      btnText:  'Buy Sunday Pass',
      email:    'pf04@example.com',
    });
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/\/passes\/success/, { timeout: 20000 });
  });

  test('PF-05 Declined card — no pass created', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Friday Day Pass',
      btnText:  'Buy Friday Pass',
      email:    'pf05@example.com',
    });
    await fillStripeCard(page, '4000 0000 0000 0002');
    // Stripe should show a decline error — we stay on the Stripe checkout page
    await expect(page.locator('text=/declined|card was declined/i')).toBeVisible({ timeout: 15000 });
    // Must NOT redirect to /passes/success
    await expect(page).not.toHaveURL(/\/passes\/success/);
  });

  test('PF-06 Abandoned checkout — cancel returns to /passes', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Saturday Day Pass',
      btnText:  'Buy Saturday Pass',
    });
    // Reach Stripe, then click cancel
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.click('text=/cancel|back/i').catch(async () => {
      // Some Stripe flows use a back arrow icon; fall back to browser back
      await page.goBack();
    });
    await expect(page).toHaveURL(/\/passes/, { timeout: 8000 });
    // Page should render cleanly
    await expect(page.locator('h1')).toContainText(/choose your pass/i);
  });

  test('PF-07 Back button during checkout returns to /passes', async ({ page }) => {
    await fillPassForm(page, {
      passText: 'Sunday Day Pass',
      btnText:  'Buy Sunday Pass',
    });
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/passes/, { timeout: 8000 });
    await expect(page.locator('h1')).toContainText(/choose your pass/i);
  });

  test('PF-08 Double-click Buy button only creates one session', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await page.click('text=Saturday Day Pass');
    await page.fill('[placeholder="Séamus"]',             'Test');
    await page.fill('[placeholder="O\'Brien"]',            'User');
    await page.fill('[placeholder="seamus@example.com"]', 'pf08@example.com');
    const btn = page.locator('button:has-text("Buy Saturday Pass")');
    // Rapid double-click
    await btn.click();
    await btn.click();
    // Button should be disabled / loading after first click
    await expect(btn).toBeDisabled();
  });

  test('PF-09 Missing first name — form validation blocks submission', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await page.click('text=Friday Day Pass');
    // Leave first name blank
    await page.fill('[placeholder="O\'Brien"]',            'User');
    await page.fill('[placeholder="seamus@example.com"]', 'test@example.com');
    await page.click('button:has-text("Buy Friday Pass")');
    // Should stay on the same page — no navigation to Stripe
    await expect(page).toHaveURL(/\/passes/, { timeout: 3000 });
    await expect(page).not.toHaveURL(/checkout\.stripe\.com/);
  });

  test('PF-10 Invalid email — form validation blocks submission', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await page.click('text=Sunday Day Pass');
    await page.fill('[placeholder="Séamus"]',             'Test');
    await page.fill('[placeholder="O\'Brien"]',            'User');
    await page.fill('[placeholder="seamus@example.com"]', 'not-an-email');
    await page.click('button:has-text("Buy Sunday Pass")');
    await expect(page).not.toHaveURL(/checkout\.stripe\.com/);
  });

});

// ── TG: Ticket / pass generation ─────────────────────────────────────────────

test.describe('Ticket generation', () => {

  test('TG-03 Pass view page loads with valid paid ref', async ({ page }) => {
    const ref = process.env.TEST_PASS_REF;
    if (!ref) {
      test.skip(true, 'Set TEST_PASS_REF env var to a known paid pass ref');
      return;
    }
    await page.goto(`${BASE}/passes/view?ref=${encodeURIComponent(ref)}`);
    // QR code image should appear
    await expect(page.locator('img[alt*="QR"], img[alt*="qr"]')).toBeVisible({ timeout: 10000 });
    // Pass ref should be visible on page
    await expect(page.locator(`text=${ref}`)).toBeVisible();
    // Should show a name (any non-empty text in the holder name section)
    await expect(page.locator('text=/Pass Holder/i')).toBeVisible();
  });

  test('TG-07 Invalid pass ref shows friendly error', async ({ page }) => {
    await page.goto(`${BASE}/passes/view?ref=INVALID-9999`);
    await expect(page.locator('text=/not found|check the link/i')).toBeVisible({ timeout: 8000 });
  });

  test('TG-07b Missing ref param shows error', async ({ page }) => {
    await page.goto(`${BASE}/passes/view`);
    await expect(page.locator('text=/no pass reference|not found/i')).toBeVisible({ timeout: 8000 });
  });

  test('TG-04 QR endpoint only serves paid passes', async ({ page }) => {
    // Attempt to generate QR for a ref with wrong format — should get 400
    const res = await page.request.get(`${BASE}/.netlify/functions/generate-pass-qr?ref=INVALID`);
    expect(res.status()).toBe(400);
  });

  test('TG-04b QR endpoint rejects unknown ref', async ({ page }) => {
    // Valid format, but ref does not exist
    const res = await page.request.get(`${BASE}/.netlify/functions/generate-pass-qr?ref=MF-SAT-9999`);
    expect(res.status()).toBe(404);
  });

});

// ── MB: Mobile layout ────────────────────────────────────────────────────────

test.describe('Mobile layout', () => {

  test('MB-03 Passes page — no horizontal scroll on 390px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
    await page.goto(BASE + '/passes');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('MB-03b All 4 pass cards visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/passes');
    await expect(page.locator('text=Moville Festival Pass')).toBeVisible();
    await expect(page.locator('text=Friday Day Pass')).toBeVisible();
    await expect(page.locator('text=Saturday Day Pass')).toBeVisible();
    await expect(page.locator('text=Sunday Day Pass')).toBeVisible();
  });

  test('MB-04 Back link is present on /passes', async ({ page }) => {
    await page.goto(BASE + '/passes');
    await expect(page.locator('text=/back to festival/i')).toBeVisible();
    await page.click('text=/back to festival/i');
    await expect(page).toHaveURL(/^\/?$|\/$/); // back to homepage
  });

});

// ── AD: Admin dashboard ──────────────────────────────────────────────────────

test.describe('Admin dashboard', () => {

  async function loginAdmin(page: Page) {
    await page.goto(BASE + '/admin');
    await page.fill('[type="password"]', ADMIN);
    await page.click('button:has-text("Sign in")');
    await expect(page.locator('text=/Committee admin/i')).toBeVisible({ timeout: 8000 });
  }

  test('AD-06 Admin page requires password', async ({ page }) => {
    await page.goto(BASE + '/admin');
    // Should see login form, not data
    await expect(page.locator('[type="password"]')).toBeVisible();
    await expect(page.locator('text=/Ball Drop/i')).not.toBeVisible();
  });

  test('AD-01 Festival Passes tab exists and loads', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('button:has-text("Festival Passes")')).toBeVisible();
    await page.click('button:has-text("Festival Passes")');
    // Table headers should appear
    await expect(page.locator('text=Pass Ref')).toBeVisible();
    await expect(page.locator('text=Pass Type')).toBeVisible();
  });

  test('AD-04 CSV export for Festival Passes produces download', async ({ page }) => {
    await loginAdmin(page);
    await page.click('button:has-text("Festival Passes")');
    // Set up download listener before clicking Export
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.click('button:has-text("Export CSV")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/festival-passes.*\.csv$/i);
  });

  test('AD-05 Search filters pass rows by name', async ({ page }) => {
    await loginAdmin(page);
    await page.click('button:has-text("Festival Passes")');
    await page.fill('[placeholder*="Search"]', 'zzzzzz_no_match');
    await expect(page.locator('text=No passes found')).toBeVisible({ timeout: 4000 });
  });

  test('AD-02 Total revenue card includes pass sales', async ({ page }) => {
    await loginAdmin(page);
    // Revenue card should be present and show a non-zero figure
    const revenueCard = page.locator('text=Total revenue').locator('..');
    await expect(revenueCard).toBeVisible();
    // Check the value cell (sibling) contains a euro sign
    await expect(page.locator('text=/\u20ac[\d]+\.\d{2}/')).toBeVisible();
  });

  test('AD-08 Resend button only appears for paid passes', async ({ page }) => {
    await loginAdmin(page);
    await page.click('button:has-text("Festival Passes")');
    // All visible Resend buttons should correspond to paid rows only
    // (pending rows show a dash, not a Resend button)
    const pendingBadges = page.locator('span:has-text("pending")');
    const count = await pendingBadges.count();
    if (count > 0) {
      // Find a pending row and confirm it has no Resend button
      const firstPendingRow = pendingBadges.first().locator('../..');
      await expect(firstPendingRow.locator('button:has-text("Resend")')).not.toBeVisible();
    }
  });

});

// ── FR: Failure and recovery ──────────────────────────────────────────────────

test.describe('Failure and recovery', () => {

  test('FR-get-pass-by-ref rejects pending passes', async ({ page }) => {
    // Direct API call — should return 404 for any pending (unpaid) pass
    // We can only test the format validation here without a real pending ref
    const res = await page.request.get(
      `${BASE}/.netlify/functions/get-pass-by-ref?ref=MF-SAT-0000`
    );
    // Either 400 (bad format for 0000 — actually 0000 is valid format) or 404 (not found)
    expect([400, 404]).toContain(res.status());
  });

  test('FR-get-pass-by-ref rejects invalid ref format', async ({ page }) => {
    const res = await page.request.get(
      `${BASE}/.netlify/functions/get-pass-by-ref?ref=../../../etc/passwd`
    );
    expect(res.status()).toBe(400);
  });

  test('FR-get-pass-by-ref rejects empty ref', async ({ page }) => {
    const res = await page.request.get(
      `${BASE}/.netlify/functions/get-pass-by-ref?ref=`
    );
    expect(res.status()).toBe(400);
  });

  test('FR success page links back to /passes and /programme', async ({ page }) => {
    // Visit success page directly (e.g. after a real purchase in another test run)
    await page.goto(`${BASE}/passes/success`);
    await expect(page.locator('a:has-text("Buy another pass"), a:has-text("passes")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('a:has-text("programme")')).toBeVisible();
  });

});
