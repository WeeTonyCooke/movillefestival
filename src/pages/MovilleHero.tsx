import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovilleHero.css';

const DAY_IMG = '/movillelightcleanday.png';
const NIGHT_IMG = '/movillelightcleannight.png';

type MovilleHeroProps = {
  isNight: boolean;
};

const MovilleHero: React.FC<MovilleHeroProps> = ({ isNight }) => {
  const navigate = useNavigate();

  return (
    <section className={`moville-hero ${isNight ? 'hero-night' : 'hero-day'}`}>
      <div
        className={`hero-bg hero-bg-day ${!isNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${DAY_IMG})` }}
        aria-hidden="true"
      />
      <div
        className={`hero-bg hero-bg-night ${isNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_IMG})` }}
        aria-hidden="true"
      >
        <div className="beam-sweep" />
      </div>

      <div className="hero-overlay" aria-hidden="true" />
      <div className="water-shimmer" aria-hidden="true" />

      <div className="hero-content">
        <div className="page-shell hero-shell">
          <div className="hero-text-wrap">
            <header className="hero-header">
              <h1 className="hero-title">
                MOVILLE
                <br />
                <span className="hero-title-italic">SUMMER</span>
                <br />
                <span className="hero-title-italic">FESTIVAL</span>
              </h1>

              <p className="hero-date">8–12 JULY</p>
            </header>

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