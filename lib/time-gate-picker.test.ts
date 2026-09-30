import { describe, expect, it } from "vitest";
import {
  DEFAULT_BETWEEN_END_HHMM,
  DEFAULT_BETWEEN_START_HHMM,
  DEFAULT_BY_HHMM,
  betweenEndAfterStart,
  dateToHhmm,
  fmt12,
  fmtWindow,
  hhmmToDate,
  parseHhmm,
  validate,
} from "@/lib/time-gate-picker";

describe("time-gate-picker", () => {
  it("defaults are By 07:00 and Between 05:00–06:30", () => {
    expect(DEFAULT_BY_HHMM).toBe("07:00");
    expect(DEFAULT_BETWEEN_START_HHMM).toBe("05:00");
    expect(DEFAULT_BETWEEN_END_HHMM).toBe("06:30");
  });

  it("fmt12 is 12-hour with am/pm", () => {
    expect(fmt12("07:00")).toBe("7:00 am");
    expect(fmt12("18:30")).toBe("6:30 pm");
    expect(fmt12("00:00")).toBe("12:00 am");
    expect(fmt12("12:00")).toBe("12:00 pm");
  });

  it("fmtWindow shares am/pm when both sides match", () => {
    expect(fmtWindow("05:00", "06:30")).toBe("5:00–6:30 am");
    expect(fmtWindow("22:00", "23:15")).toBe("10:00–11:15 pm");
    expect(fmtWindow("11:00", "13:00")).toBe("11:00 am–1:00 pm");
  });

  it("validation requires end after start on the same day", () => {
    expect(betweenEndAfterStart("05:00", "06:30")).toBe(true);
    expect(betweenEndAfterStart("06:30", "05:00")).toBe(false);
    expect(betweenEndAfterStart("06:30", "06:30")).toBe(false);
    expect(validate("05:00", "06:30")).toBeNull();
    expect(validate("05:00", "04:30")).toBe(
      "End has to be after 5:00 am. The window can't cross midnight.",
    );
    expect(parseHhmm("24:00")).toBeNull();
    expect(dateToHhmm(hhmmToDate("18:30"))).toBe("18:30");
  });
});
