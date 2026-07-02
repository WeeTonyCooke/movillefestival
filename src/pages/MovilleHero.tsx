import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovilleHero.css';

const DAY_IMG = '/mobile_lighthouse_day.webp';
const DAY_DESKTOP_IMG = '/movillelight-day-desktop.jpeg';

const EVENING_IMG = '/mobile_lighthouse_evening.webp';
const EVENING_DESKTOP_IMG = '/moville-light-evening-desktop.jpeg';

const NIGHT_IMG = '/mobile_lighthouse_night.webp';
const NIGHT_DESKTOP_IMG = '/moville-light-evening-desktop.jpeg';

type MovilleHeroProps = {
  isNight: boolean;
};

type HeroPhase = 'day' | 'evening' | 'night';

function getHeroPhase(): HeroPhase {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('hero');

  if (override === 'day' || override === 'evening' || override === 'night') {
    return override;
  }

  if (override === 'afternoon') {
    return 'evening';
  }

  const hour = new Date().getHours();

  if (hour >= 21 || hour < 6) return 'night';
  if (hour >= 14) return 'evening';
  return 'day';
}

const MovilleHero: React.FC<MovilleHeroProps> = ({ isNight }) => {
  const navigate = useNavigate();
  const [heroPhase, setHeroPhase] = useState<HeroPhase>(getHeroPhase);

  useEffect(() => {
    const updatePhase = () => setHeroPhase(getHeroPhase());
    updatePhase();
    const timer = window.setInterval(updatePhase, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const isHeroNight = heroPhase === 'night' || isNight;

  return (
    <>
    <section className={`moville-hero hero-${heroPhase}`}>
      {/* Day — mobile */}
      <div
        className={`hero-bg hero-bg-day ${heroPhase === 'day' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${DAY_IMG})` }}
        aria-hidden="true"
      />

      {/* Day — desktop */}
      <div
        className={`hero-bg hero-bg-day-desktop ${heroPhase === 'day' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${DAY_DESKTOP_IMG})` }}
        aria-hidden="true"
      />

      {/* Evening — mobile */}
      <div
        className={`hero-bg hero-bg-evening ${heroPhase === 'evening' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${EVENING_IMG})` }}
        aria-hidden="true"
      />

      {/* Evening — desktop */}
      <div
        className={`hero-bg hero-bg-evening-desktop ${heroPhase === 'evening' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${EVENING_DESKTOP_IMG})` }}
        aria-hidden="true"
      />

      {/* Night — mobile */}
      <div
        className={`hero-bg hero-bg-night ${isHeroNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_IMG})` }}
        aria-hidden="true"
      />

      {/* Night — desktop */}
      <div
        className={`hero-bg hero-bg-night-desktop ${isHeroNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_DESKTOP_IMG})` }}
        aria-hidden="true"
      />

      <div className="hero-overlay" aria-hidden="true" />
      <div className="water-shimmer" aria-hidden="true" />

      {/* Lantern flash — the real Moville Light is charted Fl W 2.5s
          (one white flash every 2.5 seconds) with a red sector inshore.
          Rendered only at night; position/colour tuned in MovilleHero.css. */}
      {isHeroNight && (
        <div className="lantern-flash" aria-hidden="true">
          <span className="lantern-flash-glow" />
          <span className="lantern-flash-reflection" />
        </div>
      )}

      <div className="hero-content">
        <div className="page-shell hero-shell">
          <div className="hero-title-wrap">
            <header className="hero-header">
              <p className="hero-kicker">Inishowen · Since 1958</p>
              <h1 className="hero-title">Moville Festival</h1>
              <p className="hero-date">8–12 July 2026</p>
            </header>
          </div>

          <div className="hero-footer-wrap">
            <footer className="hero-footer">
              <button className="hero-cta" onClick={() => navigate('/programme')}>
                View Programme
              </button>
            </footer>
          </div>
        </div>
      </div>

      {(heroPhase === 'evening' || heroPhase === 'night') && (
        <div className="hero-credit">
          Photo:{' '}
          <a
            href="https://www.instagram.com/christybutterz/"
            target="_blank"
            rel="noopener noreferrer"
          >
            @christybutterz
          </a>
        </div>
      )}
    </section>

    <button
      className="hero-sponsor-band"
      onClick={() => navigate('/sponsorship')}
      aria-label="Sponsor the Festival"
    >
      Sponsor the Festival <span className="hero-sponsor-band-arrow">→</span>
    </button>
    </>
  );
};

export default MovilleHero;
