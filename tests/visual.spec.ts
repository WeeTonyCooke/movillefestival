/**
 * tests/visual.spec.ts
 * Moville Summer Festival 2026 — Visual Regression Test Suite
 *
 * Captures full-page screenshots of every public route in both
 * light mode (theme-day) and dark mode (theme-night), then diffs
 * against stored baselines on every subsequent run.
 *
 * FIRST RUN — generates baselines:
 *   npx playwright test tests/visual.spec.ts --update-snapshots
 *
 * SUBSEQUENT RUNS — diffs against baselines:
 *   npx playwright test tests/visual.spec.ts
 *
 * Environment variables:
 *   TEST_BASE_URL — default https://stagingmf.netlify.app
 *
 * Baseline images are stored in:
 *   tests/visual.spec.ts-snapshots/
 *
 * Commit the snapshots directory to version control so the
 * baseline travels with the codebase.
 */

import { test, expect, Page } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'https://stagingmf.netlify.app';

// Pixel diff threshold — 0.2% of pixels may differ (anti-aliasing, fonts)
const THRESHOLD = 0.002;

// Routes to screenshot. Each entry: [name, path, waitForSelector]
// waitForSelector is a visible element that confirms the page has settled.
const ROUTES: [string, string, string][] = [
  ['home',              '/',                     '.moville-hero'],
  ['programme',         '/programme',            '.prog-title'],
  ['ball-drop',         '/ball-drop',            '.form-title'],
  ['bed-push',          '/bed-push',             '.form-title'],
  ['craft-fair',        '/craft-fair',           '.form-title'],
  ['sponsorship',       '/sponsorship',          '.form-title'],
  ['passes',            '/passes',               '.ticket-card'],
  ['archive',           '/archive',              '.archive-title'],
  ['getting-to-moville','/getting-to-moville',   '.getting-title'],
  ['privacy',           '/privacy',              '.legal-content'],
  ['terms',             '/terms',                '.legal-content'],
];

// Force the root div to light or dark mode regardless of time of day.
async function setTheme(page: Page, mode: 'light' | 'dark') {
  await page.evaluate((m) => {
    const root = document.querySelector('#root > div') as HTMLElement | null;
    if (!root) return;
    if (m === 'dark') {
      root.classList.remove('theme-day');
      root.classList.add('theme-night');
    } else {
      root.classList.remove('theme-night');
      root.classList.add('theme-day');
    }
  }, mode);
  // Give CSS transitions a moment to settle
  await page.waitForTimeout(400);
}

// Wait for all images and fonts to load before screenshotting
async function waitForPageReady(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  // Wait for any lazy images
  await page.waitForLoadState('networkidle');
}

// ── Light mode ────────────────────────────────────────────────────────────────

test.describe('Light mode', () => {
  for (const [name, path, waitFor] of ROUTES) {
    test(`${name}`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      await waitForPageReady(page, waitFor);
      await setTheme(page, 'light');

      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        threshold: THRESHOLD,
        animations: 'disabled',
      });
    });
  }
});

// ── Dark mode ─────────────────────────────────────────────────────────────────

test.describe('Dark mode', () => {
  for (const [name, path, waitFor] of ROUTES) {
    test(`${name}`, async ({ page }) => {
      await page.goto(`${BASE}${path}`);
      await waitForPageReady(page, waitFor);
      await setTheme(page, 'dark');

      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        threshold: THRESHOLD,
        animations: 'disabled',
      });
    });
  }
});
