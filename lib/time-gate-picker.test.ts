import { describe, expect, it } from "vitest";
import {
  BETWEEN_END_BEFORE_START,
  DEFAULT_BETWEEN_END_HHMM,
  DEFAULT_BETWEEN_START_HHMM,
  DEFAULT_BY_HHMM,
  betweenEndAfterStart,
  dateToHhmm,
  formatBetweenDisplay,
  formatByDisplay,
  hhmmToDate,
  parseHhmm,
} from "@/lib/time-gate-picker";

describe("time-gate-picker", () => {
  it("defaults are By 07:00 and Between 05:00–06:30", () => {
    expect(DEFAULT_BY_HHMM).toBe("07:00");
    expect(DEFAULT_BETWEEN_START_HHMM).toBe("05:00");
    expect(DEFAULT_BETWEEN_END_HHMM).toBe("06:30");
  });

  it("parses and formats 24h HH:MM", () => {
    expect(parseHhmm("07:00")).toEqual({ h: 7, m: 0 });
    expect(parseHhmm("5:00")).toEqual({ h: 5, m: 0 });
    expect(parseHhmm("24:00")).toBeNull();
    expect(dateToHhmm(hhmmToDate("05:00"))).toBe("05:00");
    expect(dateToHhmm(hhmmToDate("18:45"))).toBe("18:45");
  });

  it("displays 12-hour with am/pm", () => {
    expect(formatByDisplay("07:00")).toBe("7:00 am");
    expect(formatBetweenDisplay("05:00", "06:30")).toBe("5:00–6:30 am");
    expect(formatBetweenDisplay("22:00", "23:15")).toBe("10:00–11:15 pm");
    expect(formatBetweenDisplay("11:00", "13:00")).toBe("11:00 am–1:00 pm");
  });

  it("Between requires the end after the start", () => {
    expect(betweenEndAfterStart("05:00", "06:30")).toBe(true);
    expect(betweenEndAfterStart("06:30", "05:00")).toBe(false);
    expect(betweenEndAfterStart("06:30", "06:30")).toBe(false);
    expect(betweenEndAfterStart("xx", "06:30")).toBe(false);
    expect(BETWEEN_END_BEFORE_START).toBe("End must be after start.");
  });
});
