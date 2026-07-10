/**
 * Pass sales blackout schedule — ESM/TypeScript module for the React UI.
 *
 * Defines windows during which ALL online pass sales are paused
 * (2 h before each paid gig through end of the evening),
 * so customers cannot buy passes "for tonight" after the gate opens.
 *
 * All ISO timestamps are Irish Summer Time (IST = UTC+01:00).
 *
 * KEEP IN SYNC WITH: netlify/functions/_passSalesBlackout.js
 * (CommonJS mirror consumed by the Netlify checkout function).
 */

export interface BlackoutWindow {
  /** ISO 8601 with explicit +01:00 offset (Irish Summer Time) */
  startsAt: string;
  endsAt: string;
  products: string[];
}

export interface PassSalesStatus {
  available: boolean;
  /** Machine-readable reason code when available is false */
  reason?: string;
  /** ISO string — when the current blackout window ends */
  reopenAt?: string;
  /** ISO string — when the next blackout window begins (pre-cutoff warning) */
  closesAt?: string;
}

export const ALL_PASS_PRODUCTS = [
  'festival_pass',
  'friday',
  'saturday',
  'sunday',
] as const;

export type PassProductId = (typeof ALL_PASS_PRODUCTS)[number];

/**
 * Festival end — after this moment all online pass sales are permanently closed.
 * Set to the Sunday blackout end so there is no gap where sales briefly reopen.
 */
export const FESTIVAL_END = '2026-07-12T23:30:00+01:00';

/**
 * Blackout windows for the 2026 festival.
 *
 * Each window covers from 2 h before the first paid gig of the evening
 * through the end of the last paid gig. Overlapping or adjacent windows
 * for the same evening are merged into one.
 *
 * Friday  paid gigs : All Folk'd Up 20:00            → window 18:00–23:00
 * Saturday paid gigs: Marty Healy 18:00, Bagatelle 21:00 → window 16:00–23:30
 * Sunday  paid gigs : first paid act 16:00, The Two Bucks 17:30, Björn Identity 20:30 → window 14:00–23:30
 */
export const PASS_SALES_BLACKOUTS: BlackoutWindow[] = [
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
 * comparison is always in UTC — browser/server local timezone doesn't matter.
 *
 * Fails open: if the schedule cannot be parsed, sales remain available
 * rather than taking the site down.
 */
export function getPassSalesStatus(
  productId: string,
  now: Date = new Date(),
): PassSalesStatus {
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

    // Not in a blackout — look for an upcoming one (pre-cutoff warning)
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
    // Fail open — log but don't block sales if the schedule parse fails
    console.error('[passSalesBlackout] Failed to evaluate blackout schedule:', err);
    return { available: true };
  }
}

/**
 * Page-level check: is any pass currently blacked out?
 * Uses festival_pass as the representative product (all products
 * share the same windows, so any one suffices).
 */
export function getPassPageSalesStatus(now: Date = new Date()): PassSalesStatus {
  return getPassSalesStatus('festival_pass', now);
}

/**
 * Format an ISO timestamp as a human-readable Irish time string,
 * e.g. "2026-07-10T18:00:00+01:00" → "6:00 pm"
 */
export function formatIrishTime(iso: string): string {
  try {
    const d = new Date(iso);
    // Use IST (Europe/Dublin is UTC+1 in summer)
    return d.toLocaleTimeString('en-IE', {
      timeZone: 'Europe/Dublin',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}
