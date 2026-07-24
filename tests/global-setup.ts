/**
 * tests/global-setup.ts
 *
 * ANT-79: Playwright globalSetup — runs once before the full test suite.
 *
 * Resets the QA Supabase ball_drop_balls table to canonical state so that
 * state-mutating tests (BL-15, MS-07, BD-02/03) don't corrupt subsequent runs.
 *
 * Skip the reset (e.g. for a quick read-only regression pass):
 *   SKIP_QA_RESET=1 npx playwright test
 *
 * Requires env vars (set in .env or CI secrets):
 *   SUPABASE_URL              — QA project URL (plrtjpqltfhsnpmcjwox.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — service-role key for the QA project
 *
 * The reset SQL is equivalent to reset-qa-ball-inventory.sql but runs
 * directly via the Supabase JS client rather than psql.
 */

import { createClient } from '@supabase/supabase-js';

export default async function globalSetup() {
  if (process.env.SKIP_QA_RESET === '1') {
    console.log('[global-setup] SKIP_QA_RESET=1 — skipping QA inventory reset.');
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn(
      '[global-setup] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping QA reset.\n' +
      '              Set these in .env or CI secrets to enable automatic reset (ANT-79).'
    );
    return;
  }

  const supabase = createClient(url, key);

  console.log('[global-setup] Resetting QA ball_drop_balls inventory…');

  // Step 1: Delete all rows so we can re-insert cleanly
  const { error: delErr } = await supabase
    .from('ball_drop_balls')
    .delete()
    .gte('number', 1);

  if (delErr) throw new Error(`[global-setup] Failed to clear ball_drop_balls: ${delErr.message}`);

  // Step 2: Insert manual stock (balls 1–500)
  const manualRows = Array.from({ length: 500 }, (_, i) => ({
    number: i + 1,
    status: 'manual',
    registration_id: null,
  }));

  // Step 3: Insert online/available pool (balls 501–1200)
  const availableRows = Array.from({ length: 700 }, (_, i) => ({
    number: i + 501,
    status: 'available',
    registration_id: null,
  }));

  // Insert in batches to avoid request size limits
  const allRows = [...manualRows, ...availableRows];
  const BATCH = 200;
  for (let i = 0; i < allRows.length; i += BATCH) {
    const { error } = await supabase
      .from('ball_drop_balls')
      .insert(allRows.slice(i, i + BATCH));
    if (error) throw new Error(`[global-setup] Insert batch ${i}–${i + BATCH} failed: ${error.message}`);
  }

  // Step 4: Reset online_ball_limit in festival_config
  const { error: cfgErr } = await supabase
    .from('festival_config')
    .upsert({ key: 'online_ball_limit', value: '700' }, { onConflict: 'key' });

  if (cfgErr) throw new Error(`[global-setup] Failed to reset online_ball_limit: ${cfgErr.message}`);

  console.log('[global-setup] ✓ QA inventory reset: 500 manual (1–500), 700 available (501–1200), limit = 700.');
}
