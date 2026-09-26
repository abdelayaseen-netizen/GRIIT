/** Shared types for home feed cards (matches `feed.getLiveFeed` post shape). */
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
  caption: string | null;
  createdAt: string;
  respectCount: number;
  reactedByMe: boolean;
  lastReactorName?: string | null;
  commentCount: number;
  visibility: "public" | "friends" | "private";
};

export type FeedCommentPreview = {
  userId: string;
  username: string;
  displayName: string;
  text: string;
  createdAt: string;
  avatarUrl: string | null;
};
