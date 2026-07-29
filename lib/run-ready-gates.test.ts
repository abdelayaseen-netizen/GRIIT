import { describe, it, expect } from "vitest";
import {
  buildRunReadyGates,
  resolveRunReadySubtype,
  RUN_READY_HELPER,
  RUN_READY_SUBTYPE_FALLBACK,
} from "./run-ready-gates";

describe("resolveRunReadySubtype", () => {
  it("prefers subtype over label and unit_label", () => {
    expect(
      resolveRunReadySubtype({
        subtype: "Outdoor",
        label: "Treadmill",
        unit_label: "km",
      })
    ).toBe("Outdoor");
  });

  it("falls through subtype → label → unit_label → Run", () => {
    expect(resolveRunReadySubtype({ label: "Treadmill" })).toBe("Treadmill");
    expect(resolveRunReadySubtype({ unit_label: "Trail" })).toBe("Trail");
    expect(resolveRunReadySubtype({})).toBe(RUN_READY_SUBTYPE_FALLBACK);
    expect(resolveRunReadySubtype({ subtype: "  " })).toBe(
      RUN_READY_SUBTYPE_FALLBACK
    );
  });
});

describe("buildRunReadyGates", () => {
  it("includes time window when configured", () => {
    const gates = buildRunReadyGates({
      schedule_window_start: "07:00",
      schedule_window_end: "08:00",
    });
    expect(gates).toEqual([
      { key: "time", label: "Time window", sublabel: "07:00 – 08:00" },
    ]);
  });

  it("camera Library blocked when require_camera_only", () => {
    const gates = buildRunReadyGates({ require_camera_only: true });
    expect(gates).toContainEqual({
      key: "camera",
      label: "Camera only",
      sublabel: "Library blocked",
    });
  });

  it("camera If photo is on when require_photo without camera-only", () => {
    const gates = buildRunReadyGates({ require_photo: true });
    expect(gates).toContainEqual({
      key: "camera",
      label: "Camera only",
      sublabel: "If photo is on",
    });
  });

  it("locks helper copy", () => {
    expect(RUN_READY_HELPER).toBe("Distance is typed or timed. No GPS.");
  });
});
