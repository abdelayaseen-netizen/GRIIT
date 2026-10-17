import { ensureAnonymousSession } from "@/lib/anon-auth";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { isJoinableChallengeId } from "@/lib/onboarding-v2-suggest";
import { classifyJoinChallengeError } from "@/lib/join-challenge-error";
import { queryClient } from "@/lib/query-client";
import { invalidateAfterOnboardingJoin } from "@/lib/onboarding-v2-invalidate";
import {
  joinHasEnrollment,
  setPendingFirstTaskHref,
  type JoinWithFirstTask,
} from "@/lib/open-first-task";
import { firstTaskHrefAfterJoin } from "@/lib/enrich-join-first-task";

export type JoinFirstChallengeResult =
  | { ok: true; href: string | null }
  | { ok: false; message: string };

/**
 * Guest-safe join: mint/reuse an anon session, then call challenges.join.
 * Never throws — caller stays on the screen when ok is false.
 * Duo waiting-room joins (no enrollment id) are treated as failure.
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
    const result = (await trpcMutate(TRPC.challenges.join, {
      challengeId,
    })) as JoinWithFirstTask;
    if (!joinHasEnrollment(result)) {
      return {
        ok: false,
        message: "This challenge needs a partner first. Pick a solo challenge.",
      };
    }
    const href = await firstTaskHrefAfterJoin(result, challengeId, "home");
    setPendingFirstTaskHref(href);
    await invalidateAfterOnboardingJoin(queryClient);
    return { ok: true, href };
  } catch (e) {
    const classified = classifyJoinChallengeError(e);
    if (classified.kind === "already") {
      return { ok: true, href: null };
    }
    return { ok: false, message: classified.message || "Could not join. Try again." };
  }
}
