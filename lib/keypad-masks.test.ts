import { describe, expect, it } from "vitest";
import { formatKeypadBuffer, parseKeypadBuffer, pushKeypadDigit } from "@/lib/keypad-masks";

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
});
