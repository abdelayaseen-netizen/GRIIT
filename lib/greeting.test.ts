import { describe, expect, it } from "vitest";
import { earliestEnrollmentStart, firstWeekDay, greeting, greetingSub, inclusiveDayCount } from "./greeting";

const TZ = "America/New_York";

describe("greeting hours", () => {
  it("3:59 am is Still up and 4:00 am is Good morning", () => {
    expect(greeting(new Date("2026-10-07T07:59:00.000Z"), "Seed GRIIT", "seedgriit", TZ)).toBe(
      "Still up, Seed",
    );
    expect(greeting(new Date("2026-10-07T08:00:00.000Z"), "Seed GRIIT", "seedgriit", TZ)).toBe(
      "Good morning, Seed",
    );
  });

  it("11:59 pm is Still up", () => {
    expect(greeting(new Date("2026-10-08T03:59:00.000Z"), null, "seedgriit", TZ)).toBe(
      "Still up, @seedgriit",
    );
  });
});

describe("greetingSub", () => {
  it("names the one task left", () => {
    expect(greetingSub({ secured: false, nextTask: "Read 10 pages", openCount: 1 })).toBe(
      "Read 10 pages is all that’s left today.",
    );
  });

  it("says the day is secured", () => {
    expect(greetingSub({ secured: true, openCount: 0 })).toBe("Day secured. See you tomorrow.");
  });

  it("uses the first-week line before the secured line", () => {
    expect(greetingSub({ secured: false, openCount: 2, nextTask: "Pray", firstWeekDay: 2 })).toBe(
      "Day 2 of your first week.",
    );
    expect(greetingSub({ secured: true, openCount: 0, firstWeekDay: 2 })).toBe(
      "Day secured. See you tomorrow.",
    );
  });
});

describe("first week and inclusive spans", () => {
  it("counts day 1 through day 7 from the earliest start", () => {
    expect(firstWeekDay("2026-10-07", "2026-10-07")).toBe(1);
    expect(firstWeekDay("2026-10-13", "2026-10-07")).toBe(7);
    expect(firstWeekDay("2026-10-14", "2026-10-07")).toBeNull();
  });

  it("uses the oldest enrollment, including one that already finished", () => {
    const start = earliestEnrollmentStart(["2026-10-04", "2026-09-30", null]);
    expect(start).toBe("2026-09-30");
    expect(firstWeekDay("2026-10-10", start)).toBeNull();
  });

  it("Sep 6 through Sep 24 is 19 days, so an 18-day streak cannot use that span", () => {
    expect(inclusiveDayCount("2026-09-06", "2026-09-24")).toBe(19);
    expect(inclusiveDayCount("2026-09-06", "2026-09-23")).toBe(18);
  });
});
