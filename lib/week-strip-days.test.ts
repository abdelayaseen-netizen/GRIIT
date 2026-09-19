import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
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
    ).toEqual(["missed", "last_stand", "secured", "frozen", "secured", "missed", "missed"]);
  });

  it("labels Thursday frozen", () => {
    expect(weekStripAccessibilityLabel("Thursday", "frozen", false)).toBe("Thursday, frozen");
  });

  it("wires Home to weekStripDayStates and distinct WeekStrip marks", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const strip = readFileSync(resolve(__dirname, "../components/ds/WeekStrip.tsx"), "utf8");
    expect(home).toContain("weekStripDayStates");
    expect(home).toContain("frozenDateKeys");
    expect(home).toContain("lastStandDateKeys");
    expect(strip).toContain("Snowflake");
    expect(strip).toContain("Shield");
    expect(strip).toContain("DS_V3.color.surface");
    expect(strip).toContain("weekStripAccessibilityLabel");
  });
});
