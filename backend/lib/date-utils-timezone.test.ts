import { describe, it, expect, vi, afterEach } from "vitest";
import {
  elapsedWeekEnded,
  getTodayDateKey,
  getWeekStartDateKey,
  resolveCheckInTimeZone,
} from "./date-utils";

describe("elapsedWeekEnded — Monday week in profile IANA", () => {
  it("Monday → zero, Saturday → five, Sunday → six", () => {
    expect(elapsedWeekEnded("2026-09-21", "2026-09-21")).toBe(0);
    expect(elapsedWeekEnded("2026-09-21", "2026-09-26")).toBe(5);
    expect(elapsedWeekEnded("2026-09-21", "2026-09-27")).toBe(6);
    expect(elapsedWeekEnded("2026-09-21", "2026-09-27")).not.toBe(7);
  });

  it("uses the profile date when UTC is already the next day", () => {
    const instant = new Date("2026-09-27T02:00:00.000Z");
    const nyToday = "2026-09-26";
    const utcToday = "2026-09-27";
    expect(getWeekStartDateKey(instant, "America/New_York")).toBe("2026-09-21");
    expect(elapsedWeekEnded(getWeekStartDateKey(instant, "America/New_York"), nyToday)).toBe(5);
    expect(elapsedWeekEnded(getWeekStartDateKey(instant, "UTC"), utcToday)).toBe(6);
  });
});

describe("resolveCheckInTimeZone", () => {
  it("prefers task schedule_timezone over profile", () => {
    expect(
      resolveCheckInTimeZone("America/Los_Angeles", "America/New_York")
    ).toBe("America/Los_Angeles");
  });

  it("falls back to profile when schedule unset", () => {
    expect(resolveCheckInTimeZone(null, "America/New_York")).toBe(
      "America/New_York"
    );
    expect(resolveCheckInTimeZone("  ", "Europe/London")).toBe("Europe/London");
  });

  it("falls back to UTC when both missing", () => {
    expect(resolveCheckInTimeZone(null, null)).toBe("UTC");
    expect(resolveCheckInTimeZone(undefined, undefined)).toBe("UTC");
  });
});

/**
 * fcb7b99 lock — tasks without schedule_timezone must keep the pre-fix
 * complete date_key (profile TZ only). Same pattern as bd95024 run-path lock.
 */
describe("fcb7b99 date_key lock (no schedule_timezone)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Pre-fcb7b99 complete path: getTodayDateKey(profileTz). */
  function dateKeyLegacy(profileTz: string): string {
    return getTodayDateKey(profileTz);
  }

  /** Post-fcb7b99 complete path when schedule_timezone is absent. */
  function dateKeyCurrent(
    scheduleTimezone: string | null | undefined,
    profileTz: string
  ): string {
    return getTodayDateKey(
      resolveCheckInTimeZone(scheduleTimezone, profileTz)
    );
  }

  const PROFILE_INPUTS = [
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "UTC",
  ] as const;

  const ABSENT_SCHEDULE = [null, undefined, "", "   "] as const;

  it("TZ string from resolver equals profile for every absent-schedule input", () => {
    for (const profile of PROFILE_INPUTS) {
      for (const schedule of ABSENT_SCHEDULE) {
        expect(resolveCheckInTimeZone(schedule, profile)).toBe(profile);
      }
    }
  });

  it("date_key is byte-identical to legacy profile-only path", () => {
    vi.useFakeTimers();
    // Near a TZ boundary so a wrong TZ would flip the calendar day.
    vi.setSystemTime(new Date("2026-07-29T03:30:00.000Z"));
    for (const profile of PROFILE_INPUTS) {
      const legacy = dateKeyLegacy(profile);
      for (const schedule of ABSENT_SCHEDULE) {
        expect(dateKeyCurrent(schedule, profile)).toBe(legacy);
      }
    }
  });
});
