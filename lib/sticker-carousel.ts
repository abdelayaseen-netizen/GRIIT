/**
 * Build 92 chunk 01.4: a toast's "Share" opens the sticker carousel (Part 1.3).
 * Chunk 05: the tabs layout registers an opener that shows `ShareSystemSheet`, which
 * is the carousel (Photo · Week strip · Streak glow · Progress ring).
 * One entry point so no toast hard-codes a share destination.
 */
import type { TaskCompleteToast } from "@/lib/task-complete-toast";

type Opener = (toast: TaskCompleteToast) => void;

let opener: Opener | null = null;

export function registerStickerCarousel(next: Opener | null): void {
  opener = next;
}

/** Opens the sticker carousel for this toast. No-op if nothing is registered yet. */
export function openStickerCarousel(toast: TaskCompleteToast): void {
  opener?.(toast);
}
