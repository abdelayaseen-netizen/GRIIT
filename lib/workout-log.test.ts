import { describe, it, expect } from "vitest";
import { formatWorkoutSecuredMeta } from "./workout-log";

describe("formatWorkoutSecuredMeta", () => {
  it("formats Kind · N min", () => {
    expect(formatWorkoutSecuredMeta("Strength", 24)).toBe("Strength · 24 min");
    expect(formatWorkoutSecuredMeta("HIIT", 30.4)).toBe("HIIT · 30 min");
  });

  it("falls back to Workout when kind empty", () => {
    expect(formatWorkoutSecuredMeta("  ", 10)).toBe("Workout · 10 min");
  });
});
