/**
 * When to fire profiles.reconcileStreak after a Home read.
 *
 * fetchStatsWithReconcile did not check anything: it always mutated, then
 * getStats. Home and AppContext each called it on mount (two writes).
 *
 * Reconcile writes freeze-reset, Last Stand consumption, and streak zeroing.
 * It does not rewrite total_days_secured. We still treat a count mismatch as
 * needed so a stale/failed getStats cannot sit at 0 next to proof of secures.
 */

export type ReconcileStatsInput = {
  totalDaysSecured?: number | null;
  lastCompletedDateKey?: string | null;
  effectiveMissedDays?: number | null;
};

export type ReconcileProfileInput = {
  total_days_secured?: number | null;
};

export function reconcileStreakNeeded(input: {
  ready: boolean;
  stats: ReconcileStatsInput | null;
  profile: ReconcileProfileInput | null;
  securedDateKeys: readonly string[] | null;
}): boolean {
  if (!input.ready) return false;

  const statsDays = Number(input.stats?.totalDaysSecured ?? 0);
  const profileDays = Number(input.profile?.total_days_secured ?? 0);
  if (input.stats != null && input.profile != null && statsDays !== profileDays) {
    return true;
  }

  const keys = input.securedDateKeys;
  if (keys != null && keys.length > statsDays) {
    return true;
  }

  if ((input.stats?.effectiveMissedDays ?? 0) >= 1) {
    return true;
  }

  if (keys != null && keys.length > 0) {
    const latest = keys.reduce((a, b) => (a > b ? a : b));
    const last = input.stats?.lastCompletedDateKey ?? null;
    if (last == null || last < latest) return true;
  }

  return false;
}
