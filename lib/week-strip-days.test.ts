import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeekStripDays,
  enrollmentWeekDayState,
  firstWeekStripDays,
  weekStripAccessibilityLabel,
  weekStripDayState,
  weekStripDayStates,
} from "./week-strip-days";

const WEEK = [
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-19",
  "2026-09-20",
];

describe("weekStripDayState", () => {
  it("secured wins over frozen if both exist for a key", () => {
    expect(weekStripDayState({ secured: true, frozen: true, lastStand: false })).toBe("secured");
  });

  it("maps freeze and last stand as their own marks, not secured", () => {
    expect(
      weekStripDayStates(WEEK, {
        securedDateKeys: ["2026-09-16", "2026-09-18"],
        frozenDateKeys: ["2026-09-17"],
        lastStandDateKeys: ["2026-09-15"],
        todayKey: "2026-09-18",
        todaySecured: true,
      }),
    ).toEqual(["missed", "last_stand", "secured", "frozen", "secured", "future", "future"]);
  });

  it("buildWeekStripDays puts a snowflake state on Thursday", () => {
    const days = buildWeekStripDays(WEEK, {
      securedDateKeys: ["2026-09-16", "2026-09-18"],
      frozenDateKeys: ["2026-09-17"],
      lastStandDateKeys: ["2026-09-15"],
      todayKey: "2026-09-18",
      todaySecured: true,
    });
    expect(days[3]?.state).toBe("frozen");
    expect(days[3]?.letter).toBe("T");
  });

  it("counts the first week as days 1–7 and does not mark a later day missed", () => {
    const days = firstWeekStripDays("2026-10-05", {
      securedDateKeys: ["2026-10-05"],
      todayKey: "2026-10-07",
      todaySecured: false,
    });
    expect(days.map((d) => d.letter)).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
    expect(days.map((d) => d.state)).toEqual([
      "secured",
      "missed",
      "missed",
      "future",
      "future",
      "future",
      "future",
    ]);
  });

  it("labels Thursday frozen", () => {
    expect(weekStripAccessibilityLabel("Thursday", "frozen", false)).toBe("Thursday, frozen");
  });

  it("wires Home to weekStripDayStates and distinct WeekStrip marks", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const strip = readFileSync(resolve(__dirname, "../components/ds/WeekStrip.tsx"), "utf8");
    expect(home).toContain("buildWeekStripDays");
    expect(home).toContain("frozenDateKeys");
    expect(home).toContain("lastStandDateKeys");
    const secured = readFileSync(resolve(__dirname, "../app/task/secured.tsx"), "utf8");
    expect(secured).toContain("weekFromSecuredKeys");
    expect(secured).toContain("frozenDateKeys");
    expect(secured).toContain("lastStandDateKeys");
    expect(strip).toContain("DayCell");
    expect(strip).toContain("dayCellFromWeekState");
    const cell = readFileSync(resolve(__dirname, "../components/ds/DayCell.tsx"), "utf8");
    expect(cell).toContain("Snowflake");
    expect(cell).toContain("Shield");
    expect(strip).toContain("weekStripAccessibilityLabel");
  });
});

describe("enrollmentWeekDayState", () => {
  const base = {
    startDateKey: "2026-10-06",
    todayKey: "2026-10-08",
    lastDateKey: "2026-10-12",
    secured: false,
    frozen: false,
    lastStand: false,
  };
  it("covers every strip state", () => {
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-05" })).toBe("before");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-09" })).toBe("future");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-13" })).toBe("future");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-07" })).toBe("missed");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-06", secured: true })).toBe("secured");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-06", frozen: true })).toBe("frozen");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-06", lastStand: true })).toBe("last_stand");
    expect(enrollmentWeekDayState({ ...base, dateKey: "2026-10-08" })).toBe("missed");
  });
});
