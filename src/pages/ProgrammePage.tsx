import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProgrammePage.css';

const FEEDBACK_URL =
  'https://script.google.com/macros/s/AKfycbwADI9Ld2vGjlkjST4VTHHR-y5QbuoBPmFjhE8IX2sZVS8mXxfPWQL5nWoCNSJdHQ9oxg/exec';

const DEFAULT_EVENT_DURATION_MIN = 90;

type FestivalDay = 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
type Rating = 1 | 2 | 3 | 4;

type ProgrammeEvent = {
  time: string;
  title: string;
  venue?: string;
  strapline?: string;
  admission?: string;
  startTime?: string;
  headline?: boolean;
  registerUrl?: string;
  registerLabel?: string;
};

const FESTIVAL_DATES: Record<
  FestivalDay,
  { year: number; month: number; day: number }
> = {
  TUE: { year: 2026, month: 6, day: 7 },
  WED: { year: 2026, month: 6, day: 8 },
  THU: { year: 2026, month: 6, day: 9 },
  FRI: { year: 2026, month: 6, day: 10 },
  SAT: { year: 2026, month: 6, day: 11 },
  SUN: { year: 2026, month: 6, day: 12 },
};

const PROGRAMME_DATA: Record<FestivalDay, ProgrammeEvent[]> = {
  TUE: [
    {
      time: '17:30',
      title: 'Golf Scramble',
      venue: 'Greencastle Golf Club',
      strapline:
        'One of the most beautiful links courses you will play anywhere.',
    },
  ],
  WED: [
    {
      time: '18:30',
      title: 'Fancy Dress Opening Parade',
      venue: 'Market Square',
      strapline:
        'A colourful start to the festival - loud, lively and full of fun for everyone.',
    },
    {
      time: '19:00',
      title: 'Bed Push',
      venue: 'Quay Street',
      strapline: 'Fast, slightly chaotic, and much harder than it looks.',
      registerUrl: '/bed-push',
      registerLabel: 'Register your team',
    },
    {
      time: '19:00',
      title: 'Starfares Amusements',
      venue: 'Festival Square',
      strapline: 'Rides and amusements for all the family throughout the evening.',
    },
    {
      time: '19:30',
      title: 'Fire Brigade Car Rescue Demo',
      venue: 'Moville Pier',
      strapline:
        'Up close and real - a live rescue demonstration from the fire brigade. Not to be missed.',
    },
    {
      time: '21:00',
      title: 'Festival Bingo',
      venue: "St Eugene's Hall",
      strapline: 'Eyes down, dabbers ready. Expect a full house.',
    },
  ],
  THU: [
    {
      time: '18:00',
      title: 'Car Treasure Hunt',
      venue: "Bonner's Corner",
      strapline:
        'Follow the clues, trust your instincts and blame the navigator if you don’t win.',
    },
    {
      time: '19:00',
      title: 'Starfares Amusements',
      venue: 'Festival Square',
      strapline: 'Rides and amusements for all the family throughout the evening.',
    },
    {
      time: '20:00–22:00',
      startTime: '20:00',
      title: 'Social Dance',
      venue: "St Eugene's Hall",
      strapline: 'Good music, a bit of dancing and plenty of craic.',
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
      strapline:
        "Hoping we'll see some of Inishowen's sharpest shooters step up to the oche. Everyone welcome. ",
    },
  ],
  FRI: [
    {
      time: '16:00',
      title: 'Kids Entertainment',
      venue: 'Market Square',
      strapline: 'Fun and games for our younger festival-goers.',
    },
    {
      time: '17:00',
      title: 'Junior Bake Off',
      venue: 'Market Square',
      strapline: 'Celebrating the best of our talented young bakers.',
    },
    {
      time: '19:00',
      title: 'Starfares Amusements',
      venue: 'Festival Square',
      strapline: 'Rides and amusements for all the family throughout the evening.',
    },
    {
      time: '19:00',
      title: 'Street Frolics',
      venue: 'Market Square',
      strapline:
        'La Tomatina, Moville style. Something’s about to get out of hand… in a good way.',
    },
    {
      time: '20:00',
      title: "All Folk'd Up",
      venue: 'Market Square',
      admission: '€10',
      headline: true,
      strapline:
        'Trad, folk and everything in between - live music under the summer sky.',
    },
  ],
  SAT: [
    {
      time: '09:00',
      title: 'Fun Team Workout',
      venue: 'Paul McGowan Fitness',
      strapline: 'Shake off the cobwebs and get the day started properly.',
    },
    {
      time: '10:00',
      title: 'Community Games',
      venue: 'Paul McGowan Fitness',
      strapline: 'Community spirit in action — sport and fun for all ages.',
    },
    {
      time: '10:00',
      title: 'Craft Fair',
      venue: 'Marquee, Festival Square',
      strapline: 'Local makers, artists, crafters and small businesses. A day of creativity, community and unique shopping.',
      registerUrl: '/craft-fair',
      registerLabel: 'Apply for a stall',
    },
    {
      time: '10:00',
      title: 'Sea Swim',
      venue: 'Big White Bay',
      strapline: 'With The Mighty Mermaids at Big White Bay. All welcome.',
    },
    {
      time: '11:00',
      title: 'Pet Show',
      venue: 'The Green',
      strapline:
        "Moville's finest four-legged friends - big, small and full of personality.",
    },
    {
      time: '11:30',
      title: "Yoga with Lauren O'Farrelly",
      venue: 'Tennis Court',
      strapline: 'Start your Saturday morning with a stretch and some fresh air.',
    },
    {
      time: '13:00',
      title: 'Starfares Amusements',
      venue: 'Festival Square',
      strapline: 'Rides and amusements for all the family throughout the afternoon.',
    },
    {
      time: '14:00',
      title: 'Crab Fishing',
      venue: 'Moville Pier',
      strapline: 'Pull your line in very slowly, inch by inch.',
    },
    {
      time: '14:00',
      title: 'Bonny Baby',
      venue: "St Eugene's Hall",
      strapline: "Moville's bonniest babies - or so they'll be told.",
    },
    {
      time: '16:00',
      title: 'Treasure Hunt',
      venue: 'Festival Square',
      strapline: 'X marks the spot. Follow the clues and see where they take you.',
    },
    {
      time: '18:00',
      title: 'Marty Healy Band',
      venue: 'Market Square',
      admission: '€10',
      strapline: 'Live music in the Square to ease you into Saturday evening.',
    },
    {
      time: '19:00',
      title: 'Pool Competition',
      venue: "Maguire's, Diver's & The Corner Bar",
      strapline: 'Chalk up your cue and show us what you’ve got.',
    },
    {
      time: '21:00',
      title: 'Bagatelle',
      venue: 'Market Square',
      admission: '€10',
      headline: true,
      strapline:
        'One of Ireland’s best-loved bands brings the big Saturday night to Market Square.',
    },
  ],
  SUN: [
    {
      time: '09:00',
      title: '5K Fun Run or Walk',
      strapline: 'Run it, walk it or just enjoy the fresh start to Sunday.',
    },
    {
      time: '10:00',
      title: '((Bounce)) Carndonagh Free Pop Up',
      venue: "St Eugene's Hall",
      strapline: 'Free pop-up session from Carndonagh — fun for all ages.',
    },
    {
      time: '12:00',
      title: 'Starfares Amusements',
      venue: 'Festival Square',
      strapline: 'Rides and amusements for all the family.',
    },
    {
      time: '12:00',
      title: 'Moville Celtic Sports',
      venue: 'Bayfield',
      strapline: 'A great afternoon of sport, competition and community spirit.',
    },
    {
      time: '17:30',
      title: 'Ball Drop',
      venue: 'The Green',
      strapline:
        'Hundreds of balls. One hill. Absolute chaos. Make sure you have your ticket.',
      registerUrl: '/ball-drop',
      registerLabel: 'Buy balls',
    },
    {
      time: '17:30',
      title: 'The Two Bucks',
      venue: 'Market Square',
      admission: '€10',
      strapline:
        'A lively start to Sunday evening - expect a good crowd and high-energy takes on familiar favourites.',
    },
    {
      time: '19:00',
      title: 'Pool Competition',
      venue: "Maguire's, Diver's & The Corner Bar",
      strapline: 'Chalk up your cue and show us what you’ve got.',
    },
    {
      time: '20:30',
      title: 'The Björn Identity',
      venue: 'Market Square',
      admission: '€10',
      headline: true,
      strapline:
        'Ireland’s premier ABBA tribute band hits the Square for the festival finale. Glitter optional, but encouraged.',
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

const DAY_NAMES: Record<FestivalDay, string> = {
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const DATE_LABELS: Record<FestivalDay, string> = {
  TUE: '7 July',
  WED: '8 July',
  THU: '9 July',
  FRI: '10 July',
  SAT: '11 July',
  SUN: '12 July',
};

const DAY_ORDER: FestivalDay[] = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function getStartTime(event: ProgrammeEvent): string {
  return event.startTime ?? event.time.split(/[–-]/)[0].trim();
}

function buildEventStart(day: FestivalDay, event: ProgrammeEvent): Date {
  const { year, month, day: dayNum } = FESTIVAL_DATES[day];
  const [hours, minutes] = getStartTime(event)
    .split(':')
    .map((n) => Number(n));

  return new Date(year, month, dayNum, hours, minutes, 0, 0);
}

function hasEventFinished(day: FestivalDay, event: ProgrammeEvent): boolean {
  const start = buildEventStart(day, event);
  const end = new Date(
    start.getTime() + DEFAULT_EVENT_DURATION_MIN * 60 * 1000,
  );

  return new Date() > end;
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

type TimeBucket = 'morning' | 'afternoon' | 'evening';

const BUCKET_LABELS: Record<TimeBucket, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

function bucketForTime(timeStr: string): TimeBucket {
  const hour = Number(timeStr.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Build an .ics calendar file string for a festival event.
 * Festival is in July (Ireland BST = UTC+1), so we hand-roll the UTC offset
 * rather than rely on the browser's local timezone, which would corrupt times
 * for diaspora users abroad.
 */
function buildICS(day: FestivalDay, event: ProgrammeEvent): string {
  const { year, month, day: dayNum } = FESTIVAL_DATES[day];
  const [startH, startM] = getStartTime(event).split(':').map(Number);

  const totalEndMinutes = startH * 60 + startM + DEFAULT_EVENT_DURATION_MIN;
  const endH = Math.floor(totalEndMinutes / 60);
  const endM = totalEndMinutes % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Convert Ireland-local hour to UTC (BST = +1 throughout July).
  const toUTC = (h: number, m: number) =>
    `${year}${pad(month + 1)}${pad(dayNum)}T${pad(h - 1)}${pad(m)}00Z`;

  const dtStart = toUTC(startH, startM);
  const dtEnd = toUTC(endH, endM);
  const dtStamp =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');

  const uidSlug = event.title.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const venue = event.venue
    ? `${event.venue}, Moville, Co. Donegal`
    : 'Moville, Co. Donegal';
  const description =
    (event.strapline ?? '') +
    (event.admission ? ` Admission: ${event.admission}.` : '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moville Festival//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${day}-${getStartTime(event).replace(':', '')}-${uidSlug}@movillefestival.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escape(event.title)} — Moville Festival`,
    `LOCATION:${escape(venue)}`,
    `DESCRIPTION:${escape(description.trim())}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(day: FestivalDay, event: ProgrammeEvent) {
  const ics = buildICS(day, event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  a.href = url;
  a.download = `moville-${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SmileyVeryUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path
        d="M 27 78 Q 50 52 73 78"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path
        d="M 30 70 Q 50 62 70 70"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path
        d="M 30 64 Q 50 80 70 64"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmileyVeryHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="40" r="7" />
      <circle cx="65" cy="40" r="7" />
      <path
        d="M 27 62 Q 50 88 73 62"
        strokeWidth="8"
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
  const [selectedVotes, setSelectedVotes] = useState<Record<string, Rating>>(
    {},
  );

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
    event: ProgrammeEvent,
    rating: Rating,
  ) => {
    setSelectedVotes((prev) => ({ ...prev, [eventKey]: rating }));

    const payload = {
      event: eventTitle,
      day,
      scheduledTime: event.time,
      rating,
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

      <div className="prog-content page-shell--narrow">

        {/* ── Header ── */}
        <header className="prog-header">
          <div className="prog-header-top">
            <Link to="/" className="prog-back" aria-label="Back to home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className="prog-header-meta">
              <p className="prog-kicker">What's On</p>
              <h1 className="prog-title">Programme</h1>
              <span className="prog-header-date">Tue 7 — Sun 12 July 2026</span>
            </div>
          </div>

          {/* Buy passes — tertiary link with hairline rule */}
          <div className="prog-buy-passes-wrap">
            <span className="prog-buy-passes-rule" aria-hidden="true" />
            <Link to="/passes" className="prog-buy-passes-banner">
              Buy passes →
            </Link>
          </div>
        </header>

        {/* ── Day nav — flat segmented control ── */}
        <nav className="prog-day-nav" aria-label="Festival days">
          <div className="prog-day-nav-inner">
            {DAY_ORDER.map((day) => (
              <button
                key={day}
                className={`prog-day-pill${activeDay === day ? ' is-active' : ''}`}
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

          {/* ── Weather strip ── */}
          <div className="prog-weather">
            <span className="prog-weather-icon" aria-hidden="true">
              {isNight ? '🌙' : '☀️'}
            </span>
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
          </div>

          {/* ── Schedule — one per day, hidden when not active ── */}
          {DAY_ORDER.map((day) => {
            const dayEvents = PROGRAMME_DATA[day];
            let lastBucket: TimeBucket | null = null;

            return (
              <section
                key={day}
                className={`prog-schedule prog-day-block${day === activeDay ? ' is-active' : ''}`}
                aria-hidden={day === activeDay ? undefined : true}
              >
                {/* Day header: italic Playfair name + muted date + hairline */}
                <div className="prog-day-header">
                  <span className="prog-day-header-name">
                    {DAY_LABELS[day].split(',')[0]}
                  </span>
                  <span className="prog-day-header-date">
                    {DAY_LABELS[day].split(',')[1]?.trim().toUpperCase()}
                  </span>
                  <span className="prog-day-header-rule" aria-hidden="true" />
                </div>

                {/* Timeline */}
                <div className="prog-timeline">
                  {dayEvents.map((event) => {
                    const eventKey = `${day}-${event.time}-${event.title}`;
                    const selectedRating = selectedVotes[eventKey];
                    const eventFinished = hasEventFinished(day, event);
                    const isHeadliner = Boolean(event.headline || event.admission);

                    const bucket = bucketForTime(getStartTime(event));
                    const showBucket = bucket !== lastBucket && dayEvents.length > 3;
                    lastBucket = bucket;

                    return (
                      <React.Fragment key={eventKey}>

                        {/* Time-of-day divider */}
                        {showBucket && (
                          <div
                            className={`prog-time-divider prog-time-divider--${bucket}`}
                            aria-hidden="true"
                          >
                            <span>{BUCKET_LABELS[bucket]}</span>
                          </div>
                        )}

                        {/* Event row */}
                        <article className={`prog-event${isHeadliner ? ' is-headline' : ''}`}>

                          {/* Time — sits in left gutter via absolute position */}
                          <div className="prog-event-time">{event.time}</div>

                          {/* Headliner label */}
                          {isHeadliner && (
                            <div className="prog-event-badge">
                              <span>Headliner</span>
                            </div>
                          )}

                          <h3 className="prog-event-title">{event.title}</h3>

                          {event.strapline && (
                            <p className="prog-event-strapline">{event.strapline}</p>
                          )}

                          {event.venue && (
                            <div className="prog-event-venue">
                              <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="#1F4E5F">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                              </svg>
                              <span className="prog-event-venue-text">{event.venue}</span>
                            </div>
                          )}

                          {event.registerUrl && (
                            <Link to={event.registerUrl} className="prog-event-register">
                              {event.registerLabel || 'Register'} →
                            </Link>
                          )}

                          {/* Admission + calendar on one row */}
                          {isHeadliner && (
                            <div className="prog-event-actions">
                              {event.admission && (
                                <span className="prog-event-admission-chip">
                                  Admission {event.admission}
                                </span>
                              )}
                              <button
                                type="button"
                                className="prog-event-cal"
                                onClick={() => downloadICS(day, event)}
                                aria-label={`Add ${event.title} to your calendar`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="3" y="5" width="18" height="16" rx="2" />
                                  <path d="M8 3v4M16 3v4M3 10h18" />
                                </svg>
                                Add to calendar
                              </button>
                            </div>
                          )}

                          {/* Post-event voting */}
                          {eventFinished && (
                            <>
                              <p className="prog-event-vote-heading">Tell us what you thought</p>
                              <div className="prog-event-vote" role="group" aria-label={`Your reaction to ${event.title}`}>
                                {RATING_CONFIG.map(({ rating, className, label, Smiley }) => {
                                  const isSelected = selectedRating === rating;
                                  return (
                                    <button
                                      key={rating}
                                      type="button"
                                      className={`prog-event-vote-face ${className}${isSelected ? ' is-voted' : ''}`}
                                      onClick={() => handleVote(eventKey, event.title, day, event, rating)}
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
                            </>
                          )}

                        </article>
                      </React.Fragment>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* ── Archive link ── */}
          <div className="prog-archive-link">
            <Link to="/archive" className="prog-archive-anchor" aria-label="Go to archive">
              <div className="prog-archive-mark">
                <img src="/moville_lighthouse_icon.png" alt="" className="prog-archive-logo" />
                <span className="prog-archive-years">Archive | 1958 – 2026</span>
              </div>
            </Link>
          </div>

          {/* ── Getting to Moville ── */}
          <div className="directions-footer">
            <Link to="/getting-to-moville" className="directions-footer-anchor" aria-label="Getting to Moville">
              <svg viewBox="0 0 24 24" className="directions-footer-icon" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
              <span className="directions-footer-text">Getting to Moville</span>
            </Link>
          </div>

          {/* ── Social links ── */}
          <section className="prog-social" aria-label="Moville Festival social links">
            <a className="prog-social-link" href="https://www.instagram.com/movillefestival" target="_blank" rel="noreferrer" aria-label="Moville Festival on Instagram">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a className="prog-social-link" href="https://www.facebook.com/p/Moville-Festival-100092674825683/" target="_blank" rel="noreferrer" aria-label="Moville Festival on Facebook">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M13.2 20v-7h2.4l.4-3h-2.8V8.1c0-.87.24-1.46 1.49-1.46H16V4.02c-.23-.03-1.03-.1-1.96-.1-1.94 0-3.27 1.18-3.27 3.36V10H8v3h2.77v7h2.43Z" fill="currentColor" />
              </svg>
            </a>
            <a className="prog-social-link" href="https://www.tiktok.com/@movillefestival" target="_blank" rel="noreferrer" aria-label="Moville Festival on TikTok">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M14.6 3.8c.42 1.2 1.31 2.25 2.46 2.87.78.42 1.63.63 2.5.63v2.63a7.6 7.6 0 0 1-3.36-.77v5.37c0 2.9-2.35 5.25-5.25 5.25S5.7 17.43 5.7 14.53c0-2.9 2.35-5.25 5.25-5.25.27 0 .54.02.8.06v2.72a2.64 2.64 0 0 0-.8-.12 2.59 2.59 0 1 0 2.59 2.59V3.8h1.06Z" fill="currentColor" />
              </svg>
            </a>
            <a className="prog-social-link" href="https://www.instagram.com/christybutterz/" target="_blank" rel="noreferrer" aria-label="Photography by Christy Butterz">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 7.5h2.1l1-1.7h3.8l1 1.7H17a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="12.5" r="3.1" stroke="currentColor" strokeWidth="1.8" />
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
