import { describe, it, expect } from "vitest";
import {
  buildWorkoutReadyGates,
  formatWorkoutReadyHelper,
  resolveWorkoutReadySubtype,
  WORKOUT_READY_HELPER_NO_FLOOR,
  WORKOUT_READY_SUBTYPE_FALLBACK,
} from "./workout-ready-gates";

describe("formatWorkoutReadyHelper", () => {
  it("interpolates the real floor — never hardcodes 20", () => {
    expect(formatWorkoutReadyHelper(15)).toBe(
      "A 15 min minimum turns on the timer."
    );
    expect(formatWorkoutReadyHelper(45)).toBe(
      "A 45 min minimum turns on the timer."
    );
    // Spec mock "20" is only valid when the task floor is actually 20.
    expect(formatWorkoutReadyHelper(20)).toBe(
      "A 20 min minimum turns on the timer."
    );
  });
});

describe("resolveWorkoutReadySubtype", () => {
  it("falls through subtype → label → unit_label → Workout", () => {
    expect(
      resolveWorkoutReadySubtype({ subtype: "Strength", label: "Gym" })
    ).toBe("Strength");
    expect(resolveWorkoutReadySubtype({ label: "Strength" })).toBe("Strength");
    expect(resolveWorkoutReadySubtype({ unit_label: "HIIT" })).toBe("HIIT");
    expect(resolveWorkoutReadySubtype({})).toBe(WORKOUT_READY_SUBTYPE_FALLBACK);
  });
});

describe("buildWorkoutReadyGates", () => {
  it("includes time window when configured", () => {
    expect(
      buildWorkoutReadyGates({
        schedule_window_start: "06:00",
        schedule_window_end: "07:00",
      })
    ).toEqual([
      { key: "time", label: "Time window", sublabel: "06:00 – 07:00" },
    ]);
  });

  it("locks no-floor helper", () => {
    expect(WORKOUT_READY_HELPER_NO_FLOOR).toBe(
      "Log your type and duration. No GPS."
    );
  });
});
