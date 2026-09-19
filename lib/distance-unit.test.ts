import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDistanceUnit, runDistanceUnit } from "./distance-unit";

describe("runDistanceUnit", () => {
  it("uses the task unit on first render, not the profile", () => {
    expect(runDistanceUnit("mi", "km")).toBe("mi");
    expect(runDistanceUnit("km", "mi")).toBe("km");
    expect(runDistanceUnit(undefined, "km")).toBe("km");
    expect(runDistanceUnit(undefined, undefined)).toBe(parseDistanceUnit(undefined));
    expect(runDistanceUnit("yd", "km")).toBe("km");
  });

  it("Log / flow read runDistanceUnit from config.unit", () => {
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(flow).toContain("runDistanceUnit((config as { unit?: unknown }).unit, profile?.distance_unit)");
  });
});
