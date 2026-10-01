import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DS_V3 } from "@/lib/design-system";

describe("display face (contradiction 116)", () => {
  it("uses SF Pro Display Heavy 800 tabular and does not load Barlow", () => {
    expect(DS_V3.type.number.fontWeight).toBe("800");
    expect(DS_V3.type.number.fontFamily).toBeUndefined();
    expect(DS_V3.displayWeight).toBe("800");
    const tokens = readFileSync(resolve(__dirname, "design-system.ts"), "utf8");
    const layout = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(tokens).not.toMatch(/BarlowCondensed/);
    expect(layout).not.toMatch(/BarlowCondensed/);
    expect(layout).not.toMatch(/barlow-condensed/);
  });
});
