/**
 * Live-feed no-photo headline. "secured" only for secured_day.
 * Finished copy: Y is duration_days unless the viewer's target_streak is longer
 * (own posts). "verified" only when the completion has camera proof.
 */

import { homeDayTotal } from "@/lib/home-day-total";
import { dayWord } from "@/lib/format-days";
import { hasCameraProof } from "@/lib/active-challenge-ui";

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

/**
 * Feed N: duration_days (post.totalDays). Not target_streak.
 * n is clamped to N — never "Day 76 of 75" / "2 of 1".
 */
export function feedDisplayTotal(
  totalDays: number,
  currentDay: number,
  _targetStreak?: number | null,
): number {
  void currentDay;
  void _targetStreak;
  return homeDayTotal(totalDays) ?? Math.max(1, totalDays);
}

export function feedDisplayDay(currentDay: number, totalDays: number): number {
  const y = feedDisplayTotal(totalDays, currentDay);
  const n = Number.isFinite(currentDay) && currentDay > 0 ? Math.floor(currentDay) : 1;
  return Math.min(n, y);
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
  const n = feedDisplayDay(post.currentDay, post.totalDays);
  const base = `Finished. ${n} of ${y} ${dayWord(y)}`;
  return hasCameraProof({
    proof_photo_url: post.proofPhotoUrl || (post.hasProof ? post.photoUrl : null) || null,
  })
    ? `${base} verified.`
    : `${base}.`;
}
