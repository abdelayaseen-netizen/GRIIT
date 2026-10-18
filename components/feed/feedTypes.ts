/** Shared types for home feed cards (matches `feed.getLiveFeed` post shape). */
import type { PostBadge, PostResult } from "@/backend/lib/post-result";

export type LiveFeedPost = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  streakCount: number;
  challengeId: string | null;
  challengeName: string;
  taskName?: string | null;
  currentDay: number;
  /** Finished events — R1 window over that enrollment. Omit when unknown. */
  securedDays?: number;
  longestStreak?: number;
  heldDays?: number;
  startedOn?: string | null;
  startedLabel?: string | null;
  /** Author secured today — same input Home passes to displayDay. */
  securedToday?: boolean;
  totalDays: number;
  eventType: string;
  isCompleted: boolean;
  hasProof: boolean;
  photoUrl: string | null;
  /** Proof image URL when distinct from `photoUrl` (task completion). */
  proofPhotoUrl?: string | null;
  verified: boolean;
  /** Build 90 09.3: "strava" when the completion came from the Strava webhook. */
  verifiedBy?: "strava" | null;
  caption: string | null;
  createdAt: string;
  respectCount: number;
  reactedByMe: boolean;
  lastReactorName?: string | null;
  commentCount: number;
  shareCount?: number;
  visibility: "public" | "friends" | "private";
  audience?: "friends" | "everyone" | "only_me" | string | null;
  /** Build 92 04.1: result facts the post shows ("{d} mi · {time} · {pace} /mi" …). Absent on build 91 rows. */
  result?: PostResult | null;
  /** Build 92 04.2: the one badge. */
  badge?: PostBadge | null;
};

export type FeedCommentPreview = {
  userId: string;
  username: string;
  displayName: string;
  text: string;
  createdAt: string;
  avatarUrl: string | null;
};
