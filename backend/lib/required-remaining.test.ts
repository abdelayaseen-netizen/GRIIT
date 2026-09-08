import { describe, expect, it } from "vitest";
import { requiredRemainingCount } from "./required-remaining";

describe("requiredRemainingCount", () => {
  it("is 0 when every required task is done (1 of 1)", () => {
    expect(requiredRemainingCount(1, 1)).toBe(0);
  });

  it("is never undefined", () => {
    expect(requiredRemainingCount(0, 0)).toBe(0);
    expect(typeof requiredRemainingCount(3, 1)).toBe("number");
  });
});
