import { displayDay } from "@/lib/challenge-day";
import { homeDayTotal } from "@/lib/home-day-total";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";
import { closedWindowCaption, gateLine } from "@/lib/task-ui";

export const HOME_PROOF_CTA_TODAY = "Post your proof";
export const HOME_PROOF_CTA_FIRST = "Post your first proof";
export const HOME_PROOF_CTA_DONE = "Posted today";
export const HOME_PROOF_HEADING = "Today";

export function homeProofDayLine(day: number, dayTotal: number): string {
  return `Day ${day} of ${dayTotal}`;
}

export type HomeProofTask = {
  id?: string;
  name: string;
  challengeName: string;
  activeChallengeId?: string;
  currentDay: number;
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
  day: number;
  dayTotal: number;
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
    name: task.name,
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

function sectionKey(task: HomeProofTask): string {
  return task.activeChallengeId || task.challengeName;
}

function sectionFromTasks(
  id: string,
  tasks: HomeProofTask[],
  targetStreak: number | null | undefined,
  _securedToday: boolean,
): HomeProofSection {
  const first = tasks[0]!;
  const durationDays = first.durationDays ?? first.currentDay ?? 1;
  return {
    id,
    challenge: first.challengeName,
    day: displayDay(first.currentDay, first.challengeSecuredToday),
    dayTotal: homeDayTotal(durationDays, targetStreak),
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
    sectionFromTasks(id, groups.get(id)!, input.targetStreak, input.securedToday),
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
