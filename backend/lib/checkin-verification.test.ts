import { describe, it, expect } from "vitest";
import {
  buildCheckinVerification,
  formatArrivedWindowLabel,
  formatCheckinSecuredMeta,
  formatOnLocationLabel,
} from "./checkin-verification";

describe("formatArrivedWindowLabel", () => {
  it("locks Arrived copy", () => {
    expect(formatArrivedWindowLabel("06:22", true)).toBe(
      "Arrived 06:22 — inside the window"
    );
    expect(formatArrivedWindowLabel("06:22", false)).toBe(
      "Arrived 06:22 — outside the window"
    );
  });
});

describe("formatOnLocationLabel", () => {
  it("locks On location distance copy — no stayed language", () => {
    expect(formatOnLocationLabel(30)).toBe("On location · 30 m away");
    expect(formatOnLocationLabel(0.4)).toBe("On location · 0 m away");
  });
});

describe("formatCheckinSecuredMeta", () => {
  it("locks Secured meta — On location when target configured", () => {
    expect(formatCheckinSecuredMeta(true)).toBe("On location");
    expect(formatCheckinSecuredMeta()).toBe("On location");
  });

  it("locks Secured meta — Checked in when no location target", () => {
    expect(formatCheckinSecuredMeta(false)).toBe("Checked in");
  });
});

describe("buildCheckinVerification", () => {
  it("emits window + location rows when both present", () => {
    const v = buildCheckinVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "06:22" },
      checkinLog: { arrived_hhmm: "06:22", distance_meters: 30 },
    });
    expect(v.rows.map((r) => r.label)).toEqual([
      "Arrived 06:22 — inside the window",
      "On location · 30 m away",
    ]);
    expect(v.rows.every((r) => r.verified)).toBe(true);
  });

  it("omits window row when no schedule window", () => {
    const v = buildCheckinVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      checkinLog: { arrived_hhmm: "12:00", distance_meters: 12 },
    });
    expect(v.rows).toHaveLength(1);
    expect(v.rows[0]?.label).toBe("On location · 12 m away");
  });
});
