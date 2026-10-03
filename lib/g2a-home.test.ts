import { describe, expect, it } from "vitest";
import {
  countdownSuffix,
  pickStartTask,
  startCtaLabel,
  todayDay2Hero,
  todayFirstDayLine,
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
  });

  it("Start label and window banner", () => {
    expect(startCtaLabel("Read")).toBe("Start: Read");
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
