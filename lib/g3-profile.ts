/**
 * v43.1 frames 150–152 + 159 — Profile header, proofs grid, privacy copy.
 */

import { proofsTileIsMissing } from "@/lib/proofs-grid";
import type { V42BadgeState } from "@/lib/v42-badges";

export const NO_PROOFS_YET = "No proofs yet.";
export const NO_PROOFS_BODY = "Proofs you share show here. Self-reported days show as text.";
export const SELF_REPORTED_TILE = "SELF-REPORTED";
export const PHOTO_NOT_SAVED = "Photo not saved";
export const FIND_FRIENDS = "Find friends";
export const SHARE_PROFILE = "Share profile";
export const EDIT_PROFILE = "Edit profile";
export const FOLLOW = "Follow";
export const FRIENDS = "Friends";
export const MESSAGE = "Message";
export const ACCOUNT_PRIVATE = "This account is private.";
export const SEE_STRANGER = "See how a stranger sees you";
export const STRANGER_BANNER = "This is what someone who isn't your friend sees.";
export const PHOTOS_STAY_PRIVATE = "Photos stay private until you share them.";
export const SWITCH_NEVER_SHARES_KEPT =
  "This switch changes who sees what you shared. It never shares a photo you kept.";
export const TODAY_TILE = "Today";
export const EARNED_HEADING = (n: number) => `Earned · ${n}`;

export function accountPrivateBody(name: string): string {
  const who = name.trim() || "them";
  return `Follow each other to see ${who}'s proofs and challenges.`;
}

export const PRIVACY_MATRIX: {
  who: string;
  public: string;
  private: string;
}[] = [
  {
    who: "Anyone",
    public: "Your profile, the proofs you shared and your challenges.",
    private: "Your name, photo and streak.",
  },
  {
    who: "Friends",
    public: "Everything you shared. Friends are people you follow who follow you back.",
    private: "Everything you shared. Friends are people you follow who follow you back.",
  },
  {
    who: "People in a challenge with you",
    public: "Always see your posts in it.",
    private: "Always see your posts in it.",
  },
];

export function proofsNewestLine(count: number): string {
  const n = Math.max(0, Math.floor(count));
  return `${n} proofs · newest first`;
}

export function todayTileCaption(tasksLeft: number): string {
  const n = Math.max(0, Math.floor(tasksLeft));
  return n === 1 ? "1 task left" : `${n} tasks left`;
}

export function joinedBioLine(weekday: string, challenge: string): string {
  const day = weekday.trim() || "this week";
  const run = challenge.trim() || "a challenge";
  return `Joined ${day}. Running ${run}.`;
}

export function accountAgeDays(createdAt: string | null | undefined, now = new Date()): number | null {
  if (!createdAt) return null;
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / 86_400_000);
}

export function showJoinedBioPlaceholder(args: {
  bio?: string | null;
  createdAt?: string | null;
  now?: Date;
}): boolean {
  if ((args.bio ?? "").trim()) return false;
  const age = accountAgeDays(args.createdAt, args.now);
  return age != null && age < 7;
}

export function ownerShareLabel(friends: number): string {
  return friends <= 0 ? FIND_FRIENDS : SHARE_PROFILE;
}

export type ProfileProofKind = "photo" | "self" | "missing";

export function profileProofKind(proof: {
  imageUrl?: string | null;
  bytes?: number | null;
  failed?: boolean;
}): ProfileProofKind {
  const url = (proof.imageUrl ?? "").trim();
  if (!url) return "self";
  if (proofsTileIsMissing({ bytes: proof.bytes, failed: proof.failed })) return "missing";
  return "photo";
}

export function nextUnearnedBadge(badges: readonly V42BadgeState[]): V42BadgeState | null {
  return badges.find((b) => !b.earned) ?? null;
}

export function nextBadgeRemainLine(badge: Pick<V42BadgeState, "id" | "have" | "target" | "rule">): string {
  const left = Math.max(0, badge.target - badge.have);
  if (badge.id.startsWith("streak_")) {
    return left === 1 ? "1 more day in a row." : `${left} more days in a row.`;
  }
  return badge.rule;
}

export function badgesMoreFooter(unearned: number): string {
  const n = Math.max(0, Math.floor(unearned));
  const more = n === 1 ? "1 more to earn" : `${n} more to earn`;
  return `${more}. Tap the next badge to see them.`;
}

export function showNextBadgeUnderGrid(tileCount: number): boolean {
  return tileCount < 6;
}

export function weekdayFromCreatedAt(createdAt: string, timeZone = "UTC"): string {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return "this week";
  try {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(new Date(t));
  } catch {
    return "this week";
  }
}
