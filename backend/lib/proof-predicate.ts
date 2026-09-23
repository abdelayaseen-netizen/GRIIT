/**
 * Camera-proof predicate for check_ins / completion rows.
 * Mirrors `hasCameraProof` in lib/active-challenge-ui.ts:
 *   verified === true || Boolean(proof_photo_url)
 * Never require_photo. URL pick is proofImageUrlForCheckIn.
 */

import { proofImageUrlForCheckIn } from "../../lib/profile-v2-proof-photo";
import { calendarDay } from "../../lib/home-day-total";
import { gatesFor, type TaskGate, type TaskModelRow } from "./task-model";

export function hasCameraProof(row: {
  verified?: boolean | null;
  proof_photo_url?: string | null;
}): boolean {
  return row.verified === true || Boolean(row.proof_photo_url);
}

/** Same pick as `proofImageUrlForCheckIn` — feed, Secured, and Profile Proofs. */
export function proofPhotoUrlFromCheckIn(row: {
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  proof_photo_url?: string | null;
}): string | null {
  return proofImageUrlForCheckIn(row);
}

export type ProofCheckIn = {
  id?: string;
  date_key: string;
  task_id?: string | null;
  active_challenge_id?: string | null;
  photo_url?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  verified?: boolean | null;
  proof_photo_url?: string | null;
  created_at?: string | null;
};

export type RecordProofTile = {
  dateKey: string;
  day: number;
  imageUrl: string | null;
  challengeName: string;
  gates: TaskGate[];
  eventId: string | null;
  durationDays: number;
  capturedAt: string | null;
  taskName: string;
  gateTime: { mode: "by" | "between" | null; start: string | null; end: string | null } | null;
  shared: boolean;
};

export function checkInHasCameraProof(row: ProofCheckIn): boolean {
  return hasCameraProof({
    verified: row.verified,
    proof_photo_url: row.proof_photo_url ?? proofPhotoUrlFromCheckIn(row),
  });
}

export type EnrollmentProofSplit = {
  id: string;
  camera: number;
  selfReported: number;
};

export type SecuredProofSplit = {
  cameraDays: number;
  selfReportedDays: number;
  byEnrollment: EnrollmentProofSplit[];
};

/** Camera / self-reported counts on one day set — same keys as a challenge fraction. */
export function proofCountsForDateKeys(input: {
  dateKeys: readonly string[];
  securedDateKeys: readonly string[];
  checkIns: ProofCheckIn[];
}): { camera: number; selfReported: number } {
  const secured = new Set(input.securedDateKeys);
  let camera = 0;
  let selfReported = 0;
  for (const key of input.dateKeys) {
    if (!secured.has(key)) continue;
    const rows = input.checkIns.filter((r) => r.date_key === key);
    if (rows.some(checkInHasCameraProof)) camera += 1;
    else selfReported += 1;
  }
  return { camera, selfReported };
}

/** A secured day is camera if any check-in that day has camera proof. */
export function splitSecuredProof(args: {
  securedDateKeys: string[];
  checkIns: ProofCheckIn[];
  enrollmentIds: string[];
}): SecuredProofSplit {
  const secured = new Set(args.securedDateKeys);
  const byDay = new Map<string, ProofCheckIn[]>();
  for (const row of args.checkIns) {
    if (!secured.has(row.date_key)) continue;
    const list = byDay.get(row.date_key) ?? [];
    list.push(row);
    byDay.set(row.date_key, list);
  }

  let cameraDays = 0;
  for (const key of args.securedDateKeys) {
    const rows = byDay.get(key) ?? [];
    if (rows.some(checkInHasCameraProof)) cameraDays += 1;
  }

  const byEnrollment = args.enrollmentIds.map((id) => {
    const days = new Set<string>();
    for (const row of args.checkIns) {
      if (row.active_challenge_id === id && secured.has(row.date_key)) {
        days.add(row.date_key);
      }
    }
    let camera = 0;
    for (const key of days) {
      const rows = (byDay.get(key) ?? []).filter((r) => r.active_challenge_id === id);
      if (rows.some(checkInHasCameraProof)) camera += 1;
    }
    return { id, camera, selfReported: days.size - camera };
  });

  return {
    cameraDays,
    selfReportedDays: args.securedDateKeys.length - cameraDays,
    byEnrollment,
  };
}

function challengeDayOn(startDateKey: string, dateKey: string): number {
  return calendarDay(startDateKey, dateKey, null);
}

/** Camera proofs for the grid / Secured — self-reported days emit nothing. */
export function cameraProofTiles(args: {
  checkIns: ProofCheckIn[];
  securedDateKeys?: readonly string[];
  dateKey?: string;
  enrollments: { id: string; challengeId: string; startDateKey: string }[];
  challenges: { id: string; title?: string | null; duration_days?: number | null }[];
  tasks: (TaskModelRow & { id?: string; challenge_id?: string; title?: string | null })[];
  events?: { id: string; metadata?: Record<string, unknown> | null; created_at?: string; shared?: boolean }[];
}): RecordProofTile[] {
  const secured = args.securedDateKeys ? new Set(args.securedDateKeys) : null;
  const titleByChallenge = new Map(
    args.challenges.map((c) => [c.id, (c.title ?? "").trim() || "Challenge"]),
  );
  const durationByChallenge = new Map(args.challenges.map((c) => [c.id, c.duration_days ?? 30]));
  const enrollmentById = new Map(args.enrollments.map((e) => [e.id, e]));
  const taskById = new Map(args.tasks.filter((t) => t.id).map((t) => [t.id as string, t]));
  const tiles: RecordProofTile[] = [];
  for (const row of args.checkIns) {
    if (args.dateKey && row.date_key !== args.dateKey) continue;
    if (secured && !secured.has(row.date_key)) continue;
    const url = proofPhotoUrlFromCheckIn(row);
    if (!url) continue;
    const enrollment = row.active_challenge_id ? enrollmentById.get(row.active_challenge_id) : undefined;
    const task = row.task_id ? taskById.get(row.task_id) : undefined;
    const challengeId = enrollment?.challengeId;
    const event =
      args.events?.find((ev) => {
        const md = ev.metadata ?? {};
        return (
          (row.task_id && md.task_id === row.task_id && md.date_key === row.date_key) ||
          (typeof md.photo_url === "string" && md.photo_url === url)
        );
      }) ?? null;
    tiles.push({
      dateKey: row.date_key,
      day: enrollment ? challengeDayOn(enrollment.startDateKey, row.date_key) : 1,
      imageUrl: url,
      challengeName: challengeId ? (titleByChallenge.get(challengeId) ?? "Challenge") : "Challenge",
      gates: task ? gatesFor(task) : [],
      eventId: event?.id ?? null,
      durationDays: challengeId ? (durationByChallenge.get(challengeId) ?? 30) : 30,
      capturedAt: row.created_at ?? event?.created_at ?? null,
      taskName: (task?.title ?? "").trim() || "Task",
      gateTime: task
        ? {
            mode: (task.gate_time_mode as "by" | "between" | null) ?? null,
            start: task.gate_time_start ?? null,
            end: task.gate_time_end ?? null,
          }
        : null,
      shared: event?.shared !== false,
    });
  }
  tiles.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? 1 : -1;
    return (b.capturedAt ?? "") > (a.capturedAt ?? "") ? 1 : -1;
  });
  return tiles;
}
