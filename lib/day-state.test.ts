import { describe, expect, it } from "vitest";
import {
  DAY_GLYPH,
  DAY_STATES,
  boardRowsFromDays,
  consistencyDenominatorLine,
  consistencyFromDays,
  consistencyHeadlineFromDays,
  dayArray,
  daysFromSource,
  monthGridFromDays,
  streakFromDays,
  visibleProofDays,
  weekStripFromDays,
  type EnrollmentInput,
} from "@/lib/day-state";

const TZ = "America/New_York";
const TODAY = "2026-09-22";

const IRON: EnrollmentInput = {
  challengeId: "ironman",
  startDateKey: "2026-07-16",
  endDateKey: "2026-09-28",
};

function days(secured: string[], extra: Parameters<typeof dayArray>[3] = {}) {
  return dayArray([IRON], secured, TZ, { todayKey: TODAY, ...extra });
}

describe("DayState union and glyph table", () => {
  it("has exactly the eight states", () => {
    expect([...DAY_STATES]).toEqual([
      "camera",
      "self",
      "freeze",
      "laststand",
      "missed",
      "today",
      "notdue",
      "beforejoin",
    ]);
    expect(Object.keys(DAY_GLYPH)).toEqual([...DAY_STATES]);
  });
});

describe("dayArray eight states", () => {
  it("camera / self / freeze / laststand / missed / today / notdue / beforejoin", () => {
    const rows = dayArray(
      [
        { challengeId: "late", startDateKey: "2026-09-18", endDateKey: "2026-09-28" },
      ],
      [
        { dateKey: "2026-09-18", camera: true },
        { dateKey: "2026-09-19", camera: false },
      ],
      TZ,
      {
        todayKey: TODAY,
        frozenDateKeys: ["2026-09-20"],
        lastStandDateKeys: ["2026-09-21"],
        throughDateKey: "2026-09-24",
      },
    );

    const by = Object.fromEntries(rows.map((d) => [d.dateKey, d.state]));
    expect(by["2026-09-18"]).toBe("camera");
    expect(by["2026-09-19"]).toBe("self");
    expect(by["2026-09-20"]).toBe("freeze");
    expect(by["2026-09-21"]).toBe("laststand");
    expect(by["2026-09-22"]).toBe("today");
    expect(by["2026-09-23"]).toBe("notdue");
    expect(by["2026-09-17"]).toBeUndefined();

    const before = dayArray(
      [{ challengeId: "late", startDateKey: "2026-09-18" }],
      [],
      TZ,
      { todayKey: TODAY, throughDateKey: "2026-09-18" },
    );
    expect(before[0]?.dateKey).toBe("2026-09-18");
    expect(before.every((d) => d.state !== "beforejoin")).toBe(true);

    const withGap = dayArray(
      [{ challengeId: "late", startDateKey: "2026-09-20" }],
      [],
      TZ,
      { todayKey: TODAY, throughDateKey: "2026-09-20" },
    );
    expect(withGap[0]?.dateKey).toBe("2026-09-20");
  });

  it("joined-later days before that enrollment are notdue, not missed", () => {
    const rows = dayArray(
      [
        { challengeId: "early", startDateKey: "2026-09-10", endDateKey: "2026-09-12" },
        { challengeId: "late", startDateKey: "2026-09-20" },
      ],
      [],
      TZ,
      { todayKey: TODAY, throughDateKey: TODAY },
    );
    const mid = rows.find((d) => d.dateKey === "2026-09-15");
    expect(mid?.state).toBe("notdue");
    expect(mid?.challengeIds).toEqual([]);
    expect(rows.find((d) => d.dateKey === "2026-09-11")?.state).toBe("missed");
  });

  it("before-first-join is not in the array (array starts at first join)", () => {
    const rows = days(["2026-09-21"]);
    expect(rows[0]?.dateKey).toBe("2026-07-16");
    expect(rows.every((d) => d.dateKey >= "2026-07-16")).toBe(true);
  });

  it("visitor mode drops days with no shared photos", () => {
    const owner = visibleProofDays(
      [
        { dateKey: "2026-09-19", photoCount: 3, sharedCount: 1, hasPrivate: true },
        { dateKey: "2026-09-20", photoCount: 2, sharedCount: 0, hasPrivate: true },
      ],
      true,
    );
    const visitor = visibleProofDays(
      [
        { dateKey: "2026-09-19", photoCount: 3, sharedCount: 1, hasPrivate: true },
        { dateKey: "2026-09-20", photoCount: 2, sharedCount: 0, hasPrivate: true },
      ],
      false,
    );
    expect(owner).toHaveLength(2);
    expect(visitor).toHaveLength(1);
    expect(visitor[0]?.photoCount).toBe(1);
    expect(visitor[0]?.hasPrivate).toBe(false);
  });
});

describe("reductions over dayArray", () => {
  it("consistency, streak, month grid, week strip, and board share one array", () => {
    const rows = dayArray(
      [IRON],
      [
        { dateKey: "2026-09-18", camera: true },
        { dateKey: "2026-09-19", camera: true },
      ],
      TZ,
      { todayKey: TODAY, throughDateKey: TODAY },
    );
    // 21 Sep missed → streak 0 (spec)
    const withMiss = dayArray(
      [IRON],
      [
        { dateKey: "2026-09-18", camera: true },
        { dateKey: "2026-09-19", camera: true },
      ],
      TZ,
      { todayKey: TODAY, throughDateKey: TODAY },
    );
    expect(streakFromDays(withMiss)).toBe(0);

    const securedThroughYesterday = dayArray(
      [IRON],
      [
        { dateKey: "2026-09-20", camera: true },
        { dateKey: "2026-09-21", camera: false },
      ],
      TZ,
      { todayKey: TODAY, throughDateKey: TODAY },
    );
    expect(streakFromDays(securedThroughYesterday)).toBe(2);

    const c = consistencyFromDays(rows);
    expect(consistencyHeadlineFromDays(rows)).toBe(`${c.secured} of ${c.elapsed} days secured`);
    expect(consistencyDenominatorLine("16 Jul 2026")).toBe(
      "Every day since you joined on 16 Jul 2026. Today counts once it's secured.",
    );

    const month = monthGridFromDays(rows, "2026-09");
    expect(month.secured).toBe(rows.filter((d) => d.dateKey.startsWith("2026-09") && (d.state === "camera" || d.state === "self")).length);
    expect(month.leadingBlanks).toBeGreaterThanOrEqual(0);

    const week = weekStripFromDays(rows, TZ, TODAY);
    expect(week).toHaveLength(7);

    const board = boardRowsFromDays(rows, [IRON]);
    expect(board[0]?.secured).toBe(c.secured);
    expect(board[0]?.elapsed).toBe(c.elapsed);
  });

  it("freeze and laststand are not secured and do not break the streak", () => {
    const rows = dayArray(
      [IRON],
      [{ dateKey: "2026-09-19", camera: true }],
      TZ,
      {
        todayKey: TODAY,
        frozenDateKeys: ["2026-09-20"],
        lastStandDateKeys: ["2026-09-21"],
        throughDateKey: TODAY,
      },
    );
    expect(rows.find((d) => d.dateKey === "2026-09-20")?.state).toBe("freeze");
    expect(rows.find((d) => d.dateKey === "2026-09-21")?.state).toBe("laststand");
    expect(streakFromDays(rows)).toBe(1);
    expect(consistencyFromDays(rows).secured).toBe(1);
  });

  it("daysFromSource is dayArray over the record payload", () => {
    const fromSource = daysFromSource(
      {
        enrollments: [IRON],
        securedDays: [{ dateKey: "2026-09-21", camera: true }],
      },
      TZ,
      { todayKey: TODAY, throughDateKey: TODAY },
    );
    const direct = dayArray([IRON], [{ dateKey: "2026-09-21", camera: true }], TZ, {
      todayKey: TODAY,
      throughDateKey: TODAY,
    });
    expect(fromSource.map((d) => d.state)).toEqual(direct.map((d) => d.state));
    expect(daysFromSource(null, TZ)).toEqual([]);
  });
});
