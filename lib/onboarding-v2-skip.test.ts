import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureAnonymousSession = vi.fn();
const completeOnboardingV2 = vi.fn();

vi.mock("@/lib/anon-auth", () => ({
  ensureAnonymousSession: (...args: unknown[]) => ensureAnonymousSession(...args),
}));

vi.mock("@/components/onboarding/v2/completeOnboarding", () => ({
  completeOnboardingV2: (...args: unknown[]) => completeOnboardingV2(...args),
}));

import { skipOnboardingV2 } from "@/lib/onboarding-v2-skip";

describe("skip-completes", () => {
  beforeEach(() => {
    ensureAnonymousSession.mockReset();
    completeOnboardingV2.mockReset();
    ensureAnonymousSession.mockResolvedValue({
      kind: "ok",
      user: { id: "anon-1", is_anonymous: true },
      session: {},
      message: null,
      previousAnonUserId: "anon-1",
    });
    completeOnboardingV2.mockResolvedValue({ ok: true });
  });

  it("mints a real anonymous user before marking onboarding complete", async () => {
    await skipOnboardingV2();
    expect(ensureAnonymousSession).toHaveBeenCalledTimes(1);
    expect(completeOnboardingV2).toHaveBeenCalledTimes(1);
    expect(ensureAnonymousSession.mock.invocationCallOrder[0]).toBeLessThan(
      completeOnboardingV2.mock.invocationCallOrder[0]!
    );
  });
});
