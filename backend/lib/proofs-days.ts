/**
 * v41 Proofs calendar days for profiles.getRecord (frame 117, contradictions 79/88/113).
 * One entry per date key from the first start_at through today. Future days are omitted.
 */
import { addCalendarDaysToDateKey } from "./date-utils";
import { proofPhotoUrlFromCheckIn, checkInHasCameraProof, type ProofCheckIn } from "./proof-predicate";
import { firstDueDateKey, tallyTasks, tasksDueOnDay, type EnrollmentTasks } from "./record-days";
import { securedElapsed } from "./secured-elapsed";

export const PROOFS_DAY_STATE = [
  "camera",
  "self",
  "freeze",
  "last_stand",
  "missed",
  "today_open",
  "today_secured",
  "before_first",
] as const;

export type ProofsDayState = (typeof PROOFS_DAY_STATE)[number];

export type ProofsDay = {
  date: string;
  state: ProofsDayState;
  cover_path: string | null;
  shared: boolean;
  tasksDone: number;
  tasksDue: number;
};

export type ProofsShareEvent = {
  dateKey: string;
  hasPhoto: boolean;
  shared: boolean;
};

export function keysInclusive(start: string, end: string): string[] {
  if (!start || !end || start > end) return [];
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addCalendarDaysToDateKey(cur, 1);
  }
  return out;
}

/** Accept a public URL or a bare path; return the storage path when we can. */
export function coverPathFromStored(stored: string | null | undefined): string | null {
  const s = stored?.trim();
  if (!s) return null;
  const signed = s.match(/\/storage\/v1\/object\/sign\/task-proofs\/([^?]+)/i);
  if (signed?.[1]) return decodeURIComponent(signed[1]);
  const pub = s.match(/\/storage\/v1\/object\/public\/task-proofs\/([^?]+)/i);
  if (pub?.[1]) return decodeURIComponent(pub[1]);
  if (/^https?:\/\//i.test(s)) return s;
  return s.replace(/^task-proofs\//i, "");
}

export function proofsDayState(input: {
  date: string;
  todayKey: string;
  firstStart: string | null;
  due: boolean;
  secured: boolean;
  camera: boolean;
  frozen: boolean;
  lastStand: boolean;
}): ProofsDayState {
  if (!input.firstStart || input.date < input.firstStart) return "before_first";
  if (input.lastStand) return "last_stand";
  if (input.frozen) return "freeze";
  if (input.date === input.todayKey) return input.secured ? "today_secured" : "today_open";
  if (input.secured) return input.camera ? "camera" : "self";
  if (!input.due) return "before_first";
  return "missed";
}

function dueOn(date: string, enrollments: readonly EnrollmentTasks[]): boolean {
  return enrollments.some((en) => en.startDateKey <= date && (!en.endDateKey || en.endDateKey >= date));
}

function firstCameraRow(
  rows: readonly (ProofCheckIn & { created_at?: string | null })[],
): (ProofCheckIn & { created_at?: string | null }) | null {
  const camera = rows.filter((row) => checkInHasCameraProof(row));
  if (camera.length === 0) return null;
  return [...camera].sort((a, b) => {
    const aAt = a.created_at ?? "";
    const bAt = b.created_at ?? "";
    return aAt < bAt ? -1 : aAt > bAt ? 1 : 0;
  })[0] ?? null;
}

export function buildProofsDays(input: {
  todayKey: string;
  securedDateKeys: readonly string[];
  lastStandDateKeys: readonly string[];
  frozenDateKeys: readonly string[];
  enrollments: EnrollmentTasks[];
  checkIns: (ProofCheckIn & { task_id?: string | null; status?: string | null; created_at?: string | null })[];
  shareEvents?: readonly ProofsShareEvent[];
  viewer?: "owner" | "visitor";
}): ProofsDay[] {
  const firstStart = firstDueDateKey(input.enrollments);
  if (!firstStart) return [];
  const secured = new Set(input.securedDateKeys);
  const stood = new Set(input.lastStandDateKeys);
  const frozen = new Set(input.frozenDateKeys);
  const completedByDay = new Map<string, string[]>();
  const rowsByDay = new Map<string, (ProofCheckIn & { task_id?: string | null; status?: string | null; created_at?: string | null })[]>();
  for (const row of input.checkIns) {
    const list = rowsByDay.get(row.date_key) ?? [];
    list.push(row);
    rowsByDay.set(row.date_key, list);
    if (row.status && row.status !== "completed") continue;
    if (typeof row.task_id === "string" && row.task_id) {
      const ids = completedByDay.get(row.date_key) ?? [];
      ids.push(row.task_id);
      completedByDay.set(row.date_key, ids);
    }
  }
  const sharedByDay = new Map<string, boolean>();
  for (const ev of input.shareEvents ?? []) {
    if (!ev.hasPhoto) continue;
    if (ev.shared) sharedByDay.set(ev.dateKey, true);
    else if (!sharedByDay.has(ev.dateKey)) sharedByDay.set(ev.dateKey, false);
  }

  const visitor = input.viewer === "visitor";
  return keysInclusive(firstStart, input.todayKey).map((date) => {
    const dueTasks = tasksDueOnDay(date, input.enrollments);
    const tally = tallyTasks({
      tasks: dueTasks,
      completedIds: completedByDay.get(date) ?? [],
    });
    const rows = rowsByDay.get(date) ?? [];
    const first = firstCameraRow(rows);
    const cover = coverPathFromStored(first ? proofPhotoUrlFromCheckIn(first) : null);
    const camera = cover != null;
    const shared = sharedByDay.get(date) === true;
    const state = proofsDayState({
      date,
      todayKey: input.todayKey,
      firstStart,
      due: dueOn(date, input.enrollments),
      secured: secured.has(date),
      camera,
      frozen: frozen.has(date),
      lastStand: stood.has(date),
    });
    const hideCover = visitor && (state === "camera" || state === "today_secured") && !shared;
    return {
      date,
      state,
      cover_path: hideCover ? null : cover,
      shared,
      tasksDone: tally.done,
      tasksDue: tally.total,
    };
  });
}

export function proofsBreakdown(days: readonly ProofsDay[]): {
  cameraDays: number;
  selfReportedDays: number;
  lastStandDays: number;
  freezeDays: number;
} {
  let cameraDays = 0;
  let selfReportedDays = 0;
  let lastStandDays = 0;
  let freezeDays = 0;
  for (const d of days) {
    if (d.state === "camera" || (d.state === "today_secured" && d.cover_path)) cameraDays += 1;
    else if (d.state === "self" || d.state === "today_secured") selfReportedDays += 1;
    else if (d.state === "last_stand") lastStandDays += 1;
    else if (d.state === "freeze") freezeDays += 1;
  }
  return { cameraDays, selfReportedDays, lastStandDays, freezeDays };
}

export function proofsHeader(args: {
  dueDayKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
}): { secured: number; days: number } {
  const w = securedElapsed(args);
  return { secured: w.secured, days: w.elapsed };
}

export function shareEventsFromActivity(
  events: readonly {
    metadata?: Record<string, unknown> | null;
    shared?: boolean | null;
  }[],
): ProofsShareEvent[] {
  return events.map((ev) => {
    const meta = ev.metadata ?? {};
    const dateKey = typeof meta.date_key === "string" ? meta.date_key : "";
    const photo = Boolean(meta.has_photo) || typeof meta.photo_url === "string";
    return { dateKey, hasPhoto: photo, shared: ev.shared === true };
  }).filter((e) => e.dateKey);
}
