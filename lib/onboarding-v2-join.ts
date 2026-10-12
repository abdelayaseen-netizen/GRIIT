import { ensureAnonymousSession } from "@/lib/anon-auth";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { isJoinableChallengeId } from "@/lib/onboarding-v2-suggest";
import { classifyJoinChallengeError } from "@/lib/join-challenge-error";
import { queryClient } from "@/lib/query-client";
import { invalidateAfterOnboardingJoin } from "@/lib/onboarding-v2-invalidate";

export type JoinFirstChallengeResult = { ok: true } | { ok: false; message: string };

/**
 * Guest-safe join: mint/reuse an anon session, then call challenges.join.
 * Never throws — caller stays on the screen when ok is false.
 */
export async function joinFirstChallenge(challengeId: string): Promise<JoinFirstChallengeResult> {
  if (!isJoinableChallengeId(challengeId)) {
    return { ok: false, message: "This challenge can't be joined." };
  }
  const anon = await ensureAnonymousSession();
  if (anon.kind !== "ok") {
    return { ok: false, message: anon.message ?? "Could not start a guest session." };
  }
  try {
    await trpcMutate(TRPC.challenges.join, { challengeId });
    await invalidateAfterOnboardingJoin(queryClient);
    return { ok: true };
  } catch (e) {
    const classified = classifyJoinChallengeError(e);
    if (classified.kind === "already") return { ok: true };
    return { ok: false, message: classified.message || "Could not join. Try again." };
  }
}
