// netlify/functions/validate-pass-scan.js
// Called by the /scan page when a QR code is read.
// Validates the pass ref, checks it's paid, then applies re-entry rules:
//
//   Day pass (friday/saturday/sunday):
//     — Admit only if scan_dates is empty (never been scanned)
//     — Reject if already has any scan date
//
//   Full Festival Pass:
//     — Admit once per day (Irish time)
//     — Reject if today's date is already in scan_dates
//     — Append today's date on admission
//
// POST body: { ref: "MF-FRI-0001" }
// Header:    x-admin-password (same as admin panel)

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

// Get today's date in Irish time as 'YYYY-MM-DD'
function todayIrish() {
  return new Date().toLocaleDateString('en-IE', {
    timeZone: 'Europe/Dublin',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).split('/').reverse().join('-'); // DD/MM/YYYY → YYYY-MM-DD
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Password check
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
    .select('full_name, pass_type, pass_ref, status, scan_dates')
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

  const scanDates = data.scan_dates || [];
  const today     = todayIrish();
  const isFestivalPass = data.pass_type === 'festival_pass';

  // ── Re-entry rules ────────────────────────────────────────────────────────
  if (isFestivalPass) {
    // Full Festival Pass — allow once per day
    if (scanDates.includes(today)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid:  false,
          reason: 'Full Festival Pass already used today. Do not admit.',
        }),
      };
    }
  } else {
    // Day pass — allow only once ever
    if (scanDates.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid:  false,
          reason: 'Day pass already used. Do not admit.',
        }),
      };
    }
  }

  // ── Record the scan ───────────────────────────────────────────────────────
  // Optimistic lock: only write if scan_dates still matches what we just read.
  // If another device scanned this exact pass in the moment between our read
  // and our write, this update will match zero rows and we correctly reject
  // instead of admitting twice.
  const updatedDates = [...scanDates, today];

  let updateQuery = supabase
    .from('festival_passes')
    .update({ scan_dates: updatedDates })
    .eq('pass_ref', ref)
    .eq('status', 'paid');

  updateQuery = data.scan_dates === null
    ? updateQuery.is('scan_dates', null)
    : updateQuery.eq('scan_dates', data.scan_dates);

  const { data: updateResult, error: updateError } = await updateQuery.select();

  if (updateError) {
    console.error('Scan update error:', updateError);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Scan could not be recorded. Try again.' }),
    };
  }

  if (!updateResult || updateResult.length === 0) {
    // Lost the race — another scan landed first. Re-check which rule applies
    // so the rejection message matches what actually happened.
    const message = isFestivalPass
      ? 'Full Festival Pass already used today. Do not admit.'
      : 'Day pass already used. Do not admit.';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: message }),
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
