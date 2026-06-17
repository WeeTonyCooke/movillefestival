import { Link } from 'react-router-dom';
import './SiteFooter.css';

export default function SiteFooter() {
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
      </div>
    </footer>
  );
}
