import { describe, expect, it } from "vitest";
import {
  ONBOARDING_V2_ORDER,
  ONBOARDING_V2_PROGRESS_SEGMENTS,
  resolveCompletedLeaveHref,
  resolveOnboardingCompleted,
  resolveOnboardingLaunch,
  resolveV2Step,
  sessionKindFromUser,
  v2ProgressLabel,
  v2SegmentFilled,
} from "@/lib/onboarding-v2-routing";

describe("ONBOARDING_V2_ORDER", () => {
  it("is the v4 list without mode", () => {
    expect(ONBOARDING_V2_ORDER).toEqual([
      "welcome",
      "goals",
      "proof",
      "circle",
      "challenge",
      "reminder",
      "account",
      "invite",
      "dayone",
    ]);
  });

  it("does not include paywall, mode, or commitment", () => {
    expect(ONBOARDING_V2_ORDER.includes("paywall" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
    expect(ONBOARDING_V2_ORDER.includes("mode" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
    expect(ONBOARDING_V2_ORDER.includes("commitment" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
  });

  it("has seven progress segments", () => {
    expect(ONBOARDING_V2_PROGRESS_SEGMENTS).toBe(7);
  });
});

describe("resolveV2Step", () => {
  it("returns a known key unchanged", () => {
    expect(resolveV2Step("goals")).toBe("goals");
    expect(resolveV2Step("dayone")).toBe("dayone");
  });

  it("maps stale Chunk A keys and unknown keys to the renamed step", () => {
    expect(resolveV2Step("why_proof")).toBe("proof");
    expect(resolveV2Step("why_circle")).toBe("circle");
    expect(resolveV2Step("commitment")).toBe("challenge");
    expect(resolveV2Step("first_challenge")).toBe("challenge");
    expect(resolveV2Step("reminders")).toBe("reminder");
    expect(resolveV2Step("profile")).toBe("dayone");
    expect(resolveV2Step("paywall")).toBe("challenge");
    expect(resolveV2Step("nope")).toBe("challenge");
    expect(resolveV2Step(null)).toBe("challenge");
    expect(resolveV2Step(undefined)).toBe("challenge");
  });
});

describe("v2 progress chrome", () => {
  it("fills segment i when step index >= i; Day 1 fills all and reads Done", () => {
    expect(v2SegmentFilled("welcome", 1)).toBe(false);
    expect(v2SegmentFilled("goals", 1)).toBe(true);
    expect(v2SegmentFilled("goals", 2)).toBe(false);
    expect(v2SegmentFilled("invite", 7)).toBe(true);
    expect(v2SegmentFilled("dayone", 1)).toBe(true);
    expect(v2SegmentFilled("dayone", 7)).toBe(true);
    expect(v2ProgressLabel("welcome")).toBe("");
    expect(v2ProgressLabel("goals")).toBe("Step 1/7");
    expect(v2ProgressLabel("invite")).toBe("Step 7/7");
    expect(v2ProgressLabel("dayone")).toBe("Done");
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

  it("real session: db not loaded yet is not completed (overlay stays up)", () => {
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: true,
        dbCompleted: null,
      })
    ).toBe(false);
  });

  it("real session: db fetch error falls back to local || store", () => {
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: false,
        dbCompleted: null,
        dbFetchFailed: true,
      })
    ).toBe(true);
    expect(
      resolveOnboardingCompleted({
        sessionKind: "real",
        localCompleted: false,
        storeCompleted: false,
        dbCompleted: null,
        dbFetchFailed: true,
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

  it("real session, dbCompleted null after error, localCompleted true → home", () => {
    expect(
      resolveOnboardingLaunch({
        sessionKind: "real",
        localCompleted: true,
        storeCompleted: false,
        dbCompleted: null,
        dbFetchFailed: true,
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

  it("completed guest already on Discover is not redirected to Home", () => {
    expect(
      resolveCompletedLeaveHref({
        inOnboarding: false,
        inAuth: false,
        onCreateProfile: false,
        inTabs: true,
        exitHref: "/(tabs)/discover",
      })
    ).toBeNull();
    expect(
      resolveCompletedLeaveHref({
        inOnboarding: true,
        inAuth: false,
        onCreateProfile: false,
        inTabs: false,
        exitHref: "/(tabs)/discover",
      })
    ).toBe("/(tabs)/discover");
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
