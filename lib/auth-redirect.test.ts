import { describe, expect, it } from "vitest";
import { resolveAuthRedirect, shouldShowAuthRedirectOverlay } from "@/lib/auth-redirect";

const offOnboarding = {
  inOnboarding: false,
  inAuth: false,
  onCreateProfile: false,
  inTabs: true,
} as const;

const onOnboarding = {
  inOnboarding: true,
  inAuth: false,
  onCreateProfile: false,
  inTabs: false,
} as const;

const ready = {
  loading: false,
  profileChecked: true,
} as const;

describe("resolveAuthRedirect matrix (current AuthRedirector)", () => {
  it("real account + completed → Home (leave onboarding for tabs)", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: true,
        hasLaunched: true,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: true,
        hasLaunched: false,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("real account + not completed → onboarding", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
        hasLaunched: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
        hasLaunched: false,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("anon + completed → Home (leave onboarding for tabs)", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: true,
        hasLaunched: true,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: true,
        hasLaunched: false,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("anon + not completed → onboarding", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: false,
        hasLaunched: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: false,
        hasLaunched: false,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("no session + first launch → onboarding (hasLaunched false)", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        hasLaunched: false,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        hasLaunched: false,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("no session + returning → onboarding (hasLaunched true; same dest as first launch)", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        hasLaunched: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: true,
        hasLaunched: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
  });

  it("hasLaunched null waits — destination is not chosen yet", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        hasLaunched: null,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "wait" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: true,
        hasLaunched: null,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "wait" });
  });

  it("session present + profile not checked waits", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: null,
        hasLaunched: true,
        loading: false,
        profileChecked: false,
        ...offOnboarding,
      })
    ).toEqual({ action: "wait" });
  });
});

describe("shouldShowAuthRedirectOverlay (current spinner)", () => {
  it("shows while loading, while a session waits on profile, or while no session waits on hasLaunched", () => {
    expect(
      shouldShowAuthRedirectOverlay({
        loading: true,
        hasSession: false,
        profileChecked: true,
        hasLaunched: false,
      })
    ).toBe(true);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: true,
        profileChecked: false,
        hasLaunched: null,
      })
    ).toBe(true);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: false,
        profileChecked: true,
        hasLaunched: null,
      })
    ).toBe(true);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: true,
        profileChecked: true,
        hasLaunched: null,
      })
    ).toBe(false);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: false,
        profileChecked: true,
        hasLaunched: false,
      })
    ).toBe(false);
  });
});
