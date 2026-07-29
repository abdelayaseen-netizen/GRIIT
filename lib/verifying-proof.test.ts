import { describe, it, expect } from "vitest";
import { visibleVerifyingRows } from "./verifying-proof";

describe("visibleVerifyingRows", () => {
  it("hides pending rows (null / undefined)", () => {
    const visible = visibleVerifyingRows([
      { label: "Taken 07:42 — inside the window", verified: null },
      { label: "Shot in-app, not from the library", verified: undefined },
    ]);
    expect(visible).toEqual([]);
  });

  it("reveals only confirmed pass/fail rows", () => {
    const visible = visibleVerifyingRows([
      { label: "Taken 07:42 — inside the window", verified: true },
      { label: "Shot in-app, not from the library", verified: null },
      { label: "On location · 30 m away", verified: false },
    ]);
    expect(visible.map((r) => r.label)).toEqual([
      "Taken 07:42 — inside the window",
      "On location · 30 m away",
    ]);
    expect(visible[0]!.verified).toBe(true);
    expect(visible[1]!.verified).toBe(false);
  });

  it("never invents rows — empty input stays empty", () => {
    expect(visibleVerifyingRows([])).toEqual([]);
  });
});
