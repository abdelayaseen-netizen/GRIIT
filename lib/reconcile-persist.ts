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

const resultByUser = new Map<string, ReconcileStreakResult>();

export function persistedReconcileResult(userId: string): ReconcileStreakResult | null {
  return resultByUser.get(userId) ?? null;
}

export function rememberReconcileResult(userId: string, result: ReconcileStreakResult | null): void {
  if (result) resultByUser.set(userId, result);
}

export function clearReconcilePersist(): void {
  resultByUser.clear();
}
