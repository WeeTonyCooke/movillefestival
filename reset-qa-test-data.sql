-- reset-qa-test-data.sql
-- Run against the QA Supabase instance (plrtjpqltfhsnpmcjwox) before
-- capacity-gated Playwright tests (BP-02/03/04/05, CF-02/03/04/05).
-- Safe to run repeatedly — only deletes test data, never touches live.
--
-- Run via Supabase SQL editor or:
--   psql $QA_DATABASE_URL -f reset-qa-test-data.sql

-- ── Bed Push ──────────────────────────────────────────────────────────
-- Remove all test registrations (email pattern used by Playwright suite)
DELETE FROM bed_push_registrations
WHERE email LIKE '%@example.com'
   OR email LIKE '%bp0%@example.com';

-- ── Craft Fair ────────────────────────────────────────────────────────
DELETE FROM craft_fair_registrations
WHERE email LIKE '%@example.com'
   OR email LIKE '%cf0%@example.com';

-- ── Ball Drop ─────────────────────────────────────────────────────────
-- Remove test registrations and free their ball numbers
DELETE FROM ball_drop_balls
WHERE registration_id IN (
  SELECT id FROM ball_drop_registrations
  WHERE email LIKE '%@example.com'
);

DELETE FROM ball_drop_registrations
WHERE email LIKE '%@example.com';

-- ── Festival Passes ───────────────────────────────────────────────────
DELETE FROM festival_passes
WHERE email LIKE '%@example.com';

-- ── Verify counts after reset ─────────────────────────────────────────
SELECT 'bed_push_registrations'  AS table_name, COUNT(*) AS remaining FROM bed_push_registrations
UNION ALL
SELECT 'craft_fair_registrations', COUNT(*) FROM craft_fair_registrations
UNION ALL
SELECT 'ball_drop_registrations',  COUNT(*) FROM ball_drop_registrations
UNION ALL
SELECT 'festival_passes',          COUNT(*) FROM festival_passes;
