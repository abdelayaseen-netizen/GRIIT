export type LeaderScope = "global" | "friends" | "challenge";

export type NotifRow = {
  id: string;
  type: "respect" | "comment" | "follow" | "follow_request" | "rank" | "general";
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
  currentStreak: number;
  progressVsLeader: number;
  gapToAbove: number;
};
