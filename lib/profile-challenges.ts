/**
 * Profile → Challenges rows. Copy from design/handoff/src/components/ProfileChallenges.tsx.
 */
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { inclusiveLastDateKey } from "../backend/lib/record-days";

export type ChallengeStatus = "active" | "completed" | "abandoned" | "failed";

export type ChallengeRow = {
  id: string;
  challengeId: string;
  title: string;
  status: ChallengeStatus;
  duration_days: number;
  current_day: number;
  secured_days: number;
  ended_on_day?: number;
  secured_today?: boolean;
  tasks_today?: number;
  started_at: string;
  ended_at?: string;
};

export function statusLine(c: ChallengeRow): string {
  switch (c.status) {
    case "active":
      // current_day on the row is calendar Day n (r.day), not the DB column.
      return `Day ${Math.max(1, c.current_day)} of ${c.duration_days}`;
    case "completed":
      return `${c.secured_days} of ${c.duration_days}`;
    case "abandoned":
      return `Left on day ${c.ended_on_day}`;
    // solo hard-mode failure deferred, see Chunk T ruling
    case "failed":
      return `Failed on day ${c.ended_on_day}`;
  }
}

export function leftRecordLine(day: number, secured: number, duration: number): string {
  return `Left on day ${Math.max(1, day)} · ${secured} of ${duration} secured`;
}

/** Catalog finished header: "{secured} of {N} days" via statusLine. */
export function finishedHeaderLine(c: Pick<ChallengeRow, "status" | "secured_days" | "duration_days" | "ended_on_day" | "current_day">): string {
  const line = statusLine({
    id: "",
    challengeId: "",
    title: "",
    status: c.status,
    duration_days: c.duration_days,
    current_day: c.current_day,
    secured_days: c.secured_days,
    ended_on_day: c.ended_on_day,
    started_at: "",
  });
  return c.status === "completed" ? `${line} days` : line;
}

export type EndedEnrollmentRow = {
  id: string;
  challenge_id: string;
  status: string;
  start_at?: string | null;
  end_at?: string | null;
  ended_at?: string | null;
  current_day?: number | null;
};

/** Latest completed or failed enrollment by ended_at. */
export function pickLatestEndedEnrollment(
  rows: EndedEnrollmentRow[],
): EndedEnrollmentRow | null {
  const ended = rows.filter((r) => r.status === "completed" || r.status === "failed" || r.status === "abandoned");
  if (ended.length === 0) return null;
  return [...ended].sort((a, b) => {
    const ta = Date.parse(a.ended_at ?? "") || 0;
    const tb = Date.parse(b.ended_at ?? "") || 0;
    return tb - ta;
  })[0]!;
}

export function countSecuredInRange(keys: string[], startKey: string, endKey: string): number {
  if (!startKey || !endKey) return 0;
  return keys.filter((k) => k >= startKey && k <= endKey).length;
}

export function finishedDateRangeLine(
  startKey: string,
  exclusiveEndKey: string,
  fmt: (key: string) => string,
): string {
  const last = inclusiveLastDateKey(startKey, exclusiveEndKey);
  if (!last || last === startKey) return fmt(startKey);
  return `${fmt(startKey)} to ${fmt(last)}`;
}

export function detailLine(c: ChallengeRow, fmt: (iso: string) => string): string {
  if (c.status === "active") {
    return c.secured_today
      ? `${c.tasks_today} of ${c.tasks_today} secured today`
      : "Not yet today";
  }
  return finishedDateRangeLine(c.started_at, c.ended_at ?? c.started_at, fmt);
}

function asStatus(status: string): ChallengeStatus {
  if (status === "failed") return "failed";
  if (status === "abandoned") return "abandoned";
  if (status === "active") return "active";
  return "completed";
}

export function rowsFromProfileRecord(
  record: Pick<ProfileRecord, "runs" | "completed">,
  opts?: { todaySecured?: boolean },
): ChallengeRow[] {
  const active: ChallengeRow[] = record.runs.map((r) => ({
    id: r.id,
    challengeId: r.challengeId,
    title: r.name,
    status: "active",
    duration_days: r.dayTotal,
    current_day: r.day,
    secured_days: r.verified,
    secured_today: opts?.todaySecured === true,
    tasks_today: r.tasksPerDay,
    started_at: r.dayLabel,
  }));
  const finished: ChallengeRow[] = record.completed.map((c) => ({
    id: c.id,
    challengeId: c.challengeId,
    title: c.name,
    status: asStatus(c.status),
    duration_days: c.length,
    current_day: c.endedOnDay,
    secured_days: c.verified,
    ended_on_day: c.endedOnDay,
    started_at: c.startDateKey,
    ended_at: c.endDateKey,
  }));
  return [...active, ...finished];
}
