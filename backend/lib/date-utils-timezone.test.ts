import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodayDateKey, resolveCheckInTimeZone } from "./date-utils";

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
