import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovilleHero.css';

const DAY_IMG = '/mobile_lighthouse_day.webp';
const EVENING_IMG = '/mobile_lighthouse_evening.webp';
const NIGHT_IMG = '/mobile_lighthouse_night.webp';

type MovilleHeroProps = {
  isNight: boolean;
};

const MovilleHero: React.FC<MovilleHeroProps> = ({ isNight }) => {
  const navigate = useNavigate();

  const now = new Date();
  const hour = now.getHours();

  const isEvening = hour >= 17 && hour < 21;
  const isLateNight = hour >= 21 || hour < 5;

  const showNight = isNight || isLateNight;
  const showEvening = !showNight && isEvening;
  const showDay = !showNight && !showEvening;

  return (
    <section className="moville-hero">
      <div
        className={`hero-bg hero-bg-day ${showDay ? 'active' : ''}`}
        style={{ backgroundImage: `url(${DAY_IMG})` }}
      />

      <div
        className={`hero-bg hero-bg-evening ${showEvening ? 'active' : ''}`}
        style={{ backgroundImage: `url(${EVENING_IMG})` }}
      />

      <div
        className={`hero-bg hero-bg-night ${showNight ? 'active' : ''}`}
        style={{ backgroundImage: `url(${NIGHT_IMG})` }}
      />

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">Moville Festival</h1>

        <button
          className="hero-cta"
          onClick={() => navigate('/programme')}
        >
          View Programme
        </button>
      </div>

      {/* ✅ DESKTOP CREDIT */}
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
    </section>
  );
};

export default MovilleHero;