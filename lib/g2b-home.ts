/**
 * v43.1 frames 146 + 155 — Home feed scope, caught-up line, invite card.
 */

import { countNoun } from "@/lib/onboarding-v2-suggest";

export const FEED_HEADING = "Feed";
export const FOLLOWING_SCOPE = "Following";
export const EVERYONE_SCOPE = "Everyone";
export const EVERYONE_UNTIL_THREE = "Everyone is on until you follow 3 people.";
export const NO_CHALLENGE_YET = "No challenge yet. Your tasks show here once you join one.";
export const FIND_A_CHALLENGE = "Find a challenge";
export const CREATE_CHALLENGE = "Create";

export type HomeFeedScope = "following" | "everyone";

export function defaultHomeFeedScope(
  followingCount: number,
  stored?: HomeFeedScope | null,
): HomeFeedScope {
  if (stored === "following" || stored === "everyone") return stored;
  return followingCount >= 3 ? "following" : "everyone";
}

export function weekdayFromIso(iso: string, timeZone = "UTC"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "this week";
  try {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(d);
  } catch {
    return "this week";
  }
}

export function caughtUpLine(postCount: number, weekday: string): string {
  const n = Math.max(0, Math.floor(postCount));
  const day = weekday.trim() || "this week";
  return `You're caught up. ${countNoun(n, "post", "posts")} since ${day}.`;
}

export function inviteCardCopy(challenge: string): {
  heading: string;
  body: string;
  cta: string;
} {
  const name = challenge.trim() || "this challenge";
  return {
    heading: `Invite one person to ${name}`,
    body: "You are the only one in it. People you invite join at Day 1 of their own run.",
    cta: "Share invite link",
  };
}

export function showHomeInviteCard(args: {
  soleMember: boolean;
  firstDaySecured: boolean;
}): boolean {
  return args.soleMember && args.firstDaySecured;
}

export function homeDateCaption(now = new Date()): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const day = now.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
  return `${weekday} ${day} ${month}`;
}

export const HOME_FEED_SCOPE_KEY = (userId: string) => `g2b-home-feed-scope:${userId}`;

export function pickHomeInviteChallenge(
  rows: readonly {
    challenge_id?: string | null;
    challenges?: {
      id?: string | null;
      title?: string | null;
      participants_count?: number | null;
    } | null;
  }[],
): { id: string; name: string; soleMember: boolean } | null {
  const row = rows[0];
  if (!row) return null;
  const id = (row.challenges?.id || row.challenge_id || "").trim();
  if (!id) return null;
  const name = (row.challenges?.title || "").trim() || "this challenge";
  const n = row.challenges?.participants_count;
  return { id, name, soleMember: n == null || n <= 1 };
}
