import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(rel: string): string {
  return readFileSync(resolve(__dirname, rel), "utf8");
}

describe("account privacy enforcement", () => {
  it("gates getRecord, Everyone feed, follow counts, badges, and visitor badges", () => {
    const record = read("../trpc/routes/profiles-record.ts");
    expect(record).toContain("canSeeProfileContent");
    expect(record).toContain("active_streak_count");
    expect(record).toContain("locked.streak.current");

    const feed = read("../trpc/routes/feed.ts");
    expect(feed).toContain("canSeeProfileContent");
    expect(feed).toContain('scope === "everyone"');

    const social = read("../trpc/routes/profiles-social.ts");
    expect(social).toContain("canViewerSeeAccountContent");
    expect(social).toContain("followers: 0, following: 0");

    const stats = read("../trpc/routes/profiles-stats.ts");
    expect(stats).toContain("canViewerSeeAccountContent");

    const visitor = read("../../app/profile/[username].tsx");
    expect(visitor).toContain("badgeItemsFromRows(rec?.badges ?? [])");
    expect(visitor).not.toContain("badgeRowsFromProgress");

    const board = read("../trpc/routes/leaderboard.ts");
    expect(board).toContain("Account privacy does not hide co-members");
  });
});
