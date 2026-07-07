import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SiteFooter.css';

const MCA_EMAIL_HREF = 'mailto:hello@quietobjects.ie?subject=Collaboration';
const MCA_TRACE_DURATION_MS = 450;

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
            <span className="site-footer-credit-trace" />
          </span>
          <span className="site-footer-credit-caption">Website by MCA</span>
        </a>
      </div>
    </footer>
  );
}
