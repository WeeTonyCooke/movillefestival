# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/visual.spec.ts >> Dark mode >> home
- Location: tests/visual.spec.ts:95:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  297647 pixels (ratio 0.10 of all image pixels) are different.

  Snapshot: home-dark.png

Call log:
  - Expect "toHaveScreenshot(home-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1280px by 2370px, received 1265px by 2370px. 406326 pixels (ratio 0.14 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 1265px by 2370px, received 1280px by 2370px. 172006 pixels (ratio 0.06 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 138389 pixels (ratio 0.05 of all image pixels) are different.
  - waiting 500ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 138389 pixels (ratio 0.05 of all image pixels) are different.
  - waiting 1000ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 297647 pixels (ratio 0.10 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e10]:
      - generic [ref=e12]:
        - paragraph [ref=e13]: Inishowen · Since 1958
        - heading "Moville Festival" [level=1] [ref=e14]
        - paragraph [ref=e15]: 8–12 July 2026
      - button "View Programme" [ref=e18] [cursor=pointer]
    - button "Ball Drop — win up to €500, buy a ball" [ref=e19] [cursor=pointer]:
      - generic [ref=e20]: Ball Drop
      - generic [ref=e21]: €500
      - generic [ref=e22]: Buy tickets
    - generic [ref=e23]:
      - text: "Photo:"
      - link "@christybutterz" [ref=e24] [cursor=pointer]:
        - /url: https://www.instagram.com/christybutterz/
  - button "Sponsor the Festival" [ref=e25] [cursor=pointer]:
    - text: Sponsor the Festival
    - generic [ref=e26]: →
  - generic [ref=e28]:
    - generic [ref=e29]:
      - paragraph [ref=e30]: Festival Fundraiser · 12 July
      - heading "The Great Ball Drop" [level=2] [ref=e31]
      - paragraph [ref=e32]: 1,200 numbered balls are released at Festival Square. The first three to cross the finish line win cash prizes. You don't need to be there to win.
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]: 1st
        - generic [ref=e36]: €500
      - generic [ref=e37]:
        - generic [ref=e38]: 2nd
        - generic [ref=e39]: €300
      - generic [ref=e40]:
        - generic [ref=e41]: 3rd
        - generic [ref=e42]: €150
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]: Best value
        - generic [ref=e46]: €20
        - generic [ref=e47]: 5 balls · 5 chances
        - generic [ref=e48]: €4 each — save €5
      - generic [ref=e49]:
        - generic [ref=e50]: €5
        - generic [ref=e51]: 1 ball
        - generic [ref=e52]: Single entry
    - button "Buy Ball Drop tickets" [ref=e53] [cursor=pointer]
    - paragraph [ref=e54]: Secure payment via Stripe · Confirmation email sent instantly
  - generic [ref=e56]:
    - generic [ref=e57]:
      - img [ref=e59]
      - generic [ref=e63]:
        - heading "Bed Push Race" [level=2] [ref=e64]
        - paragraph [ref=e65]: Speed, style, and absolute silliness. Enter your team of 5 for the most chaotic race in Inishowen.
        - generic [ref=e66]:
          - generic [ref=e67]: Wednesday 8 July
          - generic [ref=e68]: Quay Street
          - generic [ref=e69]: €50 per team
      - button "Register a team" [ref=e70] [cursor=pointer]
    - generic [ref=e71]:
      - img [ref=e73]
      - generic [ref=e77]:
        - heading "Craft Fair" [level=2] [ref=e78]
        - paragraph [ref=e79]: Local makers, artists and small businesses. Book your stall at the Festival Square marquee.
        - generic [ref=e80]:
          - generic [ref=e81]: Saturday 11 July
          - generic [ref=e82]: Festival Square
          - generic [ref=e83]: €20 per stall
      - button "Book a stall" [ref=e84] [cursor=pointer]
  - generic [ref=e86]:
    - paragraph [ref=e87]: Partner with us
    - heading "Become a Sponsor" [level=2] [ref=e88]
    - paragraph [ref=e89]: Support Moville's biggest community celebration. Sponsorship keeps the festival free, open and rooted in the town. Get in touch to find out how we can work together.
    - button "Sponsorship enquiry" [ref=e90] [cursor=pointer]
  - contentinfo [ref=e91]:
    - generic [ref=e92]:
      - generic [ref=e93]: Moville Summer Festival 2026 · movillefestival.com
      - navigation "Legal" [ref=e94]:
        - link "Privacy Policy" [ref=e95] [cursor=pointer]:
          - /url: /privacy
        - generic [ref=e96]: ·
        - link "Terms & Conditions" [ref=e97] [cursor=pointer]:
          - /url: /terms
```

# Test source

```ts
  1   | /**
  2   |  * tests/visual.spec.ts
  3   |  * Moville Summer Festival 2026 — Visual Regression Test Suite
  4   |  *
  5   |  * Captures full-page screenshots of every public route in both
  6   |  * light mode (theme-day) and dark mode (theme-night), then diffs
  7   |  * against stored baselines on every subsequent run.
  8   |  *
  9   |  * FIRST RUN — generates baselines:
  10  |  *   npx playwright test tests/visual.spec.ts --update-snapshots
  11  |  *
  12  |  * SUBSEQUENT RUNS — diffs against baselines:
  13  |  *   npx playwright test tests/visual.spec.ts
  14  |  *
  15  |  * Environment variables:
  16  |  *   TEST_BASE_URL — default https://stagingmf.netlify.app
  17  |  *
  18  |  * Baseline images are stored in:
  19  |  *   tests/visual.spec.ts-snapshots/
  20  |  *
  21  |  * Commit the snapshots directory to version control so the
  22  |  * baseline travels with the codebase.
  23  |  */
  24  | 
  25  | import { test, expect, Page } from '@playwright/test';
  26  | 
  27  | const BASE = process.env.TEST_BASE_URL || 'https://stagingmf.netlify.app';
  28  | 
  29  | // Pixel diff threshold — 0.2% of pixels may differ (anti-aliasing, fonts)
  30  | const THRESHOLD = 0.002;
  31  | 
  32  | // Routes to screenshot. Each entry: [name, path, waitForSelector]
  33  | // waitForSelector is a visible element that confirms the page has settled.
  34  | const ROUTES: [string, string, string][] = [
  35  |   ['home',              '/',                     '.moville-hero'],
  36  |   ['programme',         '/programme',            '.prog-title'],
  37  |   ['ball-drop',         '/ball-drop',            '.form-title'],
  38  |   ['bed-push',          '/bed-push',             '.form-title'],
  39  |   ['craft-fair',        '/craft-fair',           '.form-title'],
  40  |   ['sponsorship',       '/sponsorship',          '.form-title'],
  41  |   ['passes',            '/passes',               '.ticket-card'],
  42  |   ['archive',           '/archive',              '.archive-title'],
  43  |   ['getting-to-moville','/getting-to-moville',   '.getting-title'],
  44  |   ['privacy',           '/privacy',              '.legal-content'],
  45  |   ['terms',             '/terms',                '.legal-content'],
  46  | ];
  47  | 
  48  | // Force the root div to light or dark mode regardless of time of day.
  49  | async function setTheme(page: Page, mode: 'light' | 'dark') {
  50  |   await page.evaluate((m) => {
  51  |     const root = document.querySelector('#root > div') as HTMLElement | null;
  52  |     if (!root) return;
  53  |     if (m === 'dark') {
  54  |       root.classList.remove('theme-day');
  55  |       root.classList.add('theme-night');
  56  |     } else {
  57  |       root.classList.remove('theme-night');
  58  |       root.classList.add('theme-day');
  59  |     }
  60  |   }, mode);
  61  |   // Give CSS transitions a moment to settle
  62  |   await page.waitForTimeout(400);
  63  | }
  64  | 
  65  | // Wait for all images and fonts to load before screenshotting
  66  | async function waitForPageReady(page: Page, selector: string) {
  67  |   await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  68  |   await page.evaluate(() => document.fonts.ready);
  69  |   // Wait for any lazy images
  70  |   await page.waitForLoadState('networkidle');
  71  | }
  72  | 
  73  | // ── Light mode ────────────────────────────────────────────────────────────────
  74  | 
  75  | test.describe('Light mode', () => {
  76  |   for (const [name, path, waitFor] of ROUTES) {
  77  |     test(`${name}`, async ({ page }) => {
  78  |       await page.goto(`${BASE}${path}`);
  79  |       await waitForPageReady(page, waitFor);
  80  |       await setTheme(page, 'light');
  81  | 
  82  |       await expect(page).toHaveScreenshot(`${name}-light.png`, {
  83  |         fullPage: true,
  84  |         threshold: THRESHOLD,
  85  |         animations: 'disabled',
  86  |       });
  87  |     });
  88  |   }
  89  | });
  90  | 
  91  | // ── Dark mode ─────────────────────────────────────────────────────────────────
  92  | 
  93  | test.describe('Dark mode', () => {
  94  |   for (const [name, path, waitFor] of ROUTES) {
  95  |     test(`${name}`, async ({ page }) => {
  96  |       await page.goto(`${BASE}${path}`);
  97  |       await waitForPageReady(page, waitFor);
  98  |       await setTheme(page, 'dark');
  99  | 
> 100 |       await expect(page).toHaveScreenshot(`${name}-dark.png`, {
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  101 |         fullPage: true,
  102 |         threshold: THRESHOLD,
  103 |         animations: 'disabled',
  104 |       });
  105 |     });
  106 |   }
  107 | });
  108 | 
```