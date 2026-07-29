import { describe, it, expect } from "vitest";
import { formatCounterSecuredMeta } from "./counter-log";

describe("formatCounterSecuredMeta", () => {
  it("formats n of target cups", () => {
    expect(formatCounterSecuredMeta(8, 8, "cups")).toBe("8 of 8 cups");
  });
});
