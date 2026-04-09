import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { useApp } from "@/contexts/AppContext";

/** Fires once on cold start; must render inside AppProvider. */
export function AnalyticsBootstrap() {
  const { stats, isPremium } = useApp();
  useEffect(() => {
    try {
      track({ name: "app_opened", streak_count: stats?.activeStreak, isPremium });
    } catch {
      /* non-fatal */
    }
    // Intentionally run once on mount (funnel snapshot may be partial before stats load).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
