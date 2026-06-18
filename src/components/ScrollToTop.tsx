import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top on every route change.
 * Fixes ANT-40 (Ball Drop "Back to festival site" landing mid-page on
 * desktop) at the root, rather than patching each individual link —
 * the same fix prevents the identical issue on any other confirmation
 * screen that navigates back to "/".
 *
 * Hardened (session 9, 18 June 2026): passing `behavior: 'instant'` to
 * window.scrollTo() is supposed to override the global
 * `html { scroll-behavior: smooth }` rule, but this is a single-page app —
 * the window/html scroller persists across route changes rather than being
 * a fresh page, so an in-flight smooth scroll from just before navigation
 * can still be animating when this fires. Chromium doesn't always cancel
 * that cleanly against a same-tick `behavior: 'instant'` call, landing on a
 * small residual offset instead of 0. Toggling scroll-behavior to 'auto' at
 * the element level for the duration of the reset is the more reliable
 * cross-browser pattern — it forces every pending scroll on that element to
 * resolve instantly rather than relying on per-call animation cancellation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const reset = () => {
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      body.scrollTop = 0;
    };

    reset();

    const raf = window.requestAnimationFrame(() => {
      reset();
      window.setTimeout(() => {
        reset();
        root.style.scrollBehavior = previousRootBehavior;
        body.style.scrollBehavior = previousBodyBehavior;
      }, 0);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
