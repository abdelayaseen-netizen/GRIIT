import { queryClient } from "@/lib/query-client";
import { clearSentryUser } from "@/lib/sentry";
import { resetAnalytics } from "@/lib/analytics";
import { cancelAllNotifications } from "@/lib/notifications";

/** Run after `supabase.auth.signOut()` (or with session cleared). Clears React Query, Sentry user, PostHog session, and scheduled notifications. */
export async function runClientSignOutCleanup(): Promise<void> {
  try {
    await cancelAllNotifications();
  } catch {
    // ignore
  }
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
