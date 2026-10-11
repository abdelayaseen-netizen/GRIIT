import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { displayDay, enrollmentDayIndex, uiChallengeDay } from "./challenge-day";
import { feedNoPhotoCopy } from "./feed-copy";
import { calendarDayFromStartAt } from "./home-day-total";
import { workStepDay } from "./work-step";

describe("displayDay", () => {
  it("created today, secured today → displays Day 1, feed says secured day 1", () => {
    const current_day = 2;
    const shown = displayDay(current_day, true);
    expect(shown).toBe(1);
    expect(
      feedNoPhotoCopy({
        eventType: "secured_day",
        displayName: "Maya",
        username: "maya",
        challengeName: "No Days Off",
        currentDay: shown,
      })
    ).toBe("Maya");
  });

  it("tomorrow morning unsecured → Day 2", () => {
    expect(displayDay(2, false)).toBe(2);
  });

  it("calendar helpers still differ by timezone", () => {
    const startAt = "2026-09-17T02:00:00.000Z";
    const today = "2026-09-23";
    const ny = uiChallengeDay(startAt, "America/New_York", today, 14);
    const utc = uiChallengeDay(startAt, "UTC", today, 14);
    expect(ny).toBe(8);
    expect(utc).toBe(7);
    expect(ny).not.toBe(utc);
    expect(workStepDay(startAt, "America/New_York", today, 14)).toBe(8);
    expect(calendarDayFromStartAt(startAt, "America/New_York", today, 14)).toBe(8);
  });

  it("live Day n is the stored enrollment day, capped at the challenge length", () => {
    expect(enrollmentDayIndex({ currentDay: 2, durationDays: 7 })).toBe(2);
    expect(enrollmentDayIndex({ currentDay: 2, durationDays: 1 })).toBe(1);
    expect(enrollmentDayIndex({ currentDay: 0, durationDays: 7 })).toBe(1);
    expect(enrollmentDayIndex({ currentDay: null, durationDays: 7 })).toBe(1);
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(flow).toContain("enrollmentDayIndex");
    expect(flow).toContain("current_day");
    expect(flow).not.toContain("workStepDay(");
    expect(flow).not.toContain("firstString(params.currentDay)");
    const dayOpen = readFileSync(resolve(__dirname, "./day-open-active.ts"), "utf8");
    expect(dayOpen).toContain("enrollmentDayIndex");
    expect(dayOpen).toContain("ac.current_day");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("enrollmentDayIndex");
    expect(home).not.toContain("calendarDayFromStartAt");
    const src = readFileSync(resolve(__dirname, "./challenge-day.ts"), "utf8");
    expect(src).not.toMatch(/from ["']@\//);
    expect(src).toContain('from "../backend/lib/calendar-day"');
  });
});
