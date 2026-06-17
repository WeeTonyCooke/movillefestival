import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 * Fixes ANT-40 (Ball Drop "Back to festival site" landing mid-page on
 * desktop) at the root, rather than patching each individual link —
 * the same fix prevents the identical issue on any other confirmation
 * screen that navigates back to "/".
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
