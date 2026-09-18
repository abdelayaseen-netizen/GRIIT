export type ReconcileStreakResult = {
  streak_broken: boolean;
  previous_streak: number;
  lostStreak?: number;
  lastStandUsedThisSession?: boolean;
  lastStandsAvailable?: number;
  missedTaskNames?: string[];
  done?: number;
  total?: number;
};

const resultByUserDate = new Map<string, ReconcileStreakResult>();

export function reconcilePersistKey(userId: string, dateKey: string): string {
  return `${userId}:${dateKey}`;
}

export function persistedReconcileResult(
  userId: string,
  dateKey: string,
): ReconcileStreakResult | null {
  return resultByUserDate.get(reconcilePersistKey(userId, dateKey)) ?? null;
}

export function rememberReconcileResult(
  userId: string,
  dateKey: string,
  result: ReconcileStreakResult | null,
): void {
  if (result) resultByUserDate.set(reconcilePersistKey(userId, dateKey), result);
}

export function clearReconcilePersist(): void {
  resultByUserDate.clear();
}
