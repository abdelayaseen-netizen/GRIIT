import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { shownChallengeDay } from "./calendar-day";
import { enrollmentDayStats } from "./enrollment-day-stats";

describe("shownChallengeDay", () => {
  it("is local date minus start plus 1, capped at N", () => {
    const startAt = "2026-10-03T16:00:00.000Z";
    expect(shownChallengeDay(startAt, "America/New_York", "2026-10-11", 30)).toBe(9);
    expect(shownChallengeDay(startAt, "UTC", "2026-10-11", 30)).toBe(9);
    expect(shownChallengeDay(startAt, "America/New_York", "2026-10-11", 7)).toBe(7);
    const overnight = "2026-10-03T02:00:00.000Z";
    expect(shownChallengeDay(overnight, "UTC", "2026-10-11", 30)).toBe(9);
    expect(shownChallengeDay(overnight, "America/New_York", "2026-10-11", 30)).toBe(10);
  });

  it("is the day on Home, the challenge, the task, Profile, and the share sheet", () => {
    const files = [
      "app/(tabs)/index.tsx",
      "app/challenge/active/[activeChallengeId].tsx",
      "components/task-v2/useTaskFlowV2.ts",
      "lib/profile-v2-record.ts",
      "components/share/DayStickerSheet.tsx",
    ];
    for (const file of files) {
      const src = readFileSync(resolve(__dirname, "../../", file), "utf8");
      expect(src.includes("shownChallengeDay") || src.includes("enrollmentDayStats"), file).toBe(true);
    }
  });
});

describe("enrollmentDayStats", () => {
  const startAt = "2026-10-03T16:00:00.000Z";
  const keys = ["2026-10-03", "2026-10-04", "2026-10-06", "2026-10-08"];

  it("uses one window for done, secured, and due", () => {
    const stats = enrollmentDayStats({
      startAt,
      timeZone: "America/New_York",
      todayKey: "2026-10-11",
      durationDays: 30,
      securedDateKeys: keys,
    });
    expect(stats.day).toBe(9);
    expect(stats.done).toBe(stats.due);
    expect(stats.secured).toBeLessThanOrEqual(stats.due);
    expect(stats.line).toBe(`${stats.secured} of ${stats.due} days`);
    expect(stats.due).toBe(8);
    expect(stats.secured).toBe(4);
  });

  it("never lets the numerator exceed the denominator", () => {
    const stats = enrollmentDayStats({
      startAt: "2026-10-10T16:00:00.000Z",
      timeZone: "America/New_York",
      todayKey: "2026-10-11",
      durationDays: 7,
      securedDateKeys: ["2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12"],
    });
    expect(stats.secured).toBeLessThanOrEqual(stats.due);
    expect(stats.line.startsWith(`${stats.secured} of `)).toBe(true);
    expect(stats.due).toBeGreaterThan(0);
  });
});
