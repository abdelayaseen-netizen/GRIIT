// Build 92 chunk 07 · synthetic posts for the dev harnesses (app/dev/build92-posts, build92-grid).
import type { LiveFeedPost } from "@/components/feed/feedTypes";

const COUNT = 25;

/** 25 posts with large (2000 px) photos so each cell decodes like a real camera proof. */
export function syntheticPosts(count = COUNT): LiveFeedPost[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `dev-post-${i + 1}`,
    userId: "dev-user",
    username: "yaseen",
    displayName: "Yaseen",
    avatarUrl: null,
    streakCount: i + 1,
    challengeId: "dev-ch",
    challengeName: "Show Up 7",
    currentDay: (i % 7) + 1,
    totalDays: 7,
    eventType: "task_completed",
    isCompleted: true,
    hasProof: true,
    photoUrl: `https://picsum.photos/seed/griit-${i + 1}/2000/2000`,
    proofPhotoUrl: i % 5 === 0 ? `https://picsum.photos/seed/griit-proof-${i + 1}/2000/2000` : null,
    verified: true,
    caption: i % 3 === 0 ? "Got to the gym before work. Legs today." : null,
    createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
    respectCount: i % 4,
    reactedByMe: false,
    lastReactorName: i % 4 ? "Sara" : null,
    commentCount: i % 3,
    visibility: "friends",
    audience: "friends",
  }));
}

