// netlify/functions/validate-pass-scan.js
// Called by the /scan page when a QR code is read.
// Validates the pass ref, checks it's paid and not already scanned,
// then marks it as scanned atomically.
//
// POST body: { ref: "MF-FRI-0001" }
// Header:    x-admin-password (same password as admin panel)
//
// Responses:
//   200 { valid: true,  full_name, pass_type, pass_ref }  — admit
//   200 { valid: false, reason }                          — reject
//   400  invalid format / missing ref
//   401  wrong password
//   405  wrong method

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const REF_PATTERN    = /^MF-[A-Z]+-\d{4}$/;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.URL || 'https://movillefestival.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Password check — same mechanism as admin panel
  const supplied = event.headers['x-admin-password'];
  if (!supplied || supplied !== ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorised' }) };
  }

  let ref;
  try {
    const body = JSON.parse(event.body || '{}');
    ref = body.ref?.trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!ref) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pass reference is required' }) };
  }

  if (!REF_PATTERN.test(ref)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid pass reference format' }) };
  }

  // Fetch the pass
  const { data, error } = await supabase
    .from('festival_passes')
    .select('full_name, pass_type, pass_ref, status, scanned_at')
    .eq('pass_ref', ref)
    .single();

  if (error || !data) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Pass not found. Check the reference and try again.' }),
    };
  }

  if (data.status !== 'paid') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'This pass has not been paid for.' }),
    };
  }

  if (data.scanned_at) {
    const scannedTime = new Date(data.scanned_at).toLocaleTimeString('en-IE', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Dublin',
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: false,
        reason: `Already scanned at ${scannedTime}. Do not admit.`,
      }),
    };
  }

  // Mark as scanned — atomic update
  const { error: updateError } = await supabase
    .from('festival_passes')
    .update({ scanned_at: new Date().toISOString() })
    .eq('pass_ref', ref)
    .eq('status', 'paid')
    .is('scanned_at', null); // extra safety — only update if still unscanned

  if (updateError) {
    console.error('Scan update error:', updateError);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Scan could not be recorded. Try again.' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      valid:     true,
      full_name: data.full_name,
      pass_type: data.pass_type,
      pass_ref:  data.pass_ref,
    }),
  };
};
