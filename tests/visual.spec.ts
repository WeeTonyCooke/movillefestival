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
 *
 * ── When is it valid to run --update-snapshots? ──────────────────────────
 * A failing visual test means EITHER a real regression OR a stale baseline.
 * Before updating any baseline, confirm which one it is:
 *
 *   1. Run the suite twice back-to-back with no code changes in between.
 *      - Same pages/pixel-counts fail identically both times  → stale
 *        baseline or environment drift (safe to investigate further).
 *      - Different pages/pixel-counts each run                → runtime
 *        instability (live data, unsettled state, a real bug). Fix the
 *        instability first. Do NOT update baselines to paper over this.
 *   2. For each failing page, open the actual/expected/diff images
 *      (`npx playwright show-report`) and visually confirm the CURRENT
 *      rendering is the intended design — not a broken or half-loaded
 *      state, not an accidental content change.
 *   3. Only once both checks pass: update, and update ALL confirmed
 *      pages in a single commit with a commit message naming WHY
 *      (e.g. "content change" / "confirmed inventory fix" / "design
 *      change"), never a generic "fix visual tests" commit.
 *   4. Any diff you can't explain — don't accept it. File it as a named
 *      ticket instead of silently re-baselining over it.
 *
 * ── 3 July 2026 investigation (see ANT-78 in Linear) ─────────────────────
 * A run showing 20/22 visual tests failing was traced as follows:
 *   - Confirmed via two consecutive identical runs: stale baselines /
 *     content drift, NOT runtime instability (pixel-diff counts matched
 *     exactly, or within ~3px of AA noise, across both runs).
 *   - Ruled out with hard evidence: Playwright version drift (unchanged
 *     since before baseline capture), Chromium binary drift (installed
 *     Jun 24, before the Jun 27 baseline), OS/display drift, and the
 *     theme-class-override mechanism being reverted by React (diagnostics
 *     confirmed the correct class was present at every capture).
 *   - ball-drop's dramatic height mismatch (989px → 1684px) was caused by
 *     the QA ball_drop_balls inventory corruption (ANT-78): the baseline
 *     captured the page's "sold out" state while `available` was
 *     incorrectly 0. After the inventory repair, the page correctly
 *     renders the full purchase form — confirmed by direct visual
 *     inspection of the live page. This is the fix working, not a
 *     regression.
 *   - The remaining pages showed smaller, but equally stable, diffs with
 *     no shared-component or dependency cause found — consistent with
 *     baselines simply predating legitimate design work (Harbour Light
 *     redesign, hero refresh) that was never re-baselined afterward.
 */

import { test, expect, Page } from '@playwright/test';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const playwrightVersion = require('@playwright/test/package.json').version;

const BASE = process.env.TEST_BASE_URL || 'https://stagingmf.netlify.app';

// Pixel diff threshold — 0.2% of pixels may differ (anti-aliasing, fonts)
const THRESHOLD = 0.002;

let loggedRunnerInfo = false;
function logRunnerInfoOnce(browserName: string, browserVersion: string) {
  if (loggedRunnerInfo) return;
  loggedRunnerInfo = true;
  console.log(
    `\n[visual-diagnostics] Runner info (logged once per test run)\n` +
    `  @playwright/test package version: ${playwrightVersion}\n` +
    `  Browser: ${browserName} ${browserVersion}\n`
  );
}

// Logs the actual rendered state right before a screenshot is taken, so a
// failure can be diagnosed as environment drift, an unsettled theme class,
// or genuinely different content — instead of guessing from a pixel count.
async function logPageDiagnostics(page: Page, label: string) {
  const diag = await page.evaluate(() => ({
    htmlClassName: document.documentElement.className,
    bodyClassName: document.body.className,
    rootDivClassName: (document.querySelector('#root > div') as HTMLElement | null)?.className ?? '(not found)',
    prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    devicePixelRatio: window.devicePixelRatio,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    now: new Date().toString(),
  }));
  console.log(
    `[visual-diagnostics] ${label}\n` +
    `  #root > div className: "${diag.rootDivClassName}"\n` +
    `  documentElement className: "${diag.htmlClassName}" | body className: "${diag.bodyClassName}"\n` +
    `  prefers-color-scheme (OS/browser): ${diag.prefersColorScheme}\n` +
    `  viewport: ${diag.innerWidth}x${diag.innerHeight} @ devicePixelRatio=${diag.devicePixelRatio}\n` +
    `  page's Date().toString(): ${diag.now}\n`
  );
}

// Routes to screenshot. Each entry: [name, path, waitForSelector, clip?]
// waitForSelector is a visible element that confirms the page has settled.
// clip: true = use a fixed-height clip instead of fullPage (for unstable long pages).
const ROUTES: [string, string, string, boolean?][] = [
  ['home',              '/',                     '.moville-hero'],
  ['programme',         '/programme',            '.prog-title'],
  ['ball-drop',         '/ball-drop',            'h1'],
  ['bed-push',          '/bed-push',             '.form-title'],
  ['craft-fair',        '/craft-fair',           '.form-title'],
  ['sponsorship',       '/sponsorship',          '.form-title'],
  ['passes',            '/passes',               '.ticket-card'],
  ['archive',           '/archive',              '.archive-title', true],
  ['getting-to-moville','/getting-to-moville',   '.getting-title'],
  ['privacy',           '/privacy',              '.legal-content'],
  ['terms',             '/terms',                '.legal-content'],
];

// Stable viewport — fixed width eliminates scrollbar-driven 1265/1280 oscillation.
const VIEWPORT = { width: 1280, height: 900 };

// Force the root div to light or dark mode regardless of time of day.
async function setTheme(page: Page, mode: 'light' | 'dark') {
  await page.evaluate((m) => {
    // Force scrollbar always visible to prevent layout shifts
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

// Inject scrollbar stabilisation CSS — must be called before any layout is measured.
// Forces the vertical scrollbar to always occupy space, eliminating the
// 1265px ↔ 1280px width oscillation caused by scrollbar appearing/disappearing.
async function injectScrollbarStability(page: Page) {
  await page.addStyleTag({
    content: 'html { overflow-y: scroll !important; scrollbar-gutter: stable !important; }',
  });
}

// Wait for all images and fonts to load before screenshotting
async function waitForPageReady(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  // Extra settle time for dynamic content (ball count, etc.)
  await page.waitForTimeout(300);
}

// ── Light mode ────────────────────────────────────────────────────────────────

test.describe('Light mode', () => {
  for (const [name, path, waitFor, useClip] of ROUTES) {
    test(`${name}`, async ({ page, browserName }) => {
      logRunnerInfoOnce(browserName, page.context().browser()?.version() ?? 'unknown');
      await page.setViewportSize(VIEWPORT);
      await page.goto(`${BASE}${path}`);
      await injectScrollbarStability(page);
      await waitForPageReady(page, waitFor);
      await setTheme(page, 'light');
      await logPageDiagnostics(page, `Light mode / ${name}`);

      if (useClip) {
        // Clip to a stable top section to avoid long-page flicker
        await expect(page).toHaveScreenshot(`${name}-light.png`, {
          clip: { x: 0, y: 0, width: VIEWPORT.width, height: 2400 },
          threshold: THRESHOLD,
          animations: 'disabled',
        });
      } else {
        await expect(page).toHaveScreenshot(`${name}-light.png`, {
          fullPage: true,
          threshold: THRESHOLD,
          animations: 'disabled',
        });
      }
    });
  }
});

// ── Dark mode ─────────────────────────────────────────────────────────────────

test.describe('Dark mode', () => {
  for (const [name, path, waitFor, useClip] of ROUTES) {
    test(`${name}`, async ({ page, browserName }) => {
      logRunnerInfoOnce(browserName, page.context().browser()?.version() ?? 'unknown');
      await page.setViewportSize(VIEWPORT);
      await page.goto(`${BASE}${path}`);
      await injectScrollbarStability(page);
      await waitForPageReady(page, waitFor);
      await setTheme(page, 'dark');
      await logPageDiagnostics(page, `Dark mode / ${name}`);

      if (useClip) {
        await expect(page).toHaveScreenshot(`${name}-dark.png`, {
          clip: { x: 0, y: 0, width: VIEWPORT.width, height: 2400 },
          threshold: THRESHOLD,
          animations: 'disabled',
        });
      } else {
        await expect(page).toHaveScreenshot(`${name}-dark.png`, {
          fullPage: true,
          threshold: THRESHOLD,
          animations: 'disabled',
        });
      }
    });
  }
});
