import { describe, expect, it } from "vitest";
import {
  applyDurationFieldChange,
  durationDigitsFromText,
  formatDurationInput,
  formatKeypadBuffer,
  parseDistanceInput,
  parseDurationInput,
  parseKeypadBuffer,
  pushKeypadDigit,
  sanitizeDistanceInput,
} from "@/lib/keypad-masks";

describe("keypad masks", () => {
  it("distance fills two implied decimals from the right", () => {
    let b = "";
    b = pushKeypadDigit(b, "5", "distance");
    b = pushKeypadDigit(b, "0", "distance");
    b = pushKeypadDigit(b, "2", "distance");
    expect(formatKeypadBuffer(b, "distance")).toBe("5.02");
    expect(parseKeypadBuffer(b, "distance")).toBeCloseTo(5.02);
  });

  it("duration is mm:ss from the right with seconds clamped to 59", () => {
    let b = "";
    for (const d of ["2", "7", "4", "1"]) b = pushKeypadDigit(b, d, "duration");
    expect(formatKeypadBuffer(b, "duration")).toBe("27:41");
    expect(parseKeypadBuffer(b, "duration")).toBe(27 * 60 + 41);
  });

  it("system keyboard distance keeps one decimal", () => {
    expect(sanitizeDistanceInput("5.02x")).toBe("5.02");
    expect(sanitizeDistanceInput("12.349")).toBe("12.34");
    expect(parseDistanceInput("5.02")).toBeCloseTo(5.02);
    expect(parseDistanceInput("")).toBeNull();
  });

  it("system keyboard duration formats mm:ss from digits", () => {
    expect(durationDigitsFromText("27:41")).toBe("2741");
    expect(formatDurationInput("2741")).toBe("27:41");
    expect(parseDurationInput("2741")).toBe(27 * 60 + 41);
    expect(formatDurationInput("1")).toBe("00:01");
    expect(applyDurationFieldChange("1", "00:012")).toBe("12");
    expect(applyDurationFieldChange("12", "00:1")).toBe("1");
    expect(formatDurationInput(applyDurationFieldChange("12", "00:123"))).toBe("01:23");
  });
});
