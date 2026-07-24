import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 *
 * ANT-40: Temporarily forces scrollBehavior to 'auto' on the root element
 * before scrolling to cancel any in-flight smooth-scroll animation, then
 * restores the CSS value. This is more reliable cross-browser than relying
 * on the `behavior: 'instant'` per-call option, which Chromium does not
 * always honour when a smooth scroll is already mid-animation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    // Restore after one frame so normal smooth-scroll CSS is re-enabled
    const raf = requestAnimationFrame(() => {
      root.style.scrollBehavior = prev;
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
