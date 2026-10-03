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
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: true,
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
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
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
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: true,
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
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: false,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("no session → onboarding", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: null,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "stay" });
    expect(
      resolveAuthRedirect({
        sessionKind: "none",
        onboardingCompleted: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
  });

  it("Apple login with username + flag false → Home", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
        username: "yaseen",
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
        username: "yaseen",
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "stay" });
  });

  it("new guest with username + flag false → onboarding", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: false,
        username: "user_39dc1993",
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
  });

  it("null after timeout → retry, never onboarding", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: null,
        username: null,
        cacheCompleted: false,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "retry" });
    expect(
      resolveAuthRedirect({
        sessionKind: "guest",
        onboardingCompleted: null,
        cacheCompleted: false,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "retry" });
  });

  it("null + local cache prefers Home; cache never skips a known-new account", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: null,
        cacheCompleted: true,
        ...ready,
        ...onOnboarding,
      })
    ).toEqual({ action: "replace", href: "/(tabs)" });
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: false,
        username: null,
        cacheCompleted: true,
        ...ready,
        ...offOnboarding,
      })
    ).toEqual({ action: "replace", href: "/onboarding" });
  });

  it("session present + profile not checked waits", () => {
    expect(
      resolveAuthRedirect({
        sessionKind: "real",
        onboardingCompleted: null,
        loading: false,
        profileChecked: false,
        ...offOnboarding,
      })
    ).toEqual({ action: "wait" });
  });
});

describe("shouldShowAuthRedirectOverlay (current spinner)", () => {
  it("shows while loading, or while a session waits on profile", () => {
    expect(
      shouldShowAuthRedirectOverlay({
        loading: true,
        hasSession: false,
        profileChecked: true,
      })
    ).toBe(true);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: true,
        profileChecked: false,
      })
    ).toBe(true);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: false,
        profileChecked: true,
      })
    ).toBe(false);
    expect(
      shouldShowAuthRedirectOverlay({
        loading: false,
        hasSession: true,
        profileChecked: true,
      })
    ).toBe(false);
  });
});
