// netlify/functions/get-pass-by-ref.js
// Server-side pass lookup using service role key.
// PassViewPage.tsx calls this with a view_token (UUID) — not the pass_ref.
// The pass_ref is kept internal and used operationally (admin, gate scanning).
// Using a token means the public URL does not expose sequential, guessable refs.
// GDPR: names are only returned for valid paid passes via a random unguessable token.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REF_PATTERN  = /^MF-[A-Z]+-\d{4}$/;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.URL || 'https://movillefestival.com',
    'Access-Control-Allow-Methods': 'GET',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'GET')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const token = event.queryStringParameters?.token;
  const ref   = event.queryStringParameters?.ref; // internal/admin use only

  // ── Token lookup (public pass view) ────────────────────────────────────────
  if (token) {
    if (!UUID_PATTERN.test(token.trim())) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid token format' }) };
    }

    const { data, error } = await supabase
      .from('festival_passes')
      .select('full_name, pass_type, pass_ref, status')
      .eq('view_token', token.trim())
      .eq('status', 'paid')
      .single();

    if (error || !data) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pass not found' }) };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'private, max-age=300' },
      body: JSON.stringify({
        full_name: data.full_name,
        pass_type: data.pass_type,
        pass_ref:  data.pass_ref,
      }),
    };
  }

  // ── Ref lookup (internal: admin, gate scanner) ──────────────────────────────
  if (ref) {
    if (!REF_PATTERN.test(ref.trim())) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid pass reference format' }) };
    }

    const { data, error } = await supabase
      .from('festival_passes')
      .select('full_name, pass_type, pass_ref, status')
      .eq('pass_ref', ref.trim())
      .eq('status', 'paid')
      .single();

    if (error || !data) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Pass not found' }) };
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Cache-Control': 'private, max-age=300' },
      body: JSON.stringify({
        full_name: data.full_name,
        pass_type: data.pass_type,
        pass_ref:  data.pass_ref,
      }),
    };
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'token or ref is required' }) };
};
