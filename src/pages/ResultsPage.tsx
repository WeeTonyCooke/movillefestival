import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ResultsPage.css';

// Same URL as in ProgrammePage.tsx — paste the Google Apps Script web app URL.
const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbwADI9Ld2vGjlkjST4VTHHR-y5QbuoBPmFjhE8IX2sZVS8mXxfPWQL5nWoCNSJdHQ9oxg/exec';

type PhaseTotals = { r1: number; r2: number; r3: number; r4: number; total: number };
type EventSummary = {
  key: string;
  event: string;
  day: 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  time: string;
  before: PhaseTotals;
  during: PhaseTotals;
  after: PhaseTotals;
  total: number;
};
type SummaryResponse = {
  events: EventSummary[];
  totals: { count: number; events: number };
  updatedAt: string;
};

const DAY_LABELS = {
  WED: 'Wed, 8 Jul',
  THU: 'Thu, 9 Jul',
  FRI: 'Fri, 10 Jul',
  SAT: 'Sat, 11 Jul',
  SUN: 'Sun, 12 Jul',
} as const;

const DAY_ORDER: (keyof typeof DAY_LABELS)[] = ['WED', 'THU', 'FRI', 'SAT', 'SUN'];

function SmileyVeryUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" fill="#2a0a0c" />
      <circle cx="65" cy="42" r="6" fill="#2a0a0c" />
      <path d="M 25 78 Q 50 52 75 78" stroke="#2a0a0c" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SmileyUnhappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" fill="#2a0a0c" />
      <circle cx="65" cy="42" r="6" fill="#2a0a0c" />
      <path d="M 30 70 Q 50 60 70 70" stroke="#2a0a0c" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SmileyHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="35" cy="42" r="6" fill="#0c2a14" />
      <circle cx="65" cy="42" r="6" fill="#0c2a14" />
      <path d="M 30 60 Q 50 72 70 60" stroke="#0c2a14" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SmileyVeryHappy() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M 28 44 Q 35 36 42 44" stroke="#0c2a14" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 58 44 Q 65 36 72 44" stroke="#0c2a14" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M 25 55 Q 50 85 75 55" stroke="#0c2a14" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PhaseRow({ label, totals }: { label: string; totals: PhaseTotals }) {
  return (
    <div className="results-phase-row">
      <span className="results-phase-label">{label}</span>
      <span className="results-phase-cell results-phase-cell--r1">{totals.r1}</span>
      <span className="results-phase-cell results-phase-cell--r2">{totals.r2}</span>
      <span className="results-phase-cell results-phase-cell--r3">{totals.r3}</span>
      <span className="results-phase-cell results-phase-cell--r4">{totals.r4}</span>
      <span className="results-phase-cell results-phase-cell--total">{totals.total}</span>
    </div>
  );
}

function MoodBar({ event }: { event: EventSummary }) {
  const r1 = event.before.r1 + event.during.r1 + event.after.r1;
  const r2 = event.before.r2 + event.during.r2 + event.after.r2;
  const r3 = event.before.r3 + event.during.r3 + event.after.r3;
  const r4 = event.before.r4 + event.during.r4 + event.after.r4;
  const total = r1 + r2 + r3 + r4;
  if (total === 0) return null;
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div
      className="results-bar"
      aria-label={`Overall: ${r4} very happy, ${r3} happy, ${r2} unhappy, ${r1} very unhappy`}
    >
      <div className="results-bar-seg results-bar-seg--r1" style={{ width: pct(r1) }} />
      <div className="results-bar-seg results-bar-seg--r2" style={{ width: pct(r2) }} />
      <div className="results-bar-seg results-bar-seg--r3" style={{ width: pct(r3) }} />
      <div className="results-bar-seg results-bar-seg--r4" style={{ width: pct(r4) }} />
    </div>
  );
}

function EventCard({ event }: { event: EventSummary }) {
  return (
    <article className="results-event">
      <div className="results-event-head">
        <span className="results-event-time">{event.time}</span>
        <h3 className="results-event-title">{event.event}</h3>
      </div>

      <div className="results-phase-table">
        <div className="results-phase-row results-phase-row--head" aria-hidden="true">
          <span className="results-phase-label" />
          <span className="results-phase-cell"><span className="results-phase-icon results-phase-icon--r1"><SmileyVeryUnhappy /></span></span>
          <span className="results-phase-cell"><span className="results-phase-icon results-phase-icon--r2"><SmileyUnhappy /></span></span>
          <span className="results-phase-cell"><span className="results-phase-icon results-phase-icon--r3"><SmileyHappy /></span></span>
          <span className="results-phase-cell"><span className="results-phase-icon results-phase-icon--r4"><SmileyVeryHappy /></span></span>
          <span className="results-phase-cell results-phase-cell--total">Σ</span>
        </div>
        <PhaseRow label="Before" totals={event.before} />
        <PhaseRow label="During" totals={event.during} />
        <PhaseRow label="After" totals={event.after} />
      </div>

      <div className="results-event-foot">
        <span className="results-event-total">{event.total} {event.total === 1 ? 'vote' : 'votes'}</span>
        <MoodBar event={event} />
      </div>
    </article>
  );
}

function ResultsPage() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!FEEDBACK_URL || FEEDBACK_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
      setError('Backend URL not configured yet. See SETUP-guide.md.');
      setLoading(false);
      return;
    }
    fetch(`${FEEDBACK_URL}?action=summary`)
      .then((res) => res.json())
      .then((json: SummaryResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load results');
        setLoading(false);
      });
  }, []);

  const eventsByDay: Record<string, EventSummary[]> = {};
  if (data) {
    DAY_ORDER.forEach((d) => { eventsByDay[d] = []; });
    data.events.forEach((e) => {
      if (!eventsByDay[e.day]) eventsByDay[e.day] = [];
      eventsByDay[e.day].push(e);
    });
    Object.values(eventsByDay).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
  }

  return (
    <div className="results-page">
      <div className="results-bg" aria-hidden="true" />

      <div className="results-content page-shell--narrow">
        <header className="results-header">
          <div className="results-header-top">
            <Link to="/" className="results-back" aria-label="Back to home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div className="results-header-meta">
              <p className="results-kicker">Moville Festival</p>
              <span className="results-header-date">Feedback dashboard</span>
            </div>
          </div>
          <h1 className="results-title">Results</h1>
          {data && (
            <p className="results-summary">
              {data.totals.count.toLocaleString()} votes across {data.totals.events} events ·
              <span className="results-updated"> updated {new Date(data.updatedAt).toLocaleTimeString()}</span>
            </p>
          )}
        </header>

        {loading && <p className="results-empty">Loading results…</p>}
        {error && <p className="results-empty results-empty--error">{error}</p>}

        {data && data.events.length === 0 && (
          <p className="results-empty">No votes yet. Check back once people start tapping.</p>
        )}

        {data && DAY_ORDER.map((day) => {
          const events = eventsByDay[day] || [];
          if (events.length === 0) return null;
          return (
            <section className="results-day" key={day}>
              <h2 className="results-day-title">{DAY_LABELS[day].toUpperCase()}</h2>
              <div className="results-day-list">
                {events.map((event) => (
                  <EventCard key={event.key} event={event} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default ResultsPage;