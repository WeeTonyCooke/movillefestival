-- migrations/001_festival_events.sql
--
-- ANT-95: festival_events table — drives dynamic pass sales blackout windows.
--
-- Any event with requires_pass = true will automatically block pass purchases
-- from (starts_at - blackout_hours_before hours) through ends_at.
--
-- Run once against both the QA and production Supabase projects.

CREATE TABLE IF NOT EXISTS festival_events (
  id                    serial PRIMARY KEY,
  name                  text        NOT NULL,
  date                  date        NOT NULL,
  starts_at             timestamptz NOT NULL,
  ends_at               timestamptz NOT NULL,
  requires_pass         boolean     NOT NULL DEFAULT false,
  blackout_hours_before integer     NOT NULL DEFAULT 2,
  active                boolean     NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE festival_events IS
  'Paid events that gate-check festival passes. '
  'requires_pass=true events generate an automatic pass-sales blackout window '
  'starting blackout_hours_before hours before starts_at and ending at ends_at.';

-- Seed: Moville Summer Festival 2026 paid events (for historical reference)
-- These drove the 2026 hardcoded schedule in _passSalesBlackout.cjs.
INSERT INTO festival_events (name, date, starts_at, ends_at, requires_pass, blackout_hours_before) VALUES
  ('All Folk''d Up',                '2026-07-10', '2026-07-10T20:00:00+01:00', '2026-07-10T23:00:00+01:00', true,  2),
  ('Marty Healy Band',              '2026-07-11', '2026-07-11T18:00:00+01:00', '2026-07-11T23:30:00+01:00', true,  2),
  ('Bagatelle',                     '2026-07-11', '2026-07-11T21:00:00+01:00', '2026-07-11T23:30:00+01:00', true,  2),
  ('First paid act (Sunday)',       '2026-07-12', '2026-07-12T16:00:00+01:00', '2026-07-12T23:30:00+01:00', true,  2),
  ('The Two Bucks',                 '2026-07-12', '2026-07-12T17:30:00+01:00', '2026-07-12T23:30:00+01:00', true,  2),
  ('The Björn Identity',            '2026-07-12', '2026-07-12T20:30:00+01:00', '2026-07-12T23:30:00+01:00', true,  2)
ON CONFLICT DO NOTHING;
