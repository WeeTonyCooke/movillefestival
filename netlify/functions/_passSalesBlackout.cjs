/**
 * Pass sales blackout schedule — CommonJS mirror for Netlify functions.
 *
 * KEEP IN SYNC WITH: src/lib/passSalesBlackout.ts
 * (ESM/TypeScript version consumed by the React UI).
 *
 * Underscore prefix prevents Netlify from treating this as a function endpoint.
 *
 * All ISO timestamps are Irish Summer Time (IST = UTC+01:00).
 *
 * Friday  paid gigs : All Folk'd Up 20:00                → window 18:00–23:00
 * Saturday paid gigs: Marty Healy 18:00, Bagatelle 21:00 → window 16:00–23:30
 * Sunday  paid gigs : first paid act 16:00, The Two Bucks 17:30, Björn Identity 20:30 → window 14:00–23:30
 */

'use strict';

const ALL_PASS_PRODUCTS = ['festival_pass', 'friday', 'saturday', 'sunday'];

/**
 * Festival end — after this moment all online pass sales are permanently closed.
 * Set to the Sunday blackout end so there is no gap where sales briefly reopen.
 */
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
    // 2 h before first paid act (16:00 IST), merged through The Björn Identity (20:30 IST)
    startsAt: '2026-07-12T14:00:00+01:00',
    endsAt:   '2026-07-12T23:30:00+01:00',
    products: [...ALL_PASS_PRODUCTS],
  },
];

/**
 * Returns the current sales status for a specific pass product.
 *
 * ISO timestamps with explicit +01:00 offsets are parsed by Date so
 * comparison is always in UTC — server timezone doesn't matter.
 *
 * Fails open: if the schedule cannot be parsed, sales remain available
 * rather than taking the site down.
 *
 * @param {string} productId
 * @param {Date} [now]
 * @returns {{ available: boolean, reason?: string, reopenAt?: string, closesAt?: string }}
 */
function getPassSalesStatus(productId, now = new Date()) {
  try {
    const nowMs = now.getTime();

    // Permanent post-festival close
    if (nowMs >= new Date(FESTIVAL_END).getTime()) {
      return { available: false, reason: 'FESTIVAL_ENDED' };
    }

    // Check active windows first
    for (const w of PASS_SALES_BLACKOUTS) {
      if (!w.products.includes(productId)) continue;
      const startsMs = new Date(w.startsAt).getTime();
      const endsMs   = new Date(w.endsAt).getTime();
      if (nowMs >= startsMs && nowMs < endsMs) {
        return {
          available: false,
          reason:    'ONLINE_SALES_PAUSED',
          reopenAt:  w.endsAt,
        };
      }
    }

    // Not in a blackout — look for an upcoming one
    for (const w of PASS_SALES_BLACKOUTS) {
      if (!w.products.includes(productId)) continue;
      const startsMs = new Date(w.startsAt).getTime();
      if (startsMs > nowMs) {
        return {
          available: true,
          closesAt:  w.startsAt,
        };
      }
    }

    return { available: true };
  } catch (err) {
    // Fail open — log but don't block sales if schedule parse fails
    console.error('[passSalesBlackout] Failed to evaluate blackout schedule:', err);
    return { available: true };
  }
}

module.exports = { PASS_SALES_BLACKOUTS, ALL_PASS_PRODUCTS, FESTIVAL_END, getPassSalesStatus };
