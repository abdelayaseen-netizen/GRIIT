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
