import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canFlipShare,
  feedShowsEvent,
  flipSharePatch,
  keepSharePatch,
  shareColumns,
  shareStateOnInsert,
  securedDaySharedOnInsert,
  sharedOnInsert,
} from "./activity-share";

describe("sharedOnInsert R2", () => {
  it("old-client omit writes shared; shareChoicePending true writes unshared", () => {
    expect(sharedOnInsert(undefined)).toBe(true);
    expect(sharedOnInsert(false)).toBe(true);
    expect(sharedOnInsert(true)).toBe(false);
    expect(shareStateOnInsert(undefined)).toBe("shared");
    expect(shareStateOnInsert(true)).toBe("unanswered");
    expect(shareColumns("shared").shared).toBe(true);
    expect(shareColumns("kept").shared).toBe(false);
    expect(keepSharePatch().share_state).toBe("kept");
    expect(feedShowsEvent("shared")).toBe(true);
    expect(feedShowsEvent("kept")).toBe(false);
    expect(feedShowsEvent("unanswered")).toBe(false);
  });
});

describe("flipShare", () => {
  it("owner only; idempotent stamp keeps the first shared_at", () => {
    expect(canFlipShare("u1", "u1")).toBe(true);
    expect(canFlipShare("u1", "u2")).toBe(false);
    expect(flipSharePatch(false, "2026-09-19T12:00:00.000Z", null)).toEqual({
      shared: true,
      share_state: "shared",
      shared_at: "2026-09-19T12:00:00.000Z",
    });
    expect(flipSharePatch(true, "2026-09-19T13:00:00.000Z", "2026-09-19T12:00:00.000Z")).toEqual({
      shared: true,
      share_state: "shared",
      shared_at: "2026-09-19T12:00:00.000Z",
    });
  });
});

describe("feed vs record", () => {
  it("feed hides unshared; secured_day needs a shared proof", () => {
    expect(feedShowsEvent(true)).toBe(true);
    expect(feedShowsEvent(false)).toBe(false);
    expect(securedDaySharedOnInsert(0)).toBe(false);
    expect(securedDaySharedOnInsert(1)).toBe(true);
  });
});

describe("source: complete, flip, feed, record/roster/grid", () => {
  it("checkins.complete honours shareChoicePending and shareProof is service-role", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    expect(src).toContain("shareChoicePending: z.boolean().optional()");
    expect(src).toContain("shareStateOnInsert(input.shareChoicePending)");
    expect(src).toContain("...shareCols");
    expect(src).toContain("shareProof:");
    expect(src).toContain("getSupabaseServer()");
    expect(src).toContain("canFlipShare");
    expect(src).toContain("You can only share your own proof.");
    expect(src).toContain("dayProofs");
  });

  it("public feed queries filter shared = true; listMine / record / roster / consistency do not", () => {
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const record = readFileSync(resolve(__dirname, "../trpc/routes/profiles-record.ts"), "utf8");
    const groups = readFileSync(resolve(__dirname, "../trpc/routes/groups.ts"), "utf8");
    const discover = readFileSync(resolve(__dirname, "../trpc/routes/challenges-discover.ts"), "utf8");
    expect(feed).toContain('.eq("share_state", "shared")');
    expect(feed).toMatch(/getLiveFeed[\s\S]*eq\("share_state", "shared"\)/);
    expect(feed).toMatch(/getUserPosts[\s\S]*eq\("share_state", "shared"\)/);
    expect(feed).toMatch(/list:[\s\S]*eq\("share_state", "shared"\)/);
    expect(feed).toMatch(/getRecentCompletions[\s\S]*eq\("share_state", "shared"\)/);
    expect(feed).toMatch(/getTrending[\s\S]*eq\("share_state", "shared"\)/);
    expect(discover).toContain('.eq("share_state", "shared")');
    expect(record).not.toContain('.eq("shared"');
    expect(record).toContain('.from("check_ins")');
    expect(record).toContain('.from("day_secures")');
    expect(groups).toContain('.from("day_secures")');
    expect(groups).not.toContain('.eq("shared"');
    const listMine = feed.slice(feed.indexOf("listMine:"));
    const listMineBody = listMine.slice(0, listMine.indexOf("getMySummary:"));
    expect(listMineBody).not.toContain('.eq("shared"');
  });
});
