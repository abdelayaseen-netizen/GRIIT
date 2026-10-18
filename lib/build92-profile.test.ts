// Build 92 chunk 07 · Profile and post viewer.
// Part 2 README copy table and checklist lines 88–105; frames P2-01, P2-03, P2-06…P2-09, P2-12, P2-13.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  followLine,
  photoPagerLine,
  postViewerTitle,
  recordRowLine,
  verifiedLine,
  profileHeaderCacheKey,
  PROFILE_RECORD_TABS,
} from "@/lib/profile-header";
import {
  DEEPER_STATS_BODY,
  DEEPER_STATS_LIST,
  STREAK_HISTORY,
  TRY_PRO,
  YOUR_RECORD_TITLE,
  recordCountsFromRecord,
} from "@/lib/profile-record";
import { parseHeaderSnapshot, snapshotChanged } from "@/lib/profile-header-cache";
import { summarizeFrames, frameSummaryLine } from "@/lib/frame-meter";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("07.2 header copy (Part 2 copy table)", () => {
  it("follow line is one quiet line and singular for one follower", () => {
    expect(followLine(12, 3)).toBe("12 followers · 3 following");
    expect(followLine(1, 0)).toBe("1 follower · 0 following");
    expect(followLine(0, 0)).toBe("0 followers · 0 following");
    expect(followLine(12400, 3)).toBe("12.4K followers · 3 following");
  });
  it("verified line sits under Days secured", () => {
    expect(verifiedLine(0)).toBe("0 verified");
    expect(verifiedLine(5)).toBe("5 verified");
  });
  it("record row reads 'Challenges, badges and stats · n running · n finished · n badges'", () => {
    expect(recordRowLine({ running: 1, finished: 2, badges: 3 })).toBe(
      "Challenges, badges and stats · 1 running · 2 finished · 3 badges",
    );
    expect(recordRowLine({ running: 0, finished: 0, badges: 0 })).toBe(
      "Challenges, badges and stats · 0 running · 0 finished · 0 badges",
    );
  });
  it("Your record has exactly Challenges, Badges and Stats", () => {
    expect(PROFILE_RECORD_TABS).toEqual(["Challenges", "Badges", "Stats"]);
  });
  it("header cache key is per user", () => {
    expect(profileHeaderCacheKey("u1")).toBe("griit.profile.header.u1");
    expect(profileHeaderCacheKey("u1")).not.toBe(profileHeaderCacheKey("u2"));
  });
});

describe("07.2 ProfileHeader source (checklist lines 88, 89, 97)", () => {
  const src = read("components/profile/ProfileHeader.tsx");
  it("shows no Friends number and no third count", () => {
    expect(src).not.toMatch(/label="Friends"/);
    expect(src).not.toMatch(/p\.friends/);
  });
  it("uses the one-line follow copy and the verified line", () => {
    expect(src).toMatch(/followLine\(/);
    expect(src).toMatch(/verifiedLine\(/);
  });
  it("visitor view offers Invite to a challenge, own view Edit profile and Find friends", () => {
    expect(src).toMatch(/INVITE_TO_CHALLENGE|"Invite to a challenge"/);
    expect(src).toMatch(/EDIT_PROFILE/);
    expect(src).toMatch(/FIND_FRIENDS/);
    expect(src).not.toMatch(/MESSAGE/);
  });
  it("exposes the record row (Option A) under the buttons", () => {
    expect(src).toMatch(/recordRowLine\(/);
    expect(src).toMatch(/testID="profile-record-row"/);
  });
});

describe("07.3 proof grid (checklist line 92)", () => {
  const src = read("components/profile/ProfileProofs.tsx");
  it("tiles are 4:5 in 3 columns with a date label", () => {
    expect(src).toMatch(/aspectRatio:\s*4\s*\/\s*5/);
    expect(src).not.toMatch(/aspectRatio:\s*1[,\s]/);
    expect(src).toMatch(/dateBurn/);
  });
  it("offline copy is the Part 2 copy and Try again refetches", () => {
    expect(src).toMatch(/Couldn't load proofs\. You're offline\./);
    expect(src).toMatch(/Try again/);
    expect(src).toMatch(/onRetry/);
  });
});

describe("07.5 post viewer copy", () => {
  it("title is Posts or the challenge name, never a route", () => {
    expect(postViewerTitle(null)).toBe("Posts");
    expect(postViewerTitle("")).toBe("Posts");
    expect(postViewerTitle("Show Up 7")).toBe("Show Up 7");
  });
  it("photo pager reads 1 of 2 and is hidden for one photo", () => {
    expect(photoPagerLine(0, 2)).toBe("1 of 2");
    expect(photoPagerLine(1, 2)).toBe("2 of 2");
    expect(photoPagerLine(0, 1)).toBeNull();
  });
});

describe("07.1 / 07.5 PostViewer source (root cause pins)", () => {
  const src = read("components/profile/PostViewer.tsx");
  it("recycles decoded images and has a fixed layout", () => {
    expect(src).toMatch(/recyclingKey=/);
    expect(src).toMatch(/getItemLayout=/);
    expect(src).toMatch(/initialScrollIndex=/);
    expect(src).toMatch(/removeClippedSubviews/);
  });
  it("does not drive scroll through the JS thread", () => {
    expect(src).not.toMatch(/useNativeDriver:\s*false/);
    expect(src).not.toMatch(/scrollEventThrottle=\{16\}/);
  });
  it("own posts show Liked by and no heart; the heart is the visitor branch only", () => {
    expect(src).toMatch(/likedByLine\(/);
    expect(src).toMatch(/testID="post-liked-by"/);
    expect(src).toMatch(/isOwner \? \([\s\S]*?post-liked-by[\s\S]*?\) : \([\s\S]*?<Heart/);
  });
  it("posts.tsx renders the PostViewer", () => {
    expect(read("app/profile/posts.tsx")).toMatch(/<PostViewer/);
  });
});

describe("07.1 frame meter summary", () => {
  it("counts frames over 50 ms and the worst frame", () => {
    const s = summarizeFrames([16, 17, 51, 120, 16]);
    expect(s).toEqual({ frames: 5, maxMs: 120, over50: 2, avgMs: 44 });
    expect(frameSummaryLine(s)).toBe("5 frames · max 120 ms · 2 over 50 ms · avg 44 ms");
    expect(summarizeFrames([])).toEqual({ frames: 0, maxMs: 0, over50: 0, avgMs: 0 });
  });
});

describe("07.4 Your record screen", () => {
  it("exists with Challenges, Badges and Stats and the Pro preview copy", () => {
    const src = read("app/profile/record.tsx");
    expect(src).toMatch(/PROFILE_RECORD_TABS/);
    for (const k of ["STREAK_HISTORY", "DEEPER_STATS_BODY", "DEEPER_STATS_LIST", "TRY_PRO"]) {
      expect(src).toMatch(new RegExp(`\\{${k}\\}`));
    }
    expect(src).toMatch(/: YOUR_RECORD_TITLE\}/);
    expect(YOUR_RECORD_TITLE).toBe("Your record");
    expect(STREAK_HISTORY).toBe("Streak history");
    expect(DEEPER_STATS_BODY).toBe("Deeper stats are part of GRIIT Pro");
    expect(DEEPER_STATS_LIST).toBe("Charts, best times, verified %, month over month.");
    expect(TRY_PRO).toBe("Try GRIIT Pro");
    expect(recordCountsFromRecord({
      runs: [{}, {}],
      completed: [{ status: "completed" }, { status: "abandoned" }],
      badgeGrid: [{ earned: true }, { earned: false }, { earned: true }],
    })).toEqual({ running: 2, finished: 1, badges: 2 });
    expect(recordCountsFromRecord(null)).toEqual({ running: 0, finished: 0, badges: 0 });
  });
  it("routes expose PROFILE_RECORD and the own profile uses it", () => {
    expect(read("lib/routes.ts")).toMatch(/PROFILE_RECORD: "\/profile\/record"/);
    expect(read("app/(tabs)/profile.tsx")).toMatch(/ROUTES\.PROFILE_RECORD/);
  });
});

describe("07.6 header from cache", () => {
  const snap = {
    displayName: "Yaseen", username: "yaseen", avatarUrl: null, bio: null,
    streak: 1, best: 1, secured: 1, verified: 1, followers: 0, following: 0,
    running: 1, finished: 0, badges: 0, savedAt: 1,
  };
  it("parses a complete snapshot and drops a partial one", () => {
    expect(parseHeaderSnapshot(JSON.stringify(snap))).toEqual(snap);
    expect(parseHeaderSnapshot(JSON.stringify({ ...snap, streak: "1" }))).toBeNull();
    expect(parseHeaderSnapshot(JSON.stringify({ displayName: "x" }))).toBeNull();
    expect(parseHeaderSnapshot("not json")).toBeNull();
    expect(parseHeaderSnapshot(null)).toBeNull();
  });
  it("only rewrites when something other than savedAt changed", () => {
    expect(snapshotChanged(null, snap)).toBe(true);
    expect(snapshotChanged(snap, { ...snap, savedAt: 99 })).toBe(false);
    expect(snapshotChanged(snap, { ...snap, streak: 2 })).toBe(true);
  });
  it("own profile writes and reads the header snapshot", () => {
    const src = read("app/(tabs)/profile.tsx");
    expect(src).toMatch(/useProfileHeaderCache\(/);
    expect(src).not.toMatch(/<Skeleton \/>\s*<View style=\{styles\.skelGap\} \/>\s*<Skeleton \/>/);
  });
});
