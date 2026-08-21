import { describe, it, expect } from "vitest";
import {
  buildCounterVerification,
  formatCounterSecuredMeta,
  formatCounterTargetMetLabel,
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
  it("returns target check only — never midnight, never camera", () => {
    const v = buildCounterVerification({
      counterLog: { count: 8, target: 8, unit_plural: "cups" },
    });
    expect(v.rows).toEqual([
      {
        key: "target",
        label: "8 of 8 cups · target met",
        verified: true,
        role: "check",
      },
    ]);
    expect(v.rows.some((r) => r.key === "camera_in_app")).toBe(false);
    expect(v.rows.some((r) => r.key === "midnight")).toBe(false);
  });

  it("returns no rows when there is no target to evaluate", () => {
    expect(buildCounterVerification({}).rows).toEqual([]);
    expect(buildCounterVerification({ counterLog: null }).rows).toEqual([]);
  });
});
