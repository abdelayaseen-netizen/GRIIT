/** Counts under 10,000 in full with a comma; from 10,000, one decimal and K. */
export function compact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n < 10000) return n.toLocaleString("en-US");
  return `${(Math.floor(n / 100) / 10).toFixed(1).replace(/\.0$/, "")}K`;
}

// Build 92 chunk 07 · Part 2 copy table (Profile numbers, Follow line, Record row, Post viewer).
export const INVITE_TO_CHALLENGE = "Invite to a challenge";
export const PROFILE_RECORD_TABS = ["Challenges", "Badges", "Stats"] as const;
export type ProfileRecordTab = (typeof PROFILE_RECORD_TABS)[number];

/** "{n} followers · {n} following", singular for exactly one follower. */
export function followLine(followers: number, following: number): string {
  const f = followers === 1 ? "1 follower" : `${compact(followers)} followers`;
  return `${f} · ${compact(following)} following`;
}

/** Sits under Days secured. */
export function verifiedLine(verified: number): string {
  return `${compact(verified)} verified`;
}

/** Option A record row under the buttons. */
export function recordRowLine(n: { running: number; finished: number; badges: number }): string {
  return `Challenges, badges and stats · ${n.running} running · ${n.finished} finished · ${n.badges} badges`;
}

/** "Posts" or the challenge name, never a route. */
export function postViewerTitle(challengeName: string | null | undefined): string {
  const name = (challengeName ?? "").trim();
  return name || "Posts";
}

/** "1 of 2" for multi-photo posts; null when a post has one photo. */
export function photoPagerLine(index: number, count: number): string | null {
  if (count <= 1) return null;
  return `${Math.min(index, count - 1) + 1} of ${count}`;
}

/** AsyncStorage key for the cached header snapshot (07.6). */
export function profileHeaderCacheKey(userId: string): string {
  return `griit.profile.header.${userId}`;
}

export type ProfileHeaderSnapshot = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  streak: number;
  best: number;
  secured: number;
  verified: number;
  followers: number;
  following: number;
  running: number;
  finished: number;
  badges: number;
  savedAt: number;
};
