import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { doubleTapAction, eventLine, groupFeedJoins, isJoinGroup, joinLine, showCameraSeal, startedPreviewCopy } from "@/lib/feed-join";

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
    expect(joinLine(["Bilal", "Zayd"], 2, "Up by 5")).toBe("Bilal, Zayd and 2 others started Up by 5");
  });

  it("finished with 0 secured says ended; 1 day is singular", () => {
    expect(
      eventLine({
        names: ["Alex"],
        others: 0,
        verb: "finished",
        challengeName: "Iron man",
        dayN: 7,
        dayOf: 7,
        secured: 0,
      }),
    ).toBe("Alex ended Iron man");
    expect(
      eventLine({
        names: ["Alex"],
        others: 0,
        verb: "finished",
        challengeName: "Iron man",
        dayN: 1,
        dayOf: 1,
        secured: 1,
      }),
    ).toBe("Alex finished Iron man · 1 of 1 day");
    expect(
      eventLine({
        names: ["Alex"],
        others: 0,
        verb: "finished",
        challengeName: "Iron man",
        dayN: 3,
        dayOf: 7,
        secured: 3,
      }),
    ).toBe("Alex finished Iron man · 3 of 7 days");
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

  it("leaves a finished challenge as a post", () => {
    const items = groupFeedJoins([
      post({
        id: "f1",
        eventType: "completed_challenge",
        isCompleted: true,
        createdAt: "2026-10-01T12:00:00.000Z",
      }),
      post({
        id: "f2",
        userId: "b",
        displayName: "Bina",
        eventType: "completed_challenge",
        isCompleted: true,
        createdAt: "2026-10-01T12:10:00.000Z",
      }),
    ]);
    expect(items.every((item) => !isJoinGroup(item))).toBe(true);
    expect(items.map((item) => ("id" in item ? item.id : ""))).toEqual(["f1", "f2"]);
  });

  it("hides the viewer's own started line and groups the rest by challenge and hour", () => {
    const items = groupFeedJoins(
      [
        post({ id: "me", userId: "me", displayName: "Yaseen", eventType: "joined_challenge", createdAt: "2026-10-09T14:10:00.000Z" }),
        post({ id: "a", userId: "a", displayName: "Alex", eventType: "joined_challenge", createdAt: "2026-10-09T14:20:00.000Z" }),
        post({ id: "b", userId: "b", displayName: "Bina", eventType: "joined_challenge", challengeId: "c2", challengeName: "Read", createdAt: "2026-10-09T14:30:00.000Z" }),
      ],
      "me",
    );
    expect(items).toHaveLength(2);
    expect(isJoinGroup(items[0]!)).toBe(true);
    if (isJoinGroup(items[0]!)) expect(items[0].names).toEqual(["Alex"]);
  });

  it("offers Open challenge when the viewer is already in", () => {
    expect(startedPreviewCopy(null)).toEqual({ line: "Day 1 is today.", label: "Join", open: false });
    expect(startedPreviewCopy({ day: 6, total: 7 })).toEqual({
      line: "You're in · Day 6 of 7",
      label: "Open challenge",
      open: true,
    });
  });

  it("does not turn secured_day rows into a system line", () => {
    const t = "2026-10-01T12:00:00.000Z";
    const items = groupFeedJoins([
      post({ id: "s1", userId: "a", displayName: "Alex", eventType: "secured_day", createdAt: t, currentDay: 2 }),
      post({ id: "s2", userId: "b", displayName: "Bina", eventType: "secured_day", createdAt: t, currentDay: 2 }),
      post({ id: "photo", eventType: "task_completed", proofPhotoUrl: "https://cdn.example/p.jpg" }),
    ]);
    expect(items.every((item) => !isJoinGroup(item))).toBe(true);
    expect(items.map((item) => ("id" in item ? item.id : ""))).toEqual(["s1", "s2", "photo"]);
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
    expect(feed).not.toMatch(/\} live</);
    expect(feed).not.toContain("liveCountMeta");
    const route = readFileSync(resolve(__dirname, "../backend/trpc/routes/feed.ts"), "utf8");
    expect(route).toContain("anonymousIds.has(ev.user_id)");
    expect(route).toContain("joined_challenge");
    expect(route).toContain("challenge_created");
  });
});
