/**
 * Build 92 chunk 08.1: short invite codes stored in `invite_tracking`.
 * Shared by the `invites` tRPC route and the public `GET /i/:code` page.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  INVITE_LINK_SOURCE,
  generateInviteCode,
  isInviteCode,
  resolveInviteRow,
  type ResolvedInvite,
} from "./invite-codes";
import { logger } from "./logger";

type Client = SupabaseClient;

/** One code per (inviter, challenge). Re-uses the row when it exists. */
export async function getOrCreateInviteCode(
  service: Client,
  input: { inviterId: string; challengeId: string },
): Promise<string> {
  const { data: existing } = await service
    .from("invite_tracking")
    .select("invite_code")
    .eq("referrer_user_id", input.inviterId)
    .eq("challenge_id", input.challengeId)
    .eq("source", INVITE_LINK_SOURCE)
    .is("referred_user_id", null)
    .not("invite_code", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const code = (existing as { invite_code?: string | null } | null)?.invite_code;
  if (code && isInviteCode(code)) return code;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const candidate = generateInviteCode();
    const { data: clash } = await service
      .from("invite_tracking")
      .select("id")
      .eq("invite_code", candidate)
      .limit(1)
      .maybeSingle();
    if (clash) continue;
    const { error } = await service.from("invite_tracking").insert({
      referrer_user_id: input.inviterId,
      challenge_id: input.challengeId,
      invite_code: candidate,
      source: INVITE_LINK_SOURCE,
      joined_challenge: false,
    });
    if (!error) return candidate;
    logger.warn({ attempt, error: error.message }, "[invites] code insert failed, retrying");
  }
  throw new Error("Could not create an invite code.");
}

export async function findInviteByCode(service: Client, code: string): Promise<ResolvedInvite | null> {
  if (!isInviteCode(code)) return null;
  const { data } = await service
    .from("invite_tracking")
    .select("challenge_id, referrer_user_id, invite_code, source")
    .eq("invite_code", code)
    .eq("source", INVITE_LINK_SOURCE)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return resolveInviteRow(data as Parameters<typeof resolveInviteRow>[0]);
}

export type InviteChallengeSummary = {
  id: string;
  title: string;
  category: string | null;
  durationDays: number;
  participantsCount: number;
  participationType: string | null;
  runStatus: string | null;
  creatorId: string | null;
  firstTask: string | null;
  proofLine: string | null;
};

export async function loadInviteChallenge(
  service: Client,
  challengeId: string,
): Promise<InviteChallengeSummary | null> {
  const { data } = await service
    .from("challenges")
    .select(
      "id, title, category, duration_days, participants_count, participation_type, run_status, creator_id, challenge_tasks (title, require_photo, order_index, gate_time_start, gate_time_end)",
    )
    .eq("id", challengeId)
    .maybeSingle();
  if (!data) return null;
  const row = data as {
    id: string;
    title: string;
    category: string | null;
    duration_days: number | null;
    participants_count: number | null;
    participation_type: string | null;
    run_status: string | null;
    creator_id: string | null;
    challenge_tasks?: Array<{
      title?: string | null;
      require_photo?: boolean | null;
      order_index?: number | null;
      gate_time_start?: string | null;
      gate_time_end?: string | null;
    }> | null;
  };
  const tasks = [...(row.challenge_tasks ?? [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  );
  const first = tasks[0] ?? null;
  const camera = first?.require_photo === true;
  const window =
    first?.gate_time_start && first?.gate_time_end
      ? `, ${clock(first.gate_time_start)} to ${clock(first.gate_time_end)}`
      : "";
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    durationDays: row.duration_days ?? 0,
    participantsCount: row.participants_count ?? 0,
    participationType: row.participation_type,
    runStatus: row.run_status,
    creatorId: row.creator_id,
    firstTask: first?.title ?? null,
    proofLine: first ? (camera ? `Proven with the camera${window}` : "Self-reported") : null,
  };
}

/** "06:00:00" → "6am", "13:30:00" → "1:30pm". */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h)) return hhmm;
  const suffix = (h ?? 0) >= 12 ? "pm" : "am";
  const hour12 = ((h ?? 0) % 12) || 12;
  const mins = m && m > 0 ? `:${String(m).padStart(2, "0")}` : "";
  return `${hour12}${mins}${suffix}`;
}

export async function inviterDisplayName(service: Client, userId: string): Promise<string> {
  const { data } = await service
    .from("profiles")
    .select("display_name, username")
    .eq("id", userId)
    .maybeSingle();
  const p = data as { display_name?: string | null; username?: string | null } | null;
  return p?.display_name?.trim() || p?.username?.trim() || "A friend";
}
