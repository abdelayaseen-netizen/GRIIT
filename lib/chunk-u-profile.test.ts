import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { proofDaysFromPhotos, visibleProofDays } from "@/lib/day-state";

describe("Chunk U Profile Part A", () => {
  // Build 92 07.3 / 07.4 (Option A): the profile tabs are gone. Proofs sit directly under the header and
  // Challenges · Badges · Stats live on "Your record" (app/profile/record.tsx); visitors get no Stats.
  it("proofs come first; Challenges, Badges and Stats are one place (Your record)", () => {
    const v3 = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const visitor = readFileSync(resolve(__dirname, "../app/profile/[username].tsx"), "utf8");
    const record = readFileSync(resolve(__dirname, "../app/profile/record.tsx"), "utf8");
    expect(v3).not.toContain("const TABS");
    expect(own).toContain("ROUTES.PROFILE_RECORD");
    expect(own).toContain("<ProfileProofs");
    expect(visitor).toContain("ROUTES.PROFILE_RECORD");
    expect(record).toContain('isVisitor ? ["Challenges", "Badges"] : PROFILE_RECORD_TABS');
    expect(record).toContain('tab === "Stats" && !isVisitor');
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
    expect(grid).toContain("calendarHeaderLine(header)");
    expect(grid).toContain("By challenge");
    expect(badges).toContain("Five marks, each earned by verified days only. Nothing here can be bought or awarded.");
    const v3 = readFileSync(resolve(__dirname, "../components/profile/ProfileV3.tsx"), "utf8");
    const header = readFileSync(resolve(__dirname, "../components/profile/ProfileHeader.tsx"), "utf8");
    expect(v3).toContain("Five marks, each earned by verified days only. Nothing here can be bought or awarded.");
    expect(v3).toContain('title={handle ? `@${handle}` : "Profile"}');
    expect(v3).toContain("styles.secondary");
    expect(header).toContain("Add a bio");
    expect(v3).not.toContain("title={title}");
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

  it("own profile opens the vertical posts list from the grid", () => {
    const own = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const consist = readFileSync(resolve(__dirname, "../app/profile/consistency.tsx"), "utf8");
    expect(own).toContain("ProfileProofs");
    expect(own).toContain("ROUTES.PROFILE_POSTS");
    expect(own).not.toContain("ROUTES.POST_ID");
    expect(consist).toContain("daysFromSource");
    expect(consist).toContain("ConsistencyGrid");
  });
});
