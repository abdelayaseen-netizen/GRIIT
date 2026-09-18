import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { feedAvatarUri, keepLiveFeedPosts } from "./live-feed-list";

function post(
  partial: Partial<Parameters<typeof keepLiveFeedPosts>[0][number]> & { id: string },
): Parameters<typeof keepLiveFeedPosts>[0][number] {
  return {
    userId: "u1",
    eventType: "task_completed",
    challengeId: "c1",
    challengeName: "Run",
    photoUrl: null,
    proofPhotoUrl: null,
    avatarUrl: null,
    createdAt: "2026-09-18T18:00:00.000Z",
    ...partial,
  };
}

describe("keepLiveFeedPosts", () => {
  it("keeps three camera proofs plus secured_day instead of collapsing to the newest", () => {
    const rows = [
      post({ id: "secure", eventType: "secured_day", createdAt: "2026-09-18T18:10:00.000Z" }),
      post({
        id: "p3",
        photoUrl: "https://cdn.example/3.jpg",
        createdAt: "2026-09-18T18:08:00.000Z",
      }),
      post({
        id: "p2",
        photoUrl: "https://cdn.example/2.jpg",
        createdAt: "2026-09-18T18:06:00.000Z",
      }),
      post({
        id: "p1",
        photoUrl: "https://cdn.example/1.jpg",
        createdAt: "2026-09-18T18:04:00.000Z",
      }),
    ];
    expect(keepLiveFeedPosts(rows).map((p) => p.id)).toEqual(["secure", "p3", "p2", "p1"]);
    expect(feedAvatarUri(null, "https://cdn.example/3.jpg")).toBeUndefined();
    expect(feedAvatarUri("https://cdn.example/3.jpg", "https://cdn.example/3.jpg")).toBeUndefined();
    expect(feedAvatarUri("https://cdn.example/avatar.jpg", "https://cdn.example/3.jpg")).toBe(
      "https://cdn.example/avatar.jpg",
    );
    const feed = readFileSync(resolve(__dirname, "../components/LiveFeedSection.tsx"), "utf8");
    expect(feed).toContain("keepLiveFeedPosts(posts)");
    expect(feed).not.toContain("diverseFeed");
    const mut = readFileSync(resolve(__dirname, "../hooks/useAppChallengeMutations.ts"), "utf8");
    expect(mut).toContain('invalidateQueries({ queryKey: ["liveFeed"] })');
    const card = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    expect(card).toContain("feedAvatarUri(post.avatarUrl, photo)");
    expect(card).not.toContain("uri={post.photoUrl");
  });
});
