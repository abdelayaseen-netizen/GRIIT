import { describe, expect, it } from "vitest";
import { sheetKeyboardLift, sheetOutsideAction } from "./sheet-keyboard";

describe("12b.1 a sheet with a caption keeps the post while typing", () => {
  it("with the keyboard open, a tap outside only drops the keyboard", () => {
    expect(sheetOutsideAction(true, true)).toBe("dismiss-keyboard");
  });

  it("with the keyboard closed, a tap outside closes the sheet as before", () => {
    expect(sheetOutsideAction(false, true)).toBe("close");
  });

  it("sheets that do not opt in keep closing on the first tap", () => {
    expect(sheetOutsideAction(true, false)).toBe("close");
  });

  it("lifts the sheet so its button sits just above the keyboard", () => {
    expect(sheetKeyboardLift(336, 34, 12)).toBe(314);
    expect(sheetKeyboardLift(0, 34, 12)).toBe(0);
  });
});
