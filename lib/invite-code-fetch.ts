/**
 * Build 92 chunk 08.1: one short invite code per (viewer, challenge), fetched once and cached
 * for the session. Never falls back to the challenge UUID.
 */
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export async function fetchInviteCode(challengeId: string): Promise<string> {
  const hit = cache.get(challengeId);
  if (hit) return hit;
  const pending = inflight.get(challengeId);
  if (pending) return pending;
  const p = (async () => {
    const res = (await trpcMutate(TRPC.invites.create, { challengeId })) as { code?: string } | null;
    const code = res?.code?.trim();
    if (!code) throw new Error("No invite code returned.");
    cache.set(challengeId, code);
    return code;
  })();
  inflight.set(challengeId, p);
  try {
    return await p;
  } finally {
    inflight.delete(challengeId);
  }
}

/** Tests and dev screens. */
export function primeInviteCode(challengeId: string, code: string): void {
  cache.set(challengeId, code);
}
