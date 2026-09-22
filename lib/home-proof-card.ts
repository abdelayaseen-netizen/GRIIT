import { calendarDay, clampCalendarDay, homeDayLine, homeDayTotal } from "@/lib/home-day-total";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";
import { closedWindowCaption, gateLine } from "@/lib/task-ui";

export const HOME_PROOF_CTA_TODAY = "Post your proof";
export const HOME_PROOF_CTA_FIRST = "Post your first proof";
export const HOME_PROOF_CTA_DONE = "Posted today";
export const HOME_PROOF_HEADING = "Today";

export function homeProofDayLine(day: number, dayTotal: number | null | undefined): string {
  return homeDayLine(day, dayTotal);
}

const TYPE_FALLBACK: Record<string, string> = {
  timer: "Timer",
  counter: "Counter",
  count: "Counter",
  run: "Run",
  walk: "Run",
  check_off: "Check off",
  checkoff: "Check off",
  manual: "Check off",
  text: "Write",
  write: "Write",
  journal: "Write",
  photo: "Photo",
  camera: "Photo",
};

/** Empty title → type/target. Never the old generic fallback. */
export function taskDisplayName(input: {
  title?: string | null;
  type?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
  durationMinutes?: number | null;
  requirePhoto?: boolean;
}): string {
  const title = (input.title ?? "").trim();
  if (title) return title;
  const raw = (input.type ?? "").trim().toLowerCase();
  const typeName =
    TYPE_FALLBACK[raw] ??
    (raw.includes("timer")
      ? "Timer"
      : raw.includes("run") || raw.includes("walk")
        ? "Run"
        : raw.includes("count")
          ? "Counter"
          : raw.includes("write") || raw.includes("text") || raw.includes("journal")
            ? "Write"
            : raw.includes("photo") || raw.includes("camera")
              ? "Photo"
              : raw.includes("check")
                ? "Check off"
                : "");
  const mins =
    input.durationMinutes != null && Number.isFinite(input.durationMinutes) && input.durationMinutes > 0
      ? Math.floor(input.durationMinutes)
      : null;
  const target =
    input.targetValue != null && Number.isFinite(input.targetValue) && input.targetValue > 0
      ? input.targetValue
      : null;
  const unit = (input.targetUnit ?? "").trim();
  if (typeName === "Timer" && mins != null) return `${mins} min timer`;
  if (typeName === "Run" && target != null) return `Run ${target}${unit ? ` ${unit}` : " km"}`;
  if (target != null && unit) return `${target} ${unit}`;
  if (typeName) return typeName;
  if (input.requirePhoto) return "Photo";
  return "Untitled task";
}

export function homeSectionToggleA11y(expanded: boolean, challenge: string): string {
  return expanded ? `Collapse section, ${challenge}` : `Expand section, ${challenge}`;
}

export function homeChallengeOpenA11y(challenge: string): string {
  return `Open ${challenge} challenge`;
}

export type HomeProofTask = {
  id?: string;
  name: string;
  challengeName: string;
  challengeId?: string;
  activeChallengeId?: string;
  currentDay: number;
  startDateKey?: string;
  durationDays?: number;
  done: boolean;
  challengeSecuredToday: boolean;
  taskType?: string;
  type?: string;
  durationMinutes?: number;
  requirePhoto?: boolean;
  gates?: TaskGate[];
  gateTime?: GateTime | null;
  windowState?: WindowState;
  hasCameraProof?: boolean;
  taskConfig?: string;
};

export type HomeProofRow = {
  id: string;
  name: string;
  type: string;
  caption: string;
  done: boolean;
  closed: boolean;
  hasCameraProof: boolean;
};

export function homeProofTitleMuted(row: Pick<HomeProofRow, "done" | "closed">): boolean {
  return row.done || row.closed;
}

export type HomeProofSection = {
  id: string;
  challenge: string;
  challengeId: string | null;
  day: number;
  dayTotal: number | null;
  doneCount: number;
  totalCount: number;
  rows: HomeProofRow[];
  showCta: boolean;
};

export type HomeProofCard = {
  posted: boolean;
  hasChallenge: boolean;
  firstProofEver: boolean;
  doneCount: number;
  totalCount: number;
  sections: HomeProofSection[];
  showCta: boolean;
};

export function homeProofCtaLabel(proof: Pick<HomeProofCard, "posted" | "firstProofEver" | "showCta">): string {
  if (proof.posted) return HOME_PROOF_CTA_DONE;
  if (proof.showCta) return HOME_PROOF_CTA_TODAY;
  return proof.firstProofEver ? HOME_PROOF_CTA_FIRST : HOME_PROOF_CTA_TODAY;
}

function rowGates(task: HomeProofTask): TaskGate[] {
  if (task.gates && task.gates.length > 0) return task.gates;
  return task.requirePhoto ? ["camera"] : [];
}

export function homeProofRow(task: HomeProofTask, index: number): HomeProofRow {
  const closed = task.windowState === "closed" && !task.done;
  return {
    id: task.id ?? `${task.name}-${index}`,
    name: taskDisplayName({
      title: task.name,
      type: task.type ?? task.taskType,
      durationMinutes: task.durationMinutes,
      requirePhoto: task.requirePhoto,
    }),
    type: task.type ?? task.taskType ?? "check_off",
    caption: closed ? closedWindowCaption(task.gateTime) : gateLine(rowGates(task), task.gateTime),
    done: task.done,
    closed,
    hasCameraProof: task.hasCameraProof === true,
  };
}

export type HomeProofRing = "done" | "pending" | "closed";

export function homeProofRingState(row: Pick<HomeProofRow, "done" | "closed">): HomeProofRing {
  if (row.done) return "done";
  if (row.closed) return "closed";
  return "pending";
}

export function homeRingA11y(state: HomeProofRing): string {
  if (state === "done") return "Done";
  if (state === "closed") return "Window closed";
  return "Not done";
}

function sectionKey(task: HomeProofTask): string {
  return task.activeChallengeId || task.challengeName;
}

function sectionFromTasks(
  id: string,
  tasks: HomeProofTask[],
  todayKey?: string,
): HomeProofSection {
  const first = tasks[0]!;
  const day =
    first.startDateKey && todayKey
      ? calendarDay(first.startDateKey, todayKey, first.durationDays)
      : clampCalendarDay(first.currentDay, first.durationDays);
  return {
    id,
    challenge: first.challengeName,
    challengeId: first.challengeId?.trim() || null,
    day,
    dayTotal: homeDayTotal(first.durationDays),
    doneCount: tasks.filter((t) => t.done).length,
    totalCount: tasks.length,
    rows: tasks.map(homeProofRow),
    showCta: false,
  };
}

export function selectHomeProofCard(input: {
  tasks: HomeProofTask[];
  tasksDoneToday: number;
  totalTasksToday: number;
  firstProofEver: boolean;
  targetStreak?: number | null;
  /** Server getSecuredDateKeys only. Never task.done / checkins. */
  securedToday: boolean;
  todayKey?: string;
}): HomeProofCard {
  const order: string[] = [];
  const groups = new Map<string, HomeProofTask[]>();
  for (const task of input.tasks) {
    const key = sectionKey(task);
    const list = groups.get(key);
    if (list) list.push(task);
    else {
      groups.set(key, [task]);
      order.push(key);
    }
  }
  const sections = order.map((id) =>
    sectionFromTasks(id, groups.get(id)!, input.todayKey),
  );
  return {
    posted: input.securedToday,
    hasChallenge: input.tasks.length > 0,
    firstProofEver: input.firstProofEver,
    doneCount: sections.reduce((n, s) => n + s.doneCount, 0),
    totalCount: sections.reduce((n, s) => n + s.totalCount, 0),
    sections,
    showCta: sections.some((s) => s.showCta),
  };
}
