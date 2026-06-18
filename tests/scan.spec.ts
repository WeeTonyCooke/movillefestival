/**
 * tests/scan.spec.ts
 * Moville Summer Festival 2026 — Entrance Scanner Playwright Test Suite
 *
 *   npx playwright test tests/scan.spec.ts --headed
 *
 * Covers:
 *   - Admin → Scan Passes session handoff (no second password prompt)
 *   - Back to menu navigation from the scanner
 *   - Visiting /scan directly with no prior admin session
 *   - validate-pass-scan API correctness, including under concurrency —
 *     this is the part that matters for multiple volunteers scanning at
 *     the same time, since the API itself (not the camera/UI) is where a
 *     double-admit could happen.
 *
 * Environment variables:
 *   TEST_BASE_URL              — default https://stagingmf.netlify.app
 *   TEST_ADMIN_PASS            — admin / scanner password
 *   TEST_PASS_REF              — a known PAID, currently UNUSED pass_ref.
 *                                Consumed by SCAN-13/SCAN-14 (in that order —
 *                                SCAN-13 uses it up, SCAN-14 relies on it
 *                                already being used). Don't reuse a ref you
 *                                need to stay unused.
 *   TEST_PASS_REFS_CONCURRENT  — comma-separated list of 3+ PAID, UNUSED
 *                                pass_refs, each consumed once by SCAN-15
 *                                to prove concurrent scans of DIFFERENT
 *                                passes don't interfere with each other.
 *
 * These tests consume real rows in whichever Supabase project TEST_BASE_URL
 * points at. Only run against staging/QA with disposable test passes —
 * never against production data.
 */

import { test, expect, Page } from '@playwright/test';

const BASE  = process.env.TEST_BASE_URL   || 'https://stagingmf.netlify.app';
const ADMIN = process.env.TEST_ADMIN_PASS || 'testpassword';
const PASS_REF = process.env.TEST_PASS_REF || '';
const CONCURRENT_REFS = (process.env.TEST_PASS_REFS_CONCURRENT || '')
  .split(',').map(r => r.trim()).filter(Boolean);

const SCAN_ENDPOINT = BASE + '/.netlify/functions/validate-pass-scan';

async function loginAdmin(page: Page) {
  if (!process.env.TEST_ADMIN_PASS) {
    throw new Error('TEST_ADMIN_PASS is not set. Scan tests need the real staging admin password.');
  }
  await page.goto(BASE + '/admin');
  await page.fill('[type="password"]', ADMIN);
  await page.click('button:has-text("Sign in")');
  await expect(page.locator('[data-testid="tile-scan-passes"]')).toBeVisible({ timeout: 12000 });
}

// ── Navigation & session handoff ────────────────────────────────────────────

test.describe('Scan — navigation & session handoff', () => {

  test('SCAN-01 Visiting /scan directly with no session asks to sign in via admin', async ({ page }) => {
    await page.goto(BASE + '/scan');
    await expect(page.locator('text=/sign in through committee admin/i')).toBeVisible();
    await expect(page.locator('a:has-text("Go to Admin Login")')).toBeVisible();
  });

  test('SCAN-02 Choosing Scan Passes from admin goes straight to the camera, no second password prompt', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tile-scan-passes"]');
    await expect(page).toHaveURL(BASE + '/scan');
    await expect(page.locator('text=/sign in through committee admin/i')).not.toBeVisible();
    await expect(page.locator('text=/Moville Festival/i')).toBeVisible();
  });

  test('SCAN-03 Back to menu from the scanning screen returns to the chooser without re-asking for a password', async ({ page }) => {
    await loginAdmin(page);
    await page.click('[data-testid="tile-scan-passes"]');
    await page.click('a:has-text("Menu")');
    await expect(page).toHaveURL(BASE + '/admin');
    await expect(page.locator('[type="password"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="tile-scan-passes"]')).toBeVisible();
  });

});

// ── validate-pass-scan API correctness ──────────────────────────────────────

test.describe('Scan — validate-pass-scan API', () => {

  test('SCAN-10 Rejects requests with the wrong password', async ({ request }) => {
    const res = await request.post(SCAN_ENDPOINT, {
      headers: { 'x-admin-password': 'definitely-wrong', 'Content-Type': 'application/json' },
      data: { ref: 'MF-FRI-0001' },
    });
    expect(res.status()).toBe(401);
  });

  test('SCAN-11 Rejects a malformed pass reference', async ({ request }) => {
    const res = await request.post(SCAN_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { ref: 'not-a-real-format' },
    });
    expect(res.status()).toBe(400);
  });

  test('SCAN-12 Reports a friendly message for a ref that does not exist', async ({ request }) => {
    const res = await request.post(SCAN_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { ref: 'MF-ZZZ-9999' },
    });
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.reason).toMatch(/not found/i);
  });

  test('SCAN-13 Four devices scanning the SAME pass at the exact same instant — exactly one admits', async ({ request }) => {
    if (!PASS_REF) { test.skip(true, 'Set TEST_PASS_REF to a known paid, unused pass_ref'); return; }

    // Fire 4 simultaneous scans of the same ref — simulating 4 volunteers'
    // phones hitting the gate at once with the same (possibly duplicated)
    // pass. Without the optimistic-lock fix in validate-pass-scan.js, more
    // than one of these could come back valid:true.
    const responses = await Promise.all(
      Array.from({ length: 4 }, () =>
        request.post(SCAN_ENDPOINT, {
          headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
          data: { ref: PASS_REF },
        })
      )
    );
    const bodies = await Promise.all(responses.map(r => r.json()));

    const admitted = bodies.filter(b => b.valid === true);
    const rejected = bodies.filter(b => b.valid === false);

    expect(admitted.length).toBe(1);
    expect(rejected.length).toBe(3);
    for (const r of rejected) {
      expect(r.reason).toMatch(/already used/i);
    }
  });

  test('SCAN-14 Scanning that same pass again afterwards is still rejected', async ({ request }) => {
    if (!PASS_REF) { test.skip(true, 'Depends on SCAN-13 having already consumed TEST_PASS_REF'); return; }

    const res = await request.post(SCAN_ENDPOINT, {
      headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
      data: { ref: PASS_REF },
    });
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.reason).toMatch(/already used/i);
  });

  test('SCAN-15 Concurrent scans of DIFFERENT valid passes all succeed independently', async ({ request }) => {
    if (CONCURRENT_REFS.length < 2) {
      test.skip(true, 'Set TEST_PASS_REFS_CONCURRENT to 2+ comma-separated paid, unused pass_refs');
      return;
    }

    const responses = await Promise.all(
      CONCURRENT_REFS.map(ref =>
        request.post(SCAN_ENDPOINT, {
          headers: { 'x-admin-password': ADMIN, 'Content-Type': 'application/json' },
          data: { ref },
        })
      )
    );
    const bodies = await Promise.all(responses.map(r => r.json()));

    bodies.forEach((body, i) => {
      expect(body.valid, `ref ${CONCURRENT_REFS[i]} should admit`).toBe(true);
      expect(body.pass_ref).toBe(CONCURRENT_REFS[i]);
    });
  });

});
