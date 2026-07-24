/**
 * netlify/functions/_passBlackoutReport.cjs
 *
 * ANT-96: Shared logic for the pass blackout gate report.
 *
 * Called automatically by pass-blackout-report-check.js (every 30 min)
 * when it detects an event's blackout window has just opened.
 * Can also be triggered manually via pass-blackout-report-manual.js.
 *
 * Sends an HTML email + CSV attachment to movillefestival@gmail.com with:
 *   - All passes valid for tonight (paid, correct pass_type for the date)
 *   - All confirmed passes (totals by type)
 *   - Pending passes from the last 4 hours (possible drop-offs)
 *
 * Surname sort handles Mc/Mac prefixes correctly (Mc/Mac → M for sort key).
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { Resend }       = require('resend');

const REPORT_TO = process.env.FESTIVAL_REPORT_EMAIL || 'movillefestival@gmail.com';

/**
 * Returns the normalised sort key for a full name, so that
 * "McArdle" sorts as "Ardle" and "MacDonald" as "Donald".
 */
function sortKey(fullName = '') {
  const surname = fullName.trim().split(/\s+/).pop() || fullName;
  return surname.replace(/^Ma?c/i, '').toLowerCase();
}

/**
 * Determines which pass_types are valid for a given date (Irish time).
 * festival_pass is always valid. Day passes match the day name.
 *
 * @param {Date} now
 * @returns {string[]}
 */
function validPassTypesForDate(now) {
  const day = now.toLocaleDateString('en-IE', { timeZone: 'Europe/Dublin', weekday: 'long' }).toLowerCase();
  const dayTypes = { friday: 'friday', saturday: 'saturday', sunday: 'sunday' };
  const dayType  = dayTypes[day];
  return dayType ? ['festival_pass', dayType] : ['festival_pass'];
}

/**
 * Generates and sends the gate report email.
 *
 * @param {{ supabaseUrl: string, supabaseKey: string, resendKey: string }} config
 * @param {Date} [now]
 * @returns {Promise<{ sent: boolean, passCount: number, pendingCount: number }>}
 */
async function generateBlackoutReport(config, now = new Date()) {
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  const resend   = new Resend(config.resendKey);

  const validTypes   = validPassTypesForDate(now);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();

  // 1. Valid passes for tonight — paid, correct type, sorted by surname
  const { data: validPasses, error: validErr } = await supabase
    .from('festival_passes')
    .select('full_name, pass_type, pass_ref, email, created_at')
    .eq('status', 'paid')
    .in('pass_type', validTypes)
    .order('created_at', { ascending: true });

  if (validErr) throw new Error(`Supabase query failed (valid passes): ${validErr.message}`);

  const sorted = (validPasses || []).slice().sort((a, b) =>
    sortKey(a.full_name).localeCompare(sortKey(b.full_name), 'en-IE')
  );

  // 2. All confirmed pass totals (for summary)
  const { data: allPaid, error: allErr } = await supabase
    .from('festival_passes')
    .select('pass_type')
    .eq('status', 'paid');

  if (allErr) throw new Error(`Supabase query failed (all paid): ${allErr.message}`);

  const totals = (allPaid || []).reduce((acc, p) => {
    acc[p.pass_type] = (acc[p.pass_type] || 0) + 1;
    return acc;
  }, {});

  // 3. Recent pending passes (possible drop-offs from poor signal etc.)
  const { data: pendingPasses, error: pendErr } = await supabase
    .from('festival_passes')
    .select('full_name, pass_type, pass_ref, email, created_at')
    .eq('status', 'pending')
    .gte('created_at', fourHoursAgo)
    .order('created_at', { ascending: false });

  if (pendErr) throw new Error(`Supabase query failed (pending): ${pendErr.message}`);

  const dateStr = now.toLocaleDateString('en-IE', { timeZone: 'Europe/Dublin', weekday: 'long', day: 'numeric', month: 'long' });

  // Build CSV
  const csvRows = [
    'Name,Pass Type,Pass Ref,Email,Purchased',
    ...sorted.map(p =>
      [p.full_name, p.pass_type, p.pass_ref, p.email,
       new Date(p.created_at).toLocaleString('en-IE', { timeZone: 'Europe/Dublin' })]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const csv = csvRows.join('\n');

  // Build HTML email
  const passRows = sorted.map(p => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${p.full_name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize">${p.pass_type.replace('_', ' ')}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace">${p.pass_ref}</td>
    </tr>`).join('');

  const pendingRows = (pendingPasses || []).length > 0
    ? (pendingPasses || []).map(p => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${p.full_name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-transform:capitalize">${p.pass_type.replace('_', ' ')}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#999;font-size:12px">${new Date(p.created_at).toLocaleTimeString('en-IE', { timeZone: 'Europe/Dublin' })}</td>
    </tr>`).join('')
    : '<tr><td colspan="3" style="padding:10px 12px;color:#999">None in the last 4 hours</td></tr>';

  const summaryItems = Object.entries(totals)
    .map(([type, count]) => `<li>${type.replace('_', ' ')}: <strong>${count}</strong></li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Outfit',system-ui,sans-serif;color:#16323C;max-width:680px;margin:0 auto;padding:24px">
  <div style="border-left:4px solid #1F4E5F;padding-left:16px;margin-bottom:24px">
    <p style="margin:0;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#B0894F">Moville Summer Festival 2026</p>
    <h1 style="margin:4px 0 0;font-size:22px">Gate Report — ${dateStr}</h1>
  </div>

  <h2 style="font-size:15px;margin:0 0 8px">Valid passes tonight (${sorted.length})</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px">
    <thead>
      <tr style="background:#f4f0e8">
        <th style="padding:8px 12px;text-align:left">Name</th>
        <th style="padding:8px 12px;text-align:left">Type</th>
        <th style="padding:8px 12px;text-align:left">Ref</th>
      </tr>
    </thead>
    <tbody>${passRows || '<tr><td colspan="3" style="padding:10px 12px;color:#999">No paid passes found</td></tr>'}</tbody>
  </table>

  <h2 style="font-size:15px;margin:0 0 8px">All confirmed passes (totals)</h2>
  <ul style="font-size:13px;margin:0 0 28px">${summaryItems || '<li>None</li>'}</ul>

  <h2 style="font-size:15px;margin:0 0 8px">Pending in last 4 hours (${(pendingPasses || []).length})</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px">
    <thead>
      <tr style="background:#f4f0e8">
        <th style="padding:8px 12px;text-align:left">Name</th>
        <th style="padding:8px 12px;text-align:left">Type</th>
        <th style="padding:8px 12px;text-align:left">Started</th>
      </tr>
    </thead>
    <tbody>${pendingRows}</tbody>
  </table>

  <p style="font-size:11px;color:#999">Generated automatically ${now.toLocaleString('en-IE', { timeZone: 'Europe/Dublin' })} — CSV attached.</p>
</body>
</html>`;

  // Send via Resend
  const { error: sendErr } = await resend.emails.send({
    from:    'Moville Festival <noreply@movillefestival.ie>',
    to:      REPORT_TO,
    subject: `Gate Report — ${dateStr} (${sorted.length} valid passes)`,
    html,
    attachments: [{
      filename:    `gate-report-${now.toISOString().slice(0, 10)}.csv`,
      content:     Buffer.from(csv).toString('base64'),
      content_type: 'text/csv',
    }],
  });

  if (sendErr) throw new Error(`Resend failed: ${JSON.stringify(sendErr)}`);

  return { sent: true, passCount: sorted.length, pendingCount: (pendingPasses || []).length };
}

module.exports = { generateBlackoutReport, validPassTypesForDate, sortKey };
