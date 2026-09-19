import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  consistencyContext,
  consistencyDetailHero,
  consistencyFromRecord,
  consistencyHeadline,
  consistencyLine,
} from "@/lib/consistency";

describe("consistency builders", () => {
  it("uses one phrasing and no percentage", () => {
    const c = consistencyFromRecord({
      verifiedClosed: 10,
      closedDueDays: 13,
      dueToday: true,
      dueDayKeys: ["2026-09-01", "2026-09-19"],
    });
    expect(consistencyHeadline(c)).toBe("10 of 13 days");
    expect(consistencyLine(c)).toBe("10 of 13 days secured.");
    expect(consistencyContext(c, (k) => k)).toBe("Since 2026-09-01. 1 due today.");
    expect(consistencyDetailHero(c)).toBe("10 of 13");
    expect(consistencyHeadline({ secured: 0, due: 0, dueToday: false, firstDueDate: null })).toBe(
      "No due days yet.",
    );
    expect(consistencyLine({ secured: 0, due: 0, dueToday: true, firstDueDate: null })).toBe(
      "Today is the first day due.",
    );
  });

  it("Home and Profile read verifiedClosed / closedDueDays", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const profile = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    expect(home).toContain("consistencyLine");
    expect(home).toContain("verifiedClosed");
    expect(profile).toContain("consistencyHeadline");
    expect(profile).toContain("consistencyContext");
    expect(profile).not.toContain("profileConsistencyFromBootstrap");
  });
});
