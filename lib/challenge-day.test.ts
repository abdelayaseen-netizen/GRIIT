import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { displayDay, uiChallengeDay } from "./challenge-day";
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
        challengeName: "75 Hard Classic",
        currentDay: shown,
      })
    ).toBe("Maya secured day 1");
  });

  it("tomorrow morning unsecured → Day 2", () => {
    expect(displayDay(2, false)).toBe(2);
  });

  it("UI Day n is calendar — TZ != UTC, and day does not jump after secure", () => {
    const startAt = "2026-09-17T02:00:00.000Z";
    const today = "2026-09-23";
    const ny = uiChallengeDay(startAt, "America/New_York", today, 14);
    const utc = uiChallengeDay(startAt, "UTC", today, 14);
    expect(ny).toBe(8);
    expect(utc).toBe(7);
    expect(ny).not.toBe(utc);
    expect(workStepDay(startAt, "America/New_York", today, 14)).toBe(8);
    expect(calendarDayFromStartAt(startAt, "America/New_York", today, 14)).toBe(8);
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    const work = readFileSync(resolve(__dirname, "./work-step.ts"), "utf8");
    expect(flow).toContain("workStepDay(startAt, timeZone, dateKey, durationDays)");
    expect(flow).not.toContain("firstString(params.currentDay)");
    expect(work).toContain("calendarDayFromStartAt");
    const dayOpen = readFileSync(resolve(__dirname, "./day-open-active.ts"), "utf8");
    expect(dayOpen).toContain("calendarDayFromStartAt(startAt, args.timeZone, args.todayKey, durationDays)");
    expect(dayOpen).not.toContain("ac.current_day");
  });

  it("feed photo header no longer remaps current_day via feedPostDisplayDay", () => {
    const card = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    expect(card).toContain("feedCardEyebrow");
    expect(card).toContain("feedCardVariant");
    expect(card).toContain("post.currentDay");
    expect(card).not.toContain("feedPostDisplayDay");
  });
});
