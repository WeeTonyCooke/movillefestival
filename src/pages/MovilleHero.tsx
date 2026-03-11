import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./MovilleHero.css"; 

const DAY_IMG = '/movillelightcleanday.png';
const NIGHT_IMG = '/movillelightcleannight.png';

const MovilleHero = () => {
  const navigate = useNavigate();
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 18 || hour < 6);
    };
    checkTime();
    const timer = setInterval(checkTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="moville-hero">
      <div className={`bg-layer day-bg ${!isNight ? 'active' : ''}`} style={{ backgroundImage: `url(${DAY_IMG})` }} />
      <div className={`bg-layer night-bg ${isNight ? 'active' : ''}`} style={{ backgroundImage: `url(${NIGHT_IMG})` }}>
        <div className="beam-sweep"></div>
      </div>
      <div className="water-shimmer"></div>
      <div className="hero-content">
        <header className="hero-header">
          <h1 className="title">MOVILLE<br /><span className="serif-italic">SUMMER FESTIVAL</span></h1>
          <p className="date">8–12 JULY</p>
        </header>
        <footer className="hero-footer">
          <button className="cta-button" onClick={() => navigate('/programme')}>
            VIEW PROGRAMME
          </button>
        </footer>
      </div>
    </section>
  );
};

export default MovilleHero;