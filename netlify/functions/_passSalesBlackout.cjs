/**
 * Pass sales blackout — CommonJS module for Netlify functions.
 *
 * ANT-95: Now exports both a legacy synchronous function (kept for backward
 * compatibility and as a fallback) and a new async function that derives
 * blackout windows dynamically from the festival_events Supabase table.
 *
 * Underscore prefix prevents Netlify from treating this as a function endpoint.
 *
 * Legacy schedule (2026 hardcoded, retained as fallback):
 *   Friday  : All Folk'd Up 20:00            → window 18:00–23:00
 *   Saturday: Marty Healy 18:00, Bagatelle 21:00 → window 16:00–23:30
 *   Sunday  : first act 16:00, Two Bucks 17:30, Björn 20:30 → window 14:00–23:30
 */

'use strict';

const ALL_PASS_PRODUCTS = ['festival_pass', 'friday', 'saturday', 'sunday'];

// ---------------------------------------------------------------------------
// Legacy hardcoded schedule (2026) — used by getPassSalesStatus() below
// ---------------------------------------------------------------------------

const FESTIVAL_END = '2026-07-12T23:30:00+01:00';

/** @type {Array<{startsAt: string, endsAt: string, products: string[]}>} */
const PASS_SALES_BLACKOUTS = [
  {
    startsAt: '2026-07-10T18:00:00+01:00',
    endsAt:   '2026-07-10T23:00:00+01:00',
    products: [...ALL_PASS_PRODUCTS],
  },
  {
    startsAt: '2026-07-11T16:00:00+01:00',
    endsAt:   '2026-07-11T23:30:00+01:00',
    products: [...ALL_PASS_PRODUCTS],
  },
  {
    startsAt: '2026-07-12T14:00:00+01:00',
    endsAt:   '2026-07-12T23:30:00+01:00',
    products: [...ALL_PASS_PRODUCTS],
  },
];

/**
 * [LEGACY] Synchronous blackout check against the hardcoded 2026 schedule.
 * Kept for tests and any callers not yet migrated to computeBlackoutStatus().
 */
function getPassSalesStatus(productId, now = new Date()) {
  try {
    const nowMs = now.getTime();

    if (nowMs >= new Date(FESTIVAL_END).getTime()) {
      return { available: false, reason: 'FESTIVAL_ENDED' };
    }

    for (const w of PASS_SALES_BLACKOUTS) {
      if (!w.products.includes(productId)) continue;
      const startsMs = new Date(w.startsAt).getTime();
      const endsMs   = new Date(w.endsAt).getTime();
      if (nowMs >= startsMs && nowMs < endsMs) {
        return { available: false, reason: 'ONLINE_SALES_PAUSED', reopenAt: w.endsAt };
      }
    }

    for (const w of PASS_SALES_BLACKOUTS) {
      if (!w.products.includes(productId)) continue;
      const startsMs = new Date(w.startsAt).getTime();
      if (startsMs > nowMs) {
        return { available: true, closesAt: w.startsAt };
      }
    }

    return { available: true };
  } catch (err) {
    console.error('[passSalesBlackout] Failed to evaluate blackout schedule:', err);
    return { available: true };
  }
}

// ---------------------------------------------------------------------------
// Dynamic schedule — ANT-95
// ---------------------------------------------------------------------------

/**
 * Queries festival_events for all active pass-required events, computes merged
 * blackout windows (event_start - blackout_hours_before → event_end), and
 * returns the same PassSalesStatus shape as getPassSalesStatus().
 *
 * Overlapping windows on the same evening are automatically merged.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} productId
 * @param {Date} [now]
 * @returns {Promise<{ available: boolean, reason?: string, reopenAt?: string, closesAt?: string, festivalEnd?: string }>}
 */
async function computeBlackoutStatus(supabase, productId, now = new Date()) {
  try {
    const nowMs = now.getTime();

    // Fetch all active pass-required events ordered by start time
    const { data: events, error } = await supabase
      .from('festival_events')
      .select('name, starts_at, ends_at, blackout_hours_before')
      .eq('requires_pass', true)
      .eq('active', true)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    if (!events || events.length === 0) {
      return { available: true };
    }

    // Compute raw blackout windows from each event
    const rawWindows = events.map(ev => ({
      startsAt: new Date(new Date(ev.starts_at).getTime() - ev.blackout_hours_before * 60 * 60 * 1000).toISOString(),
      endsAt:   ev.ends_at,
    }));

    // Merge overlapping/adjacent windows (sort by start, then sweep)
    const sorted = rawWindows.slice().sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    const merged = [];
    for (const w of sorted) {
      if (merged.length === 0) {
        merged.push({ ...w });
        continue;
      }
      const last = merged[merged.length - 1];
      if (new Date(w.startsAt) <= new Date(last.endsAt)) {
        // Overlapping — extend the end if needed
        if (new Date(w.endsAt) > new Date(last.endsAt)) last.endsAt = w.endsAt;
      } else {
        merged.push({ ...w });
      }
    }

    // Festival end = end of the last window
    const festivalEnd = merged[merged.length - 1].endsAt;

    // Permanent post-festival close
    if (nowMs >= new Date(festivalEnd).getTime()) {
      return { available: false, reason: 'FESTIVAL_ENDED', festivalEnd };
    }

    // Check if we're inside an active blackout window
    for (const w of merged) {
      const startsMs = new Date(w.startsAt).getTime();
      const endsMs   = new Date(w.endsAt).getTime();
      if (nowMs >= startsMs && nowMs < endsMs) {
        return {
          available: false,
          reason:    'ONLINE_SALES_PAUSED',
          reopenAt:  w.endsAt,
          festivalEnd,
        };
      }
    }

    // Look for the next upcoming blackout
    for (const w of merged) {
      const startsMs = new Date(w.startsAt).getTime();
      if (startsMs > nowMs) {
        return {
          available: true,
          closesAt:  w.startsAt,
          festivalEnd,
        };
      }
    }

    return { available: true, festivalEnd };
  } catch (err) {
    console.error('[passSalesBlackout] computeBlackoutStatus failed, failing open:', err.message);
    return { available: true };
  }
}

module.exports = {
  PASS_SALES_BLACKOUTS,
  ALL_PASS_PRODUCTS,
  FESTIVAL_END,
  getPassSalesStatus,
  computeBlackoutStatus,
};
