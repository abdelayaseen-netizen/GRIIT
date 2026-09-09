import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { resolveV2Step, type OnboardingV2Step } from "@/lib/onboarding-v2-routing";

export const ONBOARDING_V2_STEP_KEY = STORAGE_KEYS.ONBOARDING_V2_STEP;

export function resumeOnboardingV2Step(raw: string | null | undefined): OnboardingV2Step {
  return resolveV2Step(raw);
}

export async function loadOnboardingV2Step(): Promise<OnboardingV2Step | null> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_V2_STEP_KEY);
    if (raw == null) return null;
    return resumeOnboardingV2Step(raw);
  } catch {
    return null;
  }
}

export async function persistOnboardingV2Step(step: OnboardingV2Step): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_V2_STEP_KEY, step);
}

export async function clearOnboardingV2Step(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_V2_STEP_KEY);
}
