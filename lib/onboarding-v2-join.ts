import { ensureAnonymousSession } from "@/lib/anon-auth";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { isJoinableChallengeId } from "@/lib/onboarding-v2-suggest";

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
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not join. Try again.",
    };
  }
}
