export type LeaderScope = "global" | "friends" | "challenge";

export type NotifRow = {
  id: string;
  type: "respect" | "comment" | "follow" | "follow_request" | "rank" | "challenge_invite" | "general";
  read: boolean;
  createdAt: string;
  title?: string | null;
  body?: string | null;
  actorId: string | null;
  actorUsername: string | null;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
  metadata: Record<string, unknown>;
};

export type BoardEntry = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  rank: number;
  points: number;
  checkInsThisWeek: number;
  /** Build 92 08.5: secured days this week with a proof. */
  verifiedThisWeek?: number;
  /** Build 92 08.5: ISO time of the latest counted secure; earlier wins a tie. */
  lastSecuredAt?: string | null;
  currentStreak: number;
  progressVsLeader: number;
  gapToAbove: number;
};
