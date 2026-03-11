import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./ProgrammePage.css";

const PROGRAMME_DATA = {
  WED: [{ time: "21:00", title: "Festival Bingo", venue: "St Eugene's Hall", icon: "🎱" }],
  THU: [{ time: "20:00", title: "Festival Queen", venue: "Annie's Bar", icon: "👑" }],
  FRI: [
    { time: "19:00", title: "Street Frolics", venue: "Market Square", icon: "🎉" },
    { time: "20:00", title: "All Folk'd Up", venue: "Market Square", icon: "🎵" }
  ],
  SAT: [
    { time: "11:00", title: "Pet Show", venue: "The Green", icon: "🐕" },
    { time: "14:00", title: "Bonny Baby", venue: "St Eugene's Hall", icon: "👶" },
    { time: "16:00", title: "Treasure Hunt", venue: "McGettigan's Bar", icon: "🗺️" },
    { time: "18:00", title: "Marty Healy Band", venue: "Market Square", icon: "🎸" },
    { time: "21:00", title: "Bagatelle", venue: "Market Square", icon: "🎤" }
  ],
  SUN: [
    { time: "12:00", title: "Moville Celtic Sports", venue: "Glencrow", icon: "🏅" },
    { time: "17:30", title: "Ball Drop", venue: "The Green", icon: "🎈" },
    { time: "17:30", title: "The Two Bucks", venue: "Market Square", icon: "🎵" },
    { time: "20:30", title: "ABBA Tribute", venue: "Market Square", icon: "🎤" }
  ]
} as const;

type FestivalDay = keyof typeof PROGRAMME_DATA;

const isEventLive = (eventTime: string) => {
  const now = new Date();
  const [hours, minutes] = eventTime.split(':').map(Number);
  const eventDate = new Date();
  eventDate.setHours(hours, minutes, 0);
  const diff = (now.getTime() - eventDate.getTime()) / 1000 / 60;
  return diff >= 0 && diff < 90; 
};

function ProgrammePage() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<FestivalDay>('SAT');
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
    <div className={`prog-wrapper ${isNight ? 'theme-night' : 'theme-day'}`}>
      <div className="bg-fixed-layer" aria-hidden="true">
        {isNight ? (
          <>
            <video autoPlay loop muted playsInline className="festival-bg-video">
              <source src="/bokeh-bg.mp4" type="video/mp4" />
            </video>
            <div className="night-overlay"></div>
          </>
        ) : (
          <div className="festival-bg-image"></div>
        )}
      </div>

      <div className="content-scroller">
        <header className="prog-header">
          <button className="back-nav" onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="header-titles">
            <p className="fest-subtitle">Moville Festival · July 8–12</p>
            <h1 className="prog-main-title">Programme</h1>
          </div>
        </header>

        <nav className="day-nav-sticky">
          <div className="day-nav-inner">
            {(Object.keys(PROGRAMME_DATA) as FestivalDay[]).map((day) => (
              <button 
                key={day} 
                className={`day-pill ${activeDay === day ? 'active' : ''}`} 
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </nav>

        <main className="main-feed">
          <div className="weather-card">
            <span className="weather-icon">{isNight ? '🌙' : '☀️'}</span>
            <div className="weather-info">
              <span className="temp-line">{isNight ? '14°C' : '18°C'} in Moville</span>
              <span className="desc-line">{isNight ? 'Perfect night for music!' : 'Great day for the festival!'}</span>
            </div>
          </div>

          <div className="glass-schedule">
            {PROGRAMME_DATA[activeDay].map((event, idx) => (
              <div className="event-item" key={idx}>
                <div className="time-column">
                  <span className="time-text">{event.time}</span>
                  {activeDay === 'SAT' && isEventLive(event.time) && (
                    <span className="live-indicator">LIVE</span>
                  )}
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <div className="venue-line">
                    <span className="v-icon">{event.icon}</span>
                    <span className="venue-text">{event.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="prog-footer">
          <img src="/moville-logo.svg" alt="Moville Festival" className="lighthouse-sig" />
        </footer>
      </div>
    </div>
  );
}

export default ProgrammePage;