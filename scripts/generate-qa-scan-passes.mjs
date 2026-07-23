#!/usr/bin/env node
/**
 * scripts/generate-qa-scan-passes.mjs
 *
 * ANT-60: Generates disposable paid festival pass rows directly in QA Supabase
 * for use by the scan concurrency tests (SCAN-13, SCAN-14, SCAN-15).
 *
 * These tests require real pass rows with status='paid' and no prior scan_dates.
 * Since they CONSUME the passes (mark scan_dates), fresh rows are needed each run.
 *
 * Usage:
 *   node scripts/generate-qa-scan-passes.mjs
 *
 * Output (copy into your .env or CI secrets):
 *   TEST_PASS_REF=MVF-XXXX-XXXX
 *   TEST_PASS_REFS_CONCURRENT=MVF-XXXX-XXXX,MVF-XXXX-XXXX,MVF-XXXX-XXXX
 *
 * Requires:
 *   SUPABASE_URL              — QA project URL
 *   SUPABASE_SERVICE_ROLE_KEY — QA service-role key
 *
 * Run this BEFORE the scan tests (or add it to a pre-test hook).
 * The generated refs are consumed by SCAN-13/14/15 — don't reuse them.
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(url, key);

/**
 * Generates a pass ref in the format MVF-XXXX-XXXX (uppercase hex).
 */
function makePassRef() {
  const bytes = randomBytes(4);
  const hex = bytes.toString('hex').toUpperCase();
  return `MVF-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Inserts a single paid test pass and returns the pass_ref.
 */
async function insertTestPass(label) {
  const pass_ref = makePassRef();
  const { error } = await supabase.from('festival_passes').insert({
    pass_ref,
    full_name:  `QA Test Pass (${label})`,
    email:      'qa-scan-test@example.com',
    pass_type:  'festival_pass',
    status:     'paid',
    scan_dates: [],
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to insert test pass (${label}): ${error.message}`);
  }

  console.log(`  ✓ ${label}: ${pass_ref}`);
  return pass_ref;
}

async function main() {
  console.log('Generating QA scan test passes…\n');

  // SCAN-13/14 need one pass (consumed in order: SCAN-13 scans it, SCAN-14 re-scans it)
  const singleRef = await insertTestPass('SCAN-13/14');

  // SCAN-15 needs 3+ passes to test concurrent scans of DIFFERENT passes
  const concurrentRefs = await Promise.all([
    insertTestPass('SCAN-15a'),
    insertTestPass('SCAN-15b'),
    insertTestPass('SCAN-15c'),
  ]);

  console.log('\nAdd these to your .env (or CI secrets):\n');
  console.log(`TEST_PASS_REF=${singleRef}`);
  console.log(`TEST_PASS_REFS_CONCURRENT=${concurrentRefs.join(',')}`);
  console.log('\nNote: these refs are single-use — regenerate before each scan test run.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
