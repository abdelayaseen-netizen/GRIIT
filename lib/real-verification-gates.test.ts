import { describe, it, expect } from "vitest";
import {
  resolveConfigCounterTarget,
  taskHasRealVerificationGates,
} from "./real-verification-gates";

describe("taskHasRealVerificationGates", () => {
  it("journal with a window → overlay", () => {
    expect(
      taskHasRealVerificationGates({
        schedule_window_start: "20:00",
        schedule_window_end: "23:00",
      })
    ).toBe(true);
  });

  it("journal with neither window nor min_words → no overlay", () => {
    expect(taskHasRealVerificationGates({})).toBe(false);
    expect(taskHasRealVerificationGates({ min_words: 0 })).toBe(false);
  });

  it("word floor min_words > 0 is a real gate", () => {
    expect(taskHasRealVerificationGates({ min_words: 150 })).toBe(true);
  });

  it("camera-only live capture is a real gate; require_photo is not", () => {
    expect(
      taskHasRealVerificationGates({ require_camera_only: true })
    ).toBe(true);
    expect(
      taskHasRealVerificationGates({ require_camera_only: false })
    ).toBe(false);
  });

  it("location only when both coords are numeric", () => {
    expect(
      taskHasRealVerificationGates({
        location_latitude: 40.7,
        location_longitude: -74.0,
      })
    ).toBe(true);
    expect(
      taskHasRealVerificationGates({ location_latitude: 40.7 })
    ).toBe(false);
    expect(
      taskHasRealVerificationGates({
        location_latitude: null,
        location_longitude: null,
      })
    ).toBe(false);
  });

  it("counter target > 0 is a real gate; 0 is not (midnight/all_day excluded)", () => {
    expect(taskHasRealVerificationGates({ counter_target: 8 })).toBe(true);
    expect(taskHasRealVerificationGates({ counter_target: 0 })).toBe(false);
  });

  it("photo/run/workout with no window and no camera-only → no overlay", () => {
    expect(taskHasRealVerificationGates({})).toBe(false);
  });
});

describe("resolveConfigCounterTarget", () => {
  it("reads real config fields and never invents 8/10/1", () => {
    expect(resolveConfigCounterTarget({ target_count: 8 })).toBe(8);
    expect(resolveConfigCounterTarget({})).toBe(0);
    expect(resolveConfigCounterTarget({ goal: 0, pages: -1 })).toBe(0);
  });
});
