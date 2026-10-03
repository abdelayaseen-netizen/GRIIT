/**
 * OnboardingFlowV2 completion. Writes the DB profiles.onboarding_completed
 * column and caches ONBOARDING_COMPLETED locally (cache only, not a gate).
 */
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import { ROUTES } from "@/lib/routes";
import { setKnownOnboardingCompleted, setOnboardingV2Exit } from "@/lib/onboarding-v2-routing";
import { clearOnboardingV2Step } from "@/lib/onboarding-v2-step";
import { cacheOnboardingCompleted } from "@/lib/onboarding-completed-cache";
import { queryClient } from "@/lib/query-client";
import { invalidateAfterOnboardingJoin } from "@/lib/onboarding-v2-invalidate";

export const ONBOARDING_PERSIST_FAILED = "Couldn't save your setup. Try again.";

export type CompleteOnboardingResult = { ok: true } | { ok: false; message: string };

async function persistCompletedFlag(
  userId: string,
  payload: { onboarding_completed: true; updated_at: string; target_streak?: number }
): Promise<boolean> {
  const { data: row, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("user_id", userId)
    .select("onboarding_completed")
    .maybeSingle();
  if (error) throw error;
  return (row as { onboarding_completed?: boolean } | null)?.onboarding_completed === true;
}

export async function completeOnboardingV2(opts?: { destination?: string }): Promise<CompleteOnboardingResult> {
  setOnboardingV2Exit(opts?.destination ?? ROUTES.TABS);
  const store = useOnboardingStore.getState();
  track({ name: "onboarding_completed" });
  store.setProfileSetupHints(null);

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) {
    return { ok: false, message: ONBOARDING_PERSIST_FAILED };
  }

  const payload: { onboarding_completed: true; updated_at: string; target_streak?: number } = {
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  if (store.targetStreak != null) payload.target_streak = store.targetStreak;

  let wrote = false;
  try {
    wrote = await persistCompletedFlag(userId, payload);
  } catch (e) {
    captureError(e, "OnboardingV2PersistDb");
  }
  if (!wrote) {
    try {
      wrote = await persistCompletedFlag(userId, payload);
    } catch (e) {
      captureError(e, "OnboardingV2PersistDbRetry");
    }
  }
  if (!wrote) {
    return { ok: false, message: ONBOARDING_PERSIST_FAILED };
  }

  setKnownOnboardingCompleted(userId, true);
  store.completeOnboarding();

  try {
    await cacheOnboardingCompleted();
    await clearOnboardingV2Step();
  } catch (e) {
    captureError(e, "OnboardingV2PersistFlag");
  }

  try {
    await invalidateAfterOnboardingJoin(queryClient);
  } catch (e) {
    captureError(e, "OnboardingV2Invalidate");
  }

  return { ok: true };
}
