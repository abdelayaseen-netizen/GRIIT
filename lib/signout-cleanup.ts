import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryClient } from "@/lib/query-client";
import { captureError, clearSentryUser } from "@/lib/sentry";
import { resetAnalytics } from "@/lib/analytics";
import { cancelAllNotifications } from "@/lib/notifications";
import { clearReconcilePersist } from "@/lib/reconcile-persist";
import { missAckKeysToClear } from "@/lib/morning-after";
import { filterTodaySectionCollapseKeys } from "@/lib/today-section-collapse";

/** Run after `supabase.auth.signOut()` (or with session cleared). Clears React Query, Sentry user, PostHog session, and scheduled notifications. */
export async function runClientSignOutCleanup(userId?: string | null): Promise<void> {
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
    clearReconcilePersist();
  } catch (error) {
    captureError(error, "SignOutCleanup:clearReconcilePersist");
  }
  try {
    await Promise.all(missAckKeysToClear(userId).map((key) => AsyncStorage.removeItem(key)));
  } catch (error) {
    captureError(error, "SignOutCleanup:clearMissAck");
  }
  try {
    const collapseKeys = filterTodaySectionCollapseKeys(await AsyncStorage.getAllKeys(), userId);
    await Promise.all(collapseKeys.map((key) => AsyncStorage.removeItem(key)));
  } catch (error) {
    captureError(error, "SignOutCleanup:clearTodaySectionCollapse");
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
