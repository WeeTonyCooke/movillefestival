import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 * ANT-40: Uses two rAF frames to ensure the scroll fires after React
 * has committed the new route's DOM, avoiding race with layout shifts.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // First frame: React has committed — scroll immediately
    window.scrollTo(0, 0);
    // Second frame: catch any layout-shift reflow that happens post-commit
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
