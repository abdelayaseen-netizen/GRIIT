import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
  },
}));

import { ONBOARDING_V2_ORDER } from "@/lib/onboarding-v2-routing";
import {
  ONBOARDING_V2_STEP_KEY,
  clearOnboardingV2Step,
  loadOnboardingV2Step,
  persistOnboardingV2Step,
  resumeOnboardingV2Step,
} from "@/lib/onboarding-v2-step";

describe("ONBOARDING_V2_ORDER", () => {
  it("is welcome, goals, why_proof, why_circle, commitment, first_challenge, reminders, account, profile", () => {
    expect(ONBOARDING_V2_ORDER).toEqual([
      "welcome",
      "goals",
      "why_proof",
      "why_circle",
      "commitment",
      "first_challenge",
      "reminders",
      "account",
      "profile",
    ]);
  });
});

describe("resume-from-storage", () => {
  beforeEach(() => {
    store.clear();
  });

  it("resumes the stored step key after a cold start", async () => {
    await persistOnboardingV2Step("first_challenge");
    expect(store.get(ONBOARDING_V2_STEP_KEY)).toBe("first_challenge");
    expect(await loadOnboardingV2Step()).toBe("first_challenge");
    expect(resumeOnboardingV2Step("why_proof")).toBe("why_proof");
    expect(resumeOnboardingV2Step("challenge")).toBe("first_challenge");
  });
});

describe("skip-completes", () => {
  beforeEach(() => {
    store.clear();
  });

  it("clears the stored step when onboarding_completed is set", async () => {
    await persistOnboardingV2Step("goals");
    await clearOnboardingV2Step();
    expect(store.get(ONBOARDING_V2_STEP_KEY)).toBeUndefined();
    expect(await loadOnboardingV2Step()).toBeNull();
  });
});
