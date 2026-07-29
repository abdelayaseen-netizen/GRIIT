import { describe, it, expect } from "vitest";
import {
  buildRunVerification,
  formatLoggedWindowLabel,
  formatRunEntryLabel,
  formatRunKm,
} from "./run-verification";

describe("formatRunKm", () => {
  it("formats integers and decimals", () => {
    expect(formatRunKm(5)).toBe("5");
    expect(formatRunKm(5.2)).toBe("5.2");
    expect(formatRunKm(5.25)).toBe("5.25");
  });
});

describe("formatLoggedWindowLabel", () => {
  it("formats inside / outside copy", () => {
    expect(formatLoggedWindowLabel("07:12", true)).toBe(
      "Logged 07:12 — inside the window"
    );
    expect(formatLoggedWindowLabel("09:00", false)).toBe(
      "Logged 09:00 — outside the window"
    );
  });
});

describe("formatRunEntryLabel", () => {
  it("uses Entered by hand for hand mode", () => {
    expect(formatRunEntryLabel("hand", 5.2, 32)).toBe(
      "Entered by hand · 5.2 km in 32 min"
    );
  });

  it("uses Timed in-app for timer mode — never Entered by hand", () => {
    expect(formatRunEntryLabel("timer", 5.2, 32)).toBe(
      "Timed in-app · 5.2 km in 32 min"
    );
    expect(formatRunEntryLabel("timer", 5.2, 32)).not.toContain(
      "Entered by hand"
    );
  });
});

describe("buildRunVerification", () => {
  it("includes window + hand entry + in-app photo when proven", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T11:12:00.000Z",
        captured_in_app: true,
      },
    });
    expect(verification.rows).toEqual([
      {
        key: "time_window",
        label: "Logged 07:12 — inside the window",
        verified: true,
      },
      {
        key: "run_entry",
        label: "Entered by hand · 5.2 km in 32 min",
        verified: true,
      },
      {
        key: "camera_in_app",
        label: "Shot in-app, not from the library",
        verified: true,
      },
    ]);
  });

  it("uses Timed in-app row for timer entry_mode", () => {
    const verification = buildRunVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      runLog: { distance_km: 3, duration_min: 20, entry_mode: "timer" },
      photoPresent: false,
      proofPayload: null,
    });
    expect(verification.rows).toEqual([
      {
        key: "run_entry",
        label: "Timed in-app · 3 km in 20 min",
        verified: true,
      },
    ]);
  });

  it("omits photo row when no photo / captured_in_app absent", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: false,
      proofPayload: null,
    });
    expect(verification.rows.map((r) => r.key)).toEqual([
      "time_window",
      "run_entry",
    ]);
  });

  it("marks time row failed when outside the window", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: false, checkedAtHHMM: "09:15" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: false,
    });
    expect(verification.rows[0]).toEqual({
      key: "time_window",
      label: "Logged 09:15 — outside the window",
      verified: false,
    });
  });
});
