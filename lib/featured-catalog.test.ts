import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FEATURED_BUILTINS,
  featuredCardLine,
  featuredMembersLine,
  needsSetGym,
} from "@/lib/featured-catalog";

describe("v44 featured catalog", () => {
  it("lists eight built-ins, with Fajr, 7K Steps and 3 Good Things at 7 days", () => {
    expect(FEATURED_BUILTINS).toHaveLength(8);
    expect(FEATURED_BUILTINS.find((c) => c.title === "Fajr Before Sunrise")?.days).toBe(7);
    expect(FEATURED_BUILTINS.find((c) => c.title === "7K Steps")?.proof).toBe("self");
    expect(FEATURED_BUILTINS.find((c) => c.title === "3 Good Things")?.days).toBe(7);
    expect(featuredCardLine(FEATURED_BUILTINS[0]!)).toBe("7 days · Camera");
    expect(FEATURED_BUILTINS[0]?.task).toBe("Get to the gym");
    expect(featuredMembersLine(0)).toBe("Be the first");
    expect(featuredMembersLine(3)).toBe("3 people in it");
    expect(needsSetGym(FEATURED_BUILTINS[0]!)).toBe(false);
    expect(needsSetGym(FEATURED_BUILTINS[1]!)).toBe(false);
    expect(needsSetGym({ placeGate: true })).toBe(false);
    expect(FEATURED_BUILTINS.every((item) => item.placeGate === false)).toBe(true);
    for (const item of FEATURED_BUILTINS) {
      expect(item.config.photo_mode).toBeTruthy();
    }
  });

  it("keeps the seed out of supabase/migrations", () => {
    const sql = readFileSync(resolve(__dirname, "../docs/drafts/v44-featured-catalog.sql"), "utf8");
    expect(sql).toContain("DO NOT APPLY");
    expect(sql).toContain("SELECT id, title");
    expect(sql).toContain("creator_id");
    expect(sql).toContain("photo_mode");
    expect(sql).not.toContain("griit.app");
  });
});
