import { describe, expect, it } from "vitest";
import {
  ONBOARDING_V2_ORDER,
  ONBOARDING_V2_PROGRESS_SEGMENTS,
  resolveCompletedLeaveHref,
  resolveOnboardingCompleted,
  resolveOnboardingLaunch,
  chromeStep,
  resolveV2Step,
  sessionKindFromUser,
  v2ProgressLabel,
  v2SegmentFilled,
} from "@/lib/onboarding-v2-routing";

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

  it("does not include paywall or mode", () => {
    expect(ONBOARDING_V2_ORDER.includes("paywall" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
    expect(ONBOARDING_V2_ORDER.includes("mode" as (typeof ONBOARDING_V2_ORDER)[number])).toBe(false);
  });

  it("has eight progress segments after welcome", () => {
    expect(ONBOARDING_V2_PROGRESS_SEGMENTS).toBe(8);
  });

  it("chromeStep starts at Goals", () => {
    expect(chromeStep("goals")).toBe(0);
    expect(chromeStep("why_proof")).toBe(1);
    expect(chromeStep("why_circle")).toBe(2);
    expect(chromeStep("profile")).toBe(7);
  });
});

describe("resolveV2Step", () => {
  it("returns a known key unchanged", () => {
    expect(resolveV2Step("goals")).toBe("goals");
    expect(resolveV2Step("first_challenge")).toBe("first_challenge");
    expect(resolveV2Step("profile")).toBe("profile");
  });

  it("maps stale v4 keys to Chunk A steps; unknown resumes at welcome", () => {
    expect(resolveV2Step("proof")).toBe("why_proof");
    expect(resolveV2Step("circle")).toBe("why_circle");
    expect(resolveV2Step("challenge")).toBe("first_challenge");
    expect(resolveV2Step("reminder")).toBe("reminders");
    expect(resolveV2Step("invite")).toBe("account");
    expect(resolveV2Step("dayone")).toBe("profile");
    expect(resolveV2Step("paywall")).toBe("first_challenge");
    expect(resolveV2Step("nope")).toBe("welcome");
    expect(resolveV2Step(null)).toBe("welcome");
    expect(resolveV2Step(undefined)).toBe("welcome");
  });
});

describe("v2 progress chrome", () => {
  it("fills segment i when step index >= i; labels stay empty", () => {
    expect(v2SegmentFilled("welcome", 1)).toBe(false);
    expect(v2SegmentFilled("goals", 1)).toBe(true);
    expect(v2SegmentFilled("goals", 2)).toBe(false);
    expect(v2SegmentFilled("account", 7)).toBe(true);
    expect(v2SegmentFilled("profile", 1)).toBe(true);
    expect(v2SegmentFilled("profile", 8)).toBe(true);
    expect(v2ProgressLabel("welcome")).toBe("");
    expect(v2ProgressLabel("goals")).toBe("");
    expect(v2ProgressLabel("profile")).toBe("");
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

function hrefForDest(
  dest: ReturnType<typeof resolveOnboardingLaunch>,
  loc: { inOnboarding: boolean; inAuth: boolean; onCreateProfile: boolean; inTabs: boolean }
): string | null {
  if (dest === "home") return resolveCompletedLeaveHref({ ...loc, exitHref: null });
  if (loc.inOnboarding || loc.inAuth) return null;
  return "/onboarding";
}

describe("resolveOnboardingCompleted", () => {
  it("real session: dbCompleted is the only gate", () => {
    expect(resolveOnboardingCompleted({ sessionKind: "real", dbCompleted: false })).toBe(false);
    expect(resolveOnboardingCompleted({ sessionKind: "real", dbCompleted: true })).toBe(true);
  });

  it("real session: db not loaded yet is not completed (overlay stays up)", () => {
    expect(resolveOnboardingCompleted({ sessionKind: "real", dbCompleted: null })).toBe(false);
  });

  it("guest: only profiles.onboarding_completed, not a local flag", () => {
    expect(resolveOnboardingCompleted({ sessionKind: "guest", dbCompleted: false })).toBe(false);
    expect(resolveOnboardingCompleted({ sessionKind: "guest", dbCompleted: true })).toBe(true);
    expect(resolveOnboardingCompleted({ sessionKind: "guest", dbCompleted: null })).toBe(false);
  });

  it("none is never completed", () => {
    expect(resolveOnboardingCompleted({ sessionKind: "none", dbCompleted: true })).toBe(false);
    expect(resolveOnboardingCompleted({ sessionKind: "none", dbCompleted: null })).toBe(false);
  });
});

describe("AuthRedirector matrix", () => {
  it("real + completed → Home", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: true })).toBe("home");
  });

  it("real + incomplete → resume", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: false })).toBe("resume");
  });

  it("anon + completed → Home", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "guest", dbCompleted: true })).toBe("home");
  });

  it("anon + incomplete → resume", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "guest", dbCompleted: false })).toBe("resume");
  });

  it("none → Welcome", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "none", dbCompleted: null })).toBe("welcome");
    expect(resolveOnboardingLaunch({ sessionKind: "none", dbCompleted: true })).toBe("welcome");
  });

  it("real + DB true + local unset → Home, stable — no second navigation", () => {
    const dest = resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: true });
    expect(dest).toBe("home");
    const first = hrefForDest(dest, {
      inOnboarding: true,
      inAuth: false,
      onCreateProfile: false,
      inTabs: false,
    });
    expect(first).toBe("/(tabs)");
    const second = hrefForDest(dest, {
      inOnboarding: false,
      inAuth: false,
      onCreateProfile: false,
      inTabs: true,
    });
    expect(second).toBeNull();
  });

  it("real + DB false → onboarding", () => {
    const dest = resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: false });
    expect(dest).toBe("resume");
    expect(
      hrefForDest(dest, {
        inOnboarding: false,
        inAuth: false,
        onCreateProfile: false,
        inTabs: true,
      })
    ).toBe("/onboarding");
  });

  it("v1 path with DB true + local unset → Home", () => {
    const dest = resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: true });
    expect(dest).toBe("home");
    expect(
      hrefForDest(dest, {
        inOnboarding: true,
        inAuth: false,
        onCreateProfile: false,
        inTabs: false,
      })
    ).toBe("/(tabs)");
  });
});

describe("resolveOnboardingLaunch", () => {
  it("real account, completed → Home, including a direct /onboarding hit", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: true })).toBe("home");
  });

  it("real session, dbCompleted null is not Home", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: null })).toBe("resume");
  });

  it("real account, dbCompleted false → resume", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "real", dbCompleted: false })).toBe("resume");
  });

  it("guest completed → Home with guest state (not welcome)", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "guest", dbCompleted: true })).toBe("home");
  });

  it("guest not completed → resume", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "guest", dbCompleted: false })).toBe("resume");
  });

  it("no session → Welcome, in flow or not", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "none", dbCompleted: null })).toBe("welcome");
  });

  it("no session stays Welcome even if dbCompleted is true", () => {
    expect(resolveOnboardingLaunch({ sessionKind: "none", dbCompleted: true })).toBe("welcome");
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
    const kinds = ["guest", "real"] as const;
    for (const sessionKind of kinds) {
      expect(resolveOnboardingLaunch({ sessionKind, dbCompleted: true })).toBe("home");
    }
  });
});
