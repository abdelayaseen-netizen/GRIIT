/**
 * A shared proof appears at the top of Home before the feed query returns.
 * Undo removes it.
 */
import type { LiveFeedPost } from "@/components/feed/feedTypes";

type Listener = (post: LiveFeedPost | null) => void;

let current: LiveFeedPost | null = null;
const listeners = new Set<Listener>();

export function optimisticFeedPost(): LiveFeedPost | null {
  return current;
}

export type OptimisticTaskPostInput = {
  eventId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  challengeId?: string | null;
  challengeName?: string | null;
  taskName?: string | null;
  currentDay?: number | null;
  totalDays?: number | null;
  photoUrl?: string | null;
  createdAt?: string;
};

/**
 * Same enrollment and task the server writes on the event.
 * Missing challenge, task, or day means no optimistic card.
 */
export function optimisticTaskPost(input: OptimisticTaskPostInput): LiveFeedPost | null {
  const challengeName = input.challengeName?.trim() ?? "";
  const taskName = input.taskName?.trim() ?? "";
  const currentDay = Math.floor(input.currentDay ?? 0);
  const totalDays = Math.floor(input.totalDays ?? 0);
  if (!input.eventId || !challengeName || !taskName || currentDay < 1 || totalDays < 1) return null;
  const photo = input.photoUrl ?? null;
  return {
    id: input.eventId,
    userId: input.userId,
    username: input.username,
    displayName: input.displayName,
    avatarUrl: input.avatarUrl,
    streakCount: 0,
    challengeId: input.challengeId ?? null,
    challengeName,
    taskName,
    currentDay,
    totalDays,
    eventType: "task_completed",
    isCompleted: false,
    hasProof: Boolean(photo),
    photoUrl: photo,
    proofPhotoUrl: photo,
    verified: false,
    caption: null,
    createdAt: input.createdAt ?? new Date().toISOString(),
    respectCount: 0,
    reactedByMe: false,
    commentCount: 0,
    visibility: "public",
  };
}

export function publishOptimisticFeedPost(post: LiveFeedPost): void {
  current = post;
  for (const listener of listeners) listener(current);
}

export function clearOptimisticFeedPost(eventId?: string): void {
  if (eventId && current?.id !== eventId) return;
  current = null;
  for (const listener of listeners) listener(null);
}

export function subscribeOptimisticFeedPost(listener: Listener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
