import { useState } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

const TOTAL_BALLS = 700; // balls 500–1200 available online
const SOLD_PLACEHOLDER = 147;

type Bundle = '1' | '5';

interface FormData {
  bundle: Bundle;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isGift: boolean;
  giftName: string;
  giftEmail: string;
  location: string;
  over18: boolean;
  noRefund: boolean;
  marketingOptIn: boolean;
}

const INITIAL: FormData = {
  bundle: '5',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  isGift: false,
  giftName: '',
  giftEmail: '',
  location: '',
  over18: false,
  noRefund: false,
  marketingOptIn: false,
};

export default function BallDropPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const remaining = TOTAL_BALLS - SOLD_PLACEHOLDER;
  const raised = SOLD_PLACEHOLDER * 5;

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const price = form.bundle === '5' ? 20 : 5;

  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.over18 &&
    form.noRefund;

  const handleBuy = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

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
              <p className="form-eyebrow">Moville Summer Festival · Sunday 12th July 2026</p>
              <h1 className="form-title">Great Ball Drop</h1>
              <p className="form-subtitle">Shore Green · 5.30pm · Wherever you are in the world</p>
            </div>
          </div>
        </header>

        <div className="form-card">
          {submitted ? (
            <div className="form-success">
              <div className="form-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="form-success-title">You're in, {form.firstName}! 🎱</h2>
              <p className="form-success-body">
                Your lucky ball number{form.bundle === '5' ? 's have' : ' has'} been emailed to{' '}
                {form.email}. You don't need to be present on the day to win. Good luck on 12th July!
              </p>
              <Link to="/" className="form-success-back">Back to festival site</Link>
            </div>
          ) : (
            <>
              {/* Prize info */}
              <div className="form-section">
                <p className="form-section-title">The prize</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', margin: '0 0 4px' }}>🏆 Cash prize — to be confirmed</p>
                <p className="form-hint">Prize details will be announced shortly. Watch the festival social media pages for updates.</p>
              </div>

              {/* How it works */}
              <div className="form-section">
                <p className="form-section-title">How it works</p>
                <p className="form-hint" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                  Numbered balls are dropped onto a target at Shore Green. The ball closest to the
                  marker wins. You do not need to be present on the day to win — winners will be
                  verified by the festival committee and notified by phone or email.
                </p>
              </div>

              {/* Pricing */}
              <div className="form-section">
                <p className="form-section-title">Pricing</p>
                <p style={{ margin: '0 0 4px' }}><strong>1 Ball — €5</strong></p>
                <p style={{ margin: '0 0 4px' }}><strong>5 Balls — €20</strong> <span style={{ color: 'var(--coral)', fontWeight: 600 }}>Best value · save €5</span></p>
              </div>

              {/* Live counter */}
              <div className="ball-counter-banner" role="status" aria-live="polite">
                <div className="ball-counter-item">
                  <div className="ball-counter-value">{SOLD_PLACEHOLDER}</div>
                  <div className="ball-counter-label">Sold</div>
                </div>
                <div className="ball-counter-item">
                  <div className="ball-counter-value">{remaining}</div>
                  <div className="ball-counter-label">Remaining</div>
                </div>
                <div className="ball-counter-item">
                  <div className="ball-counter-value">€{raised.toLocaleString()}</div>
                  <div className="ball-counter-label">Raised</div>
                </div>
              </div>

              {/* Bundle selection */}
              <div className="form-section">
                <p className="form-section-title">Choose your balls</p>
                <div className="ball-options">
                  <button
                    type="button"
                    className={`ball-option featured${form.bundle === '5' ? ' selected' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, bundle: '5' }))}
                    aria-pressed={form.bundle === '5'}
                  >
                    <div className="ball-selected-indicator" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <div className="ball-badge">⭐ Best value</div>
                    <div className="ball-option-count">5 Balls</div>
                    <div className="ball-option-desc">Most popular</div>
                    <div className="ball-option-price">€20</div>
                    <div className="ball-option-per">€4 per ball</div>
                    <div className="ball-option-saving">You save €5 vs buying individually</div>
                  </button>

                  <button
                    type="button"
                    className={`ball-option${form.bundle === '1' ? ' selected' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, bundle: '1' }))}
                    aria-pressed={form.bundle === '1'}
                  >
                    <div className="ball-selected-indicator" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <div className="ball-option-count">1 Ball</div>
                    <div className="ball-option-desc">Single entry</div>
                    <div className="ball-option-price">€5</div>
                    <div className="ball-option-per">€5 per ball</div>
                  </button>
                </div>
              </div>

              {/* Your details */}
              <div className="form-section">
                <p className="form-section-title">Your details</p>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">First name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Máire"
                      value={form.firstName} onChange={set('firstName')} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Last name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Ní Bhriain"
                      value={form.lastName} onChange={set('lastName')} />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Email address <span className="required">*</span></label>
                  <input className="form-input" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')} />
                  <p className="form-hint">Your ball number{form.bundle === '5' ? 's' : ''} will be emailed to you immediately after payment.</p>
                </div>

                <div className="form-field">
                  <label className="form-label">Phone number</label>
                  <input className="form-input" type="tel" placeholder="+353 83 …"
                    value={form.phone} onChange={set('phone')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Where are you joining from? (optional)</label>
                  <select className="form-select" value={form.location} onChange={set('location')}>
                    <option value="">Select…</option>
                    <option value="moville">Moville</option>
                    <option value="donegal">Donegal</option>
                    <option value="ireland">Elsewhere in Ireland</option>
                    <option value="uk">UK</option>
                    <option value="usa">USA / Canada</option>
                    <option value="aus">Australia / New Zealand</option>
                    <option value="other">Other overseas</option>
                  </select>
                </div>
              </div>

              {/* Gift option */}
              <div className="form-section">
                <p className="form-section-title">Gifting</p>
                <label className="form-check">
                  <input type="checkbox" checked={form.isGift} onChange={set('isGift')} />
                  <span className="form-check-label">These balls are a gift for someone else.</span>
                </label>

                {form.isGift && (
                  <>
                    <div className="form-field" style={{ marginTop: '12px' }}>
                      <label className="form-label">Recipient name</label>
                      <input className="form-input" type="text" placeholder="Their name"
                        value={form.giftName} onChange={set('giftName')} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Recipient email</label>
                      <input className="form-input" type="email" placeholder="Their email address"
                        value={form.giftEmail} onChange={set('giftEmail')} />
                    </div>
                  </>
                )}
              </div>

              {/* Confirmations */}
              <div className="form-section">
                <p className="form-section-title">Before you pay</p>

                <label className="form-check">
                  <input type="checkbox" checked={form.over18} onChange={set('over18')} />
                  <span className="form-check-label">
                    I confirm that I am 18 years of age or older. Under Irish law, ticket purchasers
                    must be 18 or older.
                  </span>
                </label>

                <label className="form-check">
                  <input type="checkbox" checked={form.noRefund} onChange={set('noRefund')} />
                  <span className="form-check-label">
                    I understand that ball purchases are non-refundable, ball numbers are automatically
                    assigned, and I do not need to be present at Shore Green on 12th July to win.
                    Winners will be verified by the festival committee.
                  </span>
                </label>

                <label className="form-check">
                  <input type="checkbox" checked={form.marketingOptIn} onChange={set('marketingOptIn')} />
                  <span className="form-check-label">
                    I would like to receive updates about Moville Summer Festival events.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="form-submit-wrap">
                <button
                  className="form-submit"
                  onClick={handleBuy}
                  disabled={!valid || submitting}
                >
                  {submitting ? 'Processing…' : `Pay €${price} securely →`}
                </button>
                <p className="form-submit-note">
                  Secure card payment via Stripe · Ball drop: Sunday 12th July at Shore Green
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
