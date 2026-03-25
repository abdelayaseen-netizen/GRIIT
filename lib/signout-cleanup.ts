import { queryClient } from "@/lib/query-client";
import { captureError, clearSentryUser } from "@/lib/sentry";
import { resetAnalytics } from "@/lib/analytics";
import { cancelAllNotifications } from "@/lib/notifications";

/** Run after `supabase.auth.signOut()` (or with session cleared). Clears React Query, Sentry user, PostHog session, and scheduled notifications. */
export async function runClientSignOutCleanup(): Promise<void> {
  try {
    await cancelAllNotifications();
  } catch (error) {
    captureError(error, "SignOutCleanup:cancelNotifications");
  }
  try {
    queryClient.clear();
  } catch (error) {
    captureError(error, "SignOutCleanup:queryClientClear");
  }
  try {
    clearSentryUser();
  } catch (error) {
    captureError(error, "SignOutCleanup:clearSentryUser");
  }
  try {
    resetAnalytics();
  } catch (error) {
    captureError(error, "SignOutCleanup:resetAnalytics");
  }
}
