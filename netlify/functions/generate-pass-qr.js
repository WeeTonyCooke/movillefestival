// netlify/functions/generate-pass-qr.js
// Returns a base64-encoded PNG QR code for a given pass_ref.
// Called by PassViewPage.tsx — also used server-side in the webhook to embed in emails.
//
// Uses Python (qrcode + Pillow) via a child process — same pattern as Ball Drop QR generation.
// The Python script is at netlify/functions/generate_qr.py

const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const ref = event.queryStringParameters?.ref;

  if (!ref) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ref is required' }) };
  }

  // SECURITY: validate format before anything touches the shell.
  // MF-SAT-0042, MF-FEST-0042, MF-FRI-0042, MF-SUN-0042
  const REF_PATTERN = /^MF-[A-Z]+-\d{4}$/;
  if (!REF_PATTERN.test(ref)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid pass reference format' }) };
  }

  // Validate the ref exists and is paid — prevent arbitrary QR generation
  const { data, error } = await supabase
    .from('festival_passes')
    .select('pass_ref')
    .eq('pass_ref', ref)
    .eq('status', 'paid')
    .single();

  if (error || !data) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Pass not found' }) };
  }

  try {
    // Generate QR via Python — outputs base64 PNG to stdout
    const result = execSync(
      `python3 -c "
import qrcode, base64, io
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
qr.add_data('${ref.replace(/'/g, "\\'")}')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')
buf = io.BytesIO()
img.save(buf, format='PNG')
print(base64.b64encode(buf.getvalue()).decode())
"`,
      { timeout: 10000 }
    ).toString().trim();

    const dataUrl = `data:image/png;base64,${result}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // cache for 24h — QR won't change
      },
      body: JSON.stringify({ qr: dataUrl }),
    };
  } catch (err) {
    console.error('QR generation error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'QR generation failed' }) };
  }
};
