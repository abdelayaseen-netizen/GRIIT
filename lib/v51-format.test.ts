import { describe, expect, it } from "vitest";
import { count, dateRange, dayState, hourLabel } from "@/lib/v51-format";

describe("v51 format", () => {
  it("writes ranges, hours, and plurals", () => {
    const a = new Date(Date.UTC(2026, 8, 30));
    const b = new Date(Date.UTC(2026, 9, 1));
    expect(dateRange(a, b)).toBe("Sep 30 – Oct 1");
    expect(hourLabel(8)).toBe("8 am");
    expect(hourLabel(0)).toBe("12 am");
    expect(count(1, "day", "days")).toBe("1 day");
    expect(count(2, "day", "days")).toBe("2 days");
  });

  it("picks a day state", () => {
    expect(dayState({ due: true, secured: false, held: false, isToday: false, isFuture: true })).toBe("future");
    expect(dayState({ due: true, secured: false, held: true, isToday: false, isFuture: false })).toBe("held");
    expect(dayState({ due: false, secured: false, held: false, isToday: false, isFuture: false })).toBe("notDue");
  });
});