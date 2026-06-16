import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import MovilleHero from './MovilleHero';
import './HomePage.css';

type HomePageProps = {
  isNight: boolean;
};

export default function HomePage({ isNight }: HomePageProps) {
  const navigate = useNavigate();
  const sponsorRef = useRef<HTMLElement | null>(null);
  const [sponsorVisible, setSponsorVisible] = useState(false);

  useEffect(() => {
    const el = sponsorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSponsorVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <MovilleHero isNight={isNight} />

      {/* Sponsorship — full section reached by scrolling past the hero's sponsor band */}
      <section
        className={`home-sponsorship ${sponsorVisible ? 'is-visible' : ''}`}
        ref={sponsorRef as any}
      >
        <div className="home-sponsorship-inner">
          <h2 className="home-sponsorship-title">Become a Festival Sponsor</h2>
          <p className="home-sponsorship-desc">
            Promote your business while supporting Moville Summer Festival 2026.
          </p>
          <button
            className="home-sponsorship-btn"
            onClick={() => navigate('/sponsorship')}
          >
            View Sponsorship Opportunities →
          </button>
        </div>
      </section>
    </>
  );
}
