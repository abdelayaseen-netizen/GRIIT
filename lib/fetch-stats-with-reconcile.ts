/**
 * Reconcile streak side-effects (mutation), then read getStats (query).
 * Keeps writes off the getStats read path while preserving Home timing.
 */

import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import type { StatsFromApi } from "@/types";

type ReconcileStreakResult = {
  streak_broken: boolean;
  previous_streak: number;
  lastStandUsedThisSession?: boolean;
  lastStandsAvailable?: number;
};

export async function fetchStatsWithReconcile(): Promise<StatsFromApi> {
  try {
    const recon = await trpcMutate<ReconcileStreakResult>(TRPC.profiles.reconcileStreak);
    if (recon?.streak_broken) {
      try {
        trackEvent("streak_broken", { previous_streak: recon.previous_streak });
      } catch {
        /* non-fatal */
      }
    }
  } catch (err) {
    captureError(err, "reconcileStreak");
  }
  return trpcQuery<StatsFromApi>(TRPC.profiles.getStats);
}
