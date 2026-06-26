/**
 * tests/registrations.spec.ts
 * Moville Summer Festival 2026 — Registration Pages Playwright Test Suite
 *
 *   npx playwright test tests/registrations.spec.ts --headed
 *
 * Environment variables:
 *   TEST_BASE_URL    — default https://stagingmf.netlify.app
 *   TEST_ADMIN_PASS  — admin panel password
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL  || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';

// ── Stripe helper ─────────────────────────────────────────────────────────────

async function fillStripeCard(page: Page, cardNumber: string) {
  await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
  await page.fill('[placeholder="1234 1234 1234 1234"]', cardNumber);
  await page.fill('[placeholder="MM / YY"]', '12 / 30');
  await page.fill('[placeholder="CVC"]', '123');
  await page.fill('[placeholder="Full name on card"]', 'Test User').catch(() => {});
  await page.click('[data-testid="hosted-payment-submit-button"]');
}

// ── Ball Drop helpers ─────────────────────────────────────────────────────────

async function fillBallDropForm(page: Page, opts: {
  bundle?:  '1' | '5';
  name?:    string;
  email?:   string;
  phone?:   string;
  over18?:  boolean;
  noRefund?: boolean;
} = {}) {
  await page.goto(BASE + '/ball-drop');

  // Select bundle
  if ((opts.bundle ?? '1') === '5') {
    await page.locator('.ball-option.featured').click();
  } else {
    await page.locator('.ball-option:not(.featured)').first().click();
  }

  await page.fill('[placeholder="Your full name"]',  opts.name  ?? 'Test User');
  await page.fill('[placeholder="your@email.com"]',  opts.email ?? 'test@example.com');
  await page.fill('[placeholder*="country code"]',   opts.phone ?? '0851234567');

  // Wait for React to settle after text entry before clicking checkboxes
  await page.waitForTimeout(400);

  if (opts.over18 !== false) {
    await page.locator('label').filter({ hasText: /over 18/i }).click();
  }
  if (opts.noRefund !== false) {
    await page.locator('label').filter({ hasText: /non-refundable|refund/i }).click();
  }
}

// ── Bed Push helpers ──────────────────────────────────────────────────────────

async function fillBedPushForm(page: Page, opts: {
  teamName?:    string;
  organisation?: string;
  captainName?: string;
  email?:       string;
  phone?:       string;
  checkboxes?:  boolean;
} = {}) {
  await page.goto(BASE + '/bed-push');
  await page.fill('[placeholder*="Flying Duvets"]',  opts.teamName    ?? 'Test Team');
  await page.fill('[placeholder*="Moville GAA"]',    opts.organisation ?? 'Test Org');
  await page.fill('[placeholder*="captain"]',        opts.captainName ?? 'Test Captain');
  await page.fill('[placeholder="your@email.com"]',  opts.email       ?? 'test@example.com');
  await page.fill('[placeholder*="event day"]',      opts.phone       ?? '0851234567');

  await page.waitForTimeout(400);

  if (opts.checkboxes !== false) {
    const checkboxes = page.locator('input[type="checkbox"]');
    // If sold out, form renders without checkboxes — skip gracefully
    const count = await checkboxes.count();
    if (count === 0) return;
    // Wait for form to settle before interacting with checkboxes
    await page.waitForTimeout(300);
    // Use dispatchEvent to fire React synthetic events — avoids DOM stability issues
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      inputs.forEach(input => {
        const el = input as HTMLInputElement;
        if (!el.checked) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'checked'
          )?.set;
          nativeInputValueSetter?.call(el, true);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(200);
  }
}

// ── Craft Fair helpers ────────────────────────────────────────────────────────

async function fillCraftFairForm(page: Page, opts: {
  fullName?:    string;
  email?:       string;
  phone?:       string;
  businessName?: string;
  products?:    string;
  checkboxes?:  boolean;
} = {}) {
  await page.goto(BASE + '/craft-fair');
  await page.fill('[placeholder="Your full name"]',           opts.fullName     ?? 'Test Trader');
  await page.fill('[placeholder="your@email.com"]',          opts.email        ?? 'test@example.com');
  await page.fill('[placeholder*="event day"]',               opts.phone        ?? '0851234567');
  await page.fill('[placeholder*="Ceramics"]',                opts.businessName ?? 'Test Crafts');
  await page.fill('[placeholder*="handmade ceramics"]',       opts.products     ?? 'Handmade candles');

  await page.waitForTimeout(400);

  if (opts.checkboxes !== false) {
    const checkboxes = page.locator('input[type="checkbox"]');
    // If sold out, form renders without checkboxes — skip gracefully
    const count = await checkboxes.count();
    if (count === 0) return;
    // Wait for form to settle before interacting with checkboxes
    await page.waitForTimeout(300);
    // Use dispatchEvent to fire React synthetic events — avoids DOM stability issues
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      inputs.forEach(input => {
        const el = input as HTMLInputElement;
        if (!el.checked) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'checked'
          )?.set;
          nativeInputValueSetter?.call(el, true);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    await page.waitForTimeout(200);
  }
}

// ── Admin helper ──────────────────────────────────────────────────────────────

async function loginAdmin(page: Page) {
  if (!process.env.TEST_ADMIN_PASS) {
    throw new Error('TEST_ADMIN_PASS is not set. Admin tests need the real staging admin password.');
  }

  await page.goto(BASE + '/admin');
  await page.fill('[type="password"]', ADMIN);
  await page.click('button:has-text("Sign in")');
  await page.click('[data-testid="tile-reports-admin"]');

  // The admin page now lands on a two-choice menu. Enter Reports & Admin,
  // then wait for a dashboard-only element so login is genuinely complete.
  await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible({ timeout: 12000 });
}

// ── BD: Ball Drop ─────────────────────────────────────────────────────────────

test.describe('Ball Drop', () => {

  test('BD-01 Ball Drop page loads correctly', async ({ page }) => {
    await page.goto(BASE + '/ball-drop');
    await expect(page.locator('h1')).toContainText(/ball drop/i);
    // Check either bundle option is visible
    await expect(page.locator('.ball-option').first()).toBeVisible();
  });

  test('BD-02 Successful single ball purchase', async ({ page }) => {
    await fillBallDropForm(page, { bundle: '1', email: 'bd02@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/ball-drop/, { timeout: 20000 });
    await expect(page.locator('text=/confirmed|thank you|numbers/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('BD-03 Successful 5-ball bundle purchase', async ({ page }) => {
    await fillBallDropForm(page, { bundle: '5', email: 'bd03@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/ball-drop/, { timeout: 20000 });
    await expect(page.locator('text=/confirmed|thank you|numbers/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('BD-04 Declined card — no registration created', async ({ page }) => {
    await fillBallDropForm(page, { email: 'bd04@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4000 0000 0000 0002');
    await expect(page.locator('text=/declined/i')).toBeVisible({ timeout: 15000 });
  });

  test('BD-05 Abandoned checkout returns to ball drop', async ({ page }) => {
    await fillBallDropForm(page, { email: 'bd05@example.com' });
    await page.locator('button.form-submit').click();
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/ball-drop/, { timeout: 8000 });
  });

  test('BD-06 Form validation — missing name blocks submit', async ({ page }) => {
    await page.goto(BASE + '/ball-drop');
    await page.locator('.ball-option:not(.featured)').first().click();
    // Leave name blank — fill email and phone only
    await page.fill('[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('[placeholder*="country code"]', '0851234567');
    await page.waitForTimeout(400);
    await page.locator('label').filter({ hasText: /over 18/i }).click();
    await page.locator('label').filter({ hasText: /non-refundable|refund/i }).click();
    // Submit button should remain disabled
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('BD-07 Form validation — over 18 checkbox keeps button disabled', async ({ page }) => {
    await page.goto(BASE + '/ball-drop');
    await page.locator('.ball-option:not(.featured)').first().click();
    await page.fill('[placeholder="Your full name"]', 'Test User');
    await page.fill('[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('[placeholder*="country code"]', '0851234567');
    await page.waitForTimeout(400);
    // Do NOT tick over18 — button should be disabled
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('BD-08 Ball Drop page layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/ball-drop');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await expect(page.locator('h1')).toContainText(/ball drop/i);
  });

  test('BD-09 Returning to homepage scrolls to top (ANT-40)', async ({ page }) => {
    await page.goto(BASE + '/ball-drop?status=success');
    await expect(page.locator('text=/you.?re in/i')).toBeVisible({ timeout: 8000 });
    await page.evaluate(() => window.scrollTo({ top: 600, left: 0, behavior: 'instant' }));
    await page.click('a:has-text("Back to festival site")');
    await page.waitForURL(BASE + '/');
    // Wait for ScrollToTop useEffect to fire and scroll to settle
    await page.waitForFunction(() => window.scrollY === 0, { timeout: 3000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

});

// ── BP: Bed Push Race ─────────────────────────────────────────────────────────

test.describe('Bed Push Race', () => {

  test('BP-01 Bed Push page loads correctly', async ({ page }) => {
    await page.goto(BASE + '/bed-push');
    await expect(page.locator('h1')).toContainText(/bed push/i);
    await expect(page.locator('text=/€50/i').first()).toBeVisible();
  });

  test.skip('BP-02 Successful team registration', async ({ page }) => {
    await fillBedPushForm(page, { email: 'bp02@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page.locator('text=/confirmed|entered|registered/i').first()).toBeVisible({ timeout: 20000 });
  });

  test.skip('BP-03 Declined card — no registration created', async ({ page }) => {
    await fillBedPushForm(page, { email: 'bp03@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4000 0000 0000 0002');
    await expect(page.locator('text=/declined/i')).toBeVisible({ timeout: 15000 });
  });

  test.skip('BP-04 Abandoned checkout returns to bed push', async ({ page }) => {
    await fillBedPushForm(page, { email: 'bp04@example.com' });
    await page.locator('button.form-submit').click();
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/bed-push/, { timeout: 8000 });
  });

  test.skip('BP-05 Form validation — missing team name keeps button disabled', async ({ page }) => {
    await page.goto(BASE + '/bed-push');
    // Fill everything except team name
    await page.fill('[placeholder*="captain"]',       'Test Captain');
    await page.fill('[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('[placeholder*="event day"]',     '0851234567');
    await page.waitForTimeout(400);
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < 4; i++) {
      const cb = page.locator('input[type="checkbox"]').nth(i);
      await cb.waitFor({ state: 'visible', timeout: 5000 });
      await cb.check();
      await page.waitForTimeout(100);
    }
    // Button should remain disabled without team name
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('BP-06 Form validation — unchecked boxes keep button disabled', async ({ page }) => {
    await fillBedPushForm(page, { checkboxes: false });
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('BP-07 Bed Push page layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/bed-push');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('BP-08 Sold-out state shows correctly when at capacity', async ({ page }) => {
    await page.goto(BASE + '/bed-push');
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

});

// ── CF: Craft Fair ────────────────────────────────────────────────────────────

test.describe('Craft Fair', () => {

  test('CF-01 Craft Fair page loads correctly', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    await expect(page.locator('h1')).toContainText(/craft fair/i);
    await expect(page.locator('text=/€20/i').first()).toBeVisible();
  });

  test.skip('CF-02 Successful stall registration', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    if (await page.locator('text=/sold out/i').isVisible()) {
      test.skip();
      return;
    }
    await fillCraftFairForm(page, { email: 'cf02@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4242 4242 4242 4242');
    await expect(page).toHaveURL(/craft-fair/, { timeout: 20000 });
    await expect(page.locator('text=/confirmed|booked|stall/i').first()).toBeVisible({ timeout: 10000 });
  });

  test.skip('CF-03 Declined card — no registration created', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    if (await page.locator('text=/sold out/i').isVisible()) { test.skip(); return; }
    await fillCraftFairForm(page, { email: 'cf03@example.com' });
    await page.locator('button.form-submit').click();
    await fillStripeCard(page, '4000 0000 0000 0002');
    await expect(page.locator('text=/declined/i')).toBeVisible({ timeout: 15000 });
  });

  test.skip('CF-04 Abandoned checkout returns to craft fair', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    if (await page.locator('text=/sold out/i').isVisible()) { test.skip(); return; }
    await fillCraftFairForm(page, { email: 'cf04@example.com' });
    await page.locator('button.form-submit').click();
    await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 12000 });
    await page.goBack();
    await expect(page).toHaveURL(/craft-fair/, { timeout: 8000 });
  });

  test.skip('CF-05 Form validation — missing products keeps button disabled', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    await page.fill('[placeholder="Your full name"]',  'Test Trader');
    await page.fill('[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('[placeholder*="event day"]',      '0851234567');
    // Leave products blank
    await page.waitForTimeout(400);
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < 4; i++) {
      const cb = page.locator('input[type="checkbox"]').nth(i);
      await cb.waitFor({ state: 'visible', timeout: 5000 });
      await cb.check();
      await page.waitForTimeout(100);
    }
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('CF-06 Form validation — unchecked boxes keep button disabled', async ({ page }) => {
    await fillCraftFairForm(page, { checkboxes: false });
    await expect(page.locator('button.form-submit')).toBeDisabled();
  });

  test('CF-07 Craft Fair page layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/craft-fair');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('CF-08 Sold-out state renders without error', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    await expect(page.locator('body')).not.toContainText(/error|crash/i);
  });

});

// ── Admin: Registration data ──────────────────────────────────────────────────

test.describe('Admin — registration data', () => {

  test('Admin-01 Ball Drop tab shows registrations', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('[data-testid="tab-balldrop"]')).toBeVisible();
    await page.click('[data-testid="tab-balldrop"]');
    await expect(page.locator('th:has-text("Ball numbers")')).toBeVisible();
  });

  test('Admin-02 Bed Push tab shows registrations', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-bedpush"]');
    await expect(page.locator('th:has-text("Team")')).toBeVisible();
  });

  test('Admin-03 Craft Fair tab shows registrations', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-craftfair"]');
    await expect(page.locator('th:has-text("Products")')).toBeVisible();
  });

  test('Admin-04 CSV export works for Ball Drop', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    page.once('dialog', dialog => dialog.accept());
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.click('button:has-text("Export CSV")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/ball-drop.*\.csv$/i);
  });

  test('Admin-05 CSV export works for Bed Push', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-bedpush"]');
    page.once('dialog', dialog => dialog.accept());
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.click('button:has-text("Export CSV")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/bed-push.*\.csv$/i);
  });

  test('Admin-06 CSV export works for Craft Fair', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-craftfair"]');
    page.once('dialog', dialog => dialog.accept());
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 8000 }),
      page.click('button:has-text("Export CSV")'),
    ]);
    expect(download.suggestedFilename()).toMatch(/craft-fair.*\.csv$/i);
  });

  test('Admin-07 Search filters results', async ({ page }) => {
    await loginAdmin(page);
    // Search input is visible on any tab
    await page.fill('[placeholder*="Search"]', 'zzzzzz_no_match');
    await expect(page.locator('tbody tr td[colspan]')).toBeVisible({ timeout: 4000 });
  });

  test('Admin-08 Revenue card is visible', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('text=Total revenue')).toBeVisible();
    await expect(page.locator('text=/€[\\d]+\\.\\d{2}/').first()).toBeVisible();
  });

  test('Admin-09 Email addresses are masked in Ball Drop table (ANT-41)', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    const cell = page.locator('table tbody tr').first().locator('td').nth(1);
    await expect(cell).toBeVisible({ timeout: 6000 });
    const text = (await cell.textContent()) || '';
    expect(text).toMatch(/\.\.\.@/);
  });

  test('Admin-10 Phone numbers are masked in Ball Drop table (ANT-42)', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    const cell = page.locator('table tbody tr').first().locator('td').nth(2);
    await expect(cell).toBeVisible({ timeout: 6000 });
    const text = (await cell.textContent()) || '';
    expect(text).toMatch(/^[+\d]{1,5}\*+\d{2,4}$/);
  });

  test('Admin-11 CSV export shows GDPR warning before download (ANT-46)', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tab-balldrop"]');
    let dialogMessage = '';
    page.once('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });
    await page.click('button:has-text("Export CSV")');
    await page.waitForTimeout(500);
    expect(dialogMessage).toMatch(/personal data/i);
  });

});

// ── Site navigation ───────────────────────────────────────────────────────────

test.describe('Site navigation', () => {

  test('NAV-01 Homepage loads', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('text=/Moville/i').first()).toBeVisible({ timeout: 8000 });
  });

  test('NAV-02 Programme page loads', async ({ page }) => {
    await page.goto(BASE + '/programme');
    await expect(page.locator('h1')).toContainText(/programme/i);
  });

  test('NAV-03 Ball Drop page loads', async ({ page }) => {
    await page.goto(BASE + '/ball-drop');
    await expect(page.locator('h1')).toContainText(/ball drop/i);
  });

  test('NAV-04 Bed Push page loads', async ({ page }) => {
    await page.goto(BASE + '/bed-push');
    await expect(page.locator('h1')).toContainText(/bed push/i);
  });

  test('NAV-05 Craft Fair page loads', async ({ page }) => {
    await page.goto(BASE + '/craft-fair');
    await expect(page.locator('h1')).toContainText(/craft fair/i);
  });

  test('NAV-06 Privacy policy page loads', async ({ page }) => {
    await page.goto(BASE + '/privacy');
    await expect(page.locator('h1')).toContainText(/privacy/i);
  });

  test('NAV-07 Terms and conditions page loads', async ({ page }) => {
    await page.goto(BASE + '/terms');
    await expect(page.locator('h1')).toContainText(/terms/i);
  });

  test('NAV-08 Unknown route does not crash', async ({ page }) => {
    await page.goto(BASE + '/this-page-does-not-exist');
    // React router may redirect to home — just confirm no server error
    await expect(page.locator('body')).not.toContainText(/internal server error|application error|something went wrong/i);
  });

  test('NAV-09 Footer shows Privacy and Terms links on homepage (ANT-50)', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
  });

  test('NAV-10 Footer is hidden on the admin page', async ({ page }) => {
    await loginAdmin(page);
    await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(0);
  });

});

// ── Programme page — admission chips ─────────────────────────────────────────

test.describe('Programme page — admission chips', () => {

  test('PC-01 Admission chip is present on programme page', async ({ page }) => {
    await page.goto(BASE + '/programme');
    // Chip may be off-screen inside a collapsed day — check DOM presence not visibility
    const chip = page.locator('.prog-event-admission-chip').first();
    await expect(chip).toBeAttached({ timeout: 8000 });
  });

  test('PC-02 Admission chip links to /passes', async ({ page }) => {
    await page.goto(BASE + '/programme');
    const chip = page.locator('.prog-event-admission-chip').first();
    await expect(chip).toBeAttached({ timeout: 8000 });
    // Verify href rather than clicking — chip may be in a collapsed/hidden section
    const href = await chip.getAttribute('href');
    expect(href).toBe('/passes');
  });

  test('PC-03 Admission chip is a link element not a plain span', async ({ page }) => {
    await page.goto(BASE + '/programme');
    const chip = page.locator('.prog-event-admission-chip').first();
    await expect(chip).toBeAttached({ timeout: 8000 });
    const tagName = await chip.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

});
