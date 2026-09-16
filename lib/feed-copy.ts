/**
 * Live-feed no-photo headline. "secured" only for secured_day.
 * Finished copy: Y is duration_days unless the viewer's target_streak is longer
 * (own posts). "verified" only when the completion has camera proof.
 */

import { homeDayTotal } from "@/lib/home-day-total";
import { dayWord } from "@/lib/format-days";

export type FeedNoPhotoInput = {
  eventType: string;
  displayName: string;
  username: string;
  challengeName: string;
  taskName?: string | null;
  currentDay: number;
};

export function feedNoPhotoCopy(post: FeedNoPhotoInput): string {
  const name = post.displayName || post.username;
  switch (post.eventType) {
    case "secured_day":
      return `${name} secured day ${post.currentDay}`;
    case "joined_challenge":
    case "challenge_created":
      return `${name} started ${post.challengeName}`;
    case "task_completed":
      return `${name} completed ${post.taskName?.trim() || "a task"}`;
    case "completed_challenge":
      return `${name} finished ${post.challengeName}`;
    default:
      return name;
  }
}

/** Camera proof on the completion — never `post.verified` / require_photo. */
export function feedHasCameraProof(post: {
  proofPhotoUrl?: string | null;
  photoUrl?: string | null;
  hasProof?: boolean;
}): boolean {
  return Boolean(post.proofPhotoUrl || (post.hasProof && post.photoUrl));
}

/**
 * Feed Y: duration_days (post.totalDays). Own posts also apply target_streak.
 * Never render currentDay > Y.
 */
export function feedDisplayTotal(
  totalDays: number,
  currentDay: number,
  targetStreak?: number | null,
): number {
  return Math.max(currentDay, homeDayTotal(Math.max(1, totalDays), targetStreak));
}

export function feedFinishedCopy(post: {
  currentDay: number;
  totalDays: number;
  targetStreak?: number | null;
  proofPhotoUrl?: string | null;
  photoUrl?: string | null;
  hasProof?: boolean;
}): string {
  const y = feedDisplayTotal(post.totalDays, post.currentDay, post.targetStreak);
  const base = `Finished. ${post.currentDay} of ${y} ${dayWord(y)}`;
  return feedHasCameraProof(post) ? `${base} verified.` : `${base}.`;
}
