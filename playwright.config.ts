/**
 * playwright.config.ts
 *
 * ANT-79: Adds globalSetup so every full suite run starts from a known
 * canonical QA state, eliminating the recurring ball_drop_balls corruption
 * caused by state-mutating tests (BL-15, MS-07, BD-02/03).
 *
 * Run the full suite:       npx playwright test
 * Skip reset (read-only):   SKIP_QA_RESET=1 npx playwright test
 * Ball Drop tests only:     npx playwright test tests/ball-limit.spec.ts tests/registrations.spec.ts
 * Scan tests only:          npx playwright test tests/scan.spec.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './tests/global-setup.ts',

  testDir: './tests',

  // Timeout per test
  timeout: 30_000,

  // Reporter: list in CI, HTML locally
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],

  use: {
    // All tests share these base settings; individual specs override as needed
    baseURL: process.env.TEST_BASE_URL || 'https://stagingmf.netlify.app',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
