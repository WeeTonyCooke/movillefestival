import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

const FEE = 50;
const TEAM_SIZE = 5;
const MAX_TEAMS = 20;

interface FormData {
  teamName: string;
  organisation: string;
  captainName: string;
  email: string;
  phone: string;
  over16: boolean;
  agreeRules: boolean;
  noRefund: boolean;
}

const INITIAL: FormData = {
  teamName: '',
  organisation: '',
  captainName: '',
  email: '',
  phone: '',
  over16: false,
  agreeRules: false,
  noRefund: false,
};

type Screen = 'form' | 'success' | 'full';

export default function BedPushPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [screen, setScreen] = useState<Screen>('form');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');
    if (status === 'success' && sessionId) {
      setScreen('success');
      fetch(`/.netlify/functions/get-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.customerName) {
            setForm((prev) => ({ ...prev, captainName: data.customerName }));
          }
        })
        .catch((err) => console.error('Session fetch error:', err));
    } else if (status === 'success') {
      setScreen('success');
    }
  }, []);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const valid =
    form.teamName.trim() &&
    form.captainName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.over16 &&
    form.agreeRules &&
    form.noRefund;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/.netlify/functions/create-bed-push-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: form.teamName,
          organisation: form.organisation,
          captainName: form.captainName,
          email: form.email,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setScreen('full');
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again or contact movillefestival@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === 'full') {
    return (
      <div className="form-page">
        <div className="form-page-bg" aria-hidden="true" />
        <div className="form-page-content page-shell--narrow">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon" style={{ fontSize: '2rem' }}>🛏️</div>
              <h2 className="form-success-title">All 20 teams are entered!</h2>
              <p className="form-success-body">
                Registration for the Great Bed Push Race is now closed. Come along to Quay Street
                on Wednesday 8 July to cheer on the teams.
              </p>
              <div className="form-counter-wrap">
                <div className="form-counter-number">{MAX_TEAMS} / {MAX_TEAMS}</div>
                <div className="form-counter-label">teams registered</div>
                <div className="form-progress">
                  <div className="form-progress-bar" style={{ width: '100%' }} />
                  <span className="form-progress-label">Full</span>
                </div>
              </div>
              <div className="form-info-block">
                <p className="form-info-title">Want to watch?</p>
                <p className="form-info-body">Come along to Quay Street on Wednesday 8 July
                  from 6.30pm. Spectators are very welcome.</p>
              </div>
              <div className="form-info-block">
                <p className="form-info-title">Next year?</p>
                <p className="form-info-body">Follow us on social media to hear when
                  registration opens for 2027.</p>
              </div>
              <Link to="/programme" className="form-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
                View the full festival programme
              </Link>
              <p className="form-submit-note">Questions? Contact movillefestival@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'success') {
    return (
      <div className="form-page">
        <div className="form-page-bg" aria-hidden="true" />
        <div className="form-page-content page-shell--narrow">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="form-success-title">You're registered!</h2>
              <p className="form-success-body">
                Payment confirmed. Your spot in the Great Bed Push Race is secured.
                See you on Quay Street.
              </p>

              <div className="form-confirm-card">
                <p className="form-confirm-name">{form.teamName}</p>
                <p className="form-confirm-sub">
                  {form.organisation ? `${form.organisation} · ` : ''}{TEAM_SIZE} members
                </p>
              </div>

              <div className="form-summary">
                <div className="form-summary-row">
                  <span>Captain</span><strong>{form.captainName}</strong>
                </div>
                <div className="form-summary-row">
                  <span>Amount paid</span><strong>€{FEE}.00</strong>
                </div>
                <div className="form-summary-row">
                  <span>Date</span><strong>Wednesday 8 July</strong>
                </div>
                <div className="form-summary-row">
                  <span>Start time</span><strong>6pm for 6.30pm</strong>
                </div>
                <div className="form-summary-row">
                  <span>Venue</span><strong>Festival Square &amp; Quay Street</strong>
                </div>
              </div>

              <div className="form-info-block">
                <p className="form-info-title">🔴 Scrutineering at 6pm sharp — Festival Square</p>
                <p className="form-info-body">All beds must pass inspection by Paddy and Paddy
                  before the race. No helmet = no race. Don't be late.</p>
              </div>

              <Link to="/" className="form-success-back">Back to festival site</Link>
              <p className="form-submit-note">Questions? Contact movillefestival@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page-bg" aria-hidden="true" />
      <div className="form-page-content page-shell--narrow">
        <header className="form-header">
          <div className="form-header-top">
            <Link to="/" className="form-back" aria-label="Back to home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div className="form-header-meta">
              <p className="form-eyebrow">Moville Summer Festival · 8 July 2026</p>
              <h1 className="form-title">The Great Bed Push Race</h1>
              <p className="form-subtitle">
                Speed, style, and absolute silliness. Register your team —
                Wednesday 8 July, 6pm for 6.30pm.
              </p>
              <div className="form-chips">
                <span className="form-chip">Teams of {TEAM_SIZE}</span>
                <span className="form-chip">€{FEE} entry</span>
                <span className="form-chip">Over 16s only</span>
              </div>
            </div>
          </div>
        </header>

        <div className="form-card">
          {/* Notice */}
          <div className="form-notice">
            <strong>One form per team</strong> — the team captain registers on behalf of the
            whole team. Entry fee is €{FEE} per team, paid online to secure your spot.
          </div>

          {/* Team details */}
          <div className="form-section">
            <p className="form-section-title">Team details</p>

            <div className="form-field">
              <label className="form-label">
                Team name <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. The Flying Duvets"
                value={form.teamName}
                onChange={set('teamName')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Organisation / club / business (if applicable)</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Moville GAA, local business name"
                value={form.organisation}
                onChange={set('organisation')}
              />
            </div>

            <div className="form-team-size-notice">
              <span className="form-team-size-icon">🛏️</span>
              <div>
                <strong>{TEAM_SIZE} members per team</strong>
                <p>4 pushers + 1 rider. All must be over 16.</p>
              </div>
            </div>
          </div>

          {/* Captain details */}
          <div className="form-section">
            <p className="form-section-title">Captain's details</p>
            <p className="form-section-hint">The captain must be over 18 and is responsible for the registration.</p>

            <div className="form-field">
              <label className="form-label">Full name <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="Team captain's full name"
                value={form.captainName}
                onChange={set('captainName')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Email <span className="required">*</span></label>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Phone number <span className="required">*</span></label>
              <input
                className="form-input"
                type="tel"
                placeholder="For event day contact"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>
          </div>

          {/* Scrutineering notice */}
          <div className="form-scrutineering">
            <span className="form-scrutineering-dot" />
            <div>
              <strong>Scrutineering at 6pm — Festival Square</strong>
              <p>All beds must pass a safety inspection by Paddy and Paddy before the race.
                No helmet = no race.</p>
            </div>
          </div>

          {/* Declarations */}
          <div className="form-section">
            <label className="form-check">
              <input type="checkbox" checked={form.over16} onChange={set('over16')} />
              <span className="form-check-label">
                I confirm all team members are over 16 years old, and the team captain is over 18.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.agreeRules} onChange={set('agreeRules')} />
              <span className="form-check-label">
                I confirm our team has read and agrees to the race rules.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.noRefund} onChange={set('noRefund')} />
              <span className="form-check-label">
                I understand the €{FEE} entry fee is non-refundable, unless the event is
                cancelled by the organisers.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="form-submit-wrap">
            <p className="form-consent">
              By submitting this form you agree that Moville Summer Festival may contact you
              regarding your registration.
            </p>
            <button
              className="form-submit"
              onClick={handleSubmit}
              disabled={!valid || submitting}
            >
              {submitting ? 'Processing…' : `Pay €${FEE} and register`}
            </button>
            <p className="form-submit-note">
              Confirmation will be sent to your email immediately after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
