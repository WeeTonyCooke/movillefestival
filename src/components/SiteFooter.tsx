import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SiteFooter.css';

const MCA_EMAIL_HREF = 'mailto:hello@quietobjects.ie?subject=Collaboration';
const MCA_TRACE_DURATION_MS = 700;

// Same letterform paths as the static /mca-logo-dark.svg mark, traced as
// strokes here (rather than loaded as an <img>) so CSS can animate
// stroke-dashoffset directly — an externally-loaded SVG can't be
// animated by page styles.
const MCA_LETTER_PATHS = [
  'M327 197L297 252L228 105L102 381L0 381L181 9L275 9L279 13L345 151Z',
  'M366 381L267 381L267 376C300 300 340 150 420 70C460 30 510 0 562 0C630 0 690 30 726 58L726 62L672 120C650 102 610 80 562 81C530 82 500 110 483 137C460 175 420 280 366 381Z',
  'M625 310L641 303L669 272L789 13L793 9L884 9L1065 381L966 381L932 309L771 309L805 237L900 237L840 105L834 109L738 323L698 366L672 381L489 381L460 366L420 329L420 322L462 231L492 278L532 309L562 318L602 318Z',
];

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function SiteFooter() {
  const [tracing, setTracing] = useState(false);

  useEffect(() => {
    if (!tracing) return undefined;

    const timer = window.setTimeout(() => {
      setTracing(false);
      window.location.href = MCA_EMAIL_HREF;
    }, MCA_TRACE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [tracing]);

  const handleMcaClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (prefersReducedMotion()) return;

    event.preventDefault();
    if (!tracing) setTracing(true);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-copy">
          Moville Summer Festival 2026 · movillefestival.com
        </span>
        <nav className="site-footer-links" aria-label="Legal">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="site-footer-dot" aria-hidden="true">·</span>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </nav>
        <a
          className={`site-footer-credit ${tracing ? 'site-footer-credit--tracing' : ''}`.trim()}
          href={MCA_EMAIL_HREF}
          aria-label="Email MCA about web development and collaboration"
          onClick={handleMcaClick}
        >
          <span className="site-footer-credit-mark" aria-hidden="true">
            <img
              className="site-footer-credit-logo"
              src="/mca-logo-dark.svg"
              alt=""
              width="34"
              height="12"
            />
            <svg
              className="site-footer-credit-trace-svg"
              viewBox="0 0 1065 381"
              preserveAspectRatio="xMidYMid meet"
              focusable="false"
            >
              <defs>
                <linearGradient
                  id="site-footer-mca-trace-gradient"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="1065"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#E4B65A" />
                  <stop offset="45%" stopColor="#6FBF9B" />
                  <stop offset="75%" stopColor="#4E8FBF" />
                  <stop offset="100%" stopColor="#B08AC9" />
                </linearGradient>
              </defs>
              <g className="site-footer-credit-trace-strokes">
                {MCA_LETTER_PATHS.map((d) => (
                  <path key={d.slice(0, 8)} d={d} pathLength={100} />
                ))}
              </g>
              <path
                className="site-footer-credit-sparkle"
                d="M955,230 L972.5,282.5 L1025,300 L972.5,317.5 L955,370 L937.5,317.5 L885,300 L937.5,282.5 Z"
              />
            </svg>
          </span>
          <span className="site-footer-credit-caption">Website by MCA</span>
        </a>
      </div>
    </footer>
  );
}
