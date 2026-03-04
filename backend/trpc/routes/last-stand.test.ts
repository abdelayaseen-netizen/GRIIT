import { describe, it, expect } from "vitest";
import {
  MAX_LAST_STANDS,
  shouldEarnLastStand,
  newAvailableAfterEarn,
  newAvailableAfterUse,
} from "../../lib/last-stand";

describe("Last Stand", () => {
  it("MAX_LAST_STANDS is 2", () => {
    expect(MAX_LAST_STANDS).toBe(2);
  });

  it("shouldEarnLastStand: 6/7 secured and 0 available → true", () => {
    expect(shouldEarnLastStand(6, 0)).toBe(true);
    expect(shouldEarnLastStand(7, 0)).toBe(true);
  });

  it("shouldEarnLastStand: 6/7 secured and 1 available → true", () => {
    expect(shouldEarnLastStand(6, 1)).toBe(true);
  });

  it("shouldEarnLastStand: 6/7 secured and 2 available → false (cap)", () => {
    expect(shouldEarnLastStand(6, 2)).toBe(false);
    expect(shouldEarnLastStand(7, 2)).toBe(false);
  });

  it("shouldEarnLastStand: 5/7 secured → false", () => {
    expect(shouldEarnLastStand(5, 0)).toBe(false);
    expect(shouldEarnLastStand(5, 1)).toBe(false);
  });

  it("newAvailableAfterEarn: never exceeds 2", () => {
    expect(newAvailableAfterEarn(0)).toBe(1);
    expect(newAvailableAfterEarn(1)).toBe(2);
    expect(newAvailableAfterEarn(2)).toBe(2);
    expect(newAvailableAfterEarn(10)).toBe(2);
  });

  it("newAvailableAfterUse: never goes below 0", () => {
    expect(newAvailableAfterUse(1)).toBe(0);
    expect(newAvailableAfterUse(2)).toBe(1);
    expect(newAvailableAfterUse(0)).toBe(0);
  });

  it("miss day with 1 Last Stand → use one, streak preserved (logic: newAvailableAfterUse(1) === 0)", () => {
    expect(newAvailableAfterUse(1)).toBe(0);
  });

  it("miss day with 0 Last Stands → cannot use (streak resets in getStats)", () => {
    expect(newAvailableAfterUse(0)).toBe(0);
  });

  it("cannot exceed 2 Last Stands", () => {
    expect(newAvailableAfterEarn(2)).toBe(2);
    expect(shouldEarnLastStand(7, 2)).toBe(false);
  });
});
