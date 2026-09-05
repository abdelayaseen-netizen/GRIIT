import { describe, expect, it } from "vitest";
import {
  accountNameContinueDecision,
  accountNameSkipDecision,
  shouldShowAccountNameStep,
} from "@/lib/onboarding-v2-account-name";

describe("account name sub-step", () => {
  it("shows only after Apple / Create account — never Skip or guest", () => {
    expect(shouldShowAccountNameStep("auth_success")).toBe(true);
    expect(shouldShowAccountNameStep("skip")).toBe(false);
    expect(shouldShowAccountNameStep("guest")).toBe(false);
  });

  it("skip persists nothing", () => {
    expect(accountNameSkipDecision()).toEqual({ persist: false });
  });

  it("continue persists trimmed display name and normalized username", () => {
    expect(
      accountNameContinueDecision({ displayName: "  Yaseen  ", username: "Yaseen_OK" })
    ).toEqual({ persist: true, displayName: "Yaseen", username: "yaseen_ok" });
  });

  it("continue rejects a short username", () => {
    const result = accountNameContinueDecision({ displayName: "Yaseen", username: "ab" });
    expect(result.persist).toBe(false);
    expect("error" in result && result.error).toMatch(/3/i);
  });
});
