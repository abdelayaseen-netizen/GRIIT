import { describe, it, expect } from "vitest";
import {
  buildWorkoutVerification,
  formatFinishedWindowLabel,
  formatWorkoutSessionLabel,
  formatWorkoutSecuredMeta,
  type WorkoutLogFacts,
} from "./workout-verification";

describe("formatFinishedWindowLabel", () => {
  it("formats inside / outside", () => {
    expect(formatFinishedWindowLabel("06:40", true)).toBe(
      "Finished 06:40 — inside the window"
    );
    expect(formatFinishedWindowLabel("09:00", false)).toBe(
      "Finished 09:00 — outside the window"
    );
  });
});

describe("formatWorkoutSessionLabel", () => {
  it("floor + timer names the floor without claiming it was met", () => {
    const log: WorkoutLogFacts = {
      kind: "Strength",
      duration_min: 24,
      floor_min: 20,
      entry_mode: "timer",
    };
    expect(formatWorkoutSessionLabel(log)).toBe(
      "Strength · 24 min · 20 min floor"
    );
    expect(log.entry_mode).toBe("timer");
  });

  it("no floor + hand uses short copy — entry_mode still on the facts object", () => {
    const log: WorkoutLogFacts = {
      kind: "HIIT",
      duration_min: 30,
      floor_min: null,
      entry_mode: "hand",
    };
    expect(formatWorkoutSessionLabel(log)).toBe("HIIT · 30 min");
    expect(log.entry_mode).toBe("hand");
    expect(formatWorkoutSessionLabel(log)).not.toContain("floor");
  });

  it("never invents over a 0 min floor", () => {
    expect(
      formatWorkoutSessionLabel({
        kind: "Yoga",
        duration_min: 15,
        floor_min: 0,
        entry_mode: "timer",
      })
    ).toBe("Yoga · 15 min");
  });
});

describe("formatWorkoutSecuredMeta", () => {
  it("formats Kind · N min", () => {
    expect(formatWorkoutSecuredMeta("Strength", 24)).toBe("Strength · 24 min");
  });
});

describe("buildWorkoutVerification", () => {
  it("includes window + floor timer session + photo when proven", () => {
    const log: WorkoutLogFacts = {
      kind: "Strength",
      duration_min: 24,
      floor_min: 20,
      entry_mode: "timer",
    };
    const verification = buildWorkoutVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "06:40" },
      workoutLog: log,
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T10:40:00.000Z",
        captured_in_app: true,
      },
    });
    expect(verification.rows).toEqual([
      {
        key: "time_window",
        label: "Finished 06:40 — inside the window",
        verified: true,
        role: "check",
      },
      {
        key: "workout_session",
        label: "Strength · 24 min · 20 min floor",
        verified: true,
        role: "record",
      },
      {
        key: "camera_in_app",
        label: "Marked as captured in-app",
        verified: true,
        role: "record",
      },
    ]);
    // entry_mode always present on persisted facts shape
    expect(log.entry_mode).toBe("timer");
  });

  it("stores entry_mode hand with short copy when no floor", () => {
    const log: WorkoutLogFacts = {
      kind: "Gym",
      duration_min: 40,
      floor_min: null,
      entry_mode: "hand",
    };
    const verification = buildWorkoutVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      workoutLog: log,
      photoPresent: false,
    });
    expect(verification.rows).toEqual([
      {
        key: "workout_session",
        label: "Gym · 40 min",
        verified: true,
        role: "record",
      },
    ]);
    expect(log.entry_mode).toBe("hand");
  });
});
