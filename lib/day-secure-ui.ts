/**
 * Day-secure UI outcome after a successful task complete.
 * Task write and day secure are separate; never invent a streak on failure.
 */

export type DaySecureUi =
  | { kind: "not_attempted" }
  | { kind: "secured"; streakCount: number; dayNumber: number }
  | {
      kind: "incomplete_required";
      done: number;
      total: number;
      remainingTitles: string[];
    }
  | { kind: "secure_failed" };

/** Server message from checkins.secureDay when RPC raises NOT_ALL_REQUIRED. */
export const NOT_ALL_REQUIRED_MESSAGE = "Not all required tasks completed.";

export function isNotAllRequiredError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  return msg.includes(NOT_ALL_REQUIRED_MESSAGE) || msg.includes("NOT_ALL_REQUIRED");
}

export function formatIncompleteProgress(done: number, total: number): string {
  const d = Math.max(0, Math.floor(done));
  const t = Math.max(0, Math.floor(total));
  return `${d} of ${t} done`;
}

export type RequiredTaskRow = { id: string; title?: string | null };

/**
 * Build incomplete_required UI from the same client progress math used before secureDay.
 */
export function buildIncompleteRequired(opts: {
  requiredTasks: RequiredTaskRow[];
  completedTaskIds: Set<string>;
}): Extract<DaySecureUi, { kind: "incomplete_required" }> {
  const total = opts.requiredTasks.length;
  const done = opts.requiredTasks.filter((t) => opts.completedTaskIds.has(t.id)).length;
  const remainingTitles = opts.requiredTasks
    .filter((t) => !opts.completedTaskIds.has(t.id))
    .map((t) => (typeof t.title === "string" && t.title.trim() ? t.title.trim() : "Task"));
  return { kind: "incomplete_required", done, total, remainingTitles };
}

/** Server `requiredRemaining` is the only gate. Do not default a missing value to 1. */
export function shouldAttemptSecureDay(complete: {
  requiredRemaining: number;
  dayAlreadySecured?: boolean;
}): boolean {
  return complete.requiredRemaining === 0 && complete.dayAlreadySecured !== true;
}

export type SecureDayAfterComplete<T> = {
  attempted: boolean;
  result: T | null;
  ui: DaySecureUi;
};

/**
 * Call secureDay with the completion's activeChallengeId. AppContext is not consulted.
 * NOT_ALL_REQUIRED becomes incomplete_required; other errors become secure_failed.
 */
export async function attemptSecureDayAfterComplete<T>(args: {
  requiredRemaining: number;
  dayAlreadySecured: boolean;
  activeChallengeId: string;
  secureDay: (activeChallengeId: string) => Promise<T | undefined>;
}): Promise<SecureDayAfterComplete<T>> {
  if (!shouldAttemptSecureDay(args)) {
    return { attempted: false, result: null, ui: { kind: "not_attempted" } };
  }
  try {
    const result = (await args.secureDay(args.activeChallengeId)) ?? null;
    if (!result) {
      return { attempted: true, result: null, ui: { kind: "secure_failed" } };
    }
    const streakCount =
      typeof result === "object" && result !== null && "newStreakCount" in result
        ? Number((result as { newStreakCount?: number }).newStreakCount ?? 0)
        : 0;
    return {
      attempted: true,
      result,
      ui: { kind: "secured", streakCount, dayNumber: 0 },
    };
  } catch (err) {
    if (isNotAllRequiredError(err)) {
      return {
        attempted: true,
        result: null,
        ui: { kind: "incomplete_required", done: 0, total: 0, remainingTitles: [] },
      };
    }
    return { attempted: true, result: null, ui: { kind: "secure_failed" } };
  }
}
