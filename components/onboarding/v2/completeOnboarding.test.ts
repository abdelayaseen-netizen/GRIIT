import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const maybeSingle = vi.fn();
const captureError = vi.fn();
const completeOnboarding = vi.fn();
const setProfileSetupHints = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: (...args: unknown[]) => getUser(...args) },
    from: () => ({
      update: (...args: unknown[]) => {
        update(...args);
        return {
          eq: (...eqArgs: unknown[]) => {
            eq(...eqArgs);
            return {
              select: (...selArgs: unknown[]) => {
                select(...selArgs);
                return { maybeSingle };
              },
            };
          },
        };
      },
    }),
  },
}));

vi.mock("@/store/onboardingStore", () => ({
  useOnboardingStore: {
    getState: () => ({
      targetStreak: null,
      setProfileSetupHints,
      completeOnboarding,
    }),
  },
}));

vi.mock("@/lib/sentry", () => ({ captureError: (...args: unknown[]) => captureError(...args) }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/onboarding-v2-routing", () => ({
  setKnownOnboardingCompleted: vi.fn(),
  setOnboardingV2Exit: vi.fn(),
}));
vi.mock("@/lib/onboarding-v2-step", () => ({ clearOnboardingV2Step: vi.fn() }));
vi.mock("@/lib/onboarding-completed-cache", () => ({ cacheOnboardingCompleted: vi.fn() }));
vi.mock("@/lib/query-client", () => ({ queryClient: {} }));
vi.mock("@/lib/onboarding-v2-invalidate", () => ({
  invalidateAfterOnboardingJoin: vi.fn(),
}));

import {
  ONBOARDING_PERSIST_FAILED,
  completeOnboardingV2,
} from "@/components/onboarding/v2/completeOnboarding";

describe("completeOnboardingV2 write failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  });

  it("retries once then stays when the write still fails", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: { message: "rls" } });
    const result = await completeOnboardingV2();
    expect(result).toEqual({ ok: false, message: ONBOARDING_PERSIST_FAILED });
    expect(update).toHaveBeenCalledTimes(2);
    expect(completeOnboarding).not.toHaveBeenCalled();
  });

  it("succeeds on the retry", async () => {
    maybeSingle
      .mockResolvedValueOnce({ data: null, error: { message: "flaky" } })
      .mockResolvedValueOnce({ data: { onboarding_completed: true }, error: null });
    const result = await completeOnboardingV2();
    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledTimes(2);
    expect(completeOnboarding).toHaveBeenCalledOnce();
  });
});
