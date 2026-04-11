import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgrammePage.css';

const PROGRAMME_DATA = {
  WED: [{ time: '21:00', title: 'Festival Bingo', venue: "St Eugene's Hall", icon: '🎱' }],
  THU: [{ time: '20:00', title: 'Festival Queen', venue: "Annie's Bar", icon: '👑' }],
  FRI: [
    { time: '19:00', title: 'Street Frolics', venue: 'Market Square', icon: '🎉' },
    { time: '20:00', title: "All Folk'd Up", venue: 'Market Square', icon: '🎵' },
  ],
  SAT: [
    { time: '11:00', title: 'Pet Show', venue: 'The Green', icon: '🐕' },
    { time: '14:00', title: 'Bonny Baby', venue: "St Eugene's Hall", icon: '👶' },
    { time: '16:00', title: 'Treasure Hunt', venue: "McGettigan's Bar", icon: '🗺️' },
    { time: '18:00', title: 'Marty Healy Band', venue: 'Market Square', icon: '🎸' },
    { time: '21:00', title: 'Bagatelle', venue: 'Market Square', icon: '🎤' },
  ],
  SUN: [
    { time: '12:00', title: 'Moville Celtic Sports', venue: 'Glencrow', icon: '🏅' },
    { time: '17:30', title: 'Ball Drop', venue: 'The Green', icon: '🎈' },
    { time: '17:30', title: 'The Two Bucks', venue: 'Market Square', icon: '🎵' },
    { time: '20:30', title: 'ABBA Tribute', venue: 'Market Square', icon: '🎤' },
  ],
} as const;

type FestivalDay = keyof typeof PROGRAMME_DATA;

type ProgrammePageProps = {
  isNight: boolean;
};

function ProgrammePage({ isNight }: ProgrammePageProps) {
  const [activeDay, setActiveDay] = useState<FestivalDay>('SAT');

  return (
    <div className="prog-page">
      <div className="prog-bg" aria-hidden="true" />

      <div className="prog-content page-shell--narrow">
        <header className="prog-header">
          <div className="prog-title-row">
            <Link to="/" className="prog-inline-back" aria-label="Back to home">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <h1 className="prog-title">Programme</h1>
          </div>

          <div className="prog-header-meta">8–12 July 2026</div>
        </header>

        <nav className="prog-day-nav" aria-label="Festival days">
          <div className="prog-day-nav-inner">
            {(Object.keys(PROGRAMME_DATA) as FestivalDay[]).map((day) => (
              <button
                key={day}
                className={`prog-day-pill ${activeDay === day ? 'is-active' : ''}`}
                onClick={() => setActiveDay(day)}
                type="button"
                aria-pressed={activeDay === day}
              >
                {day}
              </button>
            ))}
          </div>
        </nav>

        <main className="prog-main">
          <section className="prog-weather surface-card">
            <span className="prog-weather-icon">{isNight ? '🌜' : '☀️'}</span>

            <div className="prog-weather-copy">
              <span className="prog-weather-line">
                {isNight ? '14°C in Moville this evening' : '18°C in Moville today'}
              </span>
              <span className="prog-weather-subline">
                {isNight
                  ? 'Clear skies and a good night for heading into town.'
                  : `A decent day for ${PROGRAMME_DATA[activeDay][0].title}.`}
              </span>
            </div>
          </section>

          <section className="prog-schedule surface-card">
            {PROGRAMME_DATA[activeDay].map((event, idx) => (
              <article className="prog-event" key={`${activeDay}-${idx}`}>
                <div className="prog-event-time">{event.time}</div>

                <div className="prog-event-body">
                  <h3>{event.title}</h3>
                  <p>
                    <span className="prog-event-icon">{event.icon}</span>
                    {event.venue}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section className="prog-archive-link">
            <a href="/archive" className="prog-archive-anchor" aria-label="Open heritage">
              <div className="prog-archive-mark">
                <img
                  src="/moville_lighthouse_clean_best.webp"
                  alt="Moville lighthouse"
                  className="prog-archive-logo"
                />
                <span className="prog-archive-years">Festival Heritage</span>
              </div>
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProgrammePage;