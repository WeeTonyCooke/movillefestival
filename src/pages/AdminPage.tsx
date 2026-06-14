import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface BallDropReg {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  quantity: number;
  ball_numbers: number[];
  amount_paid: number;
  status: string;
  created_at: string;
}

interface BedPushReg {
  id: string;
  team_name: string;
  organisation: string;
  captain_name: string;
  email: string;
  phone: string;
  amount_paid: number;
  status: string;
  created_at: string;
}

interface CraftFairReg {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  products: string;
  amount_paid: number;
  status: string;
  created_at: string;
}

interface SponsorshipReg {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  amount_paid: number;
  message: string;
  social_media_consent: boolean;
  status: string;
  created_at: string;
}

interface FestivalPassReg {
  id: string;
  full_name: string;
  email: string;
  pass_type: string;
  pass_ref: string | null;
  amount_paid: number;
  status: string;
  confirmation_email_sent: boolean;
  created_at: string;
}

interface AdminData {
  ballDrop: BallDropReg[];
  bedPush: BedPushReg[];
  craftFair: CraftFairReg[];
  sponsorships: SponsorshipReg[];
  passes: FestivalPassReg[];
  ballsRemaining: number;
  ballsSold: number;
}

type Tab = 'balldrop' | 'bedpush' | 'craftfair' | 'sponsorship' | 'passes';

const TOTAL_BALLS = 1200;
const ONLINE_DEFAULT = 700;
const PAPER_MAX = 500;
const BED_PUSH_CAPACITY = 20;
const CRAFT_FAIR_CAPACITY = 15;

const s: Record<string, React.CSSProperties> = {
  wrap: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#1F4E5F', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' },
  headerSub: { color: '#a8c8d4', margin: '2px 0 0', fontSize: '13px' },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' },
  metricCard: { background: '#fff', borderRadius: '8px', padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  metricLabel: { margin: '0 0 4px', fontSize: '11px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  metricValue: { margin: '0 0 2px', fontSize: '24px', fontWeight: 'bold', color: '#1F4E5F' },
  metricSub: { margin: 0, fontSize: '12px', color: '#888' },
  sectionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' as const, gap: '8px' },
  tabs: { display: 'flex', gap: '6px', flexWrap: 'wrap' as const },
  actionRow: { display: 'flex', gap: '8px' },
  searchRow: { marginBottom: '14px' },
  searchInput: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Arial', fontSize: '13px', width: '280px', boxSizing: 'border-box' as const },
  inventoryBar: { background: '#fff', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const },
  invItem: { display: 'flex', flexDirection: 'column' as const, gap: '2px' },
  invLabel: { fontSize: '11px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  invValue: { fontSize: '20px', fontWeight: 'bold', color: '#1F4E5F' },
  invDivider: { width: '1px', height: '36px', background: '#e0e0e0', alignSelf: 'center' },
  invAdjust: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
  invAdjustLabel: { fontSize: '12px', color: '#666' },
  invAdjustInput: { width: '70px', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Arial', fontSize: '13px', textAlign: 'center' as const },
  tableWrap: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflowX: 'auto' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px', minWidth: '700px' },
  th: { padding: '10px 12px', textAlign: 'left' as const, color: '#fff', fontSize: '12px', fontWeight: 'bold', background: '#1F4E5F', whiteSpace: 'nowrap' as const },
  tdBase: { padding: '9px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  emptyRow: { padding: '24px', textAlign: 'center' as const, color: '#888', fontSize: '14px' },
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    fontFamily: 'Arial', fontSize: '13px', fontWeight: active ? 'bold' : 'normal',
    background: active ? '#1F4E5F' : '#fff', color: active ? '#fff' : '#333',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  };
}

function btnStyle(variant: 'primary' | 'secondary' = 'secondary'): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Arial', fontSize: '13px',
    border: variant === 'primary' ? 'none' : '1px solid #ddd',
    background: variant === 'primary' ? '#1F4E5F' : '#fff',
    color: variant === 'primary' ? '#fff' : '#333',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  };
}

function badgeStyle(status: string): React.CSSProperties {
  return {
    fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px',
    background: status === 'paid' ? '#D4EDDA' : '#FFF3CD',
    color: status === 'paid' ? '#1A7A3C' : '#7D5A00',
  };
}

function resendBtnStyle(sent: boolean, loading: boolean): React.CSSProperties {
  return {
    fontSize: '11px', padding: '2px 8px', borderRadius: '4px', cursor: loading ? 'default' : 'pointer',
    border: sent ? '1px solid #1A7A3C' : '1px solid #1F4E5F',
    background: 'transparent',
    color: sent ? '#1A7A3C' : '#1F4E5F',
    opacity: loading ? 0.6 : 1,
  };
}

function rowStyle(i: number): React.CSSProperties {
  return { background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' };
}

function td(extra?: React.CSSProperties): React.CSSProperties {
  return { ...s.tdBase, ...extra };
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatEuro(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('balldrop');
  const [search, setSearch] = useState('');
  const [resendState, setResendState] = useState<Record<string, 'idle' | 'loading' | 'sent' | 'error'>>({});
  const [onlineLimit, setOnlineLimit] = useState(ONLINE_DEFAULT);
  const [onlineLimitInput, setOnlineLimitInput] = useState(String(ONLINE_DEFAULT));
  const [savingLimit, setSavingLimit] = useState(false);

  const handleLogin = () => {
    if (password.trim() === '') { setError('Please enter a password'); return; }
    setAuthed(true);
    setError('');
  };

  const fetchData = useCallback(() => {
    if (!authed) return;
    setLoading(true);
    fetch('/.netlify/functions/get-admin-data', {
      headers: { 'x-admin-password': password },
    })
      .then(res => {
        if (res.status === 401) { setAuthed(false); setError('Incorrect password'); setLoading(false); return null; }
        return res.json();
      })
      .then(d => { if (d) { setData(d); setLoading(false); } })
      .catch(() => setLoading(false));
  }, [authed, password]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResend = async (eventType: string, id: string) => {
    const key = `${eventType}-${id}`;
    setResendState(prev => ({ ...prev, [key]: 'loading' }));
    try {
      const res = await fetch('/.netlify/functions/admin-resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ event: eventType, id }),
      });
      setResendState(prev => ({ ...prev, [key]: res.ok ? 'sent' : 'error' }));
      if (!res.ok) setTimeout(() => setResendState(prev => ({ ...prev, [key]: 'idle' })), 3000);
    } catch {
      setResendState(prev => ({ ...prev, [key]: 'error' }));
      setTimeout(() => setResendState(prev => ({ ...prev, [key]: 'idle' })), 3000);
    }
  };

  const handleSaveOnlineLimit = async () => {
    const val = parseInt(onlineLimitInput, 10);
    if (isNaN(val) || val < 0 || val > (TOTAL_BALLS - PAPER_MAX)) {
      alert(`Online limit must be between 0 and ${TOTAL_BALLS - PAPER_MAX}`);
      return;
    }
    setSavingLimit(true);
    // For now update local state — backend adjustment endpoint (ANT-17) to be implemented
    setOnlineLimit(val);
    setSavingLimit(false);
  };

  const filterRegs = <T extends { full_name?: string; email?: string; phone?: string; team_name?: string; captain_name?: string }>(regs: T[]) => {
    if (!search.trim()) return regs;
    const q = search.toLowerCase();
    return regs.filter(r =>
      [r.full_name, r.email, r.phone, r.team_name, r.captain_name]
        .some(v => v && v.toLowerCase().includes(q))
    );
  };

  const exportBallDrop = () => {
    if (!data) return;
    downloadCSV('ball-drop-registrations.csv',
      data.ballDrop.map(r => [r.full_name, r.email, r.phone, String(r.quantity), (r.ball_numbers || []).join(' | '), formatEuro(r.amount_paid), r.status, formatDate(r.created_at)]),
      ['Name', 'Email', 'Phone', 'Quantity', 'Ball Numbers', 'Amount', 'Status', 'Date']
    );
  };

  const exportBedPush = () => {
    if (!data) return;
    downloadCSV('bed-push-registrations.csv',
      data.bedPush.map(r => [r.team_name, r.organisation || '', r.captain_name, r.email, r.phone, formatEuro(r.amount_paid), r.status, formatDate(r.created_at)]),
      ['Team', 'Organisation', 'Captain', 'Email', 'Phone', 'Amount', 'Status', 'Date']
    );
  };

  const exportCraftFair = () => {
    if (!data) return;
    downloadCSV('craft-fair-registrations.csv',
      data.craftFair.map(r => [r.full_name, r.business_name || '', r.email, r.phone, r.products, formatEuro(r.amount_paid), r.status, formatDate(r.created_at)]),
      ['Name', 'Business', 'Email', 'Phone', 'Products', 'Amount', 'Status', 'Date']
    );
  };

  const exportPasses = () => {
    if (!data) return;
    const PASS_LABELS: Record<string, string> = {
      festival_pass: 'Festival Pass',
      friday:        'Friday Day Pass',
      saturday:      'Saturday Day Pass',
      sunday:        'Sunday Day Pass',
    };
    downloadCSV('festival-passes.csv',
      data.passes.map(r => [
        r.full_name,
        r.email,
        PASS_LABELS[r.pass_type] || r.pass_type,
        r.pass_ref || '',
        formatEuro(r.amount_paid),
        r.status,
        r.confirmation_email_sent ? 'Yes' : 'No',
        formatDate(r.created_at),
      ]),
      ['Name', 'Email', 'Pass Type', 'Pass Ref', 'Amount', 'Status', 'Email Sent', 'Date']
    );
  };

  const exportSponsorship = () => {
    if (!data) return;
    downloadCSV('sponsorships.csv',
      (data.sponsorships || []).map(r => [r.business_name, r.contact_name, r.email, r.phone || '', formatEuro(r.amount_paid), r.message || '', r.social_media_consent ? 'Yes' : 'No', r.status, formatDate(r.created_at)]),
      ['Business', 'Contact', 'Email', 'Phone', 'Amount', 'Message', 'Social Media', 'Status', 'Date']
    );
  };

  const handleExport = () => {
    if (tab === 'balldrop') exportBallDrop();
    else if (tab === 'bedpush') exportBedPush();
    else if (tab === 'craftfair') exportCraftFair();
    else if (tab === 'passes') exportPasses();
    else exportSponsorship();
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '320px' }}>
          <h1 style={{ fontFamily: 'Arial', fontSize: '20px', color: '#1F4E5F', marginBottom: '4px' }}>Committee Admin</h1>
          <p style={{ fontFamily: 'Arial', fontSize: '14px', color: '#888', marginBottom: '24px' }}>Moville Summer Festival 2026</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Arial', fontSize: '15px', boxSizing: 'border-box', marginBottom: '12px' }}
          />
          {error && <p style={{ color: '#c0392b', fontFamily: 'Arial', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          <button onClick={handleLogin} style={{ ...btnStyle('primary'), width: '100%', padding: '12px', fontSize: '15px' }}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial', color: '#888' }}>
        Loading registrations…
      </div>
    );
  }

  const ballPaid = data.ballDrop.filter(r => r.status === 'paid');
  const bedPaid = data.bedPush.filter(r => r.status === 'paid');
  const craftPaid = data.craftFair.filter(r => r.status === 'paid');
  const sponsorPaid = (data.sponsorships || []).filter(r => r.status === 'paid');
  const passesPaid = (data.passes || []).filter(r => r.status === 'paid');
  const totalRevenue = [...ballPaid, ...bedPaid, ...craftPaid, ...sponsorPaid, ...passesPaid].reduce((s, r) => s + r.amount_paid, 0);
  const onlineBallsSold = ballPaid.reduce((s, r) => s + (r.quantity || 0), 0);
  const onlineBallsRemaining = onlineLimit - onlineBallsSold;

  const filteredBallDrop = filterRegs(data.ballDrop);
  const filteredBedPush = filterRegs(data.bedPush);
  const filteredCraftFair = filterRegs(data.craftFair);
  const filteredPasses = (data.passes || []).filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [r.full_name, r.email, r.pass_ref].some(v => v && v.toLowerCase().includes(q));
  });
  const sponsorshipPaid = (data.sponsorships || []).filter(r => r.status === 'paid');
  const filteredSponsorships = (data.sponsorships || []).filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [r.business_name, r.contact_name, r.email, r.phone].some(v => v && v.toLowerCase().includes(q));
  });

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>Moville Summer Festival 2026</h1>
          <p style={s.headerSub}>Committee admin</p>
        </div>
        <Link to="/" style={{ color: '#a8c8d4', fontSize: '13px', textDecoration: 'none' }}>← Back to site</Link>
      </div>

      <div style={s.body}>

        {/* Summary cards */}
        <div style={s.metricGrid}>
          {[
            { label: 'Ball Drop', value: `${onlineBallsSold} balls sold`, sub: `${onlineBallsRemaining} of ${onlineLimit} online remaining` },
            { label: 'Bed Push', value: `${bedPaid.length} teams`, sub: `${BED_PUSH_CAPACITY - bedPaid.length} of ${BED_PUSH_CAPACITY} remaining` },
            { label: 'Craft Fair', value: craftPaid.length >= CRAFT_FAIR_CAPACITY ? 'Sold out' : `${craftPaid.length} stalls`, sub: craftPaid.length >= CRAFT_FAIR_CAPACITY ? `${CRAFT_FAIR_CAPACITY} stalls filled` : `${CRAFT_FAIR_CAPACITY - craftPaid.length} remaining` },
            { label: 'Festival Passes', value: `${passesPaid.length} sold`, sub: `${formatEuro(passesPaid.reduce((s, r) => s + r.amount_paid, 0))} revenue` },
            { label: 'Sponsorships', value: formatEuro(sponsorPaid.reduce((s,r) => s + r.amount_paid, 0)), sub: `${sponsorPaid.length} sponsor${sponsorPaid.length !== 1 ? 's' : ''}` },
            { label: 'Total revenue', value: formatEuro(totalRevenue), sub: 'all events combined', green: true },
          ].map(({ label, value, sub, green }) => (
            <div key={label} style={s.metricCard}>
              <p style={s.metricLabel}>{label}</p>
              <p style={{ ...s.metricValue, color: green ? '#1A7A3C' : '#1F4E5F' }}>{value}</p>
              <p style={s.metricSub}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs + export */}
        <div style={s.sectionBar}>
          <div style={s.tabs}>
            {([['balldrop', '🎱 Ball Drop'], ['bedpush', '🛏️ Bed Push'], ['craftfair', '🎨 Craft Fair'], ['passes', '🎟️ Festival Passes'], ['sponsorship', '🤝 Sponsorships']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setSearch(''); }} style={tabStyle(tab === t)}>{label}</button>
            ))}
          </div>
          <div style={s.actionRow}>
            <button onClick={fetchData} style={btnStyle('secondary')}>↺ Refresh</button>
            <button onClick={handleExport} style={btnStyle('secondary')}>⬇ Export CSV</button>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchRow}>
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={s.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ marginLeft: '8px', ...btnStyle('secondary'), padding: '7px 10px' }}>✕ Clear</button>
          )}
        </div>

        {/* ── Ball Drop ── */}
        {tab === 'balldrop' && (
          <>
            {/* Inventory bar */}
            <div style={s.inventoryBar}>
              {[
                { label: 'Total balls', value: TOTAL_BALLS.toLocaleString() },
                { label: 'Online (501–1200)', value: onlineLimit },
                { label: 'Paper (1–500)', value: TOTAL_BALLS - onlineLimit },
                { label: 'Online sold', value: onlineBallsSold },
                { label: 'Online remaining', value: onlineBallsRemaining },
              ].map(({ label, value }, i, arr) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={s.invItem}>
                    <span style={s.invLabel}>{label}</span>
                    <span style={s.invValue}>{value}</span>
                  </div>
                  {i < arr.length - 1 && <div style={s.invDivider} />}
                </span>
              ))}
              <div style={s.invAdjust}>
                <span style={s.invAdjustLabel}>Adjust online limit</span>
                <input
                  type="number"
                  value={onlineLimitInput}
                  onChange={e => setOnlineLimitInput(e.target.value)}
                  style={s.invAdjustInput}
                  min={0}
                  max={TOTAL_BALLS - PAPER_MAX}
                />
                <button onClick={handleSaveOnlineLimit} disabled={savingLimit} style={{ ...btnStyle('primary'), padding: '6px 14px' }}>
                  {savingLimit ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Phone', 'Qty', 'Ball numbers', 'Amount', 'Status', 'Date', 'Email'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBallDrop.length === 0 && (
                    <tr><td colSpan={9} style={s.emptyRow}>{search ? 'No results match your search.' : 'No registrations yet.'}</td></tr>
                  )}
                  {filteredBallDrop.map((r, i) => {
                    const key = `balldrop-${r.id}`;
                    const rState = resendState[key] || 'idle';
                    return (
                      <tr key={r.id} style={rowStyle(i)}>
                        <td style={td()}>{r.full_name}</td>
                        <td style={td({ color: '#555' })}>{r.email}</td>
                        <td style={td({ color: '#555' })}>{r.phone || '—'}</td>
                        <td style={td()}>{r.quantity}</td>
                        <td style={td({ color: '#1F4E5F', fontWeight: 'bold' })}>{(r.ball_numbers || []).join(', ') || '—'}</td>
                        <td style={td()}>{formatEuro(r.amount_paid)}</td>
                        <td style={td()}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                        <td style={td({ color: '#888', fontSize: '12px' })}>{formatDate(r.created_at)}</td>
                        <td style={td()}>
                          <button
                            onClick={() => rState === 'idle' && handleResend('balldrop', r.id)}
                            disabled={rState === 'loading' || rState === 'sent'}
                            style={resendBtnStyle(rState === 'sent', rState === 'loading')}
                          >
                            {rState === 'loading' ? '…' : rState === 'sent' ? '✓ Sent' : rState === 'error' ? 'Failed' : 'Resend'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Bed Push ── */}
        {tab === 'bedpush' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Team', 'Organisation', 'Captain', 'Email', 'Phone', 'Amount', 'Status', 'Date', 'Email'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBedPush.length === 0 && (
                  <tr><td colSpan={9} style={s.emptyRow}>{search ? 'No results match your search.' : 'No registrations yet.'}</td></tr>
                )}
                {filteredBedPush.map((r, i) => {
                  const key = `bedpush-${r.id}`;
                  const rState = resendState[key] || 'idle';
                  return (
                    <tr key={r.id} style={rowStyle(i)}>
                      <td style={td({ fontWeight: 'bold' })}>{r.team_name}</td>
                      <td style={td({ color: '#555' })}>{r.organisation || '—'}</td>
                      <td style={td()}>{r.captain_name}</td>
                      <td style={td({ color: '#555' })}>{r.email}</td>
                      <td style={td({ color: '#555' })}>{r.phone}</td>
                      <td style={td()}>{formatEuro(r.amount_paid)}</td>
                      <td style={td()}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px' })}>{formatDate(r.created_at)}</td>
                      <td style={td()}>
                        <button
                          onClick={() => rState === 'idle' && handleResend('bedpush', r.id)}
                          disabled={rState === 'loading' || rState === 'sent'}
                          style={resendBtnStyle(rState === 'sent', rState === 'loading')}
                        >
                          {rState === 'loading' ? '…' : rState === 'sent' ? '✓ Sent' : rState === 'error' ? 'Failed' : 'Resend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Craft Fair ── */}
        {tab === 'craftfair' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Business', 'Email', 'Phone', 'Products', 'Amount', 'Status', 'Date', 'Email'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCraftFair.length === 0 && (
                  <tr><td colSpan={9} style={s.emptyRow}>{search ? 'No results match your search.' : 'No registrations yet.'}</td></tr>
                )}
                {filteredCraftFair.map((r, i) => {
                  const key = `craftfair-${r.id}`;
                  const rState = resendState[key] || 'idle';
                  return (
                    <tr key={r.id} style={rowStyle(i)}>
                      <td style={td()}>{r.full_name}</td>
                      <td style={td({ color: '#555' })}>{r.business_name || '—'}</td>
                      <td style={td({ color: '#555' })}>{r.email}</td>
                      <td style={td({ color: '#555' })}>{r.phone}</td>
                      <td style={td({ color: '#555', maxWidth: '160px' })}>{r.products}</td>
                      <td style={td()}>{formatEuro(r.amount_paid)}</td>
                      <td style={td()}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px' })}>{formatDate(r.created_at)}</td>
                      <td style={td()}>
                        <button
                          onClick={() => rState === 'idle' && handleResend('craftfair', r.id)}
                          disabled={rState === 'loading' || rState === 'sent'}
                          style={resendBtnStyle(rState === 'sent', rState === 'loading')}
                        >
                          {rState === 'loading' ? '…' : rState === 'sent' ? '✓ Sent' : rState === 'error' ? 'Failed' : 'Resend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Sponsorships ── */}
        {tab === 'sponsorship' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Business', 'Contact', 'Email', 'Phone', 'Amount', 'Message', 'Social Media', 'Status', 'Date', 'Email'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSponsorships.length === 0 && (
                  <tr><td colSpan={9} style={s.emptyRow}>{search ? 'No results match your search.' : 'No sponsorships yet.'}</td></tr>
                )}
                {filteredSponsorships.map((r, i) => {
                  const key = `sponsorship-${r.id}`;
                  const rState = resendState[key] || 'idle';
                  return (
                    <tr key={r.id} style={rowStyle(i)}>
                      <td style={td({ fontWeight: 'bold' })}>{r.business_name}</td>
                      <td style={td()}>{r.contact_name}</td>
                      <td style={td({ color: '#555' })}>{r.email}</td>
                      <td style={td({ color: '#555' })}>{r.phone || '—'}</td>
                      <td style={td({ fontWeight: 'bold', color: '#1A7A3C' })}>{formatEuro(r.amount_paid)}</td>
                      <td style={td({ color: '#555', maxWidth: '160px' })}>{r.message || '—'}</td>
                      <td style={td()}>{r.social_media_consent ? '✓ Yes' : '—'}</td>
                      <td style={td()}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px' })}>{formatDate(r.created_at)}</td>
                      <td style={td()}>
                        <button
                          onClick={() => rState === 'idle' && handleResend('sponsorship' as Tab, r.id)}
                          disabled={rState === 'loading' || rState === 'sent'}
                          style={resendBtnStyle(rState === 'sent', rState === 'loading')}
                        >
                          {rState === 'loading' ? '…' : rState === 'sent' ? '✓ Sent' : rState === 'error' ? 'Failed' : 'Resend'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* -- Festival Passes -- */}
        {tab === 'passes' && (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Pass Type', 'Pass Ref', 'Amount', 'Status', 'Date', 'Email'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPasses.length === 0 && (
                  <tr><td colSpan={8} style={s.emptyRow}>No passes found</td></tr>
                )}
                {filteredPasses.map((r, i) => {
                  const key = `festival_pass-${r.id}`;
                  const rState = resendState[key] || 'idle';
                  const PASS_TYPE_LABELS: Record<string, string> = {
                    festival_pass: 'Festival Pass',
                    friday: 'Friday Day Pass',
                    saturday: 'Saturday Day Pass',
                    sunday: 'Sunday Day Pass',
                  };
                  return (
                    <tr key={r.id} style={rowStyle(i)}>
                      <td style={td()}>{r.full_name}</td>
                      <td style={td({ maxWidth: 180 })}>{r.email}</td>
                      <td style={td()}>{PASS_TYPE_LABELS[r.pass_type] || r.pass_type}</td>
                      <td style={td({ fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' })}>{r.pass_ref || '—'}</td>
                      <td style={td()}>{formatEuro(r.amount_paid)}</td>
                      <td style={td()}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888' })}>{formatDate(r.created_at)}</td>
                      <td style={td()}>
                        {r.status === 'paid' ? (
                          <button
                            onClick={() => rState === 'idle' && handleResend('festival_pass', r.id)}
                            disabled={rState === 'loading' || rState === 'sent'}
                            style={resendBtnStyle(rState === 'sent', rState === 'loading')}
                          >
                            {rState === 'loading' ? '…' : rState === 'sent' ? '✓ Sent' : rState === 'error' ? 'Failed' : 'Resend'}
                          </button>
                        ) : <span style={{ color: '#bbb', fontSize: 11 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


      </div>
    </div>
  );
}
