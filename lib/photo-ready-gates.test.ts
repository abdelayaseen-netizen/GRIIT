import { describe, it, expect } from "vitest";
import {
  buildPhotoReadyGates,
  PHOTO_READY_HELPER,
  PHOTO_READY_SUBTYPE,
} from "./photo-ready-gates";

describe("buildPhotoReadyGates", () => {
  it("returns empty when no window and no camera-only", () => {
    expect(buildPhotoReadyGates({})).toEqual([]);
  });

  it("adds time window with formatted range", () => {
    expect(
      buildPhotoReadyGates({
        schedule_window_start: "07:00",
        schedule_window_end: "08:00",
      })
    ).toEqual([
      {
        key: "time",
        label: "Time window",
        sublabel: "07:00 – 08:00",
      },
    ]);
  });

  it("adds camera-only only when require_camera_only is true", () => {
    expect(buildPhotoReadyGates({ require_camera_only: false })).toEqual([]);
    expect(buildPhotoReadyGates({ require_camera_only: true })).toEqual([
      {
        key: "camera",
        label: "Camera only",
        sublabel: "Library blocked",
      },
    ]);
  });

  it("includes both gates when both apply", () => {
    const gates = buildPhotoReadyGates({
      schedule_window_start: "07:00",
      schedule_window_end: "08:00",
      require_camera_only: true,
    });
    expect(gates.map((g) => g.key)).toEqual(["time", "camera"]);
  });
});

describe("photo ready copy constants", () => {
  it("locks helper and subtype strings", () => {
    expect(PHOTO_READY_HELPER).toBe("No timer — shoot when the room is done.");
    expect(PHOTO_READY_SUBTYPE).toBe("Photo proof");
  });
});
