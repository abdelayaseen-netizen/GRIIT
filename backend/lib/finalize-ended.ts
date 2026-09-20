/**
 * Chunk T finalizeEnded / markEndSeen / unseen endings.
 * Writes are service-role after ownership. No writes on read.
 */
import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { enrollmentIsPastEnd } from "./enrollment-end-at";

/** Unseen endings: completed or team-failed, not abandoned. */
export const UNSEEN_END_STATUSES = ["completed", "failed"] as const;

export type ExistingEndEvent = {
  challenge_id: string | null;
  metadata: Record<string, unknown> | null;
};

export type FinalizeEnrollment = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  end_at: string;
};

export function endedStatusForFinalize(_enrollment: {
  is_hard_mode?: boolean | null;
  participation_type?: string | null;
}): "completed" {
  // solo hard-mode failure deferred, see Chunk T ruling
  return "completed";
}

export function shouldEmitCompletedChallenge(
  events: ExistingEndEvent[],
  enrollment: { id: string; challenge_id: string },
): boolean {
  for (const ev of events) {
    const raw = ev.metadata?.active_challenge_id;
    if (typeof raw === "string" && raw === enrollment.id) return false;
    const hasEnrollmentKey = typeof raw === "string" && raw.length > 0;
    if (!hasEnrollmentKey && ev.challenge_id === enrollment.challenge_id) return false;
  }
  return true;
}

export function isUnseenEnding(row: { status: string; end_seen_at: string | null }): boolean {
  return (
    (row.status === "completed" || row.status === "failed") && row.end_seen_at == null
  );
}

export async function applyFinalizeEnded(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<{ finalized: string[]; eventsEmitted: number }> {
  const { data: rows, error } = await supabase
    .from("active_challenges")
    .select("id, user_id, challenge_id, status, end_at")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load enrollments." });
  }

  const due = ((rows ?? []) as FinalizeEnrollment[]).filter(
    (row) => row.user_id === userId && enrollmentIsPastEnd(new Date(row.end_at), now),
  );
  if (due.length === 0) return { finalized: [], eventsEmitted: 0 };

  const { data: eventRows, error: evErr } = await supabase
    .from("activity_events")
    .select("challenge_id, metadata")
    .eq("user_id", userId)
    .eq("event_type", "completed_challenge");
  if (evErr) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load end events." });
  }
  const events = (eventRows ?? []) as ExistingEndEvent[];

  const challengeIds = [...new Set(due.map((r) => r.challenge_id))];
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, title, duration_days")
    .in("id", challengeIds);
  const titleById = new Map(
    ((challenges ?? []) as { id: string; title?: string | null; duration_days?: number | null }[]).map(
      (c) => [c.id, c],
    ),
  );

  const finalized: string[] = [];
  let eventsEmitted = 0;
  for (const row of due) {
    const status = endedStatusForFinalize({});
    const { data: won, error: updErr } = await supabase
      .from("active_challenges")
      .update({ status, ended_at: row.end_at })
      .eq("id", row.id)
      .eq("user_id", userId)
      .eq("status", "active")
      .select("id");
    if (updErr) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to finalize enrollment." });
    }
    if (!won || won.length === 0) continue;
    finalized.push(row.id);
    if (!shouldEmitCompletedChallenge(events, row)) continue;
    const ch = titleById.get(row.challenge_id);
    const { error: insErr } = await supabase.from("activity_events").insert({
      user_id: userId,
      event_type: "completed_challenge",
      challenge_id: row.challenge_id,
      // end event has no photo; matches pre-Chunk-T behaviour. Privacy of end events is an open Design question.
      shared: true,
      metadata: {
        active_challenge_id: row.id,
        challenge_name: ch?.title ?? "Challenge",
        duration_days: ch?.duration_days ?? null,
      },
    });
    if (insErr) {
      const code = (insErr as { code?: string }).code;
      if (code === "23505") {
        events.push({
          challenge_id: row.challenge_id,
          metadata: { active_challenge_id: row.id },
        });
        eventsEmitted += 1;
        continue;
      }
      console.error("[finalizeEnded] event insert failed", insErr);
      try {
        const Sentry = await import("@sentry/node");
        Sentry.captureException(insErr);
      } catch {
        /* Sentry unavailable */
      }
      continue;
    }
    events.push({
      challenge_id: row.challenge_id,
      metadata: { active_challenge_id: row.id },
    });
    eventsEmitted += 1;
  }
  return { finalized, eventsEmitted };
}

export async function applyMarkEndSeen(
  supabase: SupabaseClient,
  userId: string,
  enrollmentIds: string[],
  now: Date = new Date(),
): Promise<{ seen: string[] }> {
  if (enrollmentIds.length === 0) return { seen: [] };
  const { data, error } = await supabase
    .from("active_challenges")
    .select("id, user_id")
    .in("id", enrollmentIds);
  if (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load enrollments." });
  }
  const rows = (data ?? []) as { id: string; user_id: string }[];
  for (const row of rows) {
    if (row.user_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have access to this challenge.",
      });
    }
  }
  const owned = rows.filter((r) => r.user_id === userId).map((r) => r.id);
  if (owned.length === 0) return { seen: [] };
  const nowIso = now.toISOString();
  const { error: updErr } = await supabase
    .from("active_challenges")
    .update({ end_seen_at: nowIso })
    .in("id", owned)
    .eq("user_id", userId);
  if (updErr) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to mark end seen." });
  }
  return { seen: owned };
}
