import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("live activity image slot", () => {
  it("does not request a missing griit-mark asset", () => {
    const src = readFileSync(resolve(__dirname, "../lib/live-activity.ts"), "utf8");
    expect(src).not.toContain("griit-mark");
    expect(src).not.toContain("imageName");
    expect(src).not.toContain("dynamicIslandImageName");
    expect(src).not.toContain("imagePosition");
    expect(src).not.toContain("imageSize");
  });
});
