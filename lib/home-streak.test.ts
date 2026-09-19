import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentWeekDateKeys, getTodayDateKey } from "@/lib/date-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  homeStreakLine,
  resolveDisplayedStreak,
  resolveHomeStatsReady,
  resolveHomeTimeZone,
  streakLineFor,
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

describe("homeStreakLine", () => {
  it("says Post today to keep it when streak ≥ 1 and today is open", () => {
    expect(homeStreakLine(1, false)).toBe("Post today to keep it.");
    expect(homeStreakLine(7, false)).toBe("Post today to keep it.");
  });

  it("says Post today to start only at streak 0 with no days secured", () => {
    expect(homeStreakLine(0, false)).toBe("Post today to start.");
    expect(homeStreakLine(0, false, 0)).toBe("Post today to start.");
    expect(homeStreakLine(0, true)).toBe("Day secured.");
  });

  it("says Streak reset when streak is 0 after days have been secured", () => {
    expect(homeStreakLine(0, false, 1)).toBe("Streak reset. Post today to start again.");
    expect(homeStreakLine(0, false, 12)).toBe("Streak reset. Post today to start again.");
  });

  it("Home and Profile produce the same line for the same inputs", () => {
    const cases: [number, boolean, number][] = [
      [0, false, 0],
      [0, false, 4],
      [0, true, 4],
      [1, false, 1],
      [1, true, 1],
      [7, false, 7],
    ];
    for (const [streak, secured, total] of cases) {
      expect(streakLineFor(streak, secured, total)).toBe(homeStreakLine(streak, secured, total));
    }
    const homeSrc = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const profileSrc = readFileSync(
      resolve(__dirname, "../components/profile/ProfileV3.tsx"),
      "utf8",
    );
    expect(homeSrc).toContain("consistencyLine(");
    expect(profileSrc).toContain("streakLineFor(streak, todaySecured, totalDaysSecured)");
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
    expect(
      resolveHomeStatsReady({
        queryFetched: true,
        queryData: null,
        contextStats: null,
        statsFailed: true,
      })
    ).toBe(false);
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
