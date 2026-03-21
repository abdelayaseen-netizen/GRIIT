import { queryClient } from "@/lib/query-client";
import { clearSentryUser } from "@/lib/sentry";
import { resetAnalytics } from "@/lib/analytics";

/** Run after `supabase.auth.signOut()` (or with session cleared). Clears React Query, Sentry user, and PostHog session. */
export function runClientSignOutCleanup(): void {
  try {
    queryClient.clear();
  } catch {
    // ignore
  }
  try {
    clearSentryUser();
  } catch {
    // ignore
  }
  try {
    resetAnalytics();
  } catch {
    // ignore
  }
}
