import { describe, it, expect } from "vitest";
import {
  counterGoalCaption,
  counterUnitFromTaskType,
  formatCounterSecuredMeta,
} from "./counter-log";

describe("formatCounterSecuredMeta", () => {
  it("formats n of target cups", () => {
    expect(formatCounterSecuredMeta(8, 8, "cups")).toBe("8 of 8 cups");
  });
});

describe("counterUnitFromTaskType", () => {
  it("maps reading to pages, water to oz, everything else to count", () => {
    expect(counterUnitFromTaskType("reading")).toBe("pages");
    expect(counterUnitFromTaskType("water")).toBe("oz");
    expect(counterUnitFromTaskType("counter")).toBe("count");
  });
});

describe("counterGoalCaption", () => {
  it("puts spaces around the slash and before the unit", () => {
    expect(counterGoalCaption(10, 10, "count")).toBe("10 / 10 count");
    expect(counterGoalCaption(3, 10, "pages")).toBe("3 / 10 pages");
  });
});
