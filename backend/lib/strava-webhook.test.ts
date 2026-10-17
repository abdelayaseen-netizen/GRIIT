/**
 * Build 90 chunk 09: a run logged in Strava completes the matching task on its own.
 * Before this, nothing received Strava events; verification ran only when the user asked.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  STRAVA_WEBHOOK_DEFAULT_VERIFY_TOKEN,
  STRAVA_WEBHOOK_PATH,
  handleStravaWebhookHandshake,
  parseStravaWebhookEvent,
  processStravaWebhookEvent,
  stravaWebhookVerifyToken,
  type StravaWebhookStore,
} from "./strava-webhook";
import type { StravaActivity } from "./strava-service";
import { activityMatchesRule } from "./strava-verifier";

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const RUN_TASK = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const READ_TASK = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const ATHLETE = "4242";

const run: StravaActivity = {
  id: 987654321,
  type: "Run",
  sport_type: "Run",
  name: "Morning run",
  distance: 5200,
  moving_time: 1700,
  start_date: "2026-10-17T11:05:00Z",
  start_date_local: "2026-10-17T07:05:00Z",
};

const event = {
  object_type: "activity",
  aspect_type: "create",
  object_id: run.id,
  owner_id: Number(ATHLETE),
  subscription_id: 1,
  event_time: 1760700000,
};

function memoryStore(opts: { used?: string[]; completed?: string[]; tasks?: "run" | "none"; today?: string } = {}) {
  const calls: {
    completeTask: unknown[];
    insertActivityEvent: unknown[];
    insertNotification: unknown[];
    sendPush: unknown[];
    secureDay: unknown[];
    saveTokens: unknown[];
  } = {
    completeTask: [],
    insertActivityEvent: [],
    insertNotification: [],
    sendPush: [],
    secureDay: [],
    saveTokens: [],
  };
  const used = new Set(opts.used ?? []);
  const completed = new Set(opts.completed ?? []);
  const taskRows =
    opts.tasks === "none"
      ? [
          { id: READ_TASK, challenge_id: CH, title: "Read", task_type: "counter", config: { required: true } },
        ]
      : [
          {
            id: RUN_TASK,
            challenge_id: CH,
            title: "Morning run",
            task_type: "run",
            config: {
              required: true,
              verification_method: "strava_activity",
              verification_rule_json: { sport: "Run", min_distance_m: 5000 },
            },
          },
          { id: READ_TASK, challenge_id: CH, title: "Read", task_type: "counter", config: { required: true } },
        ];
  const store: StravaWebhookStore = {
    activityAlreadyUsed: async (id) => used.has(id),
    connectionForAthlete: async (athleteId) =>
      athleteId === ATHLETE
        ? {
            id: "conn-1",
            user_id: USER,
            provider: "strava",
            provider_user_id: ATHLETE,
            access_token: "tok",
            refresh_token: "ref",
            expires_at: "2099-01-01T00:00:00.000Z",
            scope: null,
            metadata_json: null,
            updated_at: "2026-10-17T00:00:00.000Z",
          }
        : null,
    saveTokens: async (...args) => {
      calls.saveTokens.push(args);
    },
    profileTimeZone: async () => "America/New_York",
    activeEnrollments: async () => [
      { id: AC, challenge_id: CH, start_at: "2026-10-16T04:00:00.000Z", challenge_title: "Run club", duration_days: 7, is_hard_mode: false },
    ],
    tasksForChallenges: async () => taskRows,
    completedTaskIds: async () => [...completed],
    completeTask: async (args) => {
      calls.completeTask.push(args);
      used.add(args.activityId);
      completed.add(args.taskId);
    },
    insertActivityEvent: async (payload) => {
      calls.insertActivityEvent.push(payload);
      return "event-1";
    },
    insertNotification: async (row) => {
      calls.insertNotification.push(row);
    },
    sendPush: async (userId, params) => {
      calls.sendPush.push([userId, params]);
    },
    secureDay: async (userId, acId) => {
      calls.secureDay.push([userId, acId]);
      return { secured: true, streak: 2, challengeDay: 2 };
    },
  };
  return { store, calls };
}

describe("09.1 webhook handshake", () => {
  it("echoes hub.challenge for a subscribe with the right verify token", () => {
    const q = new URLSearchParams({ "hub.mode": "subscribe", "hub.verify_token": "griit-test", "hub.challenge": "abc123" });
    expect(handleStravaWebhookHandshake(q, { STRAVA_WEBHOOK_VERIFY_TOKEN: "griit-test" })).toEqual({
      status: 200,
      body: { "hub.challenge": "abc123" },
    });
  });

  it("refuses a wrong token or a missing challenge", () => {
    const wrong = new URLSearchParams({ "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "abc" });
    expect(handleStravaWebhookHandshake(wrong, { STRAVA_WEBHOOK_VERIFY_TOKEN: "griit-test" }).status).toBe(403);
    const none = new URLSearchParams({ "hub.mode": "subscribe", "hub.verify_token": "griit-test" });
    expect(handleStravaWebhookHandshake(none, { STRAVA_WEBHOOK_VERIFY_TOKEN: "griit-test" }).status).toBe(403);
  });

  it("falls back to the fixed token when the env is unset, and the path is fixed", () => {
    expect(stravaWebhookVerifyToken({})).toBe(STRAVA_WEBHOOK_DEFAULT_VERIFY_TOKEN);
    expect(STRAVA_WEBHOOK_PATH).toBe("/api/strava/webhook");
  });

  it("parses an event body and rejects junk", () => {
    expect(parseStravaWebhookEvent(event)).toMatchObject({ object_type: "activity", aspect_type: "create", object_id: run.id, owner_id: 4242 });
    expect(parseStravaWebhookEvent(null)).toBeNull();
    expect(parseStravaWebhookEvent({ object_type: "activity" })).toBeNull();
    expect(parseStravaWebhookEvent("x")).toBeNull();
  });
});

describe("09.1 webhook events", () => {
  const fetchActivity = vi.fn(async () => run);

  it("a valid create event completes the matching task once, writes an unanswered post and notifies", async () => {
    const { store, calls } = memoryStore();
    const result = await processStravaWebhookEvent(event, {
      store,
      enabled: true,
      fetchActivity,
      now: () => new Date("2026-10-17T12:00:00Z"),
    });
    expect(result.outcome).toBe("completed");
    expect(result).toMatchObject({ userId: USER, taskId: RUN_TASK, activeChallengeId: AC, dateKey: "2026-10-17", eventId: "event-1" });
    expect(calls.completeTask).toHaveLength(1);
    expect(calls.completeTask[0]).toMatchObject({
      userId: USER,
      activeChallengeId: AC,
      taskId: RUN_TASK,
      dateKey: "2026-10-17",
      activityId: String(run.id),
      activity: { id: run.id },
    });
    const post = calls.insertActivityEvent[0] as Record<string, unknown>;
    expect(post).toMatchObject({ user_id: USER, event_type: "task_completed", challenge_id: CH, share_state: "unanswered", shared: false });
    expect(post.metadata).toMatchObject({
      task_id: RUN_TASK,
      task_name: "Morning run",
      challenge_name: "Run club",
      date_key: "2026-10-17",
      verification_method: "strava_activity",
      has_photo: false,
      audience: null,
    });
    // One required task (Read) is still open: no secure.
    expect(calls.secureDay).toHaveLength(0);
    expect(result.daySecured).toBe(false);
    const notif = calls.insertNotification[0] as Record<string, unknown>;
    expect(notif).toMatchObject({ user_id: USER, type: "general", title: "Strava run logged.", body: "Morning run is done for Day 2.", read: false });
    expect((notif.data as Record<string, unknown>).route).toMatch(/^\/task\/strava\?/);
    expect(calls.sendPush).toHaveLength(1);
    const [, push] = calls.sendPush[0] as [string, { title: string; body: string; data: Record<string, unknown> }];
    expect(push.title).toBe("Strava run logged.");
    expect(push.body).toBe("Morning run is done for Day 2.");
    expect(push.data.type).toBe("strava_verified");
    expect(String(push.data.route)).toContain("eventId=event-1");
  });

  it("secures the day through the service path when the Strava task was the last required one", async () => {
    const { store, calls } = memoryStore({ completed: [READ_TASK] });
    const result = await processStravaWebhookEvent(event, {
      store,
      enabled: true,
      fetchActivity,
      now: () => new Date("2026-10-17T12:00:00Z"),
    });
    expect(result.outcome).toBe("completed");
    expect(calls.secureDay).toEqual([[USER, AC]]);
    expect(result.daySecured).toBe(true);
    expect(result.streak).toBe(2);
  });

  it("a repeat event for the same activity id does nothing", async () => {
    const { store, calls } = memoryStore({ used: [String(run.id)] });
    const result = await processStravaWebhookEvent(event, { store, enabled: true, fetchActivity });
    expect(result.outcome).toBe("repeat");
    expect(calls.completeTask).toHaveLength(0);
    expect(calls.insertActivityEvent).toHaveLength(0);
    expect(calls.insertNotification).toHaveLength(0);
    expect(calls.sendPush).toHaveLength(0);
  });

  it("the same event delivered twice completes once (the first completion marks the id)", async () => {
    const { store, calls } = memoryStore();
    const first = await processStravaWebhookEvent(event, { store, enabled: true, fetchActivity, now: () => new Date("2026-10-17T12:00:00Z") });
    const second = await processStravaWebhookEvent(event, { store, enabled: true, fetchActivity, now: () => new Date("2026-10-17T12:00:00Z") });
    expect(first.outcome).toBe("completed");
    expect(second.outcome).toBe("repeat");
    expect(calls.completeTask).toHaveLength(1);
    expect(calls.insertNotification).toHaveLength(1);
  });

  it("a non-matching activity does nothing", async () => {
    const { store, calls } = memoryStore();
    const walk: StravaActivity = { ...run, id: 1, type: "Walk", sport_type: "Walk", distance: 1200 };
    const result = await processStravaWebhookEvent(
      { ...event, object_id: 1 },
      { store, enabled: true, fetchActivity: async () => walk },
    );
    expect(result.outcome).toBe("no_match");
    expect(calls.completeTask).toHaveLength(0);
    expect(calls.insertNotification).toHaveLength(0);
  });

  it("a user with no Strava task does nothing", async () => {
    const { store, calls } = memoryStore({ tasks: "none" });
    const result = await processStravaWebhookEvent(event, { store, enabled: true, fetchActivity });
    expect(result.outcome).toBe("no_match");
    expect(calls.completeTask).toHaveLength(0);
  });

  it("a task already done that day is not completed again by a second activity", async () => {
    const { store, calls } = memoryStore({ completed: [RUN_TASK] });
    const result = await processStravaWebhookEvent({ ...event, object_id: 555 }, { store, enabled: true, fetchActivity: async () => ({ ...run, id: 555 }) });
    expect(result.outcome).toBe("no_match");
    expect(calls.completeTask).toHaveLength(0);
  });

  it("ignores update and delete events, and non-activity objects", async () => {
    const { store, calls } = memoryStore();
    expect((await processStravaWebhookEvent({ ...event, aspect_type: "update" }, { store, enabled: true, fetchActivity })).outcome).toBe("ignored");
    expect((await processStravaWebhookEvent({ ...event, object_type: "athlete" }, { store, enabled: true, fetchActivity })).outcome).toBe("ignored");
    expect(calls.completeTask).toHaveLength(0);
  });

  it("an unknown athlete does nothing", async () => {
    const { store, calls } = memoryStore();
    const result = await processStravaWebhookEvent({ ...event, owner_id: 1 }, { store, enabled: true, fetchActivity });
    expect(result.outcome).toBe("no_connection");
    expect(calls.completeTask).toHaveLength(0);
  });

  it("with the flag off the event is acknowledged and nothing is written", async () => {
    const { store, calls } = memoryStore();
    const result = await processStravaWebhookEvent(event, { store, enabled: false, fetchActivity });
    expect(result.outcome).toBe("flag_off");
    expect(calls.completeTask).toHaveLength(0);
    expect(calls.insertNotification).toHaveLength(0);
    expect(fetchActivity).not.toHaveBeenCalledWith(expect.anything(), "flag-off-call");
  });

  it("a missing secure_day_for_user RPC leaves the task complete and the day unsecured", async () => {
    const { store, calls } = memoryStore({ completed: [READ_TASK] });
    store.secureDay = async () => null;
    const result = await processStravaWebhookEvent(event, { store, enabled: true, fetchActivity, now: () => new Date("2026-10-17T12:00:00Z") });
    expect(result.outcome).toBe("completed");
    expect(result.daySecured).toBe(false);
    expect(result.secureSkipped).toBe("rpc_missing");
    expect(calls.completeTask).toHaveLength(1);
  });

  it("an activity from another day completes the task for that date and never secures today", async () => {
    const { store, calls } = memoryStore({ completed: [READ_TASK] });
    const yesterday: StravaActivity = { ...run, start_date: "2026-10-16T11:05:00Z", start_date_local: "2026-10-16T07:05:00Z" };
    const result = await processStravaWebhookEvent(event, {
      store,
      enabled: true,
      fetchActivity: async () => yesterday,
      now: () => new Date("2026-10-17T12:00:00Z"),
    });
    expect(result.outcome).toBe("completed");
    expect(result.dateKey).toBe("2026-10-16");
    expect(calls.secureDay).toHaveLength(0);
    expect(result.secureSkipped).toBe("not_today");
  });
});

describe("09.1 the rule matcher is shared", () => {
  it("activityMatchesRule is exported and used by the webhook", () => {
    expect(activityMatchesRule(run, { sport: "Run", min_distance_m: 5000 })).toBe(true);
    expect(activityMatchesRule(run, { sport: "Ride" })).toBe(false);
    expect(activityMatchesRule(run, { sport: "Run", min_distance_m: 10000 })).toBe(false);
    const src = readFileSync(resolve(__dirname, "strava-webhook.ts"), "utf8");
    expect(src).toContain("activityMatchesRule(");
  });
});

describe("09.1 the route is on the server", () => {
  const hono = readFileSync(resolve(__dirname, "../hono.ts"), "utf8");
  it("GET handshake and POST events on /api/strava/webhook", () => {
    expect(hono).toContain('app.get("/api/strava/webhook"');
    expect(hono).toContain('app.post("/api/strava/webhook"');
  });
  it("the POST acknowledges at once and never waits on the processing", () => {
    expect(hono).toContain("handleStravaWebhookPost(body, getSupabaseServer())");
    const webhook = readFileSync(resolve(__dirname, "strava-webhook.ts"), "utf8");
    expect(webhook).toContain("void processStravaWebhookEvent(event, { store: supabaseWebhookStore(supabase) })");
  });
});

describe("09 flag", () => {
  it("STRAVA_AUTO_VERIFY is off by default on the client and on the server", async () => {
    const flags = await import("../../lib/feature-flags");
    expect(flags.FLAGS.STRAVA_AUTO_VERIFY).toBe(false);
    const { isStravaAutoVerifyEnabled } = await import("./strava-auto-verify");
    expect(isStravaAutoVerifyEnabled({})).toBe(false);
    expect(isStravaAutoVerifyEnabled({ STRAVA_AUTO_VERIFY: "true" })).toBe(true);
    expect(isStravaAutoVerifyEnabled({ STRAVA_AUTO_VERIFY: "1" })).toBe(true);
    expect(isStravaAutoVerifyEnabled({ STRAVA_AUTO_VERIFY: "false" })).toBe(false);
  });
});
