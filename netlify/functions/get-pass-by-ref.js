// netlify/functions/get-pass-by-ref.js
// FIX 2: Server-side pass lookup using service role key.
// PassViewPage.tsx calls this instead of querying Supabase directly from the browser.
// The anon key and service role key are never exposed to the frontend.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role — server-side only
);

exports.handler = async (event) => {
  // CORS headers — same-origin only in production
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.URL || 'https://movillefestival.com',
    'Access-Control-Allow-Methods': 'GET',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ref = event.queryStringParameters?.ref;

  if (!ref || ref.trim() === '') {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Pass reference is required' }),
    };
  }

  // Sanitise — pass refs match MF-XXX-0000 pattern only
  const REF_PATTERN = /^MF-[A-Z]+-\d{4}$/;
  if (!REF_PATTERN.test(ref.trim())) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid pass reference format' }),
    };
  }

  const { data, error } = await supabase
    .from('festival_passes')
    .select('full_name, pass_type, pass_ref, status')  // only what the UI needs
    .eq('pass_ref', ref.trim())
    .eq('status', 'paid')  // never return pending passes
    .single();

  if (error || !data) {
    console.error('Pass lookup error:', error);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Pass not found' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Cache-Control': 'private, max-age=300', // 5 min — pass data won't change
    },
    body: JSON.stringify({
      full_name: data.full_name,
      pass_type: data.pass_type,
      pass_ref:  data.pass_ref,
    }),
  };
};
