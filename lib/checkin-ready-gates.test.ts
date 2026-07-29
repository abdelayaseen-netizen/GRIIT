import { describe, it, expect } from "vitest";
import {
  buildCheckinReadyGates,
  formatCheckinWithinLabel,
  resolveCheckinRadiusMeters,
  CHECKIN_RADIUS_DEFAULT_M,
  CHECKIN_READY_HELPER,
} from "./checkin-ready-gates";

describe("resolveCheckinRadiusMeters", () => {
  it("uses real radius; defaults to 200 when null/0 — never 50", () => {
    expect(resolveCheckinRadiusMeters(150)).toBe(150);
    expect(resolveCheckinRadiusMeters(null)).toBe(CHECKIN_RADIUS_DEFAULT_M);
    expect(resolveCheckinRadiusMeters(undefined)).toBe(200);
    expect(resolveCheckinRadiusMeters(0)).toBe(200);
    expect(formatCheckinWithinLabel(null)).toBe("Within 200 m");
    expect(formatCheckinWithinLabel(50)).toBe("Within 50 m"); // real config 50 ok
  });
});

describe("buildCheckinReadyGates", () => {
  it("includes window + Within N m from real radius", () => {
    const gates = buildCheckinReadyGates({
      schedule_window_start: "06:00",
      schedule_window_end: "08:00",
      location_radius_meters: 200,
    });
    expect(gates.map((g) => g.key)).toEqual(["time", "location"]);
    expect(gates[1]?.label).toBe("Within 200 m");
  });

  it("defaults location row to 200 when radius null", () => {
    expect(
      buildCheckinReadyGates({ location_radius_meters: null })[0]?.label
    ).toBe("Within 200 m");
  });
});

describe("checkin ready helper", () => {
  it("locks helper copy", () => {
    expect(CHECKIN_READY_HELPER).toBe("Range is checked. No photo needed.");
  });
});
