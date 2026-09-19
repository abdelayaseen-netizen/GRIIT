import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("legacy streak-milestone modal", () => {
  it("has no remaining import of CelebrationOverlay or celebrationStore", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const layout = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(home).not.toContain("CelebrationOverlay");
    expect(home).not.toContain("celebrationStore");
    expect(home).not.toContain("You're building something real.");
    expect(home).not.toContain("STREAK_MILESTONES");
    expect(home).not.toContain("griit_milestone_");
    expect(layout).not.toContain("CelebrationOverlay");
    expect(layout).not.toContain("celebrationStore");
  });
});
