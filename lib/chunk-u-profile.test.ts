import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { proofDaysFromPhotos, visibleProofDays } from "@/lib/day-state";

describe("Chunk U Profile Part A", () => {
  it("tab order is Proofs | Challenges | Badges and Proofs is default", () => {
    const v3 = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    expect(v3).toContain('const TABS = ["Proofs", "Challenges", "Badges"]');
    expect(own).toContain('useState<ProfileTab>(isProfileTab(tabParam) ? tabParam : "proofs")');
    expect(visitor).toContain('useState<"Challenges" | "Proofs" | "Badges">("Proofs")');
  });

  it("copy tables match the spec", () => {
    const days = readFileSync(resolve(__dirname, "../components/profile/ProofDaysGrid.tsx"), "utf8");
    const viewer = readFileSync(resolve(__dirname, "../components/profile/DayViewer.tsx"), "utf8");
    const badges = readFileSync(resolve(__dirname, "../components/profile/BadgeRows.tsx"), "utf8");
    const grid = readFileSync(resolve(__dirname, "../components/profile/ConsistencyGrid.tsx"), "utf8");
    expect(days).toContain('export const PROOF_DAYS_EMPTY = "No days with photos"');
    expect(days).toContain("A task with the Camera gate puts its photo here, grouped by the day you took it.");
    expect(days).toContain("days with photos");
    expect(days).toContain("days with shared photos");
    expect(days).toContain("Only days ${name} shared a photo appear here.");
    expect(viewer).toContain("Only you can see this. Share it from here.");
    expect(viewer).toContain("Only you can see this.");
    expect(viewer).toContain("Share to the feed");
    expect(grid).toContain("of {elapsed} days secured");
    expect(grid).toContain("By challenge");
    expect(badges).toContain("Five marks, each earned by verified days only. Nothing here can be bought or awarded.");
    const v3 = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    expect(v3).toContain("Five marks, each earned by verified days only. Nothing here can be bought or awarded.");
  });

  it("day grouping and visitor drop", () => {
    const days = proofDaysFromPhotos([
      { dateKey: "2026-09-19", uri: "u1", shared: true },
      { dateKey: "2026-09-19", uri: "u2", shared: false },
      { dateKey: "2026-09-20", uri: "u3", shared: false },
    ]);
    expect(days.find((d) => d.dateKey === "2026-09-19")?.photoCount).toBe(2);
    expect(visibleProofDays(days, false)).toHaveLength(1);
    expect(visibleProofDays(days, false)[0]?.photoCount).toBe(1);
  });

  it("own profile opens the day viewer, not a feed post", () => {
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const consist = readFileSync(resolve(__dirname, "../app/profile/consistency.tsx"), "utf8");
    expect(own).toContain("ProofDaysGrid");
    expect(own).toContain("ROUTES.PROFILE_DAY");
    expect(own).not.toContain("ROUTES.POST_ID");
    expect(consist).toContain("daysFromSource");
    expect(consist).toContain("ConsistencyGrid");
  });
});
