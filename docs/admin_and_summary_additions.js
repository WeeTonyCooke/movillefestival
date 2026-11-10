// ─────────────────────────────────────────────────────────────────────────────
// A) ADMIN PAGE — Add this card alongside your existing Ball Drop / Bed Push /
//    Craft Fair cards in AdminPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

// In your data-fetching useEffect, add:
const { data: passData } = await supabase
  .from('festival_passes')
  .select('pass_type, status')
  .eq('status', 'paid');

// Tally by type:
const passCounts = {
  festival_pass: passData?.filter(p => p.pass_type === 'festival_pass').length ?? 0,
  friday:        passData?.filter(p => p.pass_type === 'friday').length ?? 0,
  saturday:      passData?.filter(p => p.pass_type === 'saturday').length ?? 0,
  sunday:        passData?.filter(p => p.pass_type === 'sunday').length ?? 0,
};
const totalPasses = Object.values(passCounts).reduce((a, b) => a + b, 0);

// Admin card JSX:
/*
<div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
  <h3 style={{ margin: '0 0 16px', color: '#1F4E5F', fontSize: 18 }}>Festival Passes</h3>
  <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: '#1F4E5F' }}>{totalPasses}</p>
  <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>total passes sold</p>
  <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
    <tbody>
      {[
        ['Festival Pass (Full)', passCounts.festival_pass],
        ['Friday Day Pass', passCounts.friday],
        ['Saturday Day Pass', passCounts.saturday],
        ['Sunday Day Pass', passCounts.sunday],
      ].map(([label, count]) => (
        <tr key={label} style={{ borderTop: '1px solid #f0f0f0' }}>
          <td style={{ padding: '8px 0', color: '#555' }}>{label}</td>
          <td style={{ padding: '8px 0', fontWeight: 700, color: '#1F4E5F', textAlign: 'right' }}>{count}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
*/


// ─────────────────────────────────────────────────────────────────────────────
// B) DAILY SUMMARY EMAIL — Add pass counts to daily-summary.js
//    Add this query alongside your existing Ball Drop / Bed Push / Craft Fair queries:
// ─────────────────────────────────────────────────────────────────────────────

// In daily-summary.js, add:
const { data: passRows } = await supabase
  .from('festival_passes')
  .select('pass_type')
  .eq('status', 'paid');

const festivalPassCount = passRows?.filter(p => p.pass_type === 'festival_pass').length ?? 0;
const fridayPassCount   = passRows?.filter(p => p.pass_type === 'friday').length ?? 0;
const saturdayPassCount = passRows?.filter(p => p.pass_type === 'saturday').length ?? 0;
const sundayPassCount   = passRows?.filter(p => p.pass_type === 'sunday').length ?? 0;
const totalPassCount    = passRows?.length ?? 0;

// Add to the email HTML body — suggested section to add after Ball Drop:
/*
<tr>
  <td style="padding: 16px 0; border-top: 1px solid #eee;">
    <p style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1F4E5F;">Festival Passes</p>
    <p style="margin: 0 0 4px; font-size: 14px; color: #555;">Total sold: <strong>${totalPassCount}</strong></p>
    <p style="margin: 0 0 2px; font-size: 13px; color: #777;">Festival Pass (Full): ${festivalPassCount}</p>
    <p style="margin: 0 0 2px; font-size: 13px; color: #777;">Friday: ${fridayPassCount}</p>
    <p style="margin: 0 0 2px; font-size: 13px; color: #777;">Saturday: ${saturdayPassCount}</p>
    <p style="margin: 0; font-size: 13px; color: #777;">Sunday: ${sundayPassCount}</p>
  </td>
</tr>
*/
