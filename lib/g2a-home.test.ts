import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  closedTaskStatus,
  countdownSuffix,
  firstClosedUndoneTask,
  pickStartTask,
  remainingWindowsClosed,
  startCtaLabel,
  TODAY_WINDOW_CLOSED,
  WINDOW_CLOSED_RESET,
  daysInARow,
  showTodayStreakLine,
  todayDay2Hero,
  todayFirstDayLine,
  windowClosedFollowup,
  windowClosesBanner,
} from "@/lib/g2a-home";

describe("g2a home copy", () => {
  it("first-day line uses both for two tasks and all n otherwise", () => {
    expect(todayFirstDayLine(2)).toBe("Day 1 is today. Finish both tasks to secure it.");
    expect(todayFirstDayLine(3)).toBe("Day 1 is today. Finish all 3 tasks to secure it.");
    expect(todayFirstDayLine(1)).toBe("Day 1 is today. Finish all 1 tasks to secure it.");
  });

  it("day 2 hero pluralises", () => {
    expect(todayDay2Hero(1)).toEqual({ hero: "1", line: "day. Secure today and it's 2." });
    expect(todayDay2Hero(5)).toEqual({ hero: "5", line: "days. Secure today and it's 6." });
    expect(remainingWindowsClosed([
      { done: true, closed: false },
      { done: false, closed: true },
      { done: false, closed: true },
    ])).toBe(true);
    expect(remainingWindowsClosed([{ done: false, closed: false }])).toBe(false);
    expect(todayDay2Hero(5, true)).toEqual({ hero: "5", line: TODAY_WINDOW_CLOSED });
    expect(showTodayStreakLine(0, false)).toBe(false);
    expect(showTodayStreakLine(5, true)).toBe(false);
    expect(showTodayStreakLine(5, false)).toBe(true);
    expect(windowClosedFollowup({ noDaysOff: true, freezesLeft: 2 })).toBe(WINDOW_CLOSED_RESET);
    expect(windowClosedFollowup({ noDaysOff: false, freezesLeft: 2 })).toBe(
      "Today can't be secured. Tomorrow you can use a freeze to cover it. 2 left.",
    );
    expect(windowClosedFollowup({ noDaysOff: false, freezesLeft: 0 })).toBeNull();
    expect(daysInARow(1)).toBe("1 day in a row.");
    expect(daysInARow(3)).toBe("3 days in a row.");
  });

  it("names the closed required task and says today cannot be secured", () => {
    expect(closedTaskStatus("Drink water")).toBe(
      "Drink water closed. Today can't be secured.",
    );
    const blocked = firstClosedUndoneTask([
      { name: "Read", done: true, closed: false },
      { name: "Drink water", done: false, closed: true },
      { name: "Walk", done: false, closed: false },
    ]);
    expect(blocked?.name).toBe("Drink water");
    expect(firstClosedUndoneTask([{ name: "Walk", done: false, closed: false }])).toBeNull();
    const next = pickStartTask([
      { id: "water", name: "Drink water", done: false, closed: true },
      { id: "walk", name: "Walk", done: false, closed: false },
    ]);
    expect(next?.name).toBe("Walk");
    expect(startCtaLabel(next?.name ?? "")).toBe("Walk");
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(home).toContain("homeStatus(");
    expect(home).not.toContain("closedTaskStatus(");
    expect(home).toContain("primary={startLabel ?");
  });

  it("Start label and window banner", () => {
    expect(startCtaLabel("Read")).toBe("Read");
    expect(windowClosesBanner("Read", "7:00 am")).toBe(
      "The Read window closes at 7:00 am. After that, today can't be secured.",
    );
  });

  it("countdown only under 3 hours", () => {
    expect(countdownSuffix(200)).toBe("");
    expect(countdownSuffix(90)).toBe(" · 1 h 30 min left");
    expect(countdownSuffix(15)).toBe(" · 0 h 15 min left");
  });

  it("picks the earliest closing pending task", () => {
    const start = pickStartTask([
      { id: "a", name: "Water", done: false, minutesLeft: 200 },
      { id: "b", name: "Read", done: false, minutesLeft: 40 },
      { id: "c", name: "Done", done: true, minutesLeft: 10 },
    ]);
    expect(start?.id).toBe("b");
    expect(pickStartTask([{ id: "x", name: "Later", done: false }])?.id).toBe("x");
  });
});
