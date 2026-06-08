import { useState, useEffect } from 'react';
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

interface AdminData {
  ballDrop: BallDropReg[];
  bedPush: BedPushReg[];
  craftFair: CraftFairReg[];
  ballsRemaining: number;
}

type Tab = 'balldrop' | 'bedpush' | 'craftfair';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('balldrop');

  const handleLogin = () => {
    if (password.trim() === '') {
      setError('Please enter a password');
      return;
    }
    setAuthed(true);
    setError('');
  };

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch('/.netlify/functions/get-admin-data', {
      headers: { 'x-admin-password': password },
    })
      .then(res => {
        if (res.status === 401) {
          setAuthed(false);
          setError('Incorrect password');
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then(d => { if (d) { setData(d); setLoading(false); } })
      .catch(() => setLoading(false));
  }, [authed]);

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const formatEuro = (cents: number) => `€${(cents / 100).toFixed(2)}`;

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '320px' }}>
          <h1 style={{ fontFamily: 'Arial', fontSize: '20px', color: '#1F4E5F', marginBottom: '8px' }}>Admin Access</h1>
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
          <button
            onClick={handleLogin}
            style={{ width: '100%', padding: '12px', background: '#1F4E5F', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'Arial', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

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
  const totalRevenue = [...ballPaid, ...bedPaid, ...craftPaid].reduce((s, r) => s + r.amount_paid, 0);

  return (
    <div style={{ fontFamily: 'Arial', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#1F4E5F', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Moville Summer Festival 2026</h1>
          <p style={{ color: '#a8c8d4', margin: '2px 0 0', fontSize: '13px' }}>Registration Admin</p>
        </div>
        <Link to="/" style={{ color: '#a8c8d4', fontSize: '13px' }}>← Back to site</Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Ball Drop', value: `${ballPaid.length} balls sold`, sub: `${data.ballsRemaining} of 700 remaining`, color: '#1F4E5F' },
            { label: 'Bed Push', value: `${bedPaid.length} teams`, sub: `${20 - bedPaid.length} of 20 remaining`, color: '#1F4E5F' },
            { label: 'Craft Fair', value: `${craftPaid.length} stalls`, sub: `${15 - craftPaid.length} of 15 remaining`, color: '#1F4E5F' },
            { label: 'Total Revenue', value: formatEuro(totalRevenue), sub: 'all events combined', color: '#1A7A3C' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: 'bold', color }}>{value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {([['balldrop', '🎱 Ball Drop'], ['bedpush', '🛏️ Bed Push'], ['craftfair', '🎨 Craft Fair']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'Arial', fontSize: '14px', fontWeight: tab === t ? 'bold' : 'normal', background: tab === t ? '#1F4E5F' : '#fff', color: tab === t ? '#fff' : '#333', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ball Drop table */}
        {tab === 'balldrop' && (
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F4E5F' }}>
                  {['Name', 'Email', 'Phone', 'Balls', 'Ball Numbers', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.ballDrop.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>No registrations yet</td></tr>
                )}
                {data.ballDrop.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 12px', fontSize: '14px' }}>{r.full_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.phone || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>{r.quantity}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#1F4E5F', fontWeight: 'bold' }}>{(r.ball_numbers || []).join(', ') || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>{formatEuro(r.amount_paid)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px', background: r.status === 'paid' ? '#D4EDDA' : '#FFF3CD', color: r.status === 'paid' ? '#1A7A3C' : '#7D5A00' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888' }}>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bed Push table */}
        {tab === 'bedpush' && (
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F4E5F' }}>
                  {['Team', 'Organisation', 'Captain', 'Email', 'Phone', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.bedPush.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>No registrations yet</td></tr>
                )}
                {data.bedPush.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 'bold' }}>{r.team_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.organisation || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>{r.captain_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.phone}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>{formatEuro(r.amount_paid)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px', background: r.status === 'paid' ? '#D4EDDA' : '#FFF3CD', color: r.status === 'paid' ? '#1A7A3C' : '#7D5A00' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888' }}>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Craft Fair table */}
        {tab === 'craftfair' && (
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F4E5F' }}>
                  {['Name', 'Business', 'Email', 'Phone', 'Products', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.craftFair.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>No registrations yet</td></tr>
                )}
                {data.craftFair.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 12px', fontSize: '14px' }}>{r.full_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.business_name || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555' }}>{r.phone}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#555', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.products}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px' }}>{formatEuro(r.amount_paid)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '99px', background: r.status === 'paid' ? '#D4EDDA' : '#FFF3CD', color: r.status === 'paid' ? '#1A7A3C' : '#7D5A00' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888' }}>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
