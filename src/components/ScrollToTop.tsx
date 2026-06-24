import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 * ANT-40: global scroll-behavior:smooth on <html> was causing Chromium
 * to land on a residual offset in SPAs. Removed from index.css — this
 * component can now use a simple instant scroll.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
