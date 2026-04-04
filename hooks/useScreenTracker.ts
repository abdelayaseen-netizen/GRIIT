import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { trackEvent } from "@/lib/analytics";

/**
 * Automatic screen tracking for PostHog.
 * Fires "screen_viewed" on every route change.
 * Call once in root layout — covers all screens automatically.
 */
export function useScreenTracker() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === previousPath.current) return;
    previousPath.current = pathname;

    try {
      trackEvent("screen_viewed", {
        screen_name: pathname,
        screen_pattern: pathname
          .replace(/\/[a-f0-9-]{20,}/gi, "/[id]")
          .replace(/\/[0-9]+/g, "/[id]"),
      });
    } catch {
      /* non-fatal */
    }
  }, [pathname]);
}
