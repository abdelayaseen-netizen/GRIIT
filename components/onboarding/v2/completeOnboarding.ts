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

export async function completeOnboardingV2(opts?: { destination?: string }): Promise<void> {
  setOnboardingV2Exit(opts?.destination ?? ROUTES.TABS);
  const store = useOnboardingStore.getState();
  track({ name: "onboarding_completed" });
  store.setProfileSetupHints(null);

  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (userId) {
      const payload: { onboarding_completed: true; updated_at: string; target_streak?: number } = {
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };
      if (store.targetStreak != null) payload.target_streak = store.targetStreak;
      const { data: row, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", userId)
        .select("onboarding_completed")
        .maybeSingle();
      if (error) throw error;
      if ((row as { onboarding_completed?: boolean } | null)?.onboarding_completed === true) {
        setKnownOnboardingCompleted(userId, true);
        store.completeOnboarding();
      }
    }
  } catch (e) {
    captureError(e, "OnboardingV2PersistDb");
  }

  try {
    await cacheOnboardingCompleted();
    await clearOnboardingV2Step();
  } catch (e) {
    captureError(e, "OnboardingV2PersistFlag");
  }
}
