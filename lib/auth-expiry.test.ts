import { describe, expect, it } from "vitest";
import { sessionExpiredMessageForAuthState } from "@/lib/auth-expiry";

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

  it("stays empty when there is no banner", () => {
    expect(sessionExpiredMessageForAuthState(true, null)).toBeNull();
    expect(sessionExpiredMessageForAuthState(false, null)).toBeNull();
  });
});
