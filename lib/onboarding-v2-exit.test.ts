import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureAnonymousSession = vi.fn();
const completeOnboardingV2 = vi.fn();

vi.mock("@/lib/anon-auth", () => ({
  ensureAnonymousSession: (...args: unknown[]) => ensureAnonymousSession(...args),
}));

vi.mock("@/components/onboarding/v2/completeOnboarding", () => ({
  completeOnboardingV2: (...args: unknown[]) => completeOnboardingV2(...args),
}));

import { exitOnboardingV2 } from "@/lib/onboarding-v2-exit";
import { ROUTES } from "@/lib/routes";

describe("exitOnboardingV2", () => {
  beforeEach(() => {
    ensureAnonymousSession.mockReset();
    completeOnboardingV2.mockReset();
  });

  it("browse-all sequence: session then complete then Discover", async () => {
    ensureAnonymousSession.mockResolvedValue({
      kind: "ok",
      user: { id: "anon-1", is_anonymous: true },
      session: {},
      message: null,
      previousAnonUserId: "anon-1",
    });
    completeOnboardingV2.mockResolvedValue(undefined);

    const res = await exitOnboardingV2(ROUTES.TABS_DISCOVER);

    expect(res).toEqual({ ok: true });
    expect(ensureAnonymousSession).toHaveBeenCalledTimes(1);
    expect(completeOnboardingV2).toHaveBeenCalledTimes(1);
    expect(completeOnboardingV2).toHaveBeenCalledWith({ destination: ROUTES.TABS_DISCOVER });
    expect(ensureAnonymousSession.mock.invocationCallOrder[0]).toBeLessThan(
      completeOnboardingV2.mock.invocationCallOrder[0]!
    );
  });

  it("does not complete when the guest session fails", async () => {
    ensureAnonymousSession.mockResolvedValue({
      kind: "offline",
      user: null,
      session: null,
      message: "You're offline. Connect and try again.",
      previousAnonUserId: null,
    });

    const res = await exitOnboardingV2(ROUTES.TABS_DISCOVER);

    expect(res).toEqual({ ok: false, message: "You're offline. Connect and try again." });
    expect(completeOnboardingV2).not.toHaveBeenCalled();
  });
});
