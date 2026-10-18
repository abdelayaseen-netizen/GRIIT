import { describe, expect, it } from "vitest";
import { completeLabel, showLogPartial, step } from "@/lib/counter";

describe("counter complete", () => {
  it("names the complete button; a step goes past the target (build 92 03.1) and stops at zero", () => {
    expect(completeLabel(30, "pages", false)).toBe("Done · 30 pages");
    expect(completeLabel(30, "pages", true)).toBe("Done · 30 pages");
    expect(showLogPartial(0, 30)).toBe(false);
    expect(showLogPartial(4, 30)).toBe(true);
    expect(showLogPartial(30, 30)).toBe(false);
    expect(step(25, 10, 30)).toBe(35);
    expect(step(0, -1, 30)).toBe(0);
  });
});
