import { completeOnboardingV2 } from "@/components/onboarding/v2/completeOnboarding";
import { clearOnboardingV2Step } from "@/lib/onboarding-v2-step";

/** Spec decision 5: any Skip sets onboarding_completed. */
export async function skipOnboardingV2(): Promise<void> {
  await clearOnboardingV2Step();
  await completeOnboardingV2();
}
