import { describe, expect, it } from "vitest";
import {
  sessionExpiredMessageForAuthState,
  shouldNotifySessionExpired,
} from "@/lib/auth-expiry";

describe("sessionExpiredMessageForAuthState", () => {
  it("clears the banner when auth state becomes signed-in", () => {
    expect(
      sessionExpiredMessageForAuthState(true, "Session expired. Please sign in again."),
    ).toBeNull();
  });

  it("keeps the banner while signed out", () => {
    expect(
      sessionExpiredMessageForAuthState(false, "Session expired. Please sign in again."),
    ).toBe("Session expired. Please sign in again.");
  });

  it("does not treat a signed-out 401 as expiry", () => {
    expect(shouldNotifySessionExpired(false)).toBe(false);
    expect(shouldNotifySessionExpired(true)).toBe(true);
  });

  it("stays empty when there is no banner", () => {
    expect(sessionExpiredMessageForAuthState(true, null)).toBeNull();
    expect(sessionExpiredMessageForAuthState(false, null)).toBeNull();
  });
});
