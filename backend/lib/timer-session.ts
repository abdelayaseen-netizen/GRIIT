/**
 * Wall-clock timer session stored on check_ins.proof_payload_json.session.
 * Remaining time is always derived. complete must not trust a client elapsed.
 */

export type TimerSessionKind = "timer" | "workout_session";

export type TimerSession = {
  started_at: string;
  required_seconds: number;
  kind: TimerSessionKind;
};

export const TIMER_SESSION_NOT_FOUND =
  "Timer session not found. Start the timer again.";
export const TIMER_SESSION_NOT_ELAPSED = "Timer has not finished.";

export function parseTimerSession(payload: unknown): TimerSession | null {
  if (!payload || typeof payload !== "object") return null;
  const session = (payload as { session?: unknown }).session;
  if (!session || typeof session !== "object") return null;
  const row = session as Record<string, unknown>;
  const started_at = typeof row.started_at === "string" ? row.started_at : "";
  const required_seconds =
    typeof row.required_seconds === "number" && Number.isFinite(row.required_seconds)
      ? row.required_seconds
      : NaN;
  const kind = row.kind === "workout_session" ? "workout_session" : row.kind === "timer" ? "timer" : null;
  if (!started_at || !kind || !Number.isFinite(required_seconds) || required_seconds <= 0) return null;
  const started = Date.parse(started_at);
  if (Number.isNaN(started)) return null;
  return { started_at, required_seconds, kind };
}

export function assertTimerSessionElapsed(
  session: TimerSession | null,
  now: Date = new Date()
): { ok: true; session: TimerSession } | { ok: false; code: "NOT_FOUND" | "NOT_ELAPSED"; message: string } {
  if (!session) {
    return { ok: false, code: "NOT_FOUND", message: TIMER_SESSION_NOT_FOUND };
  }
  const started = Date.parse(session.started_at);
  if (Number.isNaN(started)) {
    return { ok: false, code: "NOT_FOUND", message: TIMER_SESSION_NOT_FOUND };
  }
  const endsAt = started + session.required_seconds * 1000;
  if (now.getTime() < endsAt) {
    return { ok: false, code: "NOT_ELAPSED", message: TIMER_SESSION_NOT_ELAPSED };
  }
  return { ok: true, session };
}

export function wrapTimerSession(session: TimerSession): { session: TimerSession } {
  return { session };
}
