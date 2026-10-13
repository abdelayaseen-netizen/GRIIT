import type { CompleteOnboardingResult } from "@/components/onboarding/v2/completeOnboarding";
import { exitOnboardingV2 } from "@/lib/onboarding-v2-exit";
import { ROUTES } from "@/lib/routes";

/** Spec decision 5: any Skip sets onboarding_completed, on a real anonymous user. */
export async function skipOnboardingV2(): Promise<CompleteOnboardingResult> {
  return exitOnboardingV2(ROUTES.TABS);
}
