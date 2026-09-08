/**
 * Live-feed no-photo headline. "secured" only for secured_day.
 */

import { displayDay } from "./challenge-day";

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
      return `${name} secured day ${displayDay(post.currentDay, true)}`;
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
