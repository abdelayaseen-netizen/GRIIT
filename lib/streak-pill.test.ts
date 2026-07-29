import { describe, it, expect } from "vitest";
import { formatStreakPillLabel } from "./streak-pill";

describe("formatStreakPillLabel", () => {
  it("uses singular day with no hyphen for 1", () => {
    expect(formatStreakPillLabel(1)).toBe("1 day streak");
  });

  it("keeps singular day for n > 1 (no hyphen)", () => {
    expect(formatStreakPillLabel(23)).toBe("23 day streak");
  });

  it("handles zero", () => {
    expect(formatStreakPillLabel(0)).toBe("0 day streak");
  });

  it("floors non-integers and clamps negatives", () => {
    expect(formatStreakPillLabel(2.9)).toBe("2 day streak");
    expect(formatStreakPillLabel(-3)).toBe("0 day streak");
  });
});
