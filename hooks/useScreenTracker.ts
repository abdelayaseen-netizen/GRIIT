import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { trackEvent, trackUsage } from "@/lib/analytics";

/**
 * Automatic screen tracking for PostHog.
 * Fires "screen_viewed" on every route change.
 * Call once in root layout — covers all screens automatically.
 */
export function useScreenTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const enteredAt = useRef<number>(Date.now());

  useEffect(() => {
    if (pathname === previousPath.current) return;
    const route = pathname
      .replace(/\/[a-f0-9-]{20,}/gi, "/[id]")
      .replace(/\/[0-9]+/g, "/[id]");
    const seconds = Math.max(0, Math.round((Date.now() - enteredAt.current) / 1000));
    const previous = previousPath.current;
    previousPath.current = pathname;
    enteredAt.current = Date.now();

    try {
      trackEvent("screen_viewed", { screen_name: route, screen_pattern: route });
      if (previous) trackUsage("screen_view", { route, seconds_on_previous_screen: seconds });
    } catch {
      /* non-fatal */
    }
  }, [pathname]);
}
