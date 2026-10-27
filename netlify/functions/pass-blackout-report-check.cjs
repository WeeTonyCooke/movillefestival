// netlify/functions/pass-blackout-report-check.js
//
// ANT-96: Scheduled function — runs every 30 minutes.
// Checks if any festival event's blackout window opened in the last 30 minutes.
// If so, fires the gate report via _passBlackoutReport.cjs (~20 min after open).
//
// Netlify schedule: "*/30 * * * *" (every 30 min)
// Configured in netlify.toml under [functions."pass-blackout-report-check"]
//
// The ~20-min delay described in ANT-96 is achieved by only firing when
// a blackout opened between 15–45 min ago — giving the gate time to open
// and pass holders a chance to arrive before the report is generated.

'use strict';

const { createClient }         = require('@supabase/supabase-js');
const { generateBlackoutReport } = require('./_passBlackoutReport.cjs');

const FIRE_WINDOW_MIN = 15;  // don't fire if blackout opened less than 15 min ago
const FIRE_WINDOW_MAX = 45;  // don't fire if blackout opened more than 45 min ago

exports.handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now    = new Date();
  const nowMs  = now.getTime();
  const minMs  = nowMs - FIRE_WINDOW_MAX * 60 * 1000;
  const maxMs  = nowMs - FIRE_WINDOW_MIN * 60 * 1000;

  try {
    // Fetch all active pass-required events
    const { data: events, error } = await supabase
      .from('festival_events')
      .select('name, starts_at, ends_at, blackout_hours_before')
      .eq('requires_pass', true)
      .eq('active', true);

    if (error) throw error;
    if (!events || events.length === 0) {
      console.log('[pass-blackout-report-check] No active pass-required events — nothing to check.');
      return { statusCode: 200, body: 'no active events' };
    }

    // Find any event whose blackout window opened in the fire window
    const shouldFire = events.some(ev => {
      const blackoutStartMs = new Date(ev.starts_at).getTime() - ev.blackout_hours_before * 60 * 60 * 1000;
      const blackoutEndMs   = new Date(ev.ends_at).getTime();
      // Blackout is currently active AND opened within the fire window
      return nowMs < blackoutEndMs && blackoutStartMs >= minMs && blackoutStartMs <= maxMs;
    });

    if (!shouldFire) {
      console.log('[pass-blackout-report-check] No blackout window opened in the last 15–45 min — skipping.');
      return { statusCode: 200, body: 'no report needed' };
    }

    console.log('[pass-blackout-report-check] Blackout window detected — generating gate report…');

    const result = await generateBlackoutReport({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendKey:   process.env.RESEND_API_KEY,
    }, now);

    console.log(`[pass-blackout-report-check] Report sent — ${result.passCount} valid passes, ${result.pendingCount} pending.`);
    return { statusCode: 200, body: JSON.stringify(result) };

  } catch (err) {
    console.error('[pass-blackout-report-check] Error:', err.message);
    // Don't throw — a failed report shouldn't crash the function
    return { statusCode: 500, body: err.message };
  }
};
