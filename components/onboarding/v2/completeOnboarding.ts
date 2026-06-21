/**
 * OnboardingFlowV2 completion. Writes BOTH the local STORAGE_KEYS.ONBOARDING_COMPLETED
 * flag and the DB profiles.onboarding_completed column (same path the existing
 * AutoSuggestChallengeScreen uses), plus the persisted store state. Not store-only.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { useOnboardingStore } from "@/store/onboardingStore";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";

export async function completeOnboardingV2(): Promise<void> {
  const store = useOnboardingStore.getState();
  track({ name: "onboarding_completed" });
  store.completeOnboarding();
  store.setProfileSetupHints(null);

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
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
