import { describe, expect, it } from "vitest";
import { setUsageConsentFlag, setUsageTestAccount, usageAllowed } from "./usage-gate";

describe("usage analytics gate", () => {
  it("stays on until an is_test account is marked", () => {
    setUsageTestAccount(false);
    expect(usageAllowed()).toBe(true);
    setUsageTestAccount(true);
    expect(usageAllowed()).toBe(false);
    setUsageTestAccount(false);
  });

  it("turns off when the Settings toggle is off", () => {
    setUsageTestAccount(false);
    setUsageConsentFlag(false);
    expect(usageAllowed()).toBe(false);
    setUsageConsentFlag(true);
    expect(usageAllowed()).toBe(true);
  });
});
