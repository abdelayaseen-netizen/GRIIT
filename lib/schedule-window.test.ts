import { describe, it, expect } from "vitest";
import {
  evaluateScheduleWindow,
  formatScheduleWindowRange,
} from "./schedule-window";

/** Build a Date whose wall-clock in UTC is the given HH:mm. */
function utcAt(hours: number, minutes: number): Date {
  return new Date(Date.UTC(2026, 6, 28, hours, minutes, 0));
}

describe("evaluateScheduleWindow", () => {
  it("returns none when start or end is missing", () => {
    expect(evaluateScheduleWindow({})).toEqual({ status: "none", chipLabel: null });
    expect(evaluateScheduleWindow({ start: "07:00" })).toEqual({
      status: "none",
      chipLabel: null,
    });
    expect(evaluateScheduleWindow({ end: "08:00" })).toEqual({
      status: "none",
      chipLabel: null,
    });
  });

  it("returns in_window when now is inside the range (UTC)", () => {
    const result = evaluateScheduleWindow({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(7, 30),
    });
    expect(result).toEqual({ status: "in_window", chipLabel: "In window" });
  });

  it("returns out_of_window when now is before the range", () => {
    const result = evaluateScheduleWindow({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(6, 59),
    });
    expect(result).toEqual({ status: "out_of_window", chipLabel: "Out of window" });
  });

  it("returns out_of_window when now is after the range", () => {
    const result = evaluateScheduleWindow({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(8, 1),
    });
    expect(result).toEqual({ status: "out_of_window", chipLabel: "Out of window" });
  });

  it("includes the end bound (inclusive)", () => {
    const result = evaluateScheduleWindow({
      start: "07:00",
      end: "08:00",
      timeZone: "UTC",
      now: utcAt(8, 0),
    });
    expect(result.status).toBe("in_window");
  });

  it("handles overnight wrap (22:00 – 02:00)", () => {
    expect(
      evaluateScheduleWindow({
        start: "22:00",
        end: "02:00",
        timeZone: "UTC",
        now: utcAt(23, 0),
      }).status
    ).toBe("in_window");
    expect(
      evaluateScheduleWindow({
        start: "22:00",
        end: "02:00",
        timeZone: "UTC",
        now: utcAt(1, 0),
      }).status
    ).toBe("in_window");
    expect(
      evaluateScheduleWindow({
        start: "22:00",
        end: "02:00",
        timeZone: "UTC",
        now: utcAt(12, 0),
      }).status
    ).toBe("out_of_window");
  });

  it("returns none for malformed HH:mm", () => {
    expect(
      evaluateScheduleWindow({
        start: "7",
        end: "08:00",
        timeZone: "UTC",
        now: utcAt(7, 30),
      }).status
    ).toBe("none");
  });
});

describe("formatScheduleWindowRange", () => {
  it("formats start – end", () => {
    expect(formatScheduleWindowRange("07:00", "08:00")).toBe("07:00 – 08:00");
  });

  it("returns null when incomplete", () => {
    expect(formatScheduleWindowRange("07:00", null)).toBeNull();
    expect(formatScheduleWindowRange(undefined, "08:00")).toBeNull();
  });
});
