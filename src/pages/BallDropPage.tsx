import { useState } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

const FEE_SINGLE = 5;
const FEE_BUNDLE = 20;
const ONLINE_BALLS = 700;

type Bundle = '1' | '5';
type Screen = 'form' | 'success' | 'soldout';

interface FormData {
  bundle: Bundle;
  fullName: string;
  email: string;
  phone: string;
  over18: boolean;
  noRefund: boolean;
}

const INITIAL: FormData = {
  bundle: '5',
  fullName: '',
  email: '',
  phone: '',
  over18: false,
  noRefund: false,
};

export default function BallDropPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [screen, setScreen] = useState<Screen>('form');
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const price = form.bundle === '5' ? FEE_BUNDLE : FEE_SINGLE;

  const valid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.over18 &&
    form.noRefund;

  const handleBuy = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    // TODO: POST to Netlify function → Stripe checkout
    await new Promise((r) => setTimeout(r, 1000));
    setScreen('success');
    setSubmitting(false);
  };

  if (screen === 'soldout') {
    return (
      <div className="form-page">
        <div className="form-page-bg" aria-hidden="true" />
        <div className="form-page-content page-shell--narrow">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon" style={{ fontSize: '2rem' }}>🏆</div>
              <h2 className="form-success-title">All {ONLINE_BALLS} online balls are sold!</h2>
              <p className="form-success-body">
                Online sales are now closed. The draw takes place at Shore Green on
                12 July at 5.30pm.
              </p>
              <div className="form-info-block">
                <p className="form-info-title">Already have a ball?</p>
                <p className="form-info-body">Check your email for your ball number
                  {ONLINE_BALLS > 1 ? 's' : ''}. You don't need to be present to win.</p>
              </div>
              <div className="form-info-block">
                <p className="form-info-title">Missed out?</p>
                <p className="form-info-body">A small number of balls may still be available
                  on the day from committee members at the festival.</p>
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
              <h2 className="form-success-title">You're in!</h2>
              <p className="form-success-body">
                Payment confirmed. Good luck on 12 July — you don't need to be there to win.
              </p>

              <div className="form-summary">
                <div className="form-summary-row">
                  <span>Entry</span><strong>{form.bundle === '5' ? '5 balls' : '1 ball'}</strong>
                </div>
                <div className="form-summary-row">
                  <span>Amount paid</span><strong>€{price}.00</strong>
                </div>
                <div className="form-summary-row">
                  <span>Event</span><strong>Shore Green · 12 July</strong>
                </div>
                <div className="form-summary-row">
                  <span>Prizes</span><strong>€500 · €300 · €150</strong>
                </div>
              </div>

              <div className="form-info-block">
                <p className="form-info-title">Your ball numbers</p>
                <p className="form-info-body">Your ball number{form.bundle === '5' ? 's have' : ' has'} been
                  emailed to {form.email}. Keep it safe — the committee will
                  contact winners directly after the draw.</p>
              </div>

              <div className="form-info-block">
                <p className="form-info-title">Winner contacted directly</p>
                <p className="form-info-body">If your ball number is a winner, the festival
                  committee will contact you directly. You don't need to be present at
                  Shore Green to claim your prize.</p>
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
              <p className="form-eyebrow">Moville Summer Festival · 12 July 2026</p>
              <h1 className="form-title">The Great Ball Drop</h1>
            </div>
          </div>
        </header>

        <div className="form-card">

          {/* Prize banner */}
          <div className="ball-prize-banner">
            <div className="ball-prize-icon">🏆</div>
            <div className="ball-prize-text">
              <div className="ball-prize-headline">Win up to €500 cash</div>
              <div className="ball-prize-sub">Cash prize · drawn at Shore Green · 12 July</div>
            </div>
          </div>

          {/* Intro */}
          <p className="ball-intro">
            Wherever you are in the world, support Moville Summer Festival.
            Every ball helps fund the events that bring the town together each summer.
          </p>

          {/* How it works */}
          <div className="ball-how-it-works">
            <p className="ball-how-title">How it works</p>
            <ul className="ball-how-list">
              <li>Numbered balls are rolled down the hill at Shore Green</li>
              <li>The first three balls to cross the finish line win prizes</li>
              <li>1st across wins €500 · 2nd wins €300 · 3rd wins €150</li>
              <li>You don't need to be present to win</li>
              <li>Winners are contacted directly by the festival committee</li>
            </ul>
          </div>

          {/* Bundle selection */}
          <div className="form-section">
            <p className="form-section-title">Choose your entry</p>
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
                <div className="ball-badge">⭐ Best Value</div>
                <div className="ball-option-count">5 Balls — €20</div>
                <div className="ball-option-desc">5 chances to win · save €5</div>
                <div className="ball-option-per">€4 each</div>
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
                <div className="ball-option-desc">1 chance to win</div>
                <div className="ball-option-price">€5</div>
              </button>

            </div>
          </div>

          {/* Details */}
          <div className="form-section">
            <p className="form-section-title">Your details</p>

            <div className="form-field">
              <label className="form-label">Name <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="Your full name"
                value={form.fullName}
                onChange={set('fullName')}
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
              <p className="form-hint">
                Your ball number{form.bundle === '5' ? 's' : ''} will be emailed to you
                immediately after payment.
              </p>
            </div>

            <div className="form-field">
              <label className="form-label">Mobile number (optional)</label>
              <input
                className="form-input"
                type="tel"
                placeholder="Include country code if outside Ireland — e.g. +44, +1, +61"
                value={form.phone}
                onChange={set('phone')}
              />
              <p className="form-hint">
                Add your mobile and we'll text your number{form.bundle === '5' ? 's' : ''} to you too.
              </p>
            </div>
          </div>

          {/* Declarations */}
          <div className="form-section">
            <label className="form-check">
              <input type="checkbox" checked={form.over18} onChange={set('over18')} />
              <span className="form-check-label">
                I confirm I am over 18 years old.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.noRefund} onChange={set('noRefund')} />
              <span className="form-check-label">
                I understand this purchase is non-refundable, unless the event is cancelled
                by the organisers, and that the committee's decision is final.
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
              onClick={handleBuy}
              disabled={!valid || submitting}
            >
              {submitting ? 'Processing…' : `Pay €${price} Securely`}
            </button>
            <p className="form-submit-note">
              Your ball number{form.bundle === '5' ? 's' : ''} will be emailed and texted
              immediately after payment.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
