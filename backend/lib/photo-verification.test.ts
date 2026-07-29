import { describe, it, expect } from "vitest";
import {
  evaluateScheduleWindowServer,
  formatTakenWindowLabel,
  buildPhotoVerification,
} from "./photo-verification";

function utcAt(hours: number, minutes: number): Date {
  return new Date(Date.UTC(2026, 6, 28, hours, minutes, 0));
}

describe("evaluateScheduleWindowServer", () => {
  it("passes when server clock is inside the window", () => {
    const result = evaluateScheduleWindowServer({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(7, 42),
    });
    expect(result).toEqual({
      hasWindow: true,
      passed: true,
      checkedAtHHMM: "07:42",
    });
  });

  it("fails when server clock is outside the window", () => {
    const result = evaluateScheduleWindowServer({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(9, 0),
    });
    expect(result.hasWindow).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.checkedAtHHMM).toBe("09:00");
  });

  it("hasWindow false when bounds missing", () => {
    expect(
      evaluateScheduleWindowServer({ start: "07:00", timeZone: "UTC", now: utcAt(7, 0) })
        .hasWindow
    ).toBe(false);
  });
});

describe("formatTakenWindowLabel", () => {
  it("formats inside / outside copy", () => {
    expect(formatTakenWindowLabel("07:42", true)).toBe(
      "Taken 07:42 — inside the window"
    );
    expect(formatTakenWindowLabel("09:00", false)).toBe(
      "Taken 09:00 — outside the window"
    );
  });
});

describe("buildPhotoVerification", () => {
  it("includes time row from window eval and in-app row when proven", () => {
    const verification = buildPhotoVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:42" },
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T11:42:00.000Z",
        captured_in_app: true,
      },
    });
    expect(verification.rows).toEqual([
      {
        key: "time_window",
        label: "Taken 07:42 — inside the window",
        verified: true,
      },
      {
        key: "camera_in_app",
        label: "Shot in-app, not from the library",
        verified: true,
      },
    ]);
  });

  it("omits in-app row when captured_in_app is absent", () => {
    const verification = buildPhotoVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:42" },
      photoPresent: true,
      proofPayload: null,
    });
    expect(verification.rows.map((r) => r.key)).toEqual(["time_window"]);
  });

  it("omits in-app row when captured_in_app is false", () => {
    const verification = buildPhotoVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T12:00:00.000Z",
        captured_in_app: false,
      },
    });
    expect(verification.rows).toEqual([]);
  });

  it("marks time row failed when outside the window", () => {
    const verification = buildPhotoVerification({
      window: { hasWindow: true, passed: false, checkedAtHHMM: "09:15" },
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T13:15:00.000Z",
        captured_in_app: true,
      },
    });
    expect(verification.rows[0]).toEqual({
      key: "time_window",
      label: "Taken 09:15 — outside the window",
      verified: false,
    });
  });
});
