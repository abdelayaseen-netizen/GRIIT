import { describe, expect, it } from "vitest";
import { dateKeyInTimeZone } from "./date-utils";
import { enrollmentEndAt } from "./enrollment-end-at";
import { anyTimeWindowClosedToday, enrollmentStartAt } from "./join-challenge";

const TZ = "America/New_York";

function localClock(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  let h = get("hour");
  if (h === "24") h = "00";
  return `${h}:${get("minute")}:${get("second")}`;
}

describe("join deferral", () => {
  const windowTask = { time_window_end: "08:30" };
  const at446pm = new Date("2026-09-22T20:46:00.000Z");
  const at7am = new Date("2026-09-22T11:00:00.000Z");

  it("4:46pm join with an 8:30am-window task starts tomorrow local 00:00", () => {
    expect(dateKeyInTimeZone(at446pm, TZ)).toBe("2026-09-22");
    expect(anyTimeWindowClosedToday([windowTask], at446pm, TZ)).toBe(true);
    const startAt = enrollmentStartAt(at446pm, TZ, true);
    expect(dateKeyInTimeZone(startAt, TZ)).toBe("2026-09-23");
    expect(localClock(startAt, TZ)).toBe("00:00:00");
  });

  it("7am join with the same window starts today", () => {
    expect(anyTimeWindowClosedToday([windowTask], at7am, TZ)).toBe(false);
    const startAt = enrollmentStartAt(at7am, TZ, false);
    expect(startAt).toBe(at7am);
    expect(dateKeyInTimeZone(startAt, TZ)).toBe("2026-09-22");
  });

  it("enrollmentEndAt is last day 23:59:59.999 from the actual start", () => {
    const startAt = enrollmentStartAt(at446pm, TZ, true);
    const end = enrollmentEndAt({
      startAt,
      durationDays: 7,
      durationType: "multi_day",
      timeZone: TZ,
    });
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      fractionalSecondDigits: 3,
    }).formatToParts(end);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
    expect(`${get("year")}-${get("month")}-${get("day")}`).toBe("2026-09-29");
    expect(`${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`).toBe(
      "23:59:59.999",
    );
  });

  it("applies to any mode, not only hard_mode", () => {
    expect(
      anyTimeWindowClosedToday([{ time_window_end: "08:30", config: {} }], at446pm, TZ),
    ).toBe(true);
  });

  const between = {
    gate_time_mode: "between",
    gate_time_start: "05:00",
    gate_time_end: "06:30",
    config: { required: true },
  };
  const at4am = new Date("2026-09-27T08:00:00.000Z"); // 04:00 EDT
  const beforeOpen = new Date("2026-09-27T08:30:00.000Z"); // 04:30 EDT
  const inside = new Date("2026-09-27T09:45:00.000Z"); // 05:45 EDT
  const afterClose = new Date("2026-09-27T17:24:00.000Z"); // 13:24 EDT

  it("launch at 4:00 am starts today", () => {
    expect(anyTimeWindowClosedToday([between], at4am, TZ)).toBe(false);
    expect(enrollmentStartAt(at4am, TZ, false)).toBe(at4am);
    expect(dateKeyInTimeZone(at4am, TZ)).toBe("2026-09-27");
  });

  it("launch before the window opens starts today", () => {
    expect(anyTimeWindowClosedToday([between], beforeOpen, TZ)).toBe(false);
    expect(dateKeyInTimeZone(enrollmentStartAt(beforeOpen, TZ, false), TZ)).toBe("2026-09-27");
  });

  it("launch inside the window starts today", () => {
    expect(anyTimeWindowClosedToday([between], inside, TZ)).toBe(false);
  });

  it("launch after the window closes starts tomorrow", () => {
    expect(anyTimeWindowClosedToday([between], afterClose, TZ)).toBe(true);
    expect(dateKeyInTimeZone(enrollmentStartAt(afterClose, TZ, true), TZ)).toBe("2026-09-28");
  });

  it("a by gate that has passed defers to tomorrow", () => {
    expect(
      anyTimeWindowClosedToday(
        [{ gate_time_mode: "by", gate_time_start: "07:00", config: { required: true } }],
        afterClose,
        TZ,
      ),
    ).toBe(true);
  });

  it("no time gate starts today", () => {
    expect(anyTimeWindowClosedToday([{ config: { required: true } }], afterClose, TZ)).toBe(false);
  });

  it("optional closed window does not defer", () => {
    expect(
      anyTimeWindowClosedToday(
        [{ ...between, config: { required: false } }],
        afterClose,
        TZ,
      ),
    ).toBe(false);
  });

  it("timezone edge: same instant is still open in a later zone", () => {
    expect(anyTimeWindowClosedToday([between], afterClose, "America/Los_Angeles")).toBe(true);
    expect(anyTimeWindowClosedToday([between], afterClose, "Pacific/Auckland")).toBe(false);
  });
});
