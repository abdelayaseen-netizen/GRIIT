import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn();
const eq = vi.fn();
const captureError = vi.fn();
const cacheOnboardingCompleted = vi.fn(async () => undefined);
const setKnownOnboardingCompleted = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      update: (...args: unknown[]) => {
        update(...args);
        return { eq };
      },
    }),
  },
}));

vi.mock("@/lib/sentry", () => ({
  captureError: (...args: unknown[]) => captureError(...args),
}));

vi.mock("@/lib/onboarding-completed-cache", () => ({
  cacheOnboardingCompleted: () => cacheOnboardingCompleted(),
}));

vi.mock("@/lib/onboarding-v2-routing", async () => {
  const actual = await vi.importActual<typeof import("@/lib/onboarding-v2-routing")>(
    "@/lib/onboarding-v2-routing"
  );
  return {
    ...actual,
    setKnownOnboardingCompleted: (...args: unknown[]) => setKnownOnboardingCompleted(...args),
  };
});

import {
  interpretProfileCheckResult,
  selfHealOnboardingCompleted,
} from "@/lib/check-profile";

describe("interpretProfileCheckResult", () => {
  it("keeps username for Apple / returning users", () => {
    expect(
      interpretProfileCheckResult({
        user_id: "u1",
        username: "yaseen",
        onboarding_completed: false,
        created_at: "2026-01-01",
      })
    ).toEqual({
      hasProfile: true,
      onboardingCompleted: false,
      username: "yaseen",
      profileCreatedAt: "2026-01-01",
      cacheCompleted: false,
    });
  });

  it("timeout stays null (not incomplete)", () => {
    expect(interpretProfileCheckResult({ timedOut: true })).toEqual({
      hasProfile: false,
      onboardingCompleted: null,
      username: null,
      profileCreatedAt: null,
      cacheCompleted: false,
    });
  });
});

describe("selfHealOnboardingCompleted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eq.mockResolvedValue({ error: null });
  });

  it("writes the flag and logs success", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    await selfHealOnboardingCompleted("user-1");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_completed: true })
    );
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(setKnownOnboardingCompleted).toHaveBeenCalledWith("user-1", true);
    expect(cacheOnboardingCompleted).toHaveBeenCalledOnce();
    expect(info).toHaveBeenCalled();
    info.mockRestore();
  });

  it("captures write errors and does not throw", async () => {
    eq.mockResolvedValue({ error: { message: "rls" } });
    await selfHealOnboardingCompleted("user-1");
    expect(captureError).toHaveBeenCalled();
    expect(setKnownOnboardingCompleted).not.toHaveBeenCalled();
  });
});
