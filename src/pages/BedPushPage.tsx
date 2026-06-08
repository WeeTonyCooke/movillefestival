import { useState } from 'react';
import { Link } from 'react-router-dom';
import './forms.css';

interface FormData {
  teamName: string;
  fancyDress: string;
  organisation: string;
  website: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  expectedAttendees: string;
  agreeRules: boolean;
  agreeWaiver: boolean;
  socialMedia: boolean;
  marketingOptIn: boolean;
}

const INITIAL: FormData = {
  teamName: '',
  fancyDress: '',
  organisation: '',
  website: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  emergencyName: '',
  emergencyPhone: '',
  expectedAttendees: '',
  agreeRules: false,
  agreeWaiver: false,
  socialMedia: false,
  marketingOptIn: false,
};

export default function BedPushPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.emergencyName.trim() &&
    form.emergencyPhone.trim() &&
    form.agreeRules &&
    form.agreeWaiver;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
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
              <p className="form-eyebrow">Moville Summer Festival · Wednesday 8th July 2026</p>
              <h1 className="form-title">Bed Push Race</h1>
              <p className="form-subtitle">Festival Square &amp; Quay Street · 6pm for 6.30pm · Team registration</p>
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
              <h2 className="form-success-title">Team registered!</h2>
              <p className="form-success-body">
                Great stuff, {form.firstName}! <strong>{form.teamName}</strong> is on the list.
                We'll send confirmation and payment details to {form.email}.
              </p>
              <Link to="/" className="form-success-back">Back to festival site</Link>
            </div>
          ) : (
            <>
              {/* Fee */}
              <div className="form-section">
                <p className="form-section-title">Entry fee</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', margin: '0 0 4px' }}>€50 per team</p>
                <p className="form-hint">Payable on the day. Spaces are limited to 20 teams. If all places are allocated, registrations will be added to a waiting list.</p>
              </div>

              {/* Team details */}
              <div className="form-section">
                <p className="form-section-title">Team details</p>

                <div className="form-field">
                  <label className="form-label">Team name <span className="required">*</span></label>
                  <input className="form-input" type="text" placeholder="e.g. The Rusty Wheels"
                    value={form.teamName} onChange={set('teamName')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Organisation / business name</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. Moville GAA, local business, school…"
                    value={form.organisation} onChange={set('organisation')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Fancy dress theme (optional)</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. Nurses, Vikings, Minions, Pirates…"
                    value={form.fancyDress} onChange={set('fancyDress')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Website / Facebook / Instagram (optional)</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. facebook.com/yourteam"
                    value={form.website} onChange={set('website')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Expected number attending on the day (optional)</label>
                  <input className="form-input" type="text"
                    placeholder="e.g. 5 team members + 10 supporters"
                    value={form.expectedAttendees} onChange={set('expectedAttendees')} />
                  <p className="form-hint">Includes team members and any supporters or helpers.</p>
                </div>

                <p className="form-hint">Each team consists of 5 participants — 4 pushers and 1 rider. All participants must be aged 16 or over.</p>
              </div>

              {/* Team captain */}
              <div className="form-section">
                <p className="form-section-title">Team captain</p>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">First name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Aoife"
                      value={form.firstName} onChange={set('firstName')} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Last name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Ó Dochartaigh"
                      value={form.lastName} onChange={set('lastName')} />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Email address <span className="required">*</span></label>
                  <input className="form-input" type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')} />
                </div>

                <div className="form-field">
                  <label className="form-label">Phone number <span className="required">*</span></label>
                  <input className="form-input" type="tel" placeholder="+353 87 …"
                    value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {/* Emergency contact */}
              <div className="form-section">
                <p className="form-section-title">Emergency contact</p>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Name <span className="required">*</span></label>
                    <input className="form-input" type="text" placeholder="Contact name"
                      value={form.emergencyName} onChange={set('emergencyName')} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Phone number <span className="required">*</span></label>
                    <input className="form-input" type="tel" placeholder="+353 87 …"
                      value={form.emergencyPhone} onChange={set('emergencyPhone')} />
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="form-section">
                <p className="form-section-title">Confirmation</p>

                <label className="form-check">
                  <input type="checkbox" checked={form.agreeRules} onChange={set('agreeRules')} />
                  <span className="form-check-label">
                    I confirm that all participants must be aged 16 or over and agree to abide by the
                    festival committee's rules on the day. I understand that spaces are limited to 20
                    teams and the entry fee of €50 is payable on the day.
                  </span>
                </label>

                <label className="form-check">
                  <input type="checkbox" checked={form.agreeWaiver} onChange={set('agreeWaiver')} />
                  <span className="form-check-label">
                    I confirm that all team members acknowledge that participating in the Moville Festival
                    Bed Push Race involves inherent risks of physical injury or property damage. Teams
                    agree to assume all risks and release the Moville Festival Committee, event sponsors,
                    volunteers, and local authorities from any liability, claims, or demands arising out
                    of participation in this event.
                  </span>
                </label>

                <label className="form-check">
                  <input type="checkbox" checked={form.socialMedia} onChange={set('socialMedia')} />
                  <span className="form-check-label">
                    I am happy for Moville Festival to feature my team on social media.
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
                  onClick={handleSubmit}
                  disabled={!valid || submitting}
                >
                  {submitting ? 'Registering…' : 'Register team →'}
                </button>
                <p className="form-submit-note">
                  A confirmation email will be sent to you. Entry fee of €50 is payable on the day.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
