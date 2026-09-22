/**
 * Profile → Challenges rows. Copy from design/handoff/src/components/ProfileChallenges.tsx.
 */
import type { ProfileRecord } from "@/lib/profile-v2-record";

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
      return `Day ${Math.min(c.current_day, c.duration_days)} of ${c.duration_days}`;
    case "completed":
      return `${c.secured_days} of ${c.duration_days}`;
    case "abandoned":
      return `Left on day ${c.ended_on_day}`;
    // solo hard-mode failure deferred, see Chunk T ruling
    case "failed":
      return `Failed on day ${c.ended_on_day}`;
  }
}

export function detailLine(c: ChallengeRow, fmt: (iso: string) => string): string {
  if (c.status === "active") {
    return c.secured_today
      ? `${c.tasks_today} of ${c.tasks_today} secured today`
      : "Not yet today";
  }
  return `${fmt(c.started_at)} to ${fmt(c.ended_at ?? c.started_at)}`;
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
