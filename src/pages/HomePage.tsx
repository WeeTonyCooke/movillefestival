import { useNavigate } from 'react-router-dom';
import MovilleHero from './MovilleHero';
import './HomePage.css';

type HomePageProps = {
  isNight: boolean;
};

export default function HomePage({ isNight }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <>
      <MovilleHero isNight={isNight} />

      <section className="home-events">
        <div className="home-events-inner">

          <div className="home-event-card home-event-card--balldrop">
            <div className="home-event-card-icon">🏆</div>
            <div className="home-event-card-body">
              <h2 className="home-event-card-title">The Great Ball Drop</h2>
              <p className="home-event-card-desc">Win up to €500 cash. Buy a ball and support the festival — you don't need to be there to win.</p>
              <div className="home-event-card-meta">
                <span>Sunday 12 July</span>
                <span>Shore Green</span>
                <span>€5 per ball</span>
              </div>
            </div>
            <button
              className="home-event-card-btn"
              onClick={() => navigate('/ball-drop')}
            >
              Buy a ball
            </button>
          </div>

          <div className="home-event-card home-event-card--bedpush">
            <div className="home-event-card-icon">🛏️</div>
            <div className="home-event-card-body">
              <h2 className="home-event-card-title">Bed Push Race</h2>
              <p className="home-event-card-desc">Speed, style, and absolute silliness. Enter your team of 5 for the most chaotic race in Inishowen.</p>
              <div className="home-event-card-meta">
                <span>Wednesday 8 July</span>
                <span>Quay Street</span>
                <span>€50 per team</span>
              </div>
            </div>
            <button
              className="home-event-card-btn"
              onClick={() => navigate('/bed-push')}
            >
              Register a team
            </button>
          </div>

          <div className="home-event-card home-event-card--craftfair">
            <div className="home-event-card-icon">🎨</div>
            <div className="home-event-card-body">
              <h2 className="home-event-card-title">Craft Fair</h2>
              <p className="home-event-card-desc">Local makers, artists and small businesses. Book your stall at the Festival Square marquee.</p>
              <div className="home-event-card-meta">
                <span>Saturday 11 July</span>
                <span>Festival Square</span>
                <span>€20 per stall</span>
              </div>
            </div>
            <button
              className="home-event-card-btn"
              onClick={() => navigate('/craft-fair')}
            >
              Book a stall
            </button>
          </div>

        </div>
      </section>
    </>
  );
}
