import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNightMode } from '../hooks/useNightMode';

const PASSES = [
  {
    id: 'festival_pass',
    line1: 'Moville',
    line2: 'Festival Pass',
    sub: ["All Folk'd Up", 'Marty Healy Band & Bagatelle', 'The Two Bucks & Björn Identity'],
    date: '8–12 July 2026',
    type: 'Full Week',
    price: 20,
    accent: '#B8860B',
    stubFoot: 'Full Week',
    btnLabel: 'Buy Festival Pass →',
  },
  {
    id: 'friday',
    line1: 'Friday',
    line2: 'Day Pass',
    sub: ["All Folk'd Up", 'Friday 10 July'],
    date: '10 July 2026',
    type: 'Day Pass',
    price: 10,
    accent: '#6BAFA7',
    stubFoot: 'Friday Pass',
    btnLabel: 'Buy Friday Pass →',
  },
  {
    id: 'saturday',
    line1: 'Saturday',
    line2: 'Day Pass',
    sub: ['Marty Healy Band & Bagatelle', 'Saturday 11 July'],
    date: '11 July 2026',
    type: 'Day Pass',
    price: 10,
    accent: '#F26A4B',
    stubFoot: 'Saturday Pass',
    btnLabel: 'Buy Saturday Pass →',
  },
  {
    id: 'sunday',
    line1: 'Sunday',
    line2: 'Day Pass',
    sub: ['The Two Bucks & Björn Identity', 'Sunday 12 July'],
    date: '12 July 2026',
    type: 'Day Pass',
    price: 10,
    accent: '#6B3FA0',
    stubFoot: 'Sunday Pass',
    btnLabel: 'Buy Sunday Pass →',
  },
];

type Pass = (typeof PASSES)[number];
type Step = 'select' | 'checkout';

const responsiveStyles = `
  .ticket-card {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 680px;
    min-height: 220px;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .ticket-card-static {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 680px;
    min-height: 180px;
    border-radius: 16px;
    overflow: hidden;
  }
  .ticket-lighthouse {
    width: 150px;
    flex-shrink: 0;
    background: #F0F4FB;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 12px;
    border-right: 1px solid rgba(27,42,74,0.10);
  }
  .ticket-lighthouse img { width: 115px; height: auto; display: block; }
  .ticket-lighthouse-sm img { width: 80px; }
  .ticket-body {
    flex: 1;
    min-width: 0;
    background: #F0F4FB;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18px 22px;
  }
  .ticket-stub {
    width: 175px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 18px 16px;
    position: relative;
  }
  .ticket-stub-notch {
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    background: #EAECF0;
    border-radius: 50%;
  }
  .ticket-price { font-size: 58px; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -2px; }
  .checkout-name-row { display: flex; gap: 16px; margin-bottom: 14px; }

  @media (max-width: 500px) {
    .ticket-card, .ticket-card-static { flex-direction: column; min-height: unset; }
    .ticket-lighthouse { width: 100%; border-right: none; border-bottom: 1px solid rgba(27,42,74,0.10); padding: 16px; }
    .ticket-lighthouse img { width: 80px; }
    .ticket-stub { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; padding: 14px 20px; }
    .ticket-stub-notch { display: none; }
    .ticket-price { font-size: 40px; }
    .checkout-name-row { flex-direction: column; }
  }
`;

function Ticket({ pass, onSelect }: { pass: Pass; onSelect: () => void }) {
  return (
    <div
      className="ticket-card"
      data-testid={`pass-card-${pass.id}`}
      onClick={onSelect}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      tabIndex={0}
      role="button"
      aria-label={`Select ${pass.line1} ${pass.line2} — €${pass.price}`}
      style={{
        boxShadow: pass.id === 'festival_pass'
          ? '0 8px 32px rgba(184,134,11,0.22), 0 2px 8px rgba(0,0,0,0.10)'
          : '0 6px 28px rgba(0,0,0,0.14)',
        outline: pass.id === 'festival_pass' ? '2px solid #B8860B' : 'none',
      }}
    >
      <div className="ticket-lighthouse">
        <img src="/moville_lighthouse_passes.png" alt="Moville Festival" />
      </div>
      <div className="ticket-body">
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#16323C', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            {pass.line1}<br />{pass.line2}
          </div>
          <div style={{ borderTop: '1px solid rgba(27,42,74,0.12)', margin: '9px 0 7px' }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: pass.accent, letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1.9 }}>
            {pass.sub.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
        <div>
          <div style={{ borderTop: '1px solid rgba(27,42,74,0.12)', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 28 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(22,50,60,0.5)' }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16323C', marginTop: 2 }}>{pass.date}</div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(22,50,60,0.5)' }}>Ticket</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16323C', marginTop: 2 }}>{pass.type}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="ticket-stub" style={{ background: pass.accent }}>
        <div className="ticket-stub-notch" />
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)' }}>Admit One</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>Price</div>
          <div className="ticket-price">€{pass.price}</div>
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', marginBottom: 6 }} />
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>{pass.stubFoot}</div>
        </div>
      </div>
    </div>
  );
}

// Compact non-interactive version shown on step 2
function TicketSummary({ pass, onChangePass }: { pass: Pass; onChangePass?: () => void }) {
  return (
    <div className="ticket-card-static" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div className="ticket-lighthouse ticket-lighthouse-sm">
        <img src="/moville_lighthouse_passes.png" alt="Moville Festival" />
      </div>
      <div className="ticket-body" style={{ padding: '14px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#16323C', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          {pass.line1} {pass.line2}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: pass.accent, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {pass.date}
          </div>
          {onChangePass && (
            <button
              onClick={onChangePass}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 11, fontWeight: 600, color: 'rgba(22,50,60,0.5)', textDecoration: 'underline', fontFamily: "'Outfit', system-ui, sans-serif" }}
            >
              Change pass
            </button>
          )}
        </div>
      </div>
      <div className="ticket-stub" style={{ background: pass.accent, width: 120 }}>
        <div className="ticket-stub-notch" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>Price</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>€{pass.price}</div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ pass, onChangePass }: { pass: Pass; onChangePass: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/create-pass-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passType: pass.id,
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); setLoading(false); return; }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid rgba(27,42,74,0.18)', borderRadius: 8, padding: '10px 12px',
    fontSize: 14, fontWeight: 500, color: '#16323C', fontFamily: "'Outfit', system-ui, sans-serif",
    outline: 'none', background: '#FFFCF6', width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
    color: 'rgba(22,50,60,0.5)', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ width: '100%', maxWidth: 680 }}>

      {/* Selected pass summary */}
      <TicketSummary pass={pass} onChangePass={onChangePass} />

      {/* Age + name guidance */}
      <div style={{ background: '#FFFCF6', borderRadius: 10, padding: '12px 16px', margin: '16px 0', borderLeft: `3px solid ${pass.accent}` }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#16323C', fontFamily: "'Outfit', system-ui, sans-serif" }}>
          Passes are required for ages 16 and over — under 16s enter free.
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Outfit', system-ui, sans-serif" }}>
          Enter the name of the person attending. A parent or guardian may purchase on behalf of a 16+ attendee.
        </p>
      </div>

      {/* Form */}
      <div style={{ background: '#FFFCF6', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', marginTop: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(22,50,60,0.5)', marginBottom: 16 }}>
          Attendee details
        </div>

        <form onSubmit={handleSubmit}>
          <div className="checkout-name-row">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First name</label>
              <input
                data-testid="input-first-name"
                type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Séamus" required style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last name</label>
              <input
                data-testid="input-last-name"
                type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="O'Brien" required style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              data-testid="input-email"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seamus@example.com" required style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#b91c1c' }}>
              {error}
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(27,42,74,0.10)', margin: '18px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#16323C' }}>{pass.line1} {pass.line2}</div>
              <div style={{ fontSize: 11, color: 'rgba(22,50,60,0.5)', marginTop: 2 }}>{pass.date}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#16323C', letterSpacing: '-0.5px' }}>€{pass.price}</div>
          </div>

          <button
            data-testid="btn-buy"
            type="submit"
            disabled={loading}
            style={{
              display: 'block', width: '100%',
              background: loading ? '#aaa' : pass.accent,
              color: '#fff', border: 'none', borderRadius: 10, padding: 14,
              fontSize: 14, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', system-ui, sans-serif", transition: 'background 0.2s',
            }}
          >
            {loading ? 'Redirecting to payment…' : pass.btnLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PassesPage() {
  const [step,     setStep]     = useState<Step>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const isNight = useNightMode();

  // Night mode colour tokens
  const bg       = isNight ? '#0c1a22' : '#FAF8F4';
  const surface  = isNight ? 'rgba(18,36,48,0.76)' : '#FFFCF6';
  const textPri  = isNight ? '#f4efe5' : '#16323C';
  const textSec  = isNight ? 'rgba(244,239,229,0.64)' : 'rgba(22,50,60,0.52)';
  const border   = isNight ? 'rgba(255,255,255,0.10)' : 'rgba(22,50,60,0.12)';

  const selectedPass = PASSES.find(p => p.id === selected) ?? null;

  const handleSelect = (id: string) => {
    setSelected(id);
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangePass = () => {
    setStep('select');
    setSelected(null);
  };

  return (
    <>
      <style>{responsiveStyles}</style>
      <div style={{ background: bg, minHeight: '100vh', padding: '40px 20px 60px', fontFamily: "'Outfit', system-ui, sans-serif" }}>

        {/* Back to site */}
        <div style={{ maxWidth: 680, margin: '0 auto 28px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <Link
            to="/"
            aria-label="Back to home"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', border: `1px solid ${border}`, background: surface, color: textPri, textDecoration: 'none', flexShrink: 0, marginTop: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
          <div>
            <p style={{ margin: '0 0 4px', fontFamily: "'Outfit', sans-serif", fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#B0894F' }}>
              Moville Summer Festival 2026
            </p>
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 700, color: textPri, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Festival Passes
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {step === 'select' && (
            <>
              <div style={{ width: '100%', maxWidth: 680, marginBottom: 28 }}>
                <p style={{ fontSize: 13, color: textSec, marginBottom: 0 }}>
                  Passes required for ages 16 and over — under 16s enter free.
                </p>
              </div>

              <div style={{ width: '100%', maxWidth: 680, marginBottom: 8, background: '#FFFCF6', borderRadius: 12, padding: '12px 18px', borderLeft: '3px solid #B8860B' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#16323C', fontFamily: "'Outfit', system-ui, sans-serif" }}>
                  <strong>Attending more than one day?</strong> The Festival Pass (€20) covers all admission-required events across the full festival — better value than two or more day passes.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
                {PASSES.map(pass => (
                  <Ticket key={pass.id} pass={pass} onSelect={() => handleSelect(pass.id)} />
                ))}
              </div>
            </>
          )}

          {step === 'checkout' && selectedPass && (
            <CheckoutForm pass={selectedPass} onChangePass={handleChangePass} />
          )}

        </div>
      </div>
    </>
  );
}
