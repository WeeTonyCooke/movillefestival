import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgrammePage.css';

const PROGRAMME_DATA = {
  WED: [
    {
      time: '21:00',
      title: 'Festival Bingo',
      strapline: 'Eyes down for a good night. Big prizes, plenty of craic and some serious daubing.',
      venue: "St Eugene's Hall",
    },
  ],
  THU: [
    {
      time: '20:00',
      title: 'Festival Queen',
      strapline: 'Who will wear the crown? An evening of glitz, glam and all eyes on the runway.',
      venue: "Annie's Bar",
    },
  ],
  FRI: [
    {
      time: '19:00',
      title: 'Street Frolics',
      strapline: 'La Tomatina, Moville style. Something’s about to get out of hand… in a good way.',
      venue: 'Market Square',
    },
    {
      time: '20:00',
      title: "All Folk'd Up",
      strapline: 'Trad, folk and everything in between — live music under the summer sky.',
      venue: 'Market Square',
    },
  ],
  SAT: [
    {
      time: '11:00',
      title: 'Pet Show',
      strapline: "Moville's finest four-legged friends — big, small and full of personality.",
      venue: 'The Green',
    },
    {
      time: '14:00',
      title: 'Bonny Baby',
      strapline: 'Moville’s bonniest babies — or so they’ll be told.',
      venue: "St Eugene's Hall",
    },
    {
      time: '16:00',
      title: 'Treasure Hunt',
      strapline: 'Follow the clues across town — prizes at the finish.',
      venue: "McGettigan's Bar",
    },
    {
      time: '19:00',
      title: 'Marty Healy Band',
      strapline: 'Live music on the square as the evening kicks off.',
      venue: 'Market Square',
    },
    {
      time: '21:00',
      title: 'Bagatelle',
      strapline: "One of Ireland’s best-loved bands bring the big Saturday night to Market Square.",
      venue: 'Market Square',
    },
  ],
  SUN: [
    {
      time: '12:00',
      title: 'Moville Celtic Sports',
      strapline: 'Track and field on the banks of the Foyle — a proud day for the parish.',
      venue: 'Glencrow',
    },
    {
      time: '17:30',
      title: 'Ball Drop',
      strapline: 'Hundreds of balls. One hill. Absolute chaos. Make sure you have your ticket.',
      venue: 'The Green',
    },
    {
      time: '18:00',
      title: 'The Two Bucks',
      strapline: 'An evening session to ease you into the final night.',
      venue: 'Market Square',
    },
    {
      time: '20:00',
      title: 'Björn Again',
      strapline: 'The most recognised ABBA tribute act on the planet hits The Square. Get your hotpants on and the glitter ready!',
      venue: 'Market Square',
    },
  ],
} as const;

type FestivalDay = keyof typeof PROGRAMME_DATA;

type ProgrammePageProps = {
  isNight: boolean;
};

const DAY_LABELS: Record<FestivalDay, string> = {
  WED: 'Wed, 8 Jul',
  THU: 'Thu, 9 Jul',
  FRI: 'Fri, 10 Jul',
  SAT: 'Sat, 11 Jul',
  SUN: 'Sun, 12 Jul',
};

const DAY_ORDER: FestivalDay[] = ['WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getDefaultFestivalDay(): FestivalDay {
  const now = new Date();

  const festivalStart = new Date(2026, 6, 8, 0, 0, 0, 0); // 8 July 2026
  const festivalEnd = new Date(2026, 6, 12, 23, 59, 59, 999); // 12 July 2026

  if (now < festivalStart) return 'WED';
  if (now > festivalEnd) return 'SUN';

  const dayIndex = now.getDay(); // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

  switch (dayIndex) {
    case 3:
      return 'WED';
    case 4:
      return 'THU';
    case 5:
      return 'FRI';
    case 6:
      return 'SAT';
    case 0:
      return 'SUN';
    default:
      return 'WED';
  }
}

function ProgrammePage({ isNight }: ProgrammePageProps) {
  const defaultDay = useMemo(() => getDefaultFestivalDay(), []);
  const [activeDay, setActiveDay] = useState<FestivalDay>(defaultDay);

  return (
    <div className="prog-page">
      <div className="prog-bg" aria-hidden="true" />

      <div className="prog-content page-shell--narrow">
        <header className="prog-header">
          <div className="prog-header-top">
            <Link to="/" className="prog-back" aria-label="Back to home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div className="prog-header-meta">
              <p className="prog-kicker">Moville Festival</p>
              <span className="prog-header-date">8–12 July 2026</span>
            </div>
          </div>
          <h1 className="prog-title">Programme</h1>
        </header>

        <nav className="prog-day-nav" aria-label="Festival days">
          <div className="prog-day-nav-inner">
            {DAY_ORDER.map((day) => (
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
            <div className="prog-day-header">
              <span className="prog-day-header-text">{DAY_LABELS[activeDay].toUpperCase()}</span>
            </div>
            <div className="prog-day-rule" aria-hidden="true" />

            {PROGRAMME_DATA[activeDay].map((event, idx) => (
              <article className="prog-event" key={`${activeDay}-${idx}`}>
                <div className="prog-event-time">{event.time}</div>
                <h3 className="prog-event-title">{event.title}</h3>
                <p className="prog-event-strapline">{event.strapline}</p>
                <div className="prog-event-venue">
                  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  {event.venue}
                </div>
              </article>
            ))}
          </section>

          <section className="prog-archive-link">
            <a href="/archive" className="prog-archive-anchor" aria-label="Open archive">
              <div className="prog-archive-mark">
                <img
                  src="/moville_lighthouse_clean_best.webp"
                  alt="Moville lighthouse"
                  className="prog-archive-logo"
                />
                <span className="prog-archive-years">Archive — 1958–2026</span>
              </div>
            </a>
          </section>

          <section className="prog-social">
            <a
              href="https://www.instagram.com/movillefestival/"
              className="prog-social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@moville.festival"
              className="prog-social-link"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100092674825683"
              className="prog-social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="mailto:movillefestival@gmail.com"
              className="prog-social-link"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
            </a>
          </section>

          <section className="prog-photo-credit-wrap">
            <a
              href="https://www.instagram.com/christybutterz/"
              className="prog-photo-credit"
              aria-label="Images by Christy Buttermilk on Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="prog-photo-credit-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h3l1.4-2h7.2L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <span className="prog-photo-credit-text">Images by Christy Buttermilk</span>
            </a>
          </section>
          
        </main>
      </div>
    </div>
  );
}

export default ProgrammePage;