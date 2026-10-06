import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("v48 week strip", () => {
  it("uses 30, 36, and 20 and one button label", () => {
    const src = readFileSync(resolve(__dirname, "../components/ds/WeekStrip.tsx"), "utf8");
    expect(src).toContain("home: 30");
    expect(src).toContain("sheet: 36");
    expect(src).toContain("profile: 20");
    expect(src).toContain('accessibilityRole="button"');
    expect(src).toContain("weekStripAccessibilityLabel");
    expect(src).toContain('shape="circle"');
    expect(src).toContain("DayCell");
  });
});
