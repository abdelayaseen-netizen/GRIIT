import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

let ensuredUserId: string | null = null;
let inflight: Promise<void> | null = null;

export function resetEnsureOwnProfile(): void {
  ensuredUserId = null;
  inflight = null;
}

/** Client call to profiles.ensure. Same uid a second time is a no-op. */
export async function ensureOwnProfile(userId: string): Promise<void> {
  if (!userId) return;
  if (ensuredUserId === userId) return;
  if (inflight) {
    await inflight;
    if (ensuredUserId === userId) return;
  }
  inflight = (async () => {
    await trpcMutate(TRPC.profiles.ensure);
    ensuredUserId = userId;
  })().finally(() => {
    inflight = null;
  });
  await inflight;
}
