import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentWeekDateKeys, getTodayDateKey } from "@/lib/date-utils";
import {
  resolveDisplayedStreak,
  resolveHomeStatsReady,
  resolveHomeTimeZone,
} from "@/lib/home-streak";

describe("resolveDisplayedStreak", () => {
  it("stays null while getStats has not succeeded", () => {
    expect(resolveDisplayedStreak(false, null)).toBeNull();
    expect(resolveDisplayedStreak(false, 0)).toBeNull();
  });

  it("treats a successful read with no streaks row as day 0", () => {
    expect(resolveDisplayedStreak(true, null)).toBe(0);
    expect(resolveDisplayedStreak(true, undefined)).toBe(0);
    expect(resolveDisplayedStreak(true, 4)).toBe(4);
  });
});

describe("resolveHomeStatsReady", () => {
  it("is ready after a settled fetch even when the new query key is in-flight with leftover context", () => {
    expect(
      resolveHomeStatsReady({ queryFetched: false, queryData: undefined, contextStats: null })
    ).toBe(false);
    expect(
      resolveHomeStatsReady({ queryFetched: true, queryData: undefined, contextStats: null })
    ).toBe(true);
    expect(
      resolveHomeStatsReady({
        queryFetched: false,
        queryData: undefined,
        contextStats: { activeStreak: null },
      })
    ).toBe(true);
    expect(
      resolveHomeStatsReady({
        queryFetched: false,
        queryData: { activeStreak: 0 },
        contextStats: null,
      })
    ).toBe(true);
  });
});

describe("resolveHomeTimeZone + Friday 10:23pm ET week strip", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prefers profile IANA and never silent-UTC when device zone is known", () => {
    expect(resolveHomeTimeZone("America/New_York", "America/Chicago")).toBe("America/New_York");
    expect(resolveHomeTimeZone(null, "America/New_York")).toBe("America/New_York");
    expect(resolveHomeTimeZone("  ", "America/New_York")).toBe("America/New_York");
  });

  it("at 02:23 UTC Saturday, NY is Friday; null tz is Saturday (the Home bug)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-05T02:23:00.000Z"));
    expect(getTodayDateKey("America/New_York")).toBe("2026-09-04");
    expect(getTodayDateKey(null)).toBe("2026-09-05");
    expect(getTodayDateKey(undefined)).toBe("2026-09-05");
    const nyKeys = getCurrentWeekDateKeys("America/New_York");
    expect(nyKeys[4]).toBe("2026-09-04");
    const utcKeys = getCurrentWeekDateKeys(null);
    expect(utcKeys[5]).toBe("2026-09-05");
  });
});
