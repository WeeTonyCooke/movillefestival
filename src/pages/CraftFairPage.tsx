import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

const MAX_STALLS = 15;
const FEE = 20;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  products: string;
  socialMedia: boolean;
  over18: boolean;
  noRefund: boolean;
  readyBy10: boolean;
}

const INITIAL: FormData = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  products: '',
  socialMedia: false,
  over18: false,
  noRefund: false,
  readyBy10: false,
};

type Screen = 'form' | 'success' | 'soldout';

export default function CraftFairPage() {
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
            setForm((prev) => ({
              ...prev,
              fullName: data.customerName,
              email: data.customerEmail,
              businessName: data.businessName,
            }));
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
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.products.trim() &&
    form.over18 &&
    form.noRefund &&
    form.readyBy10;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/.netlify/functions/create-craft-fair-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          businessName: form.businessName,
          products: form.products,
          socialMediaConsent: form.socialMedia,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Sold out
        setScreen('soldout');
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again or contact movillefestival@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === 'soldout') {
    return (
      <div className="form-page">
        <div className="form-page-bg" aria-hidden="true" />
        <div className="form-page-content page-shell--narrow">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon" style={{ fontSize: '2rem' }}>🎨</div>
              <h2 className="form-success-title">All stalls are taken!</h2>
              <p className="form-success-body">
                The Craft Fair is fully booked. Come along to Festival Square on Saturday 11 July
                to browse and support the makers.
              </p>
              <div className="form-info-block">
                <p className="form-info-title">Want to visit?</p>
                <p className="form-info-body">The Craft Fair is free to attend. Come along to the
                  marquee in Festival Square on Saturday 11 July from 10am to 2pm.</p>
              </div>
              <div className="form-info-block">
                <p className="form-info-title">Interested in a stall next year?</p>
                <p className="form-info-body">Follow us on social media to hear when applications
                  open for 2027.</p>
              </div>
              <Link to="/programme" className="form-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
                View the full festival programme
              </Link>
              <p className="form-submit-note">Questions? Contact Rona at movillefestival@gmail.com</p>
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
              <h2 className="form-success-title">Your stall is booked!</h2>
              <p className="form-success-body">
                Payment confirmed. We'll be in touch with further details closer to the day.
              </p>

              <div className="form-confirm-card">
                <p className="form-confirm-name">{form.businessName || form.fullName}</p>
                <p className="form-confirm-sub">Craft Fair · Festival Square · 11 July</p>
              </div>

              <div className="form-summary">
                <div className="form-summary-row">
                  <span>Stallholder</span><strong>{form.fullName}</strong>
                </div>
                <div className="form-summary-row">
                  <span>Amount paid</span><strong>€{FEE}.00</strong>
                </div>
                <div className="form-summary-row">
                  <span>Date</span><strong>Saturday 11 July</strong>
                </div>
                <div className="form-summary-row">
                  <span>Fair opens</span><strong>10am – 2pm</strong>
                </div>
                <div className="form-summary-row">
                  <span>Setup from</span><strong>9am</strong>
                </div>
                <div className="form-summary-row">
                  <span>Venue</span><strong>Marquee, Festival Square</strong>
                </div>
              </div>

              <div className="form-info-block">
                <p className="form-info-title">WhatsApp group</p>
                <p className="form-info-body">You'll be added to a WhatsApp group with all
                  stallholders for event updates.</p>
              </div>

              <div className="form-info-block">
                <p className="form-info-title">A reminder on the day</p>
                <p className="form-info-body">A 6ft trestle table will be provided.
                  No electricity is available at this event.</p>
              </div>

              <button
                className="form-share-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Moville Summer Festival Craft Fair',
                      text: 'I\'ve just booked a stall at the Moville Summer Festival Craft Fair on 11 July. Come along!',
                      url: 'https://movillefestival.com/craft-fair',
                    });
                  }
                }}
              >
                Share the Craft Fair
              </button>
              <Link to="/" className="form-success-back">Back to festival site</Link>
              <p className="form-submit-note">Questions? Contact Rona at movillefestival@gmail.com</p>
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
              <p className="form-eyebrow">Moville Summer Festival · 11 July 2026</p>
              <h1 className="form-title">Craft Fair — Stall Booking</h1>
              <p className="form-subtitle">
                Local makers, artists, crafters and small businesses. A day of creativity
                and unique shopping in the Festival Square marquee.
              </p>
              <div className="form-chips">
                <span className="form-chip">Saturday 11 July</span>
                <span className="form-chip">10am – 2pm</span>
                <span className="form-chip">Marquee, Festival Square</span>
                <span className="form-chip">€{FEE} per stall</span>
              </div>
            </div>
          </div>
        </header>

        <div className="form-card">
          {/* Spaces notice */}
          <div className="form-notice">
            <strong>Spaces are limited</strong> — stall bookings are allocated on a first come,
            first served basis and are only confirmed once payment has been successfully processed.
          </div>

          {/* Info bullets */}
          <ul className="form-info-list">
            <li>🪑 A 6ft trestle table is supplied for each stall.</li>
            <li>⚡ Please note — electricity is not available at this event.</li>
            <li>🕘 Arrival from 9am to set up. Fair opens at 10am sharp.</li>
            <li>💬 A WhatsApp group will be created for all registered stallholders.</li>
          </ul>

          {/* Your details */}
          <div className="form-section">
            <p className="form-section-title">Your details</p>

            <div className="form-field">
              <label className="form-label">Full name <span className="required">*</span></label>
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
              <p className="form-hint">Include country code if outside Ireland — e.g. +44, +1, +61</p>
            </div>

            <div className="form-field">
              <label className="form-label">Business or trading name (if applicable)</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Rona's Ceramics"
                value={form.businessName}
                onChange={set('businessName')}
              />
            </div>

            <div className="form-field">
              <label className="form-label">What products will you be selling? <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                placeholder="e.g. handmade ceramics, candles, original prints…"
                value={form.products}
                onChange={set('products')}
              />
            </div>
          </div>

          {/* Declarations */}
          <div className="form-section">
            <label className="form-check">
              <input type="checkbox" checked={form.socialMedia} onChange={set('socialMedia')} />
              <span className="form-check-label">
                I'm happy for my stall, business name and products to be featured on Moville Festival social media.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.over18} onChange={set('over18')} />
              <span className="form-check-label">
                I confirm I am 18 or over.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.noRefund} onChange={set('noRefund')} />
              <span className="form-check-label">
                I understand the €{FEE} stall fee is non-refundable, unless the event is cancelled
                by the organisers. Stall bookings are allocated on a first come, first served basis.
              </span>
            </label>

            <label className="form-check">
              <input type="checkbox" checked={form.readyBy10} onChange={set('readyBy10')} />
              <span className="form-check-label">
                I confirm I will be set up and ready by 10am on Saturday 11 July.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="form-submit-wrap">
            {valid && (
              <div className="form-payment-summary">
                You're booking <strong>1 stall</strong> for <strong>€{FEE}</strong> — payment taken securely via Stripe.
              </div>
            )}
            <p className="form-consent">
              By submitting this form you agree that Moville Summer Festival may contact you
              regarding your registration.
            </p>
            <button
              className="form-submit"
              onClick={handleSubmit}
              disabled={!valid || submitting}
            >
              {submitting ? 'Redirecting you to secure payment…' : `Pay €${FEE} and secure my stall`}
            </button>
            <p className="form-submit-note">
              Confirmation and further details will be sent to your email immediately after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
