import { describe, expect, it } from "vitest";
import { completeLabel, showLogPartial, step } from "@/lib/counter";

describe("counter complete", () => {
  it("names the complete button and caps a step at the target", () => {
    expect(completeLabel(30, "pages", false)).toBe("Complete · 30 pages");
    expect(completeLabel(30, "pages", true)).toBe("Complete · take photo");
    expect(showLogPartial(0, 30)).toBe(false);
    expect(showLogPartial(4, 30)).toBe(true);
    expect(showLogPartial(30, 30)).toBe(false);
    expect(step(25, 10, 30)).toBe(30);
  });
});
