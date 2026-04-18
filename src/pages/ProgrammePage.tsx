import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgrammePage.css';

type FestivalDay = 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

type ProgrammeEvent = {
  time: string;
  title: string;
  venue?: string;
  strapline?: string;
  admission?: string;
  startTime?: string;
  headline?: boolean;
};

const PROGRAMME_DATA: Record<FestivalDay, ProgrammeEvent[]> = {
  TUE: [
    {
      time: '17:30',
      title: 'Golf Scramble',
      venue: 'Greencastle Golf Club',
    },
  ],
  WED: [
    {
      time: '18:30',
      title: 'Fancy Dress Opening Parade',
      venue: 'Market Square',
    },
    {
      time: '19:00',
      title: 'Bed Push',
      venue: 'Quay Street',
    },
    {
      time: '19:30',
      title: 'Fire Brigade Car Rescue Demo',
      venue: 'Moville Pier',
    },
    {
      time: '21:00',
      title: 'Festival Bingo',
      venue: "St Eugene's Hall",
      strapline:
        'Eyes down for a good night. Big prizes, plenty of craic and some serious daubing.',
    },
  ],
  THU: [
    {
      time: '18:00',
      title: 'Car Treasure Hunt',
      venue: "McGettigan's Bar",
    },
    {
      time: '20:00–22:00',
      startTime: '20:00',
      title: 'Social Dance',
      venue: "St Eugene's Hall",
    },
    {
      time: '20:30',
      title: 'Festival Queen',
      venue: "Annie's Bar",
      strapline:
        'Who will wear the crown? An evening of glitz, glam and all eyes on the runway.',
    },
    {
      time: '21:00',
      title: 'Darts Competition',
      venue: "Maguire's & The Corner Bar",
    },
  ],
  FRI: [
    {
      time: '16:00',
      title: 'Kids Entertainment',
      venue: 'Market Square',
    },
    {
      time: '17:00',
      title: 'Junior Bake Off',
      strapline: 'Judged by Bakerona.',
      venue: 'Market Square',
    },
    {
      time: '19:00',
      title: 'Street Frolics',
      strapline:
        'La Tomatina, Moville style. Something’s about to get out of hand… in a good way.',
      venue: 'Market Square',
    },
    {
      time: '20:00',
      title: "All Folk'd Up",
      strapline:
        'Trad, folk and everything in between — live music under the summer sky.',
      venue: 'Market Square',
      admission: '€10',
      headline: true,
    },
  ],
  SAT: [
    {
      time: '09:00',
      title: 'Fun Team Workout',
      venue: 'Paul McGowan Fitness',
    },
    {
      time: '10:00',
      title: 'Community Games',
      venue: 'Paul McGowan Fitness',
    },
    {
      time: '11:00',
      title: 'Pet Show',
      strapline:
        "Moville's finest four-legged friends — big, small and full of personality.",
      venue: 'The Green',
    },
    {
      time: '14:00',
      title: 'Crab Fishing',
    },
    {
      time: '14:00',
      title: 'Bonny Baby',
      strapline: "Moville's bonniest babies — or so they'll be told.",
      venue: "St Eugene's Hall",
    },
    {
      time: '16:00',
      title: 'Treasure Hunt',
      venue: "McGettigan's Bar",
    },
    {
      time: '18:00',
      title: 'Marty Healy Band',
      venue: 'Market Square',
    },
    {
      time: '19:00',
      title: 'Pool Competition',
      venue: "Maguire's, Diver's & The Corner Bar",
    },
    {
      time: '21:00',
      title: 'Bagatelle',
      strapline:
        'One of Ireland’s best-loved bands bring the big Saturday night to Market Square.',
      venue: 'Market Square',
      admission: '€10',
      headline: true,
    },
  ],
  SUN: [
    {
      time: '09:00',
      title: '5K Fun Run or Walk',
    },
    {
      time: '12:00',
      title: 'Moville Celtic Sports',
      venue: 'Bayfield',
    },
    {
      time: '17:30',
      title: 'Ball Drop',
      strapline:
        'Hundreds of balls. One hill. Absolute chaos. Make sure you have your ticket.',
      venue: 'The Green',
    },
    {
      time: '17:30',
      title: 'The Two Bucks',
      venue: 'Market Square',
    },
    {
      time: '19:00',
      title: 'Pool Competition',
      venue: "Maguire's, Diver's & The Corner Bar",
    },
    {
      time: '20:30',
      title: 'The Björn Identity',
      strapline:
        'The premier ABBA tribute band in Ireland hits the Square. Get your hotpants on and the glitter ready!',
      venue: 'Market Square',
      headline: true,
    },
  ],
};

const DAY_LABELS: Record<FestivalDay, string> = {
  TUE: 'Tue, 7 Jul',
  WED: 'Wed, 8 Jul',
  THU: 'Thu, 9 Jul',
  FRI: 'Fri, 10 Jul',
  SAT: 'Sat, 11 Jul',
  SUN: 'Sun, 12 Jul',
};

const DAY_ORDER: FestivalDay[] = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getDefaultFestivalDay(): FestivalDay {
  const now = new Date();

  const festivalStart = new Date(2026, 6, 7, 0, 0, 0, 0);
  const festivalEnd = new Date(2026, 6, 12, 23, 59, 59, 999);

  if (now < festivalStart) return 'TUE';
  if (now > festivalEnd) return 'SUN';

  const dayIndex = now.getDay();

  switch (dayIndex) {
    case 2:
      return 'TUE';
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
      return 'TUE';
  }
}

function ProgrammePage({ isNight }: { isNight: boolean }) {
  const [activeDay, setActiveDay] = useState<FestivalDay>(() =>
    getDefaultFestivalDay(),
  );
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    fetch('/.netlify/functions/weather')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.temp === 'number') {
          setTemp(data.temp);
        } else {
          setTemp(null);
        }
      })
      .catch(() => {
        setTemp(null);
      });
  }, []);

  return (
    <div className="prog-page">
      <div className="prog-bg" aria-hidden="true" />

      <div className="prog-content page-shell--narrow">
        <header className="prog-header">
          <div className="prog-header-top">
            <Link to="/" className="prog-back" aria-label="Back to home">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className="prog-header-meta">
              <p className="prog-kicker">What’s On</p>
              <h1 className="prog-title">Programme</h1>
              <span className="prog-header-date">
                Tuesday 7 – Sunday 12 July
              </span>
            </div>
          </div>
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
                {temp !== null
                  ? `${temp}°C in Moville`
                  : isNight
                    ? 'A lovely evening in Moville'
                    : 'A fine day in Moville'}
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
              <span className="prog-day-header-text">
                {DAY_LABELS[activeDay].toUpperCase()}
              </span>
            </div>

            <div className="prog-day-rule" aria-hidden="true" />

            {PROGRAMME_DATA[activeDay].map((event) => {
              const eventKey = `${activeDay}-${event.time}-${event.title}`;

              return (
                <article
                  className={`prog-event${event.headline ? ' is-headline' : ''}`}
                  key={eventKey}
                >
                  <div className="prog-event-time">{event.time}</div>

                  <h3 className="prog-event-title">{event.title}</h3>

                  {event.strapline && (
                    <p className="prog-event-strapline">{event.strapline}</p>
                  )}

                  {event.venue && (
                    <div className="prog-event-venue">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                      </svg>

                      <span className="prog-event-venue-text">{event.venue}</span>

                      {event.admission && (
                        <>
                          <span className="prog-event-separator">·</span>
                          <span className="prog-event-admission-label">
                            Admission
                          </span>
                          <span className="prog-event-admission-value">
                            {event.admission}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <div className="prog-archive-link">
            <Link
              to="/archive"
              className="prog-archive-anchor"
              aria-label="Go to archive"
            >
              <div className="prog-archive-mark">
                <img
                  src="/moville_lighthouse_icon.png"
                  alt=""
                  className="prog-archive-logo"
                />
                <span className="prog-archive-years">Archive — 1958–2026</span>
              </div>
            </Link>
          </div>

          <section className="prog-social" aria-label="Moville Festival social links">
            <a
              className="prog-social-link"
              href="https://www.instagram.com/movillefestival"
              target="_blank"
              rel="noreferrer"
              aria-label="Moville Festival on Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
              </svg>
            </a>

            <a
              className="prog-social-link"
              href="https://www.facebook.com/movillefestival"
              target="_blank"
              rel="noreferrer"
              aria-label="Moville Festival on Facebook"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M13.2 20v-7h2.4l.4-3h-2.8V8.1c0-.87.24-1.46 1.49-1.46H16V4.02c-.23-.03-1.03-.1-1.96-.1-1.94 0-3.27 1.18-3.27 3.36V10H8v3h2.77v7h2.43Z"
                  fill="currentColor"
                />
              </svg>
            </a>

            <a
              className="prog-social-link"
              href="https://www.tiktok.com/@movillefestival"
              target="_blank"
              rel="noreferrer"
              aria-label="Moville Festival on TikTok"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14.6 3.8c.42 1.2 1.31 2.25 2.46 2.87.78.42 1.63.63 2.5.63v2.63a7.6 7.6 0 0 1-3.36-.77v5.37c0 2.9-2.35 5.25-5.25 5.25S5.7 17.43 5.7 14.53c0-2.9 2.35-5.25 5.25-5.25.27 0 .54.02.8.06v2.72a2.64 2.64 0 0 0-.8-.12 2.59 2.59 0 1 0 2.59 2.59V3.8h1.06Z"
                  fill="currentColor"
                />
              </svg>
            </a>

            <a
              className="prog-social-link"
              href="https://www.instagram.com/christybutterz/"
              target="_blank"
              rel="noreferrer"
              aria-label="Photography by Christy Butterz"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 7.5h2.1l1-1.7h3.8l1 1.7H17a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12.5"
                  r="3.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="16.6" cy="9.7" r="0.9" fill="currentColor" />
              </svg>
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProgrammePage;