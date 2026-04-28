import { describe, it, expect } from "vitest";
import { getDailyTarget } from "@/lib/task-progress";

describe("getDailyTarget", () => {
  const fixed = {
    target_mode: "fixed",
    start_value: 1,
    target_value: 100,
    start_duration_minutes: null,
    duration_minutes: 30,
  };

  it("fixed mode returns end targets unchanged", () => {
    expect(getDailyTarget(fixed, 1, 30)).toEqual({
      targetValue: 100,
      durationMinutes: 30,
    });
  });

  it("ramp day 1 returns startValue", () => {
    const ramp = {
      target_mode: "ramp",
      start_value: 1,
      target_value: 10,
      start_duration_minutes: null,
      duration_minutes: null,
    };
    expect(getDailyTarget(ramp, 1, 10, "int").targetValue).toBe(1);
  });

  it("ramp last day returns end targetValue", () => {
    const ramp = {
      target_mode: "ramp",
      start_value: 1,
      target_value: 10,
      start_duration_minutes: null,
      duration_minutes: null,
    };
    expect(getDailyTarget(ramp, 10, 10, "int").targetValue).toBe(10);
  });

  it("ramp midpoint interpolates (int)", () => {
    const ramp = {
      target_mode: "ramp",
      start_value: 0,
      target_value: 10,
      start_duration_minutes: null,
      duration_minutes: null,
    };
    // 5 of 5 days: progress = 1, day 3 of 5: n=3, total=5 -> progress = 0.5
    const mid = getDailyTarget(ramp, 3, 5, "int");
    expect(mid.targetValue).toBe(5);
  });
});
