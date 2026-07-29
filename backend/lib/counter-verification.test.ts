import { describe, it, expect } from "vitest";
import {
  buildCounterVerification,
  formatCounterSecuredMeta,
  formatCounterTargetMetLabel,
  COUNTED_BEFORE_MIDNIGHT_LABEL,
} from "./counter-verification";

describe("formatCounterTargetMetLabel", () => {
  it("formats n of target cups · target met", () => {
    expect(
      formatCounterTargetMetLabel({
        count: 8,
        target: 8,
        unit_plural: "cups",
      })
    ).toBe("8 of 8 cups · target met");
  });
});

describe("formatCounterSecuredMeta", () => {
  it("formats n of target cups", () => {
    expect(
      formatCounterSecuredMeta({
        count: 8,
        target: 8,
        unit_plural: "cups",
      })
    ).toBe("8 of 8 cups");
  });
});

describe("buildCounterVerification", () => {
  it("returns midnight + target rows — never camera", () => {
    const v = buildCounterVerification({
      counterLog: { count: 8, target: 8, unit_plural: "cups" },
    });
    expect(v.rows).toEqual([
      {
        key: "midnight",
        label: COUNTED_BEFORE_MIDNIGHT_LABEL,
        verified: true,
      },
      {
        key: "target",
        label: "8 of 8 cups · target met",
        verified: true,
      },
    ]);
    expect(v.rows.some((r) => r.key === "camera_in_app")).toBe(false);
  });
});
