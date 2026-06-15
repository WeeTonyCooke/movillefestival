// netlify/functions/generate-pass-qr.js
// Returns a base64 PNG QR code for a given pass_ref.
// Pure JavaScript — no Python, no execSync, no child processes.
// Uses the 'qrcode' npm package (^1.5.4).
//
// Response: JSON { qr: 'data:image/png;base64,...' }
// Consumed by PassViewPage.tsx and embedded in webhook emails.

const QRCode    = require('qrcode');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Valid pass ref formats: MF-FEST-0001, MF-FRI-0001, MF-SAT-0001, MF-SUN-0001
const REF_PATTERN = /^MF-[A-Z]+-\d{4}$/;

exports.handler = async (event) => {
  const ref = event.queryStringParameters?.ref;

  if (!ref) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'ref is required' }),
    };
  }

  if (!REF_PATTERN.test(ref)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid pass reference format' }),
    };
  }

  // Confirm the pass exists and is paid — prevent arbitrary QR generation
  const { data, error } = await supabase
    .from('festival_passes')
    .select('pass_ref')
    .eq('pass_ref', ref)
    .eq('status', 'paid')
    .single();

  if (error || !data) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Pass not found' }),
    };
  }

  try {
    // Generate QR as base64 PNG data URL — encodes the pass_ref only, not a URL
    const dataUrl = await QRCode.toDataURL(ref, {
      errorCorrectionLevel: 'H',
      type:                 'image/png',
      margin:               4,
      width:                420,
      color: {
        dark:  '#000000',
        light: '#ffffff',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'public, max-age=86400', // QR won't change — cache 24h
      },
      body: JSON.stringify({ qr: dataUrl }),
    };
  } catch (err) {
    console.error('QR generation error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'QR generation failed' }),
    };
  }
};
