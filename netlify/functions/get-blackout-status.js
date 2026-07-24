// netlify/functions/get-blackout-status.js
//
// ANT-95: Returns the current pass sales blackout status, derived dynamically
// from the festival_events table rather than a hardcoded schedule.
//
// Called by the React PassesPage UI every 30 seconds to show/hide banners.
// The checkout function (create-pass-checkout.js) uses _passSalesBlackout.cjs
// directly rather than HTTP round-tripping through this endpoint.
//
// Response shape (mirrors PassSalesStatus in src/lib/passSalesBlackout.ts):
// {
//   available: boolean,
//   reason?: 'FESTIVAL_ENDED' | 'ONLINE_SALES_PAUSED',
//   reopenAt?: string,   // ISO — when current blackout ends
//   closesAt?: string,   // ISO — when next blackout starts (pre-warning)
//   festivalEnd?: string // ISO — when all sales permanently close
// }

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { computeBlackoutStatus } = require('./_passSalesBlackout.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const productId = event.queryStringParameters?.product || 'festival_pass';
  const now = new Date();

  try {
    const status = await computeBlackoutStatus(supabase, productId, now);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Short cache — don't serve stale blackout state for long
        'Cache-Control': 'public, max-age=60',
      },
      body: JSON.stringify(status),
    };
  } catch (err) {
    console.error('[get-blackout-status] Error:', err.message);
    // Fail open — don't block the UI if the DB is unreachable
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: true }),
    };
  }
};
