/**
 * Strava task verification: check if user has a Strava activity matching the task rule.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChallengeTaskRowRaw, VerificationRuleStrava } from "./challenge-tasks";
import { getTaskVerification } from "./challenge-tasks";
import type { ConnectedAccountRow } from "./strava-service";
import {
  ensureValidToken,
  getAthleteActivities,
  type StravaActivity,
} from "./strava-service";

const PROVIDER_STRAVA = "strava";

function log(msg: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), msg, ...meta });
  if (process.env.NODE_ENV === "production") console.log(line);
  else console.log("[strava-verifier]", line);
}

function parseDateKey(dateKey: string): { after: number; before: number } {
  const d = new Date(dateKey + "T00:00:00Z");
  const after = Math.floor(d.getTime() / 1000);
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 1);
  const before = Math.floor(next.getTime() / 1000);
  return { after, before };
}

function activityMatchesRule(activity: StravaActivity, rule: VerificationRuleStrava): boolean {
  const sport = (rule.sport ?? "Run").toLowerCase();
  const typeLower = (activity.type ?? "").toLowerCase();
  const sportTypeLower = (activity.sport_type ?? "").toLowerCase();
  const typeMatch =
    typeLower === sport || sportTypeLower === sport || typeLower.includes(sport) || sportTypeLower.includes(sport);
  if (!typeMatch) return false;

  const minDistanceM = rule.min_distance_m ?? 0;
  const distanceM = activity.distance ?? 0;
  if (minDistanceM > 0 && distanceM < minDistanceM) return false;

  const minMovingTimeS = rule.min_moving_time_s ?? 0;
  const movingTimeS = activity.moving_time ?? 0;
  if (minMovingTimeS > 0 && movingTimeS < minMovingTimeS) return false;

  return true;
}

export interface VerifyStravaResult {
  verified: boolean;
  activityId?: number;
  activity?: StravaActivity;
  error?: string;
}

export async function verifyStravaTaskCompletion(
  supabase: SupabaseClient,
  userId: string,
  activeChallengeId: string,
  taskId: string,
  dateKey: string
): Promise<VerifyStravaResult> {
  const { data: taskRow, error: taskErr } = await supabase
    .from("challenge_tasks")
    .select("id, task_type, config")
    .eq("id", taskId)
    .single();

  if (taskErr || !taskRow) {
    log("verifyStravaTask: task not found", { taskId });
    return { verified: false, error: "Task not found" };
  }

  const task = taskRow as unknown as ChallengeTaskRowRaw;
  const { verificationMethod, verificationRule } = getTaskVerification(task);
  if (verificationMethod !== "strava_activity" || !verificationRule) {
    log("verifyStravaTask: task not Strava-verified", { taskId });
    return { verified: false, error: "Task does not use Strava verification" };
  }

  const { data: connRow, error: connErr } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", PROVIDER_STRAVA)
    .maybeSingle();

  if (connErr || !connRow) {
    log("verifyStravaTask: no Strava connection", { userId });
    return { verified: false, error: "Strava not connected" };
  }

  const connection = connRow as unknown as ConnectedAccountRow;
  let accessToken: string;
  try {
    accessToken = await ensureValidToken(connection, async (updates) => {
      await supabase
        .from("connected_accounts")
        .update({
          access_token: updates.access_token,
          refresh_token: updates.refresh_token ?? connection.refresh_token,
          expires_at: updates.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connection.id);
    });
  } catch (e) {
    log("verifyStravaTask: token refresh failed", { error: String(e) });
    return { verified: false, error: "Strava token invalid or expired" };
  }

  const { after, before } = parseDateKey(dateKey);
  let activities: StravaActivity[];
  try {
    activities = await getAthleteActivities(accessToken, { after, before, per_page: 50 });
  } catch (e) {
    log("verifyStravaTask: fetch activities failed", { error: String(e) });
    return { verified: false, error: "Failed to fetch Strava activities" };
  }

  const rule = verificationRule as VerificationRuleStrava;
  const matching = activities.find((a) => activityMatchesRule(a, rule));
  if (!matching) {
    log("verifyStravaTask: no matching activity", { dateKey, count: activities.length });
    return { verified: false };
  }

  const proofPayload = {
    id: matching.id,
    type: matching.type,
    sport_type: matching.sport_type,
    name: matching.name,
    distance: matching.distance,
    moving_time: matching.moving_time,
    start_date: matching.start_date,
    start_date_local: matching.start_date_local,
  };

  const { error: upsertErr } = await supabase.from("check_ins").upsert(
    {
      user_id: userId,
      active_challenge_id: activeChallengeId,
      task_id: taskId,
      date_key: dateKey,
      status: "completed",
      value: matching.moving_time ?? undefined,
      proof_source: "strava",
      proof_payload_json: proofPayload,
      external_activity_id: String(matching.id),
      verification_status: "verified",
    },
    { onConflict: "active_challenge_id,task_id,date_key" }
  );

  if (upsertErr) {
    log("verifyStravaTask: check_in upsert failed", { code: upsertErr.code });
    return { verified: true, activityId: matching.id, activity: matching, error: "Failed to save verification" };
  }

  log("verifyStravaTask: verified", { taskId, dateKey, activityId: matching.id });
  return { verified: true, activityId: matching.id, activity: matching };
}
