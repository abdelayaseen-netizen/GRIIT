import { beforeEach, describe, expect, it, vi } from "vitest";

const completeOnboardingV2 = vi.fn();

vi.mock("@/components/onboarding/v2/completeOnboarding", () => ({
  completeOnboardingV2: (...args: unknown[]) => completeOnboardingV2(...args),
}));

import { skipOnboardingV2 } from "@/lib/onboarding-v2-skip";

describe("skip-completes", () => {
  beforeEach(() => {
    completeOnboardingV2.mockReset();
    completeOnboardingV2.mockResolvedValue({ ok: true });
  });

  it("sets onboarding_completed via skipOnboardingV2", async () => {
    await skipOnboardingV2();
    expect(completeOnboardingV2).toHaveBeenCalledTimes(1);
  });
});
