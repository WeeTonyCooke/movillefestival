import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovilleHero from './MovilleHero';
import './HomePage.css';

type HomePageProps = {
  isNight: boolean;
};

export default function HomePage({ isNight }: HomePageProps) {
  const navigate = useNavigate();
  const sponsorRef = useRef<HTMLElement | null>(null);

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
      <MovilleHero isNight={isNight} />

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
