import { describe, expect, it } from "vitest";
import {
  isRealNonAnonymousSession,
  surfaceAccountAuthKind,
  surfaceCaughtAuthError,
} from "@/lib/onboarding-v2-account-session";

const session = { access_token: "t" } as never;

describe("isRealNonAnonymousSession", () => {
  it("rejects missing session, missing user, and anonymous users", () => {
    expect(isRealNonAnonymousSession({ id: "u1", is_anonymous: false } as never, session)).toBe(true);
    expect(isRealNonAnonymousSession({ id: "u1", is_anonymous: true } as never, session)).toBe(false);
    expect(isRealNonAnonymousSession({ id: "u1", is_anonymous: false } as never, null)).toBe(false);
    expect(isRealNonAnonymousSession(null, session)).toBe(false);
  });
});

describe("surfaceAccountAuthKind", () => {
  it("maps every failure kind and never swallows", () => {
    expect(surfaceAccountAuthKind("identity_taken", "taken")).toEqual({ kind: "email_taken" });
    expect(surfaceAccountAuthKind("offline", "You're offline. Connect and try again.")).toEqual({
      kind: "message",
      message: "Network error. Check your connection and try again.",
    });
    expect(surfaceAccountAuthKind("no_anon_session", null).kind).toBe("message");
    expect(surfaceAccountAuthKind("provider_error", "Email not confirmed")).toEqual({
      kind: "message",
      message: "Please confirm your email address first. Check your inbox.",
    });
    expect(surfaceAccountAuthKind("cancelled", "x")).toEqual({ kind: "silent" });
  });
});

describe("surfaceCaughtAuthError", () => {
  it("maps known errors and falls back", () => {
    expect(surfaceCaughtAuthError(new Error("invalid login credentials"))).toMatch(/invalid email or password/i);
    expect(surfaceCaughtAuthError("nope")).toMatch(/try again/i);
  });
});
