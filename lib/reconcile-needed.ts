/**
 * When to fire profiles.reconcileStreak after a Home read.
 *
 * fetchStatsWithReconcile did not check anything: it always mutated, then
 * getStats. Home and AppContext each called it on mount (two writes).
 *
 * Reconcile writes freeze-reset, Last Stand consumption, and streak zeroing.
 * It does not rewrite total_days_secured. A stats-vs-profile count mismatch
 * is a getStats read bug, not a reconcile need.
 */

export type ReconcileStatsInput = {
  lastCompletedDateKey?: string | null;
  effectiveMissedDays?: number | null;
  lastStandUsedThisSession?: boolean | null;
};

export function reconcileStreakNeeded(input: {
  ready: boolean;
  stats: ReconcileStatsInput | null;
  securedDateKeys: readonly string[] | null;
  yesterdayKey?: string | null;
}): boolean {
  if (!input.ready) return false;

  if (input.stats?.lastStandUsedThisSession === true) {
    return true;
  }

  if ((input.stats?.effectiveMissedDays ?? 0) >= 1) {
    return true;
  }

  const keys = input.securedDateKeys;
  if (input.yesterdayKey && keys != null && !keys.includes(input.yesterdayKey)) {
    return true;
  }
  if (keys != null && keys.length > 0) {
    const latest = keys.reduce((a, b) => (a > b ? a : b));
    const last = input.stats?.lastCompletedDateKey ?? null;
    if (last == null || last < latest) return true;
  }

  return false;
}
