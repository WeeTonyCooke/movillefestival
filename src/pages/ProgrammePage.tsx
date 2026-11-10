import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import programmeJSON from '../content/programme.json';
import './ProgrammePage.css';

const DEFAULT_EVENT_DURATION_MIN = 90;

type FestivalDay = 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

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

// Derive all constants from the JSON — edit src/content/programme.json to update the programme.
const FESTIVAL_DATES = Object.fromEntries(
  programmeJSON.days.map((d) => [d.key, d.festivalDate]),
) as Record<FestivalDay, { year: number; month: number; day: number }>;

const DAY_LABELS = Object.fromEntries(
  programmeJSON.days.map((d) => [d.key, d.label]),
) as Record<FestivalDay, string>;

const DAY_NAMES = Object.fromEntries(
  programmeJSON.days.map((d) => [d.key, d.name]),
) as Record<FestivalDay, string>;

const DATE_LABELS = Object.fromEntries(
  programmeJSON.days.map((d) => [d.key, d.dateLabel]),
) as Record<FestivalDay, string>;

const PROGRAMME_DATA = Object.fromEntries(
  programmeJSON.days.map((d) => [d.key, d.events as ProgrammeEvent[]]),
) as Record<FestivalDay, ProgrammeEvent[]>;

const DAY_ORDER = programmeJSON.days.map((d) => d.key as FestivalDay);

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

function getDefaultFestivalDay(): FestivalDay {
  const now = new Date();

  if (DAY_ORDER.length === 0) return 'TUE';

  const first = FESTIVAL_DATES[DAY_ORDER[0]];
  const last = FESTIVAL_DATES[DAY_ORDER[DAY_ORDER.length - 1]];
  const festivalStart = new Date(first.year, first.month, first.day, 0, 0, 0, 0);
  const festivalEnd = new Date(last.year, last.month, last.day, 23, 59, 59, 999);

  if (now < festivalStart) return DAY_ORDER[0];
  if (now > festivalEnd) return DAY_ORDER[DAY_ORDER.length - 1];

  const match = DAY_ORDER.find((key) => {
    const d = FESTIVAL_DATES[key];
    const start = new Date(d.year, d.month, d.day, 0, 0, 0, 0);
    const end = new Date(d.year, d.month, d.day, 23, 59, 59, 999);
    return now >= start && now <= end;
  });
  return match ?? DAY_ORDER[0];
}

function ProgrammePage({ isNight }: { isNight: boolean }) {
  const [activeDay, setActiveDay] = useState<FestivalDay>(() =>
    getDefaultFestivalDay(),
  );
  type DayForecast = {
    high: number; low: number; code: number;
    description: string; emoji: string; rain: number; wind: number;
  };
  const [forecast, setForecast] = useState<Record<string, DayForecast>>({});

  useEffect(() => {
    fetch('/.netlify/functions/weather')
      .then((res) => res.json())
      .then((data) => {
        if (data.forecast) setForecast(data.forecast);
      })
      .catch(() => {});
  }, []);

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
          {(() => {
            const w = forecast[activeDay];
            const hasForecast = Object.keys(forecast).length > 0;
            return (
              <div className="prog-weather">
                <span className="prog-weather-icon" aria-hidden="true">
                  {w ? w.emoji : isNight ? '🌙' : '☀️'}
                </span>
                <div className="prog-weather-copy">
                  <span className="prog-weather-line">
                    {w
                      ? `${w.description} · ${w.high}°C / ${w.low}°C`
                      : hasForecast
                        ? 'Too early to forecast'
                        : 'Moville, Co. Donegal'}
                  </span>
                  <span className="prog-weather-subline">
                    {w
                      ? `${w.rain}% chance of rain · Wind ${w.wind} km/h`
                      : hasForecast
                        ? 'Check back closer to the festival for the full forecast.'
                        : 'Inishowen Peninsula, Co. Donegal'}
                  </span>
                </div>
              </div>
            );
          })()}

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
                                <Link to="/passes" className="prog-event-admission-chip">
                                  Admission {event.admission}
                                </Link>
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
