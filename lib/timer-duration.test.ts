import { describe, expect, it } from "vitest";
import { timerDurationMinutes, timerRequiredSeconds } from "@/lib/timer-duration";

describe("timerDurationMinutes", () => {
  it("uses nested duration_minutes when min_duration is missing (Morning Prayer)", () => {
    expect(timerDurationMinutes({ duration_minutes: 5 })).toBe(5);
    expect(timerRequiredSeconds({ duration_minutes: 5 })).toBe(300);
  });

  it("prefers min_duration_minutes over duration_minutes", () => {
    expect(timerDurationMinutes({ min_duration_minutes: 5, duration_minutes: 10 })).toBe(5);
  });

  it("falls back to 10 when nothing is set", () => {
    expect(timerDurationMinutes({})).toBe(10);
    expect(timerRequiredSeconds({})).toBe(600);
  });
});
