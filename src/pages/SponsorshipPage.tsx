import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

type Screen = 'form' | 'success' | 'cancelled';

const TIERS = [
  { label: '€100', cents: 10000, description: 'Community supporter' },
  { label: '€250', cents: 25000, description: 'Festival friend' },
  { label: '€500', cents: 50000, description: 'Festival patron' },
  { label: 'Other', cents: 0, description: 'Choose your own amount' },
];

interface FormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  selectedTier: number | null; // cents, 0 = custom
  customAmount: string;
  message: string;
  socialMediaConsent: boolean;
}

const INITIAL: FormData = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  selectedTier: 25000,
  customAmount: '',
  message: '',
  socialMediaConsent: false,
};

export default function SponsorshipPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [screen, setScreen] = useState<Screen>('form');
  const [submitting, setSubmitting] = useState(false);
  const [, setConfirmedBusiness] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') setScreen('success'); // eslint-disable-line react-hooks/set-state-in-effect
    if (status === 'cancelled') setScreen('cancelled');
  }, []);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const amountCents =
    form.selectedTier === 0
      ? Math.round(parseFloat(form.customAmount || '0') * 100)
      : form.selectedTier ?? 0;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid =
    form.businessName.trim() &&
    form.contactName.trim() &&
    emailRe.test(form.email) &&
    amountCents >= 1000;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/.netlify/functions/create-sponsorship-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          amountCents,
          message: form.message,
          socialMediaConsent: form.socialMediaConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Failed to create checkout');
      setConfirmedBusiness(form.businessName);
      window.location.href = data.url;
    } catch (err) {
      console.error('Sponsorship checkout error:', err);
      alert('Something went wrong. Please try again or contact movillefestival@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

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
              <h2 className="form-success-title">Thank you!</h2>
              <p className="form-success-body">
                Your sponsorship has been received. The festival committee will be in touch shortly.
              </p>
              <div className="form-info-block">
                <p className="form-info-title">What happens next</p>
                <p className="form-info-body">A confirmation email is on its way to you. A committee member will follow up regarding any recognition or listing on the website.</p>
              </div>
              <Link to="/" className="form-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
                Back to festival site
              </Link>
              <p className="form-submit-note">Questions? Contact movillefestival@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'cancelled') {
    return (
      <div className="form-page">
        <div className="form-page-bg" aria-hidden="true" />
        <div className="form-page-content page-shell--narrow">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon" style={{ fontSize: '2rem' }}>ℹ️</div>
              <h2 className="form-success-title">Payment cancelled</h2>
              <p className="form-success-body">
                No payment was taken. You can try again below whenever you're ready.
              </p>
              <button className="form-submit" onClick={() => setScreen('form')}>
                Back to sponsorship
              </button>
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
              <p className="form-eyebrow">Moville Summer Festival · 8–12 July 2026</p>
              <h1 className="form-title">Sponsor the Festival</h1>
            </div>
          </div>
        </header>

        <div className="form-card">
          <p className="ball-intro">
            Support Moville Summer Festival 2026 and help bring the community together
            for another unforgettable week. Every contribution goes directly towards
            running the events that make the festival what it is.
          </p>

          {/* Tier selection */}
          <div className="form-section">
            <p className="form-section-title">Choose an amount</p>
            <div className="ball-options" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {TIERS.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  className={`ball-option${form.selectedTier === tier.cents ? ' selected' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, selectedTier: tier.cents }))}
                  aria-pressed={form.selectedTier === tier.cents}
                >
                  <div className="ball-selected-indicator" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <div className="ball-option-count">{tier.label}</div>
                  <div className="ball-option-desc">{tier.description}</div>
                </button>
              ))}
            </div>

            {form.selectedTier === 0 && (
              <div className="form-field" style={{ marginTop: '12px' }}>
                <label className="form-label">Your amount (€) <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="number"
                  min="10"
                  placeholder="e.g. 150"
                  value={form.customAmount}
                  onChange={set('customAmount')}
                />
                <p className="form-hint">Minimum €10</p>
              </div>
            )}
          </div>

          {/* Business details */}
          <div className="form-section">
            <p className="form-section-title">Your details</p>

            <div className="form-field">
              <label className="form-label">Business name <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Moville Hardware"
                value={form.businessName}
                onChange={set('businessName')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Contact name <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                placeholder="Your full name"
                value={form.contactName}
                onChange={set('contactName')}
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
              <p className="form-hint">A confirmation will be sent to this address.</p>
            </div>

            <div className="form-field">
              <label className="form-label">Phone (optional)</label>
              <input
                className="form-input"
                type="tel"
                placeholder="Include country code if outside Ireland"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">Message to the committee (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Anything you'd like the committee to know"
                value={form.message}
                onChange={set('message')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <label className="form-check">
              <input
                type="checkbox"
                checked={form.socialMediaConsent}
                onChange={e => setForm(p => ({ ...p, socialMediaConsent: e.target.checked }))}
              />
              <span className="form-check-label">
                I'd like the festival to recognise and promote my business on social media.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="form-submit-wrap">
            {valid && (
              <div className="form-payment-summary">
                Sponsoring <strong>{form.businessName}</strong> for <strong>€{(amountCents / 100).toFixed(0)}</strong> — payment taken securely via Stripe.
              </div>
            )}
            <p className="form-consent">
              By submitting this form you agree that Moville Summer Festival may contact you
              regarding your sponsorship.
            </p>
            <button
              className="form-submit"
              onClick={handleSubmit}
              disabled={!valid || submitting}
            >
              {submitting ? 'Redirecting you to secure payment…' : `Pay €${amountCents >= 100 ? (amountCents / 100).toFixed(0) : '—'} Securely`}
            </button>
            <p className="form-submit-note">
              By sponsoring you agree to our <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
