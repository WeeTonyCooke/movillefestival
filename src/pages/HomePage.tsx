import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovilleHero from './MovilleHero';
import './HomePage.css';

type HomePageProps = {
  isNight: boolean;
};

const FEEDBACK_URL =
  'https://script.google.com/macros/s/AKfycbwADI9Ld2vGjlkjST4VTHHR-y5QbuoBPmFjhE8IX2sZVS8mXxfPWQL5nWoCNSJdHQ9oxg/exec';

// One-week takeover: replaces the hero with a single feedback ask,
// then reverts to the normal hero automatically. No manual toggle needed.
const FEEDBACK_TAKEOVER_START = new Date(2026, 6, 13, 0, 0, 0, 0); // 13 July 2026
const FEEDBACK_TAKEOVER_ENDS = new Date(2026, 6, 20, 0, 0, 0, 0); // 20 July 2026

// Manually disabled 16 July — was interfering with sponsors landing on
// the homepage trying to complete a payment. Flip to false to re-enable
// for the remainder of the window above.
const FEEDBACK_TAKEOVER_MANUALLY_DISABLED = true;

function isFeedbackTakeoverActive(): boolean {
  if (FEEDBACK_TAKEOVER_MANUALLY_DISABLED) return false;
  const now = new Date();
  return now >= FEEDBACK_TAKEOVER_START && now < FEEDBACK_TAKEOVER_ENDS;
}

function getClientId(): string {
  const KEY = 'moville-client-id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'c_nostorage';
  }
}

type Rating = 1 | 2 | 3 | 4;

function SmileyVeryUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path d="M 27 78 Q 50 52 73 78" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SmileyUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path d="M 30 70 Q 50 62 70 70" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SmileyHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path d="M 30 64 Q 50 80 70 64" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SmileyVeryHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path d="M 27 62 Q 50 88 73 62" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const RATING_CONFIG: {
  rating: Rating;
  className: string;
  label: string;
  Smiley: () => JSX.Element;
}[] = [
  { rating: 4, className: 'home-feedback-face--r4', label: 'Loved it', Smiley: SmileyVeryHappy },
  { rating: 3, className: 'home-feedback-face--r3', label: 'Good', Smiley: SmileyHappy },
  { rating: 2, className: 'home-feedback-face--r2', label: 'Okay', Smiley: SmileyUnhappy },
  { rating: 1, className: 'home-feedback-face--r1', label: 'Poor', Smiley: SmileyVeryUnhappy },
];

const VOTED_KEY = 'moville-feedback-voted';

function getStoredVote(): Rating | null {
  try {
    const stored = window.localStorage.getItem(VOTED_KEY);
    if (stored === '1' || stored === '2' || stored === '3' || stored === '4') {
      return Number(stored) as Rating;
    }
    return null;
  } catch {
    return null;
  }
}

function FeedbackTakeover() {
  const [selectedRating, setSelectedRating] = useState<Rating | null>(() => getStoredVote());

  const handleVote = (rating: Rating) => {
    if (selectedRating) return; // already voted on this device — don't re-fire
    setSelectedRating(rating);
    try {
      window.localStorage.setItem(VOTED_KEY, String(rating));
    } catch {
      // best-effort only
    }
    const payload = {
      rating,
      recordedAt: new Date().toISOString(),
      clientId: getClientId(),
    };
    fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // keep tap experience clean
    });
  };

  return (
    <section className="home-feedback-takeover" aria-label="Festival feedback">
      <div className="home-feedback-inner">
        <p className="home-feedback-eyebrow">Moville Festival 2026</p>
        <h1 className="home-feedback-heading">
          {selectedRating
            ? 'Thanks for letting us know!'
            : 'How was your festival, Moville?'}
        </h1>
        {!selectedRating && (
          <p className="home-feedback-sub">Tap a face to rate your experience</p>
        )}
        <div
          className={`home-feedback-faces${selectedRating ? ' home-feedback-faces--voted' : ''}`}
          role="group"
          aria-label="Rate your festival experience"
        >
          {RATING_CONFIG.filter(({ rating }) => !selectedRating || rating === selectedRating).map(({ rating, className, label, Smiley }) => {
            const isSelected = selectedRating === rating;
            return (
              <div key={rating} className="home-feedback-face-wrap">
                <button
                  type="button"
                  className={`home-feedback-face ${className}${isSelected ? ' is-voted' : ''}`}
                  onClick={() => handleVote(rating)}
                  disabled={selectedRating !== null}
                  aria-label={label}
                  aria-pressed={isSelected}
                >
                  <Smiley />
                </button>
                <span className="home-feedback-face-label">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="home-feedback-note">Help us plan for 2027.</p>
      </div>
    </section>
  );
}

export default function HomePage({ isNight }: HomePageProps) {
  const navigate = useNavigate();
  const sponsorRef = useRef<HTMLElement | null>(null);
  const showFeedbackTakeover = isFeedbackTakeoverActive();

  useEffect(() => {
    const el = sponsorRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('is-visible');
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {showFeedbackTakeover ? (
        <FeedbackTakeover />
      ) : (
        <MovilleHero isNight={isNight} />
      )}

      {/* Ball Drop — featured section */}
      <section className="home-balldrop">
        <div className="home-balldrop-inner">
          <div className="home-balldrop-header">
            <p className="home-balldrop-eyebrow">Festival Fundraiser · 12 July</p>
            <h2 className="home-balldrop-title">The Great Ball Drop</h2>
            <p className="home-balldrop-desc">
              1,200 numbered balls are released at Festival Square. The first three to cross
              the finish line win cash prizes. You don't need to be there to win.
            </p>
          </div>

          <div className="home-balldrop-prizes">
            <div className="home-balldrop-prize">
              <span className="home-balldrop-prize-place">1st</span>
              <span className="home-balldrop-prize-amount">€500</span>
            </div>
            <div className="home-balldrop-prize">
              <span className="home-balldrop-prize-place">2nd</span>
              <span className="home-balldrop-prize-amount">€300</span>
            </div>
            <div className="home-balldrop-prize">
              <span className="home-balldrop-prize-place">3rd</span>
              <span className="home-balldrop-prize-amount">€150</span>
            </div>
          </div>

          <div className="home-balldrop-options">
            <div className="home-balldrop-option home-balldrop-option--featured">
              <div className="home-balldrop-option-badge">Best value</div>
              <div className="home-balldrop-option-price">€20</div>
              <div className="home-balldrop-option-desc">5 balls · 5 chances</div>
              <div className="home-balldrop-option-per">€4 each — save €5</div>
            </div>
            <div className="home-balldrop-option">
              <div className="home-balldrop-option-price">€5</div>
              <div className="home-balldrop-option-desc">1 ball</div>
              <div className="home-balldrop-option-per">Single entry</div>
            </div>
          </div>

          <button className="home-balldrop-btn" onClick={() => navigate('/ball-drop')}>
            Buy Ball Drop tickets
          </button>
          <p className="home-balldrop-note">Secure payment via Stripe · Confirmation email sent instantly</p>
        </div>
      </section>

      {/* Other events */}
      <section className="home-events">
        <div className="home-events-inner">

          <div className="home-event-card">
            <div className="home-event-card-icon">
              {/* Bed icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/>
                <path d="M3 18h18M3 11V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
                <rect x="9" y="8" width="6" height="3" rx="1"/>
              </svg>
            </div>
            <div className="home-event-card-body">
              <h2 className="home-event-card-title">Bed Push Race</h2>
              <p className="home-event-card-desc">Speed, style, and absolute silliness. Enter your team of 5 for the most chaotic race in Inishowen.</p>
              <div className="home-event-card-meta">
                <span>Wednesday 8 July</span>
                <span>Quay Street</span>
                <span>€50 per team</span>
              </div>
            </div>
            <button className="home-event-card-btn" onClick={() => navigate('/bed-push')}>
              Register a team
            </button>
          </div>

          <div className="home-event-card">
            <div className="home-event-card-icon">
              {/* Craft / scissors icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="6" cy="6" r="3"/>
                <circle cx="6" cy="18" r="3"/>
                <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
              </svg>
            </div>
            <div className="home-event-card-body">
              <h2 className="home-event-card-title">Craft Fair</h2>
              <p className="home-event-card-desc">Local makers, artists and small businesses. Book your stall at the Festival Square marquee.</p>
              <div className="home-event-card-meta">
                <span>Saturday 11 July</span>
                <span>Festival Square</span>
                <span>€20 per stall</span>
              </div>
            </div>
            <button className="home-event-card-btn" onClick={() => navigate('/craft-fair')}>
              Book a stall
            </button>
          </div>

        </div>
      </section>

      {/* Sponsorship */}
      <section className="home-sponsorship" ref={sponsorRef}>
        <div className="home-sponsorship-inner">
          <p className="home-sponsorship-eyebrow">Partner with us</p>
          <h2 className="home-sponsorship-title">Become a Sponsor</h2>
          <p className="home-sponsorship-desc">
            Support Moville's biggest community celebration. Sponsorship keeps the festival free,
            open and rooted in the town. Get in touch to find out how we can work together.
          </p>
          <button className="home-sponsorship-btn" onClick={() => navigate('/sponsorship')}>
            Sponsorship enquiry
          </button>
        </div>
      </section>
    </>
  );
}
