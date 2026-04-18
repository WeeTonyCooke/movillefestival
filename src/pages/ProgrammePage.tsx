import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgrammePage.css';

// ─── Feedback backend ──────────────────────────────────────────────────────
// Paste the URL of your deployed Google Apps Script web app here.
// See SETUP-guide.md for how to get it.
const FEEDBACK_URL =
  'https://script.google.com/macros/s/AKfycbwADI9Ld2vGjlkjST4VTHHR-y5QbuoBPmFjhE8IX2sZVS8mXxfPWQL5nWoCNSJdHQ9oxg/exec';

const PROGRAMME_DATA = {
  WED: [
    {
      time: '21:00',
      title: 'Festival Bingo',
      strapline:
        'Eyes down for a good night. Big prizes, plenty of craic and some serious daubing.',
      venue: "St Eugene's Hall",
    },
  ],
  THU: [
    {
      time: '20:00',
      title: 'Festival Queen',
      strapline:
        'Who will wear the crown? An evening of glitz, glam and all eyes on the runway.',
      venue: "Annie's Bar",
    },
  ],
  FRI: [
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
    },
  ],
  SAT: [
    {
      time: '11:00',
      title: 'Pet Show',
      strapline:
        "Moville's finest four-legged friends — big, small and full of personality.",
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
      strapline:
        "One of Ireland’s best-loved bands bring the big Saturday night to Market Square.",
      venue: 'Market Square',
      admission: '€10',
    },
  ],
  SUN: [
    {
      time: '12:00',
      title: 'Moville Celtic Sports',
      strapline:
        'Track and field on the banks of the Foyle — a proud day for the parish.',
      venue: 'Glencrow',
    },
    {
      time: '17:30',
      title: 'Ball Drop',
      strapline:
        'Hundreds of balls. One hill. Absolute chaos. Make sure you have your ticket.',
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
      strapline:
        'The most recognised ABBA tribute act on the planet hits The Square. Get your hotpants on and the glitter ready!',
      venue: 'Market Square',
    },
  ],
} as const;

type FestivalDay = keyof typeof PROGRAMME_DATA;
type Rating = 1 | 2 | 3 | 4;

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

const FESTIVAL_DATES: Record<
  FestivalDay,
  { year: number; month: number; day: number }
> = {
  WED: { year: 2026, month: 6, day: 8 },
  THU: { year: 2026, month: 6, day: 9 },
  FRI: { year: 2026, month: 6, day: 10 },
  SAT: { year: 2026, month: 6, day: 11 },
  SUN: { year: 2026, month: 6, day: 12 },
};

const DEFAULT_EVENT_DURATION_MIN = 120;

type Phase = 'before' | 'during' | 'after';

function buildEventStart(day: FestivalDay, time: string): Date {
  const { year, month, day: dayNum } = FESTIVAL_DATES[day];
  const [hours, minutes] = time.split(':').map((n) => Number(n));
  return new Date(year, month, dayNum, hours, minutes, 0, 0);
}

function getEventPhase(day: FestivalDay, time: string): Phase {
  const start = buildEventStart(day, time);
  const end = new Date(
    start.getTime() + DEFAULT_EVENT_DURATION_MIN * 60 * 1000,
  );
  const now = new Date();
  if (now < start) return 'before';
  if (now > end) return 'after';
  return 'during';
}

function getClientId(): string {
  const KEY = 'moville-client-id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        'c_' +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36);
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'c_nostorage';
  }
}

function SmileyVeryUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" />
      <circle cx="65" cy="42" r="6" />
      <path
        d="M 25 78 Q 50 52 75 78"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" />
      <circle cx="65" cy="42" r="6" />
      <path
        d="M 30 70 Q 50 60 70 70"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" />
      <circle cx="65" cy="42" r="6" />
      <path
        d="M 30 60 Q 50 72 70 60"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyVeryHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M 28 44 Q 35 36 42 44"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 58 44 Q 65 36 72 44"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 25 55 Q 50 85 75 55"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VoteTick() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="prog-event-vote-tick-icon"
    >
      <path
        d="M6 12.5l4 4L18 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const RATING_CONFIG: {
  rating: Rating;
  className: string;
  label: string;
  Smiley: () => JSX.Element;
}[] = [
  {
    rating: 1,
    className: 'prog-event-vote-face--r1',
    label: 'Very unhappy',
    Smiley: SmileyVeryUnhappy,
  },
  {
    rating: 2,
    className: 'prog-event-vote-face--r2',
    label: 'Unhappy',
    Smiley: SmileyUnhappy,
  },
  {
    rating: 3,
    className: 'prog-event-vote-face--r3',
    label: 'Happy',
    Smiley: SmileyHappy,
  },
  {
    rating: 4,
    className: 'prog-event-vote-face--r4',
    label: 'Very happy',
    Smiley: SmileyVeryHappy,
  },
];

function getDefaultFestivalDay(): FestivalDay {
  const now = new Date();

  const festivalStart = new Date(2026, 6, 8, 0, 0, 0, 0);
  const festivalEnd = new Date(2026, 6, 12, 23, 59, 59, 999);

  if (now < festivalStart) return 'WED';
  if (now > festivalEnd) return 'SUN';

  const dayIndex = now.getDay();

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
  const [activeDay, setActiveDay] = useState<FestivalDay>(() =>
    getDefaultFestivalDay(),
  );
  const [temp, setTemp] = useState<number | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, Rating>>({});

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

  const handleVote = (
    eventKey: string,
    eventTitle: string,
    day: FestivalDay,
    time: string,
    rating: Rating,
  ) => {
    const phase = getEventPhase(day, time);

    setSelectedVotes((prev) => ({ ...prev, [eventKey]: rating }));

    if (
      !FEEDBACK_URL ||
      FEEDBACK_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE'
    ) {
      console.warn('FEEDBACK_URL not set — vote not sent.', {
        event: eventTitle,
        day,
        time,
        rating,
        phase,
      });
      return;
    }

    const payload = {
      event: eventTitle,
      day,
      scheduledTime: time,
      rating,
      phase,
      recordedAt: new Date().toISOString(),
      clientId: getClientId(),
    };

    fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // keep tap experience clean
    });
  };

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
              const selectedRating = selectedVotes[eventKey];

              return (
                <article className="prog-event" key={eventKey}>
                  <div className="prog-event-time">{event.time}</div>
                  <h3 className="prog-event-title">{event.title}</h3>
                  <p className="prog-event-strapline">{event.strapline}</p>

                  <div className="prog-event-venue">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                    </svg>

                    <span className="prog-event-venue-text">
                      {event.venue}
                      {'admission' in event && event.admission && (
                        <>
                          <span className="prog-event-separator"> · </span>
                          <span className="prog-event-admission-label">
                            Admission{' '}
                          </span>
                          <span className="prog-event-admission-value">
                            {event.admission}
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <div
                    className="prog-event-vote"
                    role="group"
                    aria-label={`Your reaction to ${event.title}`}
                  >
                    {RATING_CONFIG.map(({ rating, className, label, Smiley }) => {
                      const isSelected = selectedRating === rating;

                      return (
                        <button
                          key={rating}
                          type="button"
                          className={`prog-event-vote-face ${className}${isSelected ? ' is-voted' : ''}`}
                          onClick={() =>
                            handleVote(
                              eventKey,
                              event.title,
                              activeDay,
                              event.time,
                              rating,
                            )
                          }
                          aria-label={`${label} about ${event.title}`}
                          aria-pressed={isSelected}
                        >
                          <Smiley />
                          {isSelected && (
                            <span className="prog-event-vote-tick" aria-hidden="true">
                              <VoteTick />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="prog-archive-link">
            <Link
              to="/archive"
              className="prog-archive-anchor"
              aria-label="Open archive"
            >
              <div className="prog-archive-mark">
                <img
                  src="/moville_lighthouse_icon.png"
                  alt="Moville lighthouse"
                  className="prog-archive-logo"
                />
                <span className="prog-archive-years">
                  Archive | 1958 – 2026
                </span>
              </div>
            </Link>
          </section>

          <section className="prog-social">
            <a
              href="https://www.instagram.com/movillefestival/"
              className="prog-social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@moville.festival"
              className="prog-social-link"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            <a
              href="mailto:movillefestival@gmail.com"
              className="prog-social-link"
              aria-label="Email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
            </a>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProgrammePage;