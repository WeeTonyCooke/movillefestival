import { useState } from 'react';
import { Link } from 'react-router-dom';

// Pass IDs match the backend PASS_CONFIG keys in create-pass-checkout.js exactly:
// festival_pass | friday | saturday | sunday
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
    subCol: '#B8860B',
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
    subCol: '#6BAFA7',
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
    subCol: '#F26A4B',
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
    subCol: '#6B3FA0',
    stubFoot: 'Sunday Pass',
    btnLabel: 'Buy Sunday Pass →',
  },
];

type Pass = (typeof PASSES)[number];

// Inject responsive CSS once
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
  .ticket-lighthouse img {
    width: 115px;
    height: auto;
    display: block;
  }
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
  .ticket-price {
    font-size: 58px;
    font-weight: 900;
    color: #fff;
    line-height: 1;
    letter-spacing: -2px;
  }
  .checkout-name-row {
    display: flex;
    gap: 16px;
    margin-bottom: 14px;
  }

  @media (max-width: 500px) {
    .ticket-card {
      flex-direction: column;
      min-height: unset;
    }
    .ticket-lighthouse {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid rgba(27,42,74,0.10);
      padding: 16px;
    }
    .ticket-lighthouse img {
      width: 80px;
    }
    .ticket-stub {
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
    }
    .ticket-stub-notch {
      display: none;
    }
    .ticket-price {
      font-size: 40px;
    }
    .checkout-name-row {
      flex-direction: column;
    }
  }
`;

function Ticket({
  pass,
  selected,
  onSelect,
}: {
  pass: Pass;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className="ticket-card"
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      tabIndex={0}
      role="radio"
      aria-checked={selected}
      style={{
        boxShadow: selected
          ? `0 0 0 3px ${pass.accent}, 0 16px 48px rgba(0,0,0,0.22)`
          : '0 6px 28px rgba(0,0,0,0.14)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Lighthouse panel */}
      <div className="ticket-lighthouse">
        <img
          src="/moville_lighthouse_passes.png"
          alt="Moville Festival"
        />
      </div>

      {/* Ticket body */}
      <div className="ticket-body">
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#1B2A4A',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
            }}
          >
            {pass.line1}
            <br />
            {pass.line2}
          </div>
          <div style={{ borderTop: '1px solid rgba(27,42,74,0.12)', margin: '9px 0 7px' }} />
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: pass.subCol,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              lineHeight: 1.9,
            }}
          >
            {pass.sub.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1px solid rgba(27,42,74,0.12)', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 28 }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A9ABB' }}>
                Date
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B2A4A', marginTop: 2 }}>
                {pass.date}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A9ABB' }}>
                Ticket
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B2A4A', marginTop: 2 }}>
                {pass.type}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coloured price stub */}
      <div
        className="ticket-stub"
        style={{ background: pass.accent }}
      >
        <div className="ticket-stub-notch" />
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)' }}>
          Admit One
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}>
            Price
          </div>
          <div className="ticket-price">
            €{pass.price}
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', marginBottom: 6 }} />
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
            {pass.stubFoot}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ pass }: { pass: Pass }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid rgba(27,42,74,0.18)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    fontWeight: 500,
    color: '#1B2A4A',
    fontFamily: 'Inter, Arial, sans-serif',
    outline: 'none',
    background: '#F8F9FC',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#8A9ABB',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <div
      style={{
        maxWidth: 680,
        background: '#fff',
        borderRadius: 16,
        padding: 28,
        marginTop: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#8A9ABB', marginBottom: 16 }}>
        Your details
      </div>

      <form onSubmit={handleSubmit}>
        <div className="checkout-name-row">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>First name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Séamus"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="O'Brien"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seamus@example.com"
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 13,
            color: '#b91c1c',
          }}>
            {error}
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(27,42,74,0.10)', margin: '18px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1B2A4A' }}>
              {pass.line1} {pass.line2}
            </div>
            <div style={{ fontSize: 11, color: '#8A9ABB', marginTop: 2 }}>{pass.date}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1B2A4A', letterSpacing: '-0.5px' }}>
            €{pass.price}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 20,
            background: loading ? '#aaa' : pass.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: 14,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, Arial, sans-serif',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Redirecting to payment…' : pass.btnLabel}
        </button>
      </form>
    </div>
  );
}

export default function PassesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedPass = PASSES.find(p => p.id === selected) ?? null;

  return (
    <>
      <style>{responsiveStyles}</style>
      <div
        style={{
          background: '#EAECF0',
          minHeight: '100vh',
          padding: '40px 20px 60px',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#1B2A4A',
              textDecoration: 'none',
              opacity: 0.6,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to festival site
          </Link>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
          Moville Summer Festival 2026
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1B2A4A', letterSpacing: '-0.5px', marginBottom: 5 }}>
          Choose your pass
        </h1>
        <p style={{ fontSize: 13, color: '#8A9ABB', marginBottom: 28 }}>
          Select the ticket that's right for you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {PASSES.map(pass => (
            <Ticket
              key={pass.id}
              pass={pass}
              selected={selected === pass.id}
              onSelect={() => setSelected(pass.id)}
            />
          ))}
        </div>

        {selectedPass && (
          <div style={{ marginTop: 32 }}>
            <CheckoutForm pass={selectedPass} />
          </div>
        )}
      </div>
    </>
  );
}
