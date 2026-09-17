/**
 * Month day rows for profiles.getRecord and yesterday tallies for reconcileStreak.
 * A Last Stand day is its own state — not secured, not a freeze.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { isTaskRequired, type ChallengeTaskRowRaw } from "./challenge-tasks";
import { addCalendarDaysToDateKey, dateKeyFromIsoInTimeZone } from "./date-utils";
import { checkInHasCameraProof, type ProofCheckIn } from "./proof-predicate";

export const RECORD_DAY_STATE = {
  SECURED: "secured",
  NOT_SECURED: "not_secured",
  LAST_STAND: "last_stand",
  FROZEN: "frozen",
} as const;

export type RecordDayState = (typeof RECORD_DAY_STATE)[keyof typeof RECORD_DAY_STATE];

export type RecordDay = {
  dateKey: string;
  state: RecordDayState;
  done: number;
  total: number;
  cameraProof: boolean;
  missedTaskNames: string[];
};

export type TallyTask = {
  id: string;
  title: string;
  required?: boolean;
};

export type EnrollmentTasks = {
  startDateKey: string;
  endDateKey: string;
  tasks: TallyTask[];
};

export function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function monthDateKeys(monthKey: string): string[] {
  const m = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!m) return [];
  const year = Number(m[1]);
  const month = Number(m[2]);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const keys: string[] = [];
  for (let d = 1; d <= last; d += 1) {
    keys.push(`${m[1]}-${m[2]}-${String(d).padStart(2, "0")}`);
  }
  return keys;
}

export function recordDayState(input: {
  secured: boolean;
  lastStand: boolean;
  frozen: boolean;
}): RecordDayState {
  if (input.lastStand) return RECORD_DAY_STATE.LAST_STAND;
  if (input.frozen) return RECORD_DAY_STATE.FROZEN;
  if (input.secured) return RECORD_DAY_STATE.SECURED;
  return RECORD_DAY_STATE.NOT_SECURED;
}

export function tallyTasks(input: {
  tasks: TallyTask[];
  completedIds: readonly string[];
}): { done: number; total: number; missedTaskNames: string[] } {
  const required = input.tasks.filter((t) => t.required !== false);
  const doneSet = new Set(input.completedIds);
  const missed = required.filter((t) => !doneSet.has(t.id));
  return {
    done: required.length - missed.length,
    total: required.length,
    missedTaskNames: missed.map((t) => t.title),
  };
}

export function tasksDueOnDay(dateKey: string, enrollments: EnrollmentTasks[]): TallyTask[] {
  const seen = new Set<string>();
  const out: TallyTask[] = [];
  for (const en of enrollments) {
    if (en.startDateKey > dateKey) continue;
    if (en.endDateKey && en.endDateKey < dateKey) continue;
    for (const t of en.tasks) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
    }
  }
  return out;
}

export function buildRecordDays(input: {
  monthKey: string;
  securedDateKeys: readonly string[];
  lastStandDateKeys: readonly string[];
  frozenDateKeys: readonly string[];
  enrollments: EnrollmentTasks[];
  checkIns: (ProofCheckIn & { task_id?: string | null; status?: string | null })[];
}): RecordDay[] {
  const secured = new Set(input.securedDateKeys);
  const stood = new Set(input.lastStandDateKeys);
  const frozen = new Set(input.frozenDateKeys);
  const completedByDay = new Map<string, string[]>();
  const rowsByDay = new Map<string, Array<ProofCheckIn & { task_id?: string | null; status?: string | null }>>();
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

  return monthDateKeys(input.monthKey).map((dateKey) => {
    const tally = tallyTasks({
      tasks: tasksDueOnDay(dateKey, input.enrollments),
      completedIds: completedByDay.get(dateKey) ?? [],
    });
    const rows = rowsByDay.get(dateKey) ?? [];
    return {
      dateKey,
      state: recordDayState({
        secured: secured.has(dateKey),
        lastStand: stood.has(dateKey),
        frozen: frozen.has(dateKey),
      }),
      done: tally.done,
      total: tally.total,
      cameraProof: rows.some(checkInHasCameraProof),
      missedTaskNames: tally.missedTaskNames,
    };
  });
}

export function nextMonthKey(monthKey: string, delta: number): string {
  const keys = monthDateKeys(monthKey);
  const first = keys[0];
  if (!first) return monthKey;
  return monthKeyFromDateKey(addCalendarDaysToDateKey(first, delta * 32)).slice(0, 7);
}

export async function loadDayTaskTally(
  supabase: SupabaseClient,
  userId: string,
  dateKey: string,
  timezone: string,
): Promise<{ done: number; total: number; missedTaskNames: string[] }> {
  const [acRes, cinRes] = await Promise.all([
    supabase
      .from("active_challenges")
      .select("id, challenge_id, status, start_at, end_at")
      .eq("user_id", userId)
      .in("status", ["active", "completed"])
      .limit(50),
    supabase
      .from("check_ins")
      .select("task_id, date_key, status")
      .eq("user_id", userId)
      .eq("date_key", dateKey)
      .limit(400),
  ]);
  const acRows = (acRes.data ?? []) as {
    challenge_id: string;
    start_at: string;
    end_at: string;
  }[];
  const due = acRows.filter((row) => {
    const start = dateKeyFromIsoInTimeZone(row.start_at, timezone);
    const end = dateKeyFromIsoInTimeZone(row.end_at, timezone);
    return start <= dateKey && end >= dateKey;
  });
  const challengeIds = [...new Set(due.map((r) => r.challenge_id))];
  if (challengeIds.length === 0) {
    return { done: 0, total: 0, missedTaskNames: [] };
  }
  const { data: taskRows } = await supabase
    .from("challenge_tasks")
    .select("id, title, challenge_id, config")
    .in("challenge_id", challengeIds)
    .limit(400);
  const tasks = ((taskRows ?? []) as ChallengeTaskRowRaw[])
    .filter((t) => isTaskRequired(t))
    .map((t) => ({ id: t.id, title: (t.title ?? "Task").trim() || "Task" }));
  const completedIds = ((cinRes.data ?? []) as { task_id?: string; status?: string }[])
    .filter((r) => !r.status || r.status === "completed")
    .map((r) => r.task_id)
    .filter((id): id is string => typeof id === "string");
  return tallyTasks({ tasks, completedIds });
}
