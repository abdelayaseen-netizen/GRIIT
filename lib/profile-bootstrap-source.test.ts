import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");

describe("own profile vs home.bootstrap", () => {
  it("reads streak and follow counts from home.bootstrap", () => {
    expect(src).toContain("useHomeBootstrap");
    expect(src).toContain("bootstrap.data?.stats?.activeStreak");
    expect(src).toContain("bootstrap.data?.followCounts");
    // Build 92 07.2: no consistency headline on the profile; verified reads user_stats.
    expect(src).toContain("userStats?.verified_days");
  });
});
