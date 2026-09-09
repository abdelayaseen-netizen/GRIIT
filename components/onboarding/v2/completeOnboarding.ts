/**
 * OnboardingFlowV2 completion. Writes the DB profiles.onboarding_completed
 * column and caches ONBOARDING_COMPLETED locally (cache only, not a gate).
 */
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import { ROUTES } from "@/lib/routes";
import { setOnboardingV2Exit } from "@/lib/onboarding-v2-routing";
import { clearOnboardingV2Step } from "@/lib/onboarding-v2-step";
import { cacheOnboardingCompleted } from "@/lib/onboarding-completed-cache";

export async function completeOnboardingV2(opts?: { destination?: string }): Promise<void> {
  setOnboardingV2Exit(opts?.destination ?? ROUTES.TABS);
  const store = useOnboardingStore.getState();
  track({ name: "onboarding_completed" });
  store.completeOnboarding();
  store.setProfileSetupHints(null);

  try {
    await cacheOnboardingCompleted();
    await clearOnboardingV2Step();
  } catch (e) {
    captureError(e, "OnboardingV2PersistFlag");
  }

  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (userId) {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }
  } catch (e) {
    captureError(e, "OnboardingV2PersistDb");
  }
}
