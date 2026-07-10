-- reset-qa-ball-inventory.sql
-- Restores the canonical Ball Drop inventory for the QA Supabase instance
-- (plrtjpqltfhsnpmcjwox) before any Ball Drop or ball-limit Playwright run.
-- Safe to run repeatedly.
--
-- Why this is needed: update-ball-limit is intentionally one-way (limit can
-- only decrease), so BL-15 leaves the inventory in a reduced state after each
-- test run. The only way back to canonical state is via direct SQL.
--
-- Canonical state expected by assertBallInventoryHealthy:
--   balls   1-500  → status = 'manual',    registration_id = NULL  (paper/gate stock)
--   balls 501-1200 → status = 'available', registration_id = NULL  (online pool)
--   festival_config: online_ball_limit = '700'
--
-- Run via Supabase SQL editor or:
--   psql $QA_DATABASE_URL -f reset-qa-ball-inventory.sql

-- Step 1: ensure all 1200 rows exist (reset-qa-test-data.sql deletes sold rows)
INSERT INTO ball_drop_balls (number, status, registration_id)
SELECT
  s,
  CASE WHEN s <= 500 THEN 'manual' ELSE 'available' END,
  NULL
FROM generate_series(1, 1200) s
WHERE s NOT IN (SELECT number FROM ball_drop_balls);

-- Step 2: reset status and clear registration links for all existing rows
UPDATE ball_drop_balls
SET status = 'manual', registration_id = NULL
WHERE number BETWEEN 1 AND 500;

UPDATE ball_drop_balls
SET status = 'available', registration_id = NULL
WHERE number BETWEEN 501 AND 1200;

-- Step 3: restore the online ball limit (upsert pattern)
UPDATE festival_config SET value = '700' WHERE key = 'online_ball_limit';
INSERT INTO festival_config (key, value)
SELECT 'online_ball_limit', '700'
WHERE NOT EXISTS (SELECT 1 FROM festival_config WHERE key = 'online_ball_limit');

-- Step 4: confirm — expect manual|500|1|500 and available|700|501|1200
SELECT status, count(*) AS count, min(number) AS min, max(number) AS max
FROM ball_drop_balls
GROUP BY status
ORDER BY status;

SELECT value AS online_ball_limit FROM festival_config WHERE key = 'online_ball_limit';
