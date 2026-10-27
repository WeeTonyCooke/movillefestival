// netlify/functions/pass-blackout-report-manual.js
//
// ANT-96: Authenticated manual trigger for the gate report.
// Useful if the scheduled run missed or if a re-send is needed mid-evening.
//
// POST /.netlify/functions/pass-blackout-report-manual
// Header: x-admin-password: <TEST_ADMIN_PASS>

'use strict';

const { generateBlackoutReport } = require('./_passBlackoutReport.cjs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const provided = event.headers['x-admin-password'] || '';
  if (!ADMIN_PASSWORD || provided !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorised' }) };
  }

  try {
    const result = await generateBlackoutReport({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendKey:   process.env.RESEND_API_KEY,
    });

    console.log(`[pass-blackout-report-manual] Report sent — ${result.passCount} valid passes, ${result.pendingCount} pending.`);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('[pass-blackout-report-manual] Error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
