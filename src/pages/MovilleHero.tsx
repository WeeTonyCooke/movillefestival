import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovilleHero.css';

const DAY_IMG               = '/movillelight-day.jpeg';
const DAY_DESKTOP_IMG       = '/movillelight-day-desktop.jpeg';
const AFTERNOON_IMG         = '/movillelight-afternoon.jpeg';
const AFTERNOON_DESKTOP_IMG = '/the-fid-evening-desktop.jpeg';
const NIGHT_IMG             = '/movillelightcleannight.png';
const NIGHT_DESKTOP_IMG     = '/the-fid-night-desktop.jpeg';

type MovilleHeroProps = {
  isNight: boolean;
};

type HeroPhase = 'day' | 'afternoon' | 'night';

function getHeroPhase(): HeroPhase {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('hero');
  if (override === 'day' || override === 'afternoon' || override === 'night') {
    return override;
  }
  const hour = new Date().getHours();
  if (hour >= 21 || hour < 6) return 'night';
  if (hour >= 14) return 'afternoon';
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

      {/* Afternoon — mobile */}
      <div
        className={`hero-bg hero-bg-afternoon ${heroPhase === 'afternoon' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${AFTERNOON_IMG})` }}
        aria-hidden="true"
      />

      {/* Afternoon — desktop */}
      <div
        className={`hero-bg hero-bg-afternoon-desktop ${heroPhase === 'afternoon' ? 'active' : ''}`}
        style={{ backgroundImage: `url(${AFTERNOON_DESKTOP_IMG})` }}
        aria-hidden="true"
      />

      {/* Night — mobile */}
      <div
        className={`hero-bg hero-bg-night ${isHeroNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_IMG})` }}
        aria-hidden="true"
      >
        <div className="beam-sweep" />
      </div>

      {/* Night — desktop */}
      <div
        className={`hero-bg hero-bg-night-desktop ${isHeroNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_DESKTOP_IMG})` }}
        aria-hidden="true"
      />

      <div className="hero-overlay" aria-hidden="true" />
      <div className="water-shimmer" aria-hidden="true" />

      <div className="hero-content">
        <div className="page-shell hero-shell">
          <div className="hero-title-wrap">
            <header className="hero-header">
              <h1 className="hero-title">Moville Festival</h1>
              <p className="hero-date">8–12 July</p>
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

    </section>
  );
};

export default MovilleHero;