import type { ProofKind } from "@/lib/share-sticker";

export const DONE_FOR_TODAY = "Done for today.";
export const DAY_SECURED_EVERY = "Every challenge is done. Your day is secured on Home.";
export const DAY_SECURED_OTHERS = "Your day is secured when your other challenges are done.";

export type OtherChallengeLeft = { name: string; left: number };

export function othersLeftFromBootstrap(
  active: unknown[] | null | undefined,
  checkins: { task_id?: string; status?: string }[] | null | undefined,
  thisId: string,
): OtherChallengeLeft[] {
  const done = new Set(
    (checkins ?? []).filter((c) => c.status === "completed" && c.task_id).map((c) => String(c.task_id)),
  );
  const out: OtherChallengeLeft[] = [];
  for (const raw of active ?? []) {
    const ac = raw as {
      id?: string;
      challenges?: { title?: string | null; challenge_tasks?: { id?: string }[] | null } | { title?: string | null; challenge_tasks?: { id?: string }[] | null }[] | null;
    };
    if (!ac.id || ac.id === thisId) continue;
    const ch = Array.isArray(ac.challenges) ? ac.challenges[0] : ac.challenges;
    const tasks = ch?.challenge_tasks ?? [];
    const required = tasks.length;
    const finished = tasks.filter((t) => t.id && done.has(t.id)).length;
    out.push({ name: ch?.title?.trim() || "Challenge", left: Math.max(0, required - finished) });
  }
  return out;
}

export function challengeEnrollmentDone(tasks: readonly { completed_today?: boolean; done?: boolean }[]): boolean {
  if (tasks.length === 0) return false;
  return tasks.every((t) => t.completed_today === true || t.done === true);
}

export function otherChallengesLeftLine(others: readonly OtherChallengeLeft[]): string {
  const open = others.filter((o) => o.left > 0);
  if (open.length === 0) return DAY_SECURED_EVERY;
  if (open.length === 1) {
    const o = open[0]!;
    const tasks = o.left === 1 ? "1 task left there." : `${o.left} tasks left there.`;
    return `Your day is secured when ${o.name} is done too. ${tasks}`;
  }
  const n = open.reduce((sum, o) => sum + o.left, 0);
  return `${DAY_SECURED_OTHERS} ${n} ${n === 1 ? "task" : "tasks"} left.`;
}

export function challengeDetailTodayCopy(args: {
  thisDone: boolean;
  daySecured: boolean;
  others: readonly OtherChallengeLeft[];
}): { status: string | null; sub: string | null; showShareToday: boolean } {
  if (!args.thisDone) return { status: null, sub: null, showShareToday: false };
  if (args.daySecured) {
    return { status: DONE_FOR_TODAY, sub: DAY_SECURED_EVERY, showShareToday: true };
  }
  return {
    status: DONE_FOR_TODAY,
    sub: otherChallengesLeftLine(args.others),
    showShareToday: false,
  };
}

/** Gate actually used on this challenge today. Null if the challenge itself is not done. */
export function challengeStickerProof(args: {
  done: boolean;
  hasCameraProof?: boolean;
  requirePhoto?: boolean;
  gates?: readonly string[] | null;
}): ProofKind | null {
  if (!args.done) return null;
  if (args.hasCameraProof !== true) return "self";
  return (args.gates ?? []).includes("location") ? "camera_place" : "camera";
}

export function challengeStickerProofFromTasks(
  tasks: readonly {
    completed_today?: boolean;
    done?: boolean;
    hasCameraProof?: boolean;
    require_photo?: boolean;
    requirePhoto?: boolean;
    gates?: readonly string[] | null;
  }[],
): ProofKind | null {
  if (!challengeEnrollmentDone(tasks)) return null;
  const done = tasks.filter((t) => t.completed_today === true || t.done === true);
  const hasCameraProof = done.some((t) => t.hasCameraProof === true);
  const requirePhoto = done.some((t) => t.require_photo === true || t.requirePhoto === true);
  const gates = done.flatMap((t) => t.gates ?? []);
  return challengeStickerProof({ done: true, hasCameraProof, requirePhoto, gates });
}
