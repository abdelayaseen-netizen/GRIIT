import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { doubleTapAction, eventLine, groupFeedJoins, isJoinGroup, joinLine, showCameraSeal, systemLine } from "@/lib/feed-join";

function post(partial: Partial<LiveFeedPost> & { id: string }): LiveFeedPost {
  return {
    userId: "u1",
    username: "alex",
    displayName: "Alex",
    avatarUrl: null,
    streakCount: 0,
    challengeId: "c1",
    challengeName: "Iron man",
    taskName: "Run",
    currentDay: 3,
    totalDays: 75,
    eventType: "task_completed",
    isCompleted: false,
    hasProof: false,
    photoUrl: null,
    proofPhotoUrl: null,
    verified: false,
    caption: null,
    createdAt: "2026-10-01T12:00:00.000Z",
    respectCount: 0,
    reactedByMe: false,
    commentCount: 0,
    visibility: "public",
    ...partial,
  };
}

describe("joinLine", () => {
  it("names one, two, and n others with singular other", () => {
    expect(joinLine(["Alex"], 0, "Iron man")).toBe("Alex started Iron man");
    expect(joinLine(["Alex", "Bina"], 0, "Iron man")).toBe("Alex and Bina started Iron man");
    expect(joinLine(["Alex", "Bina"], 1, "Iron man")).toBe("Alex, Bina and 1 other started Iron man");
    expect(joinLine(["Alex", "Bina"], 3, "Iron man")).toBe("Alex, Bina and 3 others started Iron man");
    expect(systemLine("Alex", 3, 75, "Iron man")).toBe("Alex secured Day 3 of 75 · Iron man");
  });
});

describe("groupFeedJoins", () => {
  it("groups the same challenge within one hour and leaves later joins alone", () => {
    const items = groupFeedJoins([
      post({
        id: "j1",
        userId: "a",
        username: "alex",
        displayName: "Alex",
        eventType: "joined_challenge",
        createdAt: "2026-10-01T12:00:00.000Z",
      }),
      post({
        id: "j2",
        userId: "b",
        username: "bina",
        displayName: "Bina",
        eventType: "joined_challenge",
        createdAt: "2026-10-01T12:40:00.000Z",
      }),
      post({
        id: "j3",
        userId: "c",
        username: "cleo",
        displayName: "Cleo",
        eventType: "joined_challenge",
        createdAt: "2026-10-01T12:50:00.000Z",
      }),
      post({
        id: "late",
        userId: "d",
        username: "drew",
        displayName: "Drew",
        eventType: "joined_challenge",
        createdAt: "2026-10-01T14:00:00.000Z",
      }),
      post({ id: "task", eventType: "task_completed" }),
    ]);
    expect(items).toHaveLength(3);
    expect(isJoinGroup(items[0]!) && items[0].names).toEqual(["Alex", "Bina"]);
    expect(isJoinGroup(items[0]!) && items[0].others).toBe(1);
    expect(isJoinGroup(items[1]!) && items[1].names).toEqual(["Drew"]);
    expect(items[2] && !isJoinGroup(items[2]) && items[2].id).toBe("task");
  });

  it("groups equal-timestamp secured events once and leaves a photo post alone", () => {
    const t = "2026-10-01T12:00:00.000Z";
    const items = groupFeedJoins([
      post({ id: "s1", userId: "a", displayName: "Alex", eventType: "secured_day", createdAt: t, currentDay: 2 }),
      post({ id: "s2", userId: "b", displayName: "Bina", eventType: "secured_day", createdAt: t, currentDay: 2 }),
      post({ id: "photo", eventType: "task_completed", proofPhotoUrl: "https://cdn.example/p.jpg" }),
    ]);
    expect(isJoinGroup(items[0]!)).toBe(true);
    expect(isJoinGroup(items[0]!) && items[0].verb).toBe("secured");
    expect(isJoinGroup(items[0]!) && eventLine(items[0])).toBe("Alex and Bina secured Day 2 · Iron man");
    expect(items[1] && !isJoinGroup(items[1]) && items[1].id).toBe("photo");
  });
});

describe("CameraSeal and DoubleTapRespect", () => {
  it("seals only proof_photo_url and no-ops own-post double tap", () => {
    expect(showCameraSeal(null)).toBe(false);
    expect(showCameraSeal("")).toBe(false);
    expect(showCameraSeal("https://cdn.example/proof.jpg")).toBe(true);
    expect(doubleTapAction(true, false)).toBe("noop");
    expect(doubleTapAction(true, true)).toBe("noop");
    expect(doubleTapAction(false, false)).toBe("respect");
    expect(doubleTapAction(false, true)).toBe("keep");
    const card = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    expect(card).toContain("CameraSeal");
    expect(card).toContain("DoubleTapRespect");
    expect(card).toContain("FeedCompactRow");
    expect(card).toContain("ownPost");
    expect(card).not.toContain('stamp={stamp ? "Verified"');
    const feed = readFileSync(resolve(__dirname, "../components/LiveFeedSection.tsx"), "utf8");
    expect(feed).toContain("groupFeedJoins");
    expect(feed).toContain("FeedEvent");
    const route = readFileSync(resolve(__dirname, "../backend/trpc/routes/feed.ts"), "utf8");
    expect(route).toContain("anonymousIds.has(ev.user_id)");
    expect(route).toContain("joined_challenge");
    expect(route).toContain("challenge_created");
  });
});
