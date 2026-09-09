import { beforeEach, describe, expect, it, vi } from "vitest";

const completeOnboardingV2 = vi.fn();
const clearOnboardingV2Step = vi.fn();

vi.mock("@/components/onboarding/v2/completeOnboarding", () => ({
  completeOnboardingV2: (...args: unknown[]) => completeOnboardingV2(...args),
}));

vi.mock("@/lib/onboarding-v2-step", () => ({
  clearOnboardingV2Step: (...args: unknown[]) => clearOnboardingV2Step(...args),
}));

import { skipOnboardingV2 } from "@/lib/onboarding-v2-skip";

describe("skip-completes", () => {
  beforeEach(() => {
    completeOnboardingV2.mockReset();
    clearOnboardingV2Step.mockReset();
    completeOnboardingV2.mockResolvedValue(undefined);
    clearOnboardingV2Step.mockResolvedValue(undefined);
  });

  it("sets onboarding_completed via skipOnboardingV2", async () => {
    await skipOnboardingV2();
    expect(clearOnboardingV2Step).toHaveBeenCalledTimes(1);
    expect(completeOnboardingV2).toHaveBeenCalledTimes(1);
  });
});
