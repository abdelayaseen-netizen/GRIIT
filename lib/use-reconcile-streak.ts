import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { reconcileStreakNeeded, type ReconcileStatsInput } from "@/lib/reconcile-needed";
import {
  clearReconcilePersist,
  persistedReconcileResult,
  rememberReconcileResult,
  type ReconcileStreakResult,
} from "@/lib/reconcile-persist";

export type { ReconcileStreakResult };

/** One attempt per signed-in user per JS session. Prevents invalidate → still-mismatched → loop. */
const attemptedByUser = new Set<string>();

export function useReconcileStreakIfNeeded(input: {
  enabled: boolean;
  ready: boolean;
  userId: string | undefined;
  stats: ReconcileStatsInput | null;
  securedDateKeys: readonly string[] | null;
  yesterdayKey?: string | null;
}): { result: ReconcileStreakResult | null } {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ReconcileStreakResult | null>(() =>
    input.userId && input.yesterdayKey
      ? persistedReconcileResult(input.userId, input.yesterdayKey)
      : null,
  );
  const { mutate, isPending } = useMutation({
    mutationKey: ["profiles", "reconcileStreak", input.userId ?? ""],
    mutationFn: () => trpcMutate<ReconcileStreakResult>(TRPC.profiles.reconcileStreak),
    onSuccess: (recon) => {
      if (input.userId && input.yesterdayKey) {
        rememberReconcileResult(input.userId, input.yesterdayKey, recon ?? null);
      }
      setResult(recon ?? null);
      if (recon?.streak_broken) {
        try {
          trackEvent("streak_broken", { previous_streak: recon.previous_streak });
        } catch {
          /* non-fatal */
        }
      }
      void queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
    },
    onError: (err) => {
      captureError(err, "reconcileStreak");
    },
  });

  const pendingRef = useRef(isPending);
  pendingRef.current = isPending;

  useEffect(() => {
    if (!input.userId) {
      attemptedByUser.clear();
      clearReconcilePersist();
      return;
    }
    const cached =
      input.yesterdayKey ? persistedReconcileResult(input.userId, input.yesterdayKey) : null;
    if (cached && result == null) setResult(cached);
    if (!input.enabled || pendingRef.current) return;
    if (attemptedByUser.has(input.userId)) return;
    if (
      !reconcileStreakNeeded({
        ready: input.ready,
        stats: input.stats,
        securedDateKeys: input.securedDateKeys,
        yesterdayKey: input.yesterdayKey,
      })
    ) {
      return;
    }
    attemptedByUser.add(input.userId);
    mutate();
  }, [
    input.enabled,
    input.ready,
    input.userId,
    input.stats,
    input.securedDateKeys,
    input.yesterdayKey,
    result,
    mutate,
  ]);

  return { result };
}
