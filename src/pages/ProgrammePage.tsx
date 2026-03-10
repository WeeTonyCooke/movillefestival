import { useState } from 'react';
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

function ProgrammePage() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<FestivalDay>('SAT');

  return (
    <div className="prog-wrapper">
      <div className="bg-fixed-layer" aria-hidden="true">
        <div className="festival-bg-image"></div>
      </div>

      <div className="content-scroller">
        <header className="prog-header">
          <button className="back-nav" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3">
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
            <span className="weather-icon">☀️</span>
            <div className="weather-info">
              <span className="temp-line">18°C in Moville</span>
              <span className="desc-line">Great weather for {PROGRAMME_DATA[activeDay][0].title}!</span>
            </div>
          </div>

          <div className="glass-schedule">
            {PROGRAMME_DATA[activeDay].map((event, idx) => (
              <div className="event-item" key={idx}>
                <div className="time-column">{event.time}</div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p><span className="v-icon">{event.icon}</span>{event.venue}</p>
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