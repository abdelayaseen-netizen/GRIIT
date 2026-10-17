/**
 * Build 90 chunk 09.1: Strava webhook. A run or ride logged in Strava completes the matching
 * task without opening GRIIT, then the person chooses whether to post it (09.2).
 *
 * - GET  /api/strava/webhook  handshake (hub.challenge)
 * - POST /api/strava/webhook  events; acknowledged at once, processed after
 *
 * Idempotent on `check_ins.external_activity_id`: an activity id that already completed a
 * task never completes another. No new table.
 *
 * Securing the day needs the user's auth.uid() inside `secure_day`; a webhook has no user JWT,
 * so the store calls `secure_day_for_user` (SQL in docs/sql/build90.sql). Until it exists the
 * task is complete and the secure is logged as skipped; the app secures on the next open.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChallengeTaskRowRaw, VerificationRuleStrava } from "./challenge-tasks";
import { getTaskVerification, isTaskRequired } from "./challenge-tasks";
import { activityMatchesRule } from "./strava-verifier";
import { ensureValidToken, getActivity, type ConnectedAccountRow, type StravaActivity } from "./strava-service";
import { isStravaAutoVerifyEnabled } from "./strava-auto-verify";
import { shareColumns } from "./activity-share";
import { calendarDayIndexInclusive, dateKeyFromIsoInTimeZone, dateKeyInTimeZone, getProfileTimeZoneForUser } from "./date-utils";
import { sendPushToProfile } from "./sendPush";
import { logger } from "./logger";
import { STRAVA_PUSH_TYPE, stravaChoiceRoute, stravaLoggedNotification } from "../../lib/strava-verify";

export const STRAVA_WEBHOOK_PATH = "/api/strava/webhook";
/** Used when STRAVA_WEBHOOK_VERIFY_TOKEN is unset. Not a secret: it only pairs the handshake with our registration. */
export const STRAVA_WEBHOOK_DEFAULT_VERIFY_TOKEN = "griit-strava";

const PROVIDER_STRAVA = "strava";

function log(msg: string, meta?: Record<string, unknown>) {
  logger.info({ msg, ...meta }, "strava-webhook");
}

export function stravaWebhookVerifyToken(env: Record<string, string | undefined> = process.env): string {
  return env.STRAVA_WEBHOOK_VERIFY_TOKEN?.trim() || STRAVA_WEBHOOK_DEFAULT_VERIFY_TOKEN;
}

export function handleStravaWebhookHandshake(
  query: URLSearchParams,
  env: Record<string, string | undefined> = process.env,
): { status: 200; body: { "hub.challenge": string } } | { status: 403; body: { error: string } } {
  const mode = query.get("hub.mode");
  const token = query.get("hub.verify_token");
  const challenge = query.get("hub.challenge");
  if (mode !== "subscribe" || !challenge || token !== stravaWebhookVerifyToken(env)) {
    return { status: 403, body: { error: "Forbidden" } };
  }
  return { status: 200, body: { "hub.challenge": challenge } };
}

export type StravaWebhookEvent = {
  object_type: string;
  aspect_type: string;
  object_id: number | string;
  owner_id: number | string;
  subscription_id?: number;
  event_time?: number;
  updates?: Record<string, unknown>;
};

export function parseStravaWebhookEvent(body: unknown): StravaWebhookEvent | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const objectType = typeof b.object_type === "string" ? b.object_type : null;
  const aspectType = typeof b.aspect_type === "string" ? b.aspect_type : null;
  const objectId = typeof b.object_id === "number" || typeof b.object_id === "string" ? b.object_id : null;
  const ownerId = typeof b.owner_id === "number" || typeof b.owner_id === "string" ? b.owner_id : null;
  if (!objectType || !aspectType || objectId == null || ownerId == null) return null;
  return {
    object_type: objectType,
    aspect_type: aspectType,
    object_id: objectId,
    owner_id: ownerId,
    subscription_id: typeof b.subscription_id === "number" ? b.subscription_id : undefined,
    event_time: typeof b.event_time === "number" ? b.event_time : undefined,
    updates: b.updates && typeof b.updates === "object" ? (b.updates as Record<string, unknown>) : undefined,
  };
}

export type WebhookEnrollment = {
  id: string;
  challenge_id: string;
  start_at: string | null;
  challenge_title: string;
  duration_days: number | null;
  is_hard_mode: boolean;
};

export type WebhookTaskRow = ChallengeTaskRowRaw & { challenge_id: string; title?: string | null };

export type WebhookSecureResult = { secured: boolean; streak: number; challengeDay: number };

/** Everything the processor reads or writes, so the logic is testable without Supabase. */
export type StravaWebhookStore = {
  activityAlreadyUsed(activityId: string): Promise<boolean>;
  connectionForAthlete(athleteId: string): Promise<ConnectedAccountRow | null>;
  saveTokens(connectionId: string, updates: { access_token: string; refresh_token?: string; expires_at: string }): Promise<void>;
  profileTimeZone(userId: string): Promise<string>;
  activeEnrollments(userId: string): Promise<WebhookEnrollment[]>;
  tasksForChallenges(challengeIds: string[]): Promise<WebhookTaskRow[]>;
  completedTaskIds(activeChallengeId: string, dateKey: string): Promise<string[]>;
  completeTask(args: {
    userId: string;
    activeChallengeId: string;
    taskId: string;
    dateKey: string;
    activityId: string;
    activity: StravaActivity;
    progressPercent: number;
  }): Promise<void>;
  insertActivityEvent(payload: Record<string, unknown>): Promise<string | null>;
  insertNotification(row: Record<string, unknown>): Promise<void>;
  sendPush(userId: string, params: { title: string; body: string; data: Record<string, unknown> }): Promise<void>;
  /** null when the RPC is not installed yet. */
  secureDay(userId: string, activeChallengeId: string): Promise<WebhookSecureResult | null>;
};

export type StravaWebhookOutcome =
  | "flag_off"
  | "ignored"
  | "repeat"
  | "no_connection"
  | "fetch_failed"
  | "no_match"
  | "completed";

export type StravaWebhookResult = {
  outcome: StravaWebhookOutcome;
  userId?: string;
  taskId?: string;
  activeChallengeId?: string;
  dateKey?: string;
  eventId?: string | null;
  daySecured?: boolean;
  streak?: number;
  secureSkipped?: "not_today" | "rpc_missing" | "required_open";
  error?: string;
};

function activityDateKey(activity: StravaActivity, tz: string): string {
  const local = typeof activity.start_date_local === "string" ? activity.start_date_local.slice(0, 10) : "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(local)) return local;
  return dateKeyFromIsoInTimeZone(activity.start_date, tz) || dateKeyInTimeZone(new Date(), tz);
}

function challengeDayFor(enrollment: WebhookEnrollment, dateKey: string, tz: string): number {
  const startKey = enrollment.start_at ? dateKeyFromIsoInTimeZone(enrollment.start_at, tz) : dateKey;
  const idx = startKey ? calendarDayIndexInclusive(startKey, dateKey) : 1;
  const total = enrollment.duration_days && enrollment.duration_days > 0 ? enrollment.duration_days : idx;
  return Math.min(total, Math.max(1, idx));
}

export async function processStravaWebhookEvent(
  event: StravaWebhookEvent,
  deps: {
    store: StravaWebhookStore;
    enabled?: boolean;
    fetchActivity?: (connection: ConnectedAccountRow, activityId: string, store: StravaWebhookStore) => Promise<StravaActivity>;
    now?: () => Date;
  },
): Promise<StravaWebhookResult> {
  const enabled = deps.enabled ?? isStravaAutoVerifyEnabled();
  if (!enabled) return { outcome: "flag_off" };
  if (event.object_type !== "activity" || event.aspect_type !== "create") return { outcome: "ignored" };

  const { store } = deps;
  const activityId = String(event.object_id);
  if (await store.activityAlreadyUsed(activityId)) {
    log("repeat activity", { activityId });
    return { outcome: "repeat" };
  }

  const connection = await store.connectionForAthlete(String(event.owner_id));
  if (!connection) return { outcome: "no_connection" };
  const userId = connection.user_id;

  let activity: StravaActivity;
  try {
    activity = await (deps.fetchActivity ?? defaultFetchActivity)(connection, activityId, store);
  } catch (e) {
    log("fetch activity failed", { activityId, error: String(e) });
    return { outcome: "fetch_failed", userId, error: String(e) };
  }

  const tz = await store.profileTimeZone(userId);
  const dateKey = activityDateKey(activity, tz);
  const enrollments = await store.activeEnrollments(userId);
  if (enrollments.length === 0) return { outcome: "no_match", userId, dateKey };
  const tasks = await store.tasksForChallenges([...new Set(enrollments.map((e) => e.challenge_id))]);

  for (const enrollment of enrollments) {
    const theirs = tasks.filter((t) => t.challenge_id === enrollment.challenge_id);
    const candidates = theirs.filter((t) => {
      const { verificationMethod, verificationRule } = getTaskVerification(t);
      return (
        verificationMethod === "strava_activity" &&
        verificationRule != null &&
        activityMatchesRule(activity, verificationRule as VerificationRuleStrava)
      );
    });
    if (candidates.length === 0) continue;
    const done = new Set(await store.completedTaskIds(enrollment.id, dateKey));
    const task = candidates.find((t) => !done.has(t.id));
    if (!task) continue;

    const required = theirs.filter((t) => isTaskRequired(t));
    const doneAfter = new Set([...done, task.id]);
    const completedRequired = required.filter((t) => doneAfter.has(t.id)).length;
    const progressPercent = required.length > 0 ? Math.round((completedRequired / required.length) * 100) : 100;
    const requiredRemaining = Math.max(0, required.length - completedRequired);

    await store.completeTask({
      userId,
      activeChallengeId: enrollment.id,
      taskId: task.id,
      dateKey,
      activityId,
      activity,
      progressPercent,
    });

    const taskName = (task.title ?? "").trim() || "Task";
    const eventId = await store.insertActivityEvent({
      user_id: userId,
      event_type: "task_completed",
      challenge_id: enrollment.challenge_id,
      ...shareColumns("unanswered"),
      metadata: {
        task_id: task.id,
        task_name: taskName,
        task_type: task.task_type,
        challenge_name: enrollment.challenge_title,
        date_key: dateKey,
        has_photo: false,
        photo_url: null,
        verification_method: "strava_activity",
        is_hard_mode: enrollment.is_hard_mode === true,
        task_mode: "full",
        audience: null,
        heart_rate_verified: false,
        location_verified: false,
        strava_activity_id: activityId,
      },
    });

    const todayKey = dateKeyInTimeZone((deps.now ?? (() => new Date()))(), tz);
    let daySecured = false;
    let streak = 0;
    let secureSkipped: StravaWebhookResult["secureSkipped"];
    if (requiredRemaining > 0) {
      secureSkipped = "required_open";
    } else if (dateKey !== todayKey) {
      secureSkipped = "not_today";
    } else {
      const secured = await store.secureDay(userId, enrollment.id);
      if (!secured) {
        secureSkipped = "rpc_missing";
        log("secure skipped: secure_day_for_user missing", { userId, activeChallengeId: enrollment.id });
      } else {
        daySecured = secured.secured;
        streak = secured.streak;
      }
    }

    const day = challengeDayFor(enrollment, dateKey, tz);
    const text = stravaLoggedNotification({ taskName, day, sport: activity.sport_type ?? activity.type });
    const route = stravaChoiceRoute({
      eventId,
      taskName,
      day,
      challengeName: enrollment.challenge_title,
      daySecured,
      streak,
    });
    await store.insertNotification({
      user_id: userId,
      type: "general",
      title: text.title,
      body: text.body,
      read: false,
      data: {
        route,
        event_id: eventId,
        task_id: task.id,
        active_challenge_id: enrollment.id,
        challenge_id: enrollment.challenge_id,
        date_key: dateKey,
        strava_activity_id: activityId,
      },
    });
    try {
      await store.sendPush(userId, {
        title: text.title,
        body: text.body,
        data: { type: STRAVA_PUSH_TYPE, route, event_id: eventId, sent_at_ms: Date.now() },
      });
    } catch (e) {
      log("push failed", { userId, error: String(e) });
    }

    log("completed", { userId, taskId: task.id, activeChallengeId: enrollment.id, dateKey, daySecured, secureSkipped });
    return {
      outcome: "completed",
      userId,
      taskId: task.id,
      activeChallengeId: enrollment.id,
      dateKey,
      eventId,
      daySecured,
      streak,
      secureSkipped,
    };
  }

  log("no matching task", { userId, activityId, dateKey, type: activity.sport_type ?? activity.type });
  return { outcome: "no_match", userId, dateKey };
}

async function defaultFetchActivity(connection: ConnectedAccountRow, activityId: string, store: StravaWebhookStore): Promise<StravaActivity> {
  const accessToken = await ensureValidToken(connection, (updates) => store.saveTokens(connection.id, updates));
  return getActivity(accessToken, activityId);
}

/** The Supabase-backed store (service role). */
export function supabaseWebhookStore(supabase: SupabaseClient): StravaWebhookStore {
  return {
    async activityAlreadyUsed(activityId) {
      const { data, error } = await supabase
        .from("check_ins")
        .select("id")
        .eq("proof_source", PROVIDER_STRAVA)
        .eq("external_activity_id", activityId)
        .limit(1);
      if (error) {
        logger.error({ err: error }, "[strava-webhook] external_activity_id lookup");
        // Fail closed: a lookup error must not double-complete.
        return true;
      }
      return Array.isArray(data) && data.length > 0;
    },
    async connectionForAthlete(athleteId) {
      const { data, error } = await supabase
        .from("connected_accounts")
        .select("id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scope, metadata_json, updated_at")
        .eq("provider", PROVIDER_STRAVA)
        .eq("provider_user_id", athleteId)
        .maybeSingle();
      if (error || !data) return null;
      return data as unknown as ConnectedAccountRow;
    },
    async saveTokens(connectionId, updates) {
      await supabase
        .from("connected_accounts")
        .update({
          access_token: updates.access_token,
          ...(updates.refresh_token ? { refresh_token: updates.refresh_token } : {}),
          expires_at: updates.expires_at,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", connectionId);
    },
    profileTimeZone(userId) {
      return getProfileTimeZoneForUser(supabase, userId);
    },
    async activeEnrollments(userId) {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("active_challenges")
        .select("id, challenge_id, start_at, end_at, status, challenges(title, duration_days, is_hard_mode)")
        .eq("user_id", userId)
        .eq("status", "active")
        .lte("start_at", nowIso)
        .gte("end_at", nowIso)
        .limit(50);
      if (error) {
        logger.error({ err: error }, "[strava-webhook] active_challenges");
        return [];
      }
      return ((data ?? []) as unknown as {
        id: string;
        challenge_id: string;
        start_at: string | null;
        challenges?: { title?: string | null; duration_days?: number | null; is_hard_mode?: boolean | null } | null;
      }[]).map((r) => ({
        id: r.id,
        challenge_id: r.challenge_id,
        start_at: r.start_at,
        challenge_title: r.challenges?.title?.trim() || "Challenge",
        duration_days: r.challenges?.duration_days ?? null,
        is_hard_mode: r.challenges?.is_hard_mode === true,
      }));
    },
    async tasksForChallenges(challengeIds) {
      if (challengeIds.length === 0) return [];
      const { data, error } = await supabase
        .from("challenge_tasks")
        .select("id, challenge_id, title, task_type, config, order_index")
        .in("challenge_id", challengeIds)
        .limit(400);
      if (error) {
        logger.error({ err: error }, "[strava-webhook] challenge_tasks");
        return [];
      }
      return (data ?? []) as unknown as WebhookTaskRow[];
    },
    async completedTaskIds(activeChallengeId, dateKey) {
      const { data } = await supabase
        .from("check_ins")
        .select("task_id")
        .eq("active_challenge_id", activeChallengeId)
        .eq("date_key", dateKey)
        .eq("status", "completed")
        .limit(100);
      return ((data ?? []) as { task_id: string }[]).map((r) => String(r.task_id));
    },
    async completeTask(args) {
      const a = args.activity;
      const proofPayload = {
        id: a.id,
        type: a.type,
        sport_type: a.sport_type,
        name: a.name,
        distance: a.distance,
        moving_time: a.moving_time,
        start_date: a.start_date,
        start_date_local: a.start_date_local,
        source: "webhook",
      };
      const { error } = await supabase.from("check_ins").upsert(
        {
          user_id: args.userId,
          active_challenge_id: args.activeChallengeId,
          task_id: args.taskId,
          date_key: args.dateKey,
          status: "completed",
          value: a.moving_time ?? undefined,
          proof_source: PROVIDER_STRAVA,
          proof_payload_json: proofPayload,
          external_activity_id: args.activityId,
          verification_status: "verified",
        } as never,
        { onConflict: "active_challenge_id,task_id,date_key" },
      );
      if (error) {
        logger.error({ err: error, code: error.code }, "[strava-webhook] check_ins upsert");
        throw new Error(`check_ins upsert failed: ${error.code ?? "unknown"}`);
      }
      await supabase
        .from("active_challenges")
        .update({ progress_percent: args.progressPercent } as never)
        .eq("id", args.activeChallengeId);
    },
    async insertActivityEvent(payload) {
      const { data, error } = await supabase.from("activity_events").insert(payload as never).select("id").maybeSingle();
      if (error) {
        logger.error({ err: error, code: error.code }, "[strava-webhook] activity_events insert");
        return null;
      }
      return (data as { id?: string } | null)?.id ?? null;
    },
    async insertNotification(row) {
      const { error } = await supabase.from("in_app_notifications").insert(row as never);
      if (error) logger.error({ err: error, code: error.code }, "[strava-webhook] in_app_notifications insert");
    },
    sendPush(userId, params) {
      return sendPushToProfile(supabase, userId, params);
    },
    async secureDay(userId, activeChallengeId) {
      const { data, error } = await supabase.rpc("secure_day_for_user", {
        p_user_id: userId,
        p_active_challenge_id: activeChallengeId,
      } as never);
      if (error) {
        const code = (error as { code?: string }).code;
        if (code === "42883" || code === "PGRST202") return null;
        logger.error({ err: error, code, userId, activeChallengeId }, "[strava-webhook] secure_day_for_user");
        return { secured: false, streak: 0, challengeDay: 0 };
      }
      const row = (Array.isArray(data) ? data[0] : data) as { streak?: number; secured?: boolean } | null;
      const { data: ac } = await supabase.from("active_challenges").select("current_day").eq("id", activeChallengeId).maybeSingle();
      return {
        secured: row?.secured === true,
        streak: typeof row?.streak === "number" ? row.streak : 0,
        challengeDay: (ac as { current_day?: number } | null)?.current_day ?? 0,
      };
    },
  };
}

/** POST body handler for hono: parse, then process in the background. */
export function handleStravaWebhookPost(body: unknown, supabase: SupabaseClient | null): { status: 200 | 400; body: Record<string, unknown> } {
  const event = parseStravaWebhookEvent(body);
  if (!event) return { status: 400, body: { ok: false, error: "Bad event" } };
  if (!supabase) {
    logger.error("[strava-webhook] no service role client; event dropped");
    return { status: 200, body: { ok: true, outcome: "no_service_role" } };
  }
  void processStravaWebhookEvent(event, { store: supabaseWebhookStore(supabase) }).catch((err) => {
    logger.error({ err }, "[strava-webhook] processing failed");
  });
  return { status: 200, body: { ok: true } };
}
