import { displayDay } from "@/lib/challenge-day";
import { homeProofGate } from "@/lib/active-challenge-ui";

export const HOME_PROOF_CTA_TODAY = "Post today's proof";
export const HOME_PROOF_CTA_FIRST = "Post your first proof";
export const HOME_PROOF_CTA_DONE = "Posted today";

export type HomeProofTask = {
  name: string;
  challengeName: string;
  currentDay: number;
  done: boolean;
  challengeSecuredToday: boolean;
  taskType?: string;
  durationMinutes?: number;
};

export type HomeProofCard = {
  challenge: string;
  day: number;
  taskText: string;
  gate: string;
  doneCount: number;
  totalCount: number;
  posted: boolean;
  hasChallenge: boolean;
  firstProofEver: boolean;
};

export function homeProofCtaLabel(proof: Pick<HomeProofCard, "posted" | "firstProofEver">): string {
  if (proof.posted) return HOME_PROOF_CTA_DONE;
  return proof.firstProofEver ? HOME_PROOF_CTA_FIRST : HOME_PROOF_CTA_TODAY;
}

export function selectHomeProofCard(input: {
  tasks: HomeProofTask[];
  tasksDoneToday: number;
  totalTasksToday: number;
  firstProofEver: boolean;
}): HomeProofCard {
  const task = input.tasks.find((t) => !t.done) ?? input.tasks[0] ?? null;
  const hasChallenge = input.tasks.length > 0;
  return {
    challenge: task?.challengeName ?? "",
    day: displayDay(task?.currentDay ?? 1, task?.challengeSecuredToday ?? false),
    taskText: task?.name ?? "",
    gate: homeProofGate(task?.taskType ?? "", task?.durationMinutes),
    doneCount: input.tasksDoneToday,
    totalCount: input.totalTasksToday || 1,
    posted: task ? task.done : false,
    hasChallenge,
    firstProofEver: input.firstProofEver,
  };
}
