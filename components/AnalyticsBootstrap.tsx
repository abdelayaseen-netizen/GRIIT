import { useEffect } from "react";
import { loadUsageConsent, setUsageTestAccount, track } from "@/lib/analytics";
import { useApp } from "@/contexts/AppContext";

/** Fires once on cold start; must render inside AppProvider. */
export function AnalyticsBootstrap() {
  const { stats, isPremium, profile } = useApp();
  useEffect(() => {
    const isTest = (profile as { is_test?: boolean } | null)?.is_test === true;
    setUsageTestAccount(isTest);
    void loadUsageConsent().then(() => {
      if (isTest) return;
      try {
        const created = (profile as { created_at?: string } | null)?.created_at;
        const days = created ? Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / 86400000)) : undefined;
        track({ name: "app_opened", streak_count: stats?.activeStreak ?? undefined, isPremium, days_since_signup: days });
      } catch {
        /* non-fatal */
      }
    });
    // One open per mount, including later days. Consent and is_test are read first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
