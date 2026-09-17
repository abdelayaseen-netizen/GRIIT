/**
 * Frame 48 — task done, day still open.
 * Router branches on the server's secured_today only. Never a client row count.
 */
import {
  homeProofDayLine,
  selectHomeProofCard,
  type HomeProofRow,
  type HomeProofTask,
} from "@/lib/home-proof-card";
import { ROUTES } from "@/lib/routes";
import { displayDay } from "@/lib/challenge-day";

export const DAY_OPEN_ALSO = "Also today";
export const DAY_OPEN_NEXT = "Next task";
export const DAY_OPEN_DONE = "Done";

export function dayOpenTitle(task: string): string {
  return `${task} done.`;
}

export function dayOpenLeftLine(n: number): string {
  return `${Math.max(0, Math.floor(n))} left to secure today.`;
}

export function dayOpenContext(challenge: string, day: number, dayTotal: number): string {
  return `${challenge} · ${homeProofDayLine(day, dayTotal)}`;
}

export function dayOpenAlsoLine(challenge: string, n: number): string {
  return `${challenge} · ${Math.max(0, Math.floor(n))} left`;
}

/** Server day_secures after this check-in. Not requiredRemaining, not a local row tally. */
export function serverSecuredToday(args: {
  dayAlreadySecured?: boolean;
  secureDaySecured?: boolean;
}): boolean {
  return args.dayAlreadySecured === true || args.secureDaySecured === true;
}

export type DayOpenAlso = {
  id: string;
  line: string;
  nextId: string | null;
};

export type DayOpenModel = {
  title: string;
  leftLine: string;
  contextLine: string;
  rows: HomeProofRow[];
  alsoToday: DayOpenAlso[];
  nextId: string | null;
  tasks: HomeProofTask[];
};

function pending(row: HomeProofRow): boolean {
  return !row.done && !row.closed;
}

function remaining(row: HomeProofRow): boolean {
  return !row.done;
}

export function selectDayOpen(input: {
  taskName: string;
  challengeId: string;
  tasks: HomeProofTask[];
  targetStreak?: number | null;
}): DayOpenModel {
  const card = selectHomeProofCard({
    tasks: input.tasks,
    tasksDoneToday: input.tasks.filter((t) => t.done).length,
    totalTasksToday: input.tasks.length,
    firstProofEver: false,
    targetStreak: input.targetStreak,
    securedToday: false,
  });
  const mine =
    card.sections.find((s) => s.id === input.challengeId) ??
    card.sections.find((s) => s.challenge === input.tasks.find((t) => t.activeChallengeId === input.challengeId)?.challengeName) ??
    card.sections[0];
  const left = card.sections.reduce((n, s) => n + s.rows.filter(remaining).length, 0);
  const rows = (mine?.rows ?? []).filter(remaining);
  const alsoToday = card.sections
    .filter((s) => s.id !== mine?.id)
    .map((s) => {
      const n = s.rows.filter(remaining).length;
      return {
        id: s.id,
        line: dayOpenAlsoLine(s.challenge, n),
        nextId: s.rows.find(pending)?.id ?? null,
        left: n,
      };
    })
    .filter((s) => s.left > 0)
    .map(({ id, line, nextId }) => ({ id, line, nextId }));
  const nextId =
    (mine?.rows ?? []).find(pending)?.id ?? alsoToday.find((s) => s.nextId)?.nextId ?? null;
  return {
    title: dayOpenTitle(input.taskName),
    leftLine: dayOpenLeftLine(left),
    contextLine: dayOpenContext(mine?.challenge ?? "", mine?.day ?? 1, mine?.dayTotal ?? 1),
    rows,
    alsoToday,
    nextId,
    tasks: input.tasks,
  };
}

export function dayOpenTaskHref(task: HomeProofTask): string {
  const day = displayDay(task.currentDay, task.challengeSecuredToday);
  const duration = task.durationDays ?? task.currentDay ?? 1;
  return `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(task.id ?? "")}&activeChallengeId=${encodeURIComponent(task.activeChallengeId ?? "")}&taskType=${encodeURIComponent(task.taskType ?? task.type ?? "check_off")}&taskName=${encodeURIComponent(task.name)}&taskDescription=${encodeURIComponent("")}&taskConfig=${encodeURIComponent(task.taskConfig ?? "")}&challengeName=${encodeURIComponent(task.challengeName)}&currentDay=${String(day)}&durationDays=${String(duration)}`;
}

