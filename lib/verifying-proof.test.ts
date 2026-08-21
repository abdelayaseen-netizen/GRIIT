import { describe, it, expect } from "vitest";
import {
  mapServerVerificationRows,
  visibleVerifyingRows,
} from "./verifying-proof";

describe("visibleVerifyingRows", () => {
  it("hides pending rows (null / undefined)", () => {
    const visible = visibleVerifyingRows([
      { label: "Taken 07:42 — inside the window", verified: null },
      { label: "Marked as captured in-app", verified: undefined },
    ]);
    expect(visible).toEqual([]);
  });

  it("reveals only confirmed pass/fail rows", () => {
    const visible = visibleVerifyingRows([
      { label: "Taken 07:42 — inside the window", verified: true, role: "check" },
      { label: "Marked as captured in-app", verified: null },
      { label: "Distance · 30 m", verified: false, role: "check" },
    ]);
    expect(visible.map((r) => r.label)).toEqual([
      "Taken 07:42 — inside the window",
      "Distance · 30 m",
    ]);
    expect(visible[0]!.verified).toBe(true);
    expect(visible[1]!.verified).toBe(false);
  });

  it("keeps records visible — verified is still boolean", () => {
    const visible = visibleVerifyingRows([
      {
        label: "Marked as captured in-app",
        verified: true,
        role: "record",
      },
    ]);
    expect(visible).toHaveLength(1);
    expect(visible[0]?.role).toBe("record");
  });

  it("never invents rows — empty input stays empty", () => {
    expect(visibleVerifyingRows([])).toEqual([]);
  });
});

describe("mapServerVerificationRows", () => {
  it("copies role through — does not strip to label+verified", () => {
    expect(
      mapServerVerificationRows([
        {
          key: "time_window",
          label: "Taken 07:42 — inside the window",
          verified: true,
          role: "check",
        },
        {
          key: "camera_in_app",
          label: "Marked as captured in-app",
          verified: true,
          role: "record",
        },
      ])
    ).toEqual([
      {
        label: "Taken 07:42 — inside the window",
        verified: true,
        role: "check",
      },
      {
        label: "Marked as captured in-app",
        verified: true,
        role: "record",
      },
    ]);
  });
});
