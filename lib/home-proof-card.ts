import { displayDay } from "@/lib/challenge-day";
import { homeDayTotal } from "@/lib/home-day-total";
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";
import { closedWindowCaption, gateLine } from "@/lib/task-ui";

export const HOME_PROOF_CTA_TODAY = "Post your proof";
export const HOME_PROOF_CTA_FIRST = "Post your first proof";
export const HOME_PROOF_CTA_DONE = "Posted today";

export type HomeProofTask = {
  id?: string;
  name: string;
  challengeName: string;
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

export type HomeProofCard = {
  challenge: string;
  day: number;
  dayTotal: number;
  taskText: string;
  gate: string;
  doneCount: number;
  totalCount: number;
  posted: boolean;
  hasChallenge: boolean;
  firstProofEver: boolean;
  rows: HomeProofRow[];
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

export function selectHomeProofCard(input: {
  tasks: HomeProofTask[];
  tasksDoneToday: number;
  totalTasksToday: number;
  firstProofEver: boolean;
  targetStreak?: number | null;
  /** Server getSecuredDateKeys only. Never task.done / checkins. */
  securedToday: boolean;
}): HomeProofCard {
  const task = input.tasks.find((t) => !t.done) ?? input.tasks[0] ?? null;
  const hasChallenge = input.tasks.length > 0;
  const durationDays = task?.durationDays ?? task?.currentDay ?? 1;
  const rows = input.tasks.map(homeProofRow);
  const only = input.tasks.length === 1 ? input.tasks[0] : null;
  const showCta =
    !input.securedToday &&
    only != null &&
    only.done !== true &&
    only.windowState !== "closed";
  return {
    challenge: task?.challengeName ?? "",
    day: displayDay(task?.currentDay ?? 1, task?.challengeSecuredToday ?? false),
    dayTotal: homeDayTotal(durationDays, input.targetStreak),
    taskText: task?.name ?? "",
    gate: task ? gateLine(rowGates(task), task.gateTime) : "",
    doneCount: input.tasksDoneToday,
    totalCount: input.totalTasksToday || 1,
    posted: input.securedToday,
    hasChallenge,
    firstProofEver: input.firstProofEver,
    rows,
    showCta,
  };
}
