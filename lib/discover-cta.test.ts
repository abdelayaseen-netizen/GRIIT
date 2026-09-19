import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";
import { DISCOVER_CTA_TITLE, discoverCtaSubtitle } from "@/lib/discover-cta";

describe("discover CTA copy", () => {
  it("binds the free cap and does not invent a Pro limit", () => {
    expect(DISCOVER_CTA_TITLE).toBe("Find another challenge");
    expect(FREE_ACTIVE_CHALLENGES_LIMIT).toBe(3);
    expect(discoverCtaSubtitle({ running: 0, isPro: false })).toBe("Nothing running.");
    expect(discoverCtaSubtitle({ running: 2, isPro: false })).toBe(
      "2 of 3. Free accounts hold 3 at a time.",
    );
    expect(discoverCtaSubtitle({ running: 2, isPro: true })).toBe("2 running.");
  });

  it("is a ListRow and does not bulk-replace DISCOVER_CORAL", () => {
    const cta = readFileSync(resolve(__dirname, "../components/home/DiscoverCTA.tsx"), "utf8");
    expect(cta).toContain("ListRow");
    expect(cta).toContain("FREE_ACTIVE_CHALLENGES_LIMIT");
    expect(cta).not.toContain("DISCOVER_CORAL");
    expect(cta).not.toContain("Ready for more?");
    expect(cta).not.toContain("WEIGHT_BOLD");
    const ds = readFileSync(resolve(__dirname, "../lib/design-system.ts"), "utf8");
    expect(ds).toContain("DISCOVER_CORAL");
  });
});
