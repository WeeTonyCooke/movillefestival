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
  onlineBallLimit: number;
  availableBallNumbers: number[];
}

type Tab = 'balldrop' | 'bedpush' | 'craftfair' | 'sponsorship' | 'passes';

const TOTAL_BALLS = 1200;
const ONLINE_DEFAULT = 700;
const PAPER_MAX = 500;
const BED_PUSH_CAPACITY = 20;
const CRAFT_FAIR_CAPACITY = 15;

const s: Record<string, React.CSSProperties> = {
  wrap: { fontFamily: 'Outfit, system-ui, sans-serif', minHeight: '100vh', background: '#FAF8F4' },
  header: { background: '#16323C', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  headerTitle: { color: '#f4efe5', margin: 0, fontSize: '15px', fontWeight: 600, fontFamily: "'Outfit', system-ui, sans-serif" },
  headerSub: { color: '#B0894F', margin: '2px 0 0', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' as const, justifyContent: 'flex-end' as const },
  backLink: { color: 'rgba(244,239,229,0.7)', fontSize: '13px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', fontFamily: "'Outfit', system-ui, sans-serif" },
  choiceWrap: { minHeight: '100vh', background: '#16323C', display: 'flex', flexDirection: 'column' as const, fontFamily: "'Outfit', system-ui, sans-serif" },
  choiceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  choiceHeaderLeft: { display: 'flex', flexDirection: 'column' as const, gap: '2px' },
  choiceHeaderTitle: { color: '#f4efe5', margin: 0, fontSize: '15px', fontWeight: 600, fontFamily: "'Outfit', system-ui, sans-serif" },
  choiceHeaderSub: { color: '#B0894F', margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const },
  exitLink: { color: 'rgba(244,239,229,0.58)', fontSize: '13px', textDecoration: 'none', padding: '6px 0' },
  choiceBody: { flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', padding: '40px 28px 40px' },
  choiceTileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '680px' },
  choiceTile: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px', padding: '28px 24px 24px', display: 'flex', flexDirection: 'column' as const, gap: '0', textDecoration: 'none', cursor: 'pointer', font: 'inherit', textAlign: 'left' as const, transition: 'background 0.18s, border-color 0.18s' },
  choiceTileIconWrap: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  choiceTileTitle: { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: '#f4efe5', margin: '0 0 8px', letterSpacing: '-0.01em' },
  choiceTileDesc: { fontSize: '13px', color: 'rgba(244,239,229,0.58)', margin: '0 0 20px', lineHeight: 1.5 },
  choiceTileLink: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#B0894F', margin: 0 },
  choiceFooter: { display: 'flex', justifyContent: 'space-between', padding: '0 28px 24px', fontSize: '11px', color: 'rgba(255,255,255,0.28)' },
  choiceSignOut: { color: 'rgba(255,255,255,0.38)', fontSize: '11px', textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none', font: 'inherit', padding: 0 },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' },
  metricCard: { background: '#fff', border: '1px solid rgba(22,50,60,0.1)', borderRadius: '16px', padding: '16px 18px', boxShadow: '0 12px 30px rgba(12,20,28,0.05)' },
  metricLabel: { margin: '0 0 4px', fontSize: '11px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  metricValue: { margin: '0 0 2px', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '26px', fontWeight: 700, color: '#16323C' },
  metricSub: { margin: 0, fontSize: '12px', color: '#888' },
  sectionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' as const, gap: '8px' },
  tabs: { display: 'flex', gap: '6px', flexWrap: 'wrap' as const },
  actionRow: { display: 'flex', gap: '8px' },
  searchRow: { marginBottom: '14px' },
  searchInput: { padding: '8px 12px', border: '1px solid rgba(22,50,60,0.16)', borderRadius: '12px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', width: '280px', boxSizing: 'border-box' as const },
  inventoryBar: { background: '#fff', border: '1px solid rgba(22,50,60,0.1)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 12px 30px rgba(12,20,28,0.05)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' as const },
  invItem: { display: 'flex', flexDirection: 'column' as const, gap: '2px' },
  invLabel: { fontSize: '11px', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  invValue: { fontSize: '20px', fontWeight: 'bold', color: '#16323C' },
  invDivider: { width: '1px', height: '36px', background: '#e0e0e0', alignSelf: 'center' },
  invAdjust: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
  invAdjustLabel: { fontSize: '12px', color: '#666' },
  invAdjustInput: { width: '70px', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', textAlign: 'center' as const },
  availableNumbersWrap: { marginTop: '12px', padding: '14px 18px', background: '#F4F9F8', border: '1px solid rgba(107,175,167,0.3)', borderRadius: '10px' },
  availableNumbersTitle: { fontSize: '12px', fontWeight: 700, color: '#1F4E5F', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' as const },
  availableNumbersGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginTop: '8px' },
  availableNumberChip: { fontSize: '11px', fontWeight: 600, color: '#1F4E5F', background: '#fff', border: '1px solid rgba(107,175,167,0.5)', borderRadius: '4px', padding: '2px 7px', fontFamily: 'Outfit, system-ui, sans-serif' },
  tableWrap: { background: '#fff', border: '1px solid rgba(22,50,60,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(12,20,28,0.05)', overflowX: 'auto' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px', minWidth: '700px' },
  th: { padding: '10px 12px', textAlign: 'left' as const, color: '#fff', fontSize: '12px', fontWeight: 'bold', background: '#16323C', whiteSpace: 'nowrap' as const },
  tdBase: { padding: '9px 12px', wordBreak: 'break-word' as const },
  emptyRow: { padding: '24px', textAlign: 'center' as const, color: '#888', fontSize: '14px' },
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: '999px', border: active ? 'none' : '1px solid rgba(22,50,60,0.16)', cursor: 'pointer',
    fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: active ? 'bold' : 'normal',
    background: active ? '#16323C' : '#fff', color: active ? '#fff' : 'rgba(22,50,60,0.7)',
    boxShadow: 'none',
  };
}

function btnStyle(variant: 'primary' | 'secondary' = 'secondary'): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px',
    border: variant === 'primary' ? 'none' : '1px solid rgba(22,50,60,0.16)',
    background: variant === 'primary' ? '#16323C' : '#fff',
    color: variant === 'primary' ? '#fff' : '#16323C',
    boxShadow: 'none',
  };
}

function badgeStyle(status: string): React.CSSProperties {
  return {
    fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px',
    background: status === 'paid' ? 'rgba(47,143,110,0.14)' : 'rgba(176,137,79,0.18)',
    color: status === 'paid' ? '#246B52' : '#8A6A2F',
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

function maskEmail(email?: string) {
  if (!email) return '—';
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const visible = local.length <= 7 ? local : local.slice(0, 7);
  return `${visible}...${domain}`;
}

function maskPhone(phone?: string) {
  if (!phone) return '—';
  const trimmed = phone.trim();
  if (trimmed.length <= 6) return trimmed;
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-3);
  const maskedLen = Math.max(trimmed.length - 6, 3);
  return `${prefix}${'*'.repeat(maskedLen)}${suffix}`;
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

const SESSION_PW_KEY = 'movilleAdminPassword';

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(SESSION_PW_KEY));
  const [password, setPassword] = useState(() => sessionStorage.getItem(SESSION_PW_KEY) || '');
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('balldrop');
  const [search, setSearch] = useState('');
  const [resendState, setResendState] = useState<Record<string, 'idle' | 'loading' | 'sent' | 'error'>>({});
  const [onlineLimit, setOnlineLimit] = useState(ONLINE_DEFAULT);
  const [onlineLimitInput, setOnlineLimitInput] = useState(String(ONLINE_DEFAULT));
  const [showAvailableNumbers, setShowAvailableNumbers] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [view, setView] = useState<'choice' | 'dashboard'>('choice');
  const [checkingLogin, setCheckingLogin] = useState(false);

  const handleLogin = async () => {
    if (password.trim() === '') { setError('Please enter a password'); return; }
    setCheckingLogin(true);
    try {
      const res = await fetch('/.netlify/functions/get-admin-data', {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) {
        setError('Incorrect password');
        setCheckingLogin(false);
        return;
      }
      sessionStorage.setItem(SESSION_PW_KEY, password);
      setAuthed(true);
      setError('');
    } catch {
      setError('Could not reach the server. Check your connection.');
    }
    setCheckingLogin(false);
  };

  const fetchData = useCallback(() => {
    if (!authed || view !== 'dashboard') return;
    setLoading(true);
    fetch('/.netlify/functions/get-admin-data', {
      headers: { 'x-admin-password': password },
    })
      .then(res => {
        if (res.status === 401) { sessionStorage.removeItem(SESSION_PW_KEY); setAuthed(false); setView('choice'); setError('Incorrect password'); setLoading(false); return null; }
        return res.json();
      })
      .then(d => { if (d) { setData(d); if (d.onlineBallLimit !== undefined) { setOnlineLimit(d.onlineBallLimit); setOnlineLimitInput(String(d.onlineBallLimit)); } setLoading(false); } })
      .catch(() => setLoading(false));
  }, [authed, password, view]);

  useEffect(() => { fetchData(); }, [fetchData]); // eslint-disable-line react-hooks/set-state-in-effect

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
      setTimeout(() => setResendState(prev => ({ ...prev, [key]: 'idle' })), 5000);
    } catch {
      setResendState(prev => ({ ...prev, [key]: 'error' }));
      setTimeout(() => setResendState(prev => ({ ...prev, [key]: 'idle' })), 3000);
    }
  };

  const handleExportBallNumbersCSV = () => {
    if (!data) return;
    const rows = data.availableBallNumbers.map(n => [String(n), 'available']);
    // Also include sold balls from registrations
    const soldNumbers: number[] = data.ballDrop
      .filter(r => r.status === 'paid')
      .flatMap(r => r.ball_numbers || [])
      .sort((a, b) => a - b);
    const allRows = [
      ...soldNumbers.map(n => [String(n), 'sold']),
      ...rows,
    ].sort((a, b) => Number(a[0]) - Number(b[0]));
    downloadCSV('ball-numbers.csv', allRows, ['Ball Number', 'Status']);
  };

  const handleExportBallNumbersPDF = () => {
    if (!data) return;
    const soldNumbers: number[] = data.ballDrop
      .filter(r => r.status === 'paid')
      .flatMap(r => r.ball_numbers || [])
      .sort((a, b) => a - b);
    const allNumbers = [
      ...soldNumbers.map(n => ({ n, status: 'sold' })),
      ...data.availableBallNumbers.map(n => ({ n, status: 'available' })),
    ].sort((a, b) => a.n - b.n);

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ball Drop Numbers — Moville Summer Festival 2026</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  p { font-size: 12px; color: #555; margin: 0 0 16px; }
  .grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
  .ball { border: 1px solid #ccc; border-radius: 4px; padding: 6px 4px; text-align: center; font-size: 12px; font-weight: bold; }
  .ball.sold { background: #f0f0f0; color: #999; text-decoration: line-through; }
  .ball.available { background: #fff; color: #000; }
  .legend { margin-top: 16px; font-size: 11px; color: #555; }
</style>
</head>
<body>
<h1>Moville Summer Festival 2026 — Ball Drop Numbers</h1>
<p>Online allocation: balls 501–${500 + data.onlineBallLimit} &nbsp;|&nbsp; Limit: ${data.onlineBallLimit} &nbsp;|&nbsp; Sold online: ${soldNumbers.length} &nbsp;|&nbsp; Available: ${data.availableBallNumbers.length}</p>
<div class="grid">
${allNumbers.map(({ n, status }) => '<div class="ball ' + status + '">' + String(n) + '</div>').join('\n')}
')}
</div>
<div class="legend">Crossed out = sold online. Blank = available for sale.</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const handleSaveOnlineLimit = async () => {
    const val = parseInt(onlineLimitInput, 10);
    if (isNaN(val) || val < 0 || val > (TOTAL_BALLS - PAPER_MAX)) {
      alert(`Online limit must be between 0 and ${TOTAL_BALLS - PAPER_MAX}`);
      return;
    }
    setSavingLimit(true);
    try {
      const res = await fetch('/.netlify/functions/update-ball-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ online_ball_limit: val }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body.error || `Failed to save (${res.status})`);
        setSavingLimit(false);
        return;
      }
      setOnlineLimit(val);
      fetchData();
    } catch {
      alert('Could not reach the server. Check your connection.');
    }
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
    const confirmed = window.confirm(
      'This export contains personal data. Please store and share responsibly.'
    );
    if (!confirmed) return;
    if (tab === 'balldrop') exportBallDrop();
    else if (tab === 'bedpush') exportBedPush();
    else if (tab === 'craftfair') exportCraftFair();
    else if (tab === 'passes') exportPasses();
    else exportSponsorship();
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F8', fontFamily: "'Outfit', system-ui, sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(22,50,60,0.10)', width: '100%', maxWidth: '360px', padding: '40px 36px 36px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>

          {/* Lighthouse mark */}
          <img src="/lighthouse-mark.svg" alt="" aria-hidden="true" style={{ width: '56px', height: '56px', marginBottom: '20px' }} />

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: '#16323C', margin: '0 0 4px', textAlign: 'center' as const }}>Committee Admin</h1>
          <p style={{ fontFamily: "'Outfit', system-ui, sans-serif", fontSize: '13px', color: '#888', margin: '0 0 28px', textAlign: 'center' as const }}>Moville Summer Festival 2026</p>

          <form onSubmit={e => { e.preventDefault(); handleLogin(); }} style={{ width: '100%' }}>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="Committee"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
            />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid rgba(22,50,60,0.16)', borderRadius: '12px', fontFamily: "'Outfit', system-ui, sans-serif", fontSize: '15px', boxSizing: 'border-box' as const, marginBottom: '12px', outline: 'none' }}
            />
            {error && <p style={{ color: '#c0392b', fontFamily: "'Outfit', system-ui, sans-serif", fontSize: '13px', marginBottom: '12px', margin: '0 0 12px' }}>{error}</p>}
            <button type="submit" disabled={checkingLogin} style={{ ...btnStyle('primary'), width: '100%', padding: '13px', fontSize: '15px', fontWeight: 700, borderRadius: '999px', opacity: checkingLogin ? 0.7 : 1 }}>
              {checkingLogin ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Choice screen: scan or reports, financials stay hidden until chosen ──
  if (view === 'choice') {
    return (
      <div style={s.choiceWrap}>
        <div style={s.choiceHeader}>
          <div style={s.choiceHeaderLeft}>
            <p style={s.choiceHeaderTitle}>Moville Summer Festival 2026</p>
            <p style={s.choiceHeaderSub}>Committee Access</p>
          </div>
          <Link to="/" style={s.exitLink}>Exit to site →</Link>
        </div>

        <div style={s.choiceBody}>
          <div style={s.choiceTileGrid}>

            {/* Scan Passes tile */}
            <Link to="/scan" data-testid="tile-scan-passes" style={s.choiceTile}>
              <div style={s.choiceTileIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0894F" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <rect x="7" y="7" width="3" height="3" /><rect x="14" y="7" width="3" height="3" />
                  <rect x="7" y="14" width="3" height="3" /><rect x="14" y="14" width="3" height="3" />
                </svg>
              </div>
              <p style={s.choiceTileTitle}>Scan Passes</p>
              <p style={s.choiceTileDesc}>Check tickets at the gate, on the door, anywhere.</p>
              <p style={s.choiceTileLink}>Open scanner →</p>
            </Link>

            {/* Reports & Admin tile */}
            <button data-testid="tile-reports-admin" onClick={() => setView('dashboard')} style={s.choiceTile}>
              <div style={s.choiceTileIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0894F" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <p style={s.choiceTileTitle}>Reports &amp; Admin</p>
              <p style={s.choiceTileDesc}>Registrations, revenue and CSV exports.</p>
              <p style={s.choiceTileLink}>View dashboard →</p>
            </button>

          </div>
        </div>

        <div style={s.choiceFooter}>
          <span>Committee password accepted</span>
          <button
            onClick={() => { sessionStorage.removeItem('movilleAdminPassword'); setAuthed(false); setPassword(''); setView('choice'); }}
            style={s.choiceSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, system-ui, sans-serif', color: '#888' }}>
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
          <p style={s.headerTitle}>Moville Summer Festival 2026</p>
          <p style={s.headerSub}>Committee Admin</p>
        </div>
        <div style={s.headerActions}>
          <button onClick={() => setView('choice')} style={s.backLink}>← Back to menu</button>
        </div>
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
            { label: 'Total revenue', value: formatEuro(totalRevenue), sub: 'all events combined', green: true, accent: true },
          ].map(({ label, value, sub, green, accent }) => (
            <div key={label} style={{ ...s.metricCard, ...(accent ? { borderColor: '#1D9E75', borderWidth: '1.5px' } : {}) }}>
              <p style={s.metricLabel}>{label}</p>
              <p style={{ ...s.metricValue, color: green ? '#246B52' : '#16323C' }}>{value}</p>
              <p style={s.metricSub}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs + export */}
        <div style={s.sectionBar}>
          <div style={s.tabs}>
            {([['balldrop', 'Ball Drop'], ['bedpush', 'Bed Push'], ['craftfair', 'Craft Fair'], ['passes', 'Festival Passes'], ['sponsorship', 'Sponsorships']] as [Tab, string][]).map(([t, label]) => (
              <button key={t} data-testid={`tab-${t}`} onClick={() => { setTab(t); setSearch(''); }} style={tabStyle(tab === t)}>{label}</button>
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
            <div data-testid="inventory-bar" style={s.inventoryBar}>
              {[
                { label: 'Total balls', value: TOTAL_BALLS.toLocaleString() },
                { label: `Online (501–${500 + onlineLimit})`, value: onlineLimit },
                { label: `Paper (1–500)`, value: TOTAL_BALLS - onlineLimit },
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
                  data-testid="online-limit-input"
                  value={onlineLimitInput}
                  onChange={e => setOnlineLimitInput(e.target.value)}
                  style={s.invAdjustInput}
                  min={onlineBallsSold}
                  max={TOTAL_BALLS - PAPER_MAX}
                />
                <button
                  data-testid="save-online-limit"
                  onClick={handleSaveOnlineLimit}
                  disabled={savingLimit || parseInt(onlineLimitInput, 10) < onlineBallsSold}
                  style={{ ...btnStyle('primary'), padding: '6px 14px' }}
                >
                  {savingLimit ? 'Saving…' : 'Save'}
                </button>
                {parseInt(onlineLimitInput, 10) < onlineBallsSold && (
                  <span style={{ fontSize: '11px', color: '#c0392b', marginLeft: '4px' }}>
                    Cannot be lower than {onlineBallsSold} (online sold)
                  </span>
                )}
              </div>
            </div>
            {/* Ball number exports */}
            <div style={{ display: 'flex', gap: '10px', margin: '0 0 16px' }}>
              <button data-testid="export-csv" onClick={handleExportBallNumbersCSV} style={btnStyle('secondary')}>⬇ Export ball numbers CSV</button>
              <button data-testid="export-pdf" onClick={handleExportBallNumbersPDF} style={btnStyle('secondary')}>⬇ Export ball numbers PDF</button>
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
                        <td style={td({ maxWidth: 130 })}>{r.full_name}</td>
                        <td style={td({ color: '#555', maxWidth: 170 })}>{maskEmail(r.email)}</td>
                        <td style={td({ color: '#555', maxWidth: 100, whiteSpace: 'nowrap' })}>{maskPhone(r.phone)}</td>
                        <td style={td({ whiteSpace: 'nowrap' })}>{r.quantity}</td>
                        <td style={td({ color: '#1F4E5F', fontWeight: 'bold', maxWidth: 150 })}>{(r.ball_numbers || []).join(', ') || '—'}</td>
                        <td style={td({ whiteSpace: 'nowrap' })}>{formatEuro(r.amount_paid)}</td>
                        <td style={td({ whiteSpace: 'nowrap' })}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                        <td style={td({ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' })}>{formatDate(r.created_at)}</td>
                        <td style={td({ whiteSpace: 'nowrap' })}>
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
                      <td style={td({ fontWeight: 'bold', maxWidth: 120 })}>{r.team_name}</td>
                      <td style={td({ color: '#555', maxWidth: 120 })}>{r.organisation || '—'}</td>
                      <td style={td({ maxWidth: 110 })}>{r.captain_name}</td>
                      <td style={td({ color: '#555', maxWidth: 160 })}>{maskEmail(r.email)}</td>
                      <td style={td({ color: '#555', maxWidth: 100, whiteSpace: 'nowrap' })}>{maskPhone(r.phone)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>{formatEuro(r.amount_paid)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' })}>{formatDate(r.created_at)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>
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
                      <td style={td({ maxWidth: 120 })}>{r.full_name}</td>
                      <td style={td({ color: '#555', maxWidth: 110 })}>{r.business_name || '—'}</td>
                      <td style={td({ color: '#555', maxWidth: 160 })}>{maskEmail(r.email)}</td>
                      <td style={td({ color: '#555', maxWidth: 100, whiteSpace: 'nowrap' })}>{maskPhone(r.phone)}</td>
                      <td style={td({ color: '#555', maxWidth: '150px' })}>{r.products}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>{formatEuro(r.amount_paid)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' })}>{formatDate(r.created_at)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>
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
                      <td style={td({ fontWeight: 'bold', maxWidth: 120 })}>{r.business_name}</td>
                      <td style={td({ maxWidth: 100 })}>{r.contact_name}</td>
                      <td style={td({ color: '#555', maxWidth: 130 })}>{maskEmail(r.email)}</td>
                      <td style={td({ color: '#555', maxWidth: 100, whiteSpace: 'nowrap' })}>{maskPhone(r.phone)}</td>
                      <td style={td({ fontWeight: 'bold', color: '#1A7A3C', whiteSpace: 'nowrap' })}>{formatEuro(r.amount_paid)}</td>
                      <td style={td({ color: '#555', maxWidth: '130px' })}>{r.message || '—'}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>{r.social_media_consent ? '✓ Yes' : '—'}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' })}>{formatDate(r.created_at)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>
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
                      <td style={td({ maxWidth: 130 })}>{r.full_name}</td>
                      <td style={td({ maxWidth: 170 })}>{maskEmail(r.email)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>{PASS_TYPE_LABELS[r.pass_type] || r.pass_type}</td>
                      <td style={td({ fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace', whiteSpace: 'nowrap' })}>{r.pass_ref || '—'}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>{formatEuro(r.amount_paid)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={td({ color: '#888', whiteSpace: 'nowrap' })}>{formatDate(r.created_at)}</td>
                      <td style={td({ whiteSpace: 'nowrap' })}>
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
