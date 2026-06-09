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

      {/* Ball Drop — featured section */}
      <section className="home-balldrop">
        <div className="home-balldrop-inner">
          <div className="home-balldrop-header">
            <p className="home-balldrop-eyebrow">Festival Fundraiser · 12 July</p>
            <h2 className="home-balldrop-title">The Great Ball Drop</h2>
            <p className="home-balldrop-desc">
              1,200 numbered balls are released at Shore Green. The first three to cross the finish line win cash prizes. You don't need to be there to win.
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
              <div className="home-balldrop-option-desc">5 balls · 5 chances to win</div>
              <div className="home-balldrop-option-per">€4 each — save €5</div>
            </div>
            <div className="home-balldrop-option">
              <div className="home-balldrop-option-price">€5</div>
              <div className="home-balldrop-option-desc">1 ball</div>
              <div className="home-balldrop-option-per">Single entry</div>
            </div>
          </div>

          <button
            className="home-balldrop-btn"
            onClick={() => navigate('/ball-drop')}
          >
            Buy Ball Drop tickets
          </button>
          <p className="home-balldrop-note">Secure payment via Stripe · Confirmation email sent instantly</p>
        </div>
      </section>

      {/* Other events */}
      <section className="home-events">
        <div className="home-events-inner">

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
