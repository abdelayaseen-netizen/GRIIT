import { describe, expect, it } from "vitest";
import {
  ONBOARDING_V2_ORDER,
  resolveOnboardingCompleted,
  resolveOnboardingLaunch,
  resolveV2Step,
  sessionKindFromUser,
} from "@/lib/onboarding-v2-routing";

describe("ONBOARDING_V2_ORDER", () => {
  it("is the spec's nine screens in locked order", () => {
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

  it("does not include paywall", () => {
    expect(ONBOARDING_V2_ORDER.includes("paywall" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
  });
});

describe("resolveV2Step", () => {
  it("returns a known key unchanged", () => {
    expect(resolveV2Step("goals")).toBe("goals");
    expect(resolveV2Step("profile")).toBe("profile");
  });

  it("maps stale paywall and unknown keys to first_challenge", () => {
    expect(resolveV2Step("paywall")).toBe("first_challenge");
    expect(resolveV2Step("nope")).toBe("first_challenge");
    expect(resolveV2Step(null)).toBe("first_challenge");
    expect(resolveV2Step(undefined)).toBe("first_challenge");
  });
});

describe("sessionKindFromUser", () => {
  it("classifies none / guest / real", () => {
    expect(sessionKindFromUser(null)).toBe("none");
    expect(sessionKindFromUser({ is_anonymous: true })).toBe("guest");
    expect(sessionKindFromUser({ is_anonymous: false })).toBe("real");
    expect(sessionKindFromUser({})).toBe("real");
  });
});

describe("resolveOnboardingCompleted", () => {
  it("real session: dbCompleted is authoritative when loaded", () => {
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: false,
      })
    ).toBe(false);
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: true,
      })
    ).toBe(true);
  });

  it("real session: db not loaded is not completed", () => {
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: null,
      })
    ).toBe(false);
  });

  it("guest and none: local OR store OR db", () => {
    expect(
      resolveOnboardingCompleted({
        sessionKind: "guest",
        localCompleted: true,
        storeCompleted: false,
        dbCompleted: false,
      })
    ).toBe(true);
    expect(
      resolveOnboardingCompleted({
        sessionKind: "none",
        localCompleted: false,
        storeCompleted: true,
        dbCompleted: null,
      })
    ).toBe(true);
    expect(
      resolveOnboardingCompleted({
        sessionKind: "guest",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: true,
      })
    ).toBe(true);
    expect(
      resolveOnboardingCompleted({
        sessionKind: "none",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: null,
      })
    ).toBe(false);
  });
});

describe("resolveOnboardingLaunch", () => {
  it("real account, completed → Home, including a direct /onboarding hit", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "real",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: true,
        inOnboarding: false,
      })
    ).toBe("home");
    expect(
      resolveOnboardingLaunch({
        sessionKind: "real",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: true,
        inOnboarding: true,
      })
    ).toBe("home");
  });

  it("real account, dbCompleted false, localCompleted true → resume", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: false,
        inOnboarding: false,
      })
    ).toBe("resume");
    expect(
      resolveOnboardingLaunch({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: false,
        inOnboarding: true,
      })
    ).toBe("resume");
  });

  it("guest completed → Home with guest state (not welcome)", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "guest",
        localCompleted: true,
        storeCompleted: false,
        dbCompleted: true,
        inOnboarding: false,
      })
    ).toBe("home");
    expect(
      resolveOnboardingLaunch({
        sessionKind: "guest",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: null,
        inOnboarding: true,
      })
    ).toBe("home");
  });

  it("guest not completed → resume", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "guest",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: false,
        inOnboarding: false,
      })
    ).toBe("resume");
  });

  it("no session, not completed → Welcome; in-flow → resume", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "none",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: null,
        inOnboarding: false,
      })
    ).toBe("welcome");
    expect(
      resolveOnboardingLaunch({
        sessionKind: "none",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: null,
        inOnboarding: true,
      })
    ).toBe("resume");
  });

  it("no session, completed → Home even if they hit /onboarding", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "none",
        localCompleted: true,
        storeCompleted: false,
        dbCompleted: null,
        inOnboarding: true,
      })
    ).toBe("home");
  });

  it("completed never routes back to welcome (no redirect loop)", () => {
    const kinds = ["none", "guest", "real"] as const;
    for (const sessionKind of kinds) {
      const dest = resolveOnboardingLaunch({
        sessionKind,
        localCompleted: sessionKind !== "real",
        storeCompleted: sessionKind !== "real",
        dbCompleted: sessionKind === "real" ? true : null,
        inOnboarding: false,
      });
      expect(dest).toBe("home");
      expect(
        resolveOnboardingLaunch({
          sessionKind,
          localCompleted: sessionKind !== "real",
          storeCompleted: sessionKind !== "real",
          dbCompleted: sessionKind === "real" ? true : null,
          inOnboarding: true,
        })
      ).toBe("home");
    }
  });
});
