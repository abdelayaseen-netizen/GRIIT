/**
 * Day-secure UI outcome after a successful task complete.
 * Task write and day secure are separate; never invent a streak on failure.
 */

export type DaySecureUi =
  | { kind: "not_attempted" }
  | { kind: "secured"; streakCount: number; dayNumber: number }
  | {
      kind: "challenge_done";
      challengeTitle: string;
      remainingChallenges: number;
    }
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

/** Server `requiredRemaining` is the only gate. Call even if the user day is already secured. */
export function shouldAttemptSecureDay(complete: {
  requiredRemaining: number;
}): boolean {
  return complete.requiredRemaining === 0;
}

export type SecureDayRpcResult = {
  success?: boolean;
  newStreakCount?: number;
  alreadySecured?: boolean;
  secured?: boolean;
  challenge_done?: boolean;
  remaining_challenges?: number;
};

export type SecureDayAfterComplete<T> = {
  attempted: boolean;
  result: T | null;
  ui: DaySecureUi;
};

/**
 * Call secureDay with the completion's activeChallengeId. AppContext is not consulted.
 * NOT_ALL_REQUIRED becomes incomplete_required; other errors become secure_failed.
 */
export async function attemptSecureDayAfterComplete<T extends SecureDayRpcResult>(args: {
  requiredRemaining: number;
  activeChallengeId: string;
  challengeTitle: string;
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
      typeof result.newStreakCount === "number" ? result.newStreakCount : 0;
    if (result.secured === true) {
      return {
        attempted: true,
        result,
        ui: { kind: "secured", streakCount, dayNumber: 0 },
      };
    }
    if (result.challenge_done === true) {
      return {
        attempted: true,
        result,
        ui: {
          kind: "challenge_done",
          challengeTitle: args.challengeTitle,
          remainingChallenges: Number(result.remaining_challenges ?? 0),
        },
      };
    }
    return {
      attempted: true,
      result,
      ui: { kind: "incomplete_required", done: 0, total: 0, remainingTitles: [] },
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

export type EnrollmentForNext = {
  id: string;
  challenges?: {
    challenge_tasks?: Array<{ id: string; config?: { required?: boolean } | null }>;
  } | null;
};

export type CheckinForNext = {
  active_challenge_id?: string;
  task_id?: string;
  status?: string;
};

/** First other enrollment that still has a required task incomplete today. */
export function pickNextUndoneEnrollmentId(args: {
  currentId: string;
  enrollments: EnrollmentForNext[];
  completed: CheckinForNext[];
}): string | null {
  for (const ac of args.enrollments) {
    if (ac.id === args.currentId) continue;
    const tasks = ac.challenges?.challenge_tasks ?? [];
    const required = tasks.filter((t) => (t.config?.required ?? true) === true);
    if (required.length === 0) continue;
    const done = new Set(
      args.completed
        .filter((c) => c.active_challenge_id === ac.id && c.status === "completed")
        .map((c) => c.task_id)
        .filter((id): id is string => typeof id === "string"),
    );
    if (required.some((t) => !done.has(t.id))) return ac.id;
  }
  return null;
}
