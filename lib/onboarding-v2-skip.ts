import { completeOnboardingV2, type CompleteOnboardingResult } from "@/components/onboarding/v2/completeOnboarding";

/** Spec decision 5: any Skip sets onboarding_completed. */
export async function skipOnboardingV2(): Promise<CompleteOnboardingResult> {
  return completeOnboardingV2();
}
