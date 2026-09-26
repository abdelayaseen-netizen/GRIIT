/**
 * profiles.getRecord — one payload for the profile v2 record surface.
 *
 * Derives in-process from:
 *   active_challenges.status / start_at / end_at
 *   day_secures.date_key
 *   check_ins.photo_url / proof_url / completion_image_url (joined on user_id + date_key)
 *   profiles.timezone + visibility columns
 *   streaks.active_streak_count / longest_streak_count / last_completed_date_key
 *
 * Visitor reads use the service client so RLS does not hide the owner's rows;
 * the gate is applied here, never on the client.
 */
import * as z from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../create-context";
import {
  dateKeyFromIsoInTimeZone,
  getTodayDateKey,
} from "../../lib/date-utils";
import {
  buildRecordDays,
  exclusiveEndDateKey,
  inclusiveLastDateKey,
  historyEndDateKey,
  monthKeyFromDateKey,
  type EnrollmentTasks,
} from "../../lib/record-days";
import { isTaskRequired, type ChallengeTaskRowRaw } from "../../lib/challenge-tasks";
import { logger } from "../../lib/logger";
import { getSupabaseServer } from "../../lib/supabase-server";
import { followRowAccepted } from "../../lib/feed-activity-hydrate";
import { buildProfileRecord, fractionDateKeysForRange, type ChallengeRangeInput, type ProfileRecord } from "../../../lib/profile-v2-record";
import { cameraProofTiles, checkInHasCameraProof, proofCountsForDateKeys, splitSecuredProof } from "../../lib/proof-predicate";
import { PROFILE_V2_BADGES } from "../../../lib/profile-v2-badges";
import { type CheckInProofRow } from "../../../lib/profile-v2-proof-photo";
import {
  mutualFollowAccepted,
  parseVisibility,
  resolveRecordGate,
  type ProfileRelationship,
} from "../../../lib/profile-v2-visibility";

type ActiveRow = {
  id: string;
  challenge_id: string;
  status: string;
  start_at: string;
  end_at: string;
  ended_at?: string | null;
};

type ChallengeRow = {
  id: string;
  title?: string | null;
  duration_days?: number | null;
};

type TaskCountRow = {
  challenge_id: string;
  id?: string;
  title?: string | null;
  config?: ChallengeTaskRowRaw["config"];
  require_photo?: boolean | null;
  require_location?: boolean | null;
  gate_time_mode?: string | null;
  task_type?: string | null;
};

const EMPTY_CONSISTENCY: ProfileRecord["consistency"] = {
  rate: "",
  verdict: "",
  line: "",
  strip: [],
  weeks: Array.from({ length: 26 }, () => null),
  weeklyAverage: 0,
  dueDayKeys: [],
  closedDueDays: 0,
  verifiedClosed: 0,
  dueToday: false,
  showWindowControl: false,
};

function emptyRecord(): ProfileRecord {
  return {
    streak: {
      current: 0,
      best: 0,
      lastCompletedDateKey: null,
      since: "",
      note: "",
    },
    consistency: EMPTY_CONSISTENCY,
    runs: [],
    completed: [],
    proofs: [],
    badges: [],
    detail: {
      totalVerified: 0,
      completion: "—",
      firstProof: "—",
      longestStreak: 0,
      months: [],
      byChallenge: [],
      cameraDays: 0,
      selfReportedDays: 0,
      lastStandDays: 0,
      freezeDays: 0,
    } as ProfileRecord["detail"],
  };
}

export function lastStandDaysAllTime(uses: readonly { date_key: string }[]): number {
  return uses.length;
}

export const profilesRecordProcedures = {
  getRecord: protectedProcedure
    .input(
      z
        .object({
          userId: z.string().uuid().optional(),
          preview: z.enum(["stranger"]).optional(),
          monthKey: z.string().regex(/^\d{4}-\d{2}$/).optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const started = Date.now();
      const ownerId = input?.userId ?? ctx.userId;
      const previewStranger = input?.preview === "stranger";
      if (previewStranger && ownerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Preview is owner-only." });
      }

      const db = getSupabaseServer() ?? ctx.supabase;

      const { data: profileRow, error: profileErr } = await db
        .from("profiles")
        .select(
          "user_id, username, display_name, bio, avatar_url, timezone, reminder_timezone, profile_visibility, challenge_visibility, activity_visibility, target_streak"
        )
        .eq("user_id", ownerId)
        .maybeSingle();
      if (profileErr) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: profileErr.message });
      }
      if (!profileRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }

      const p = profileRow as {
        user_id: string;
        username?: string | null;
        display_name?: string | null;
        bio?: string | null;
        avatar_url?: string | null;
        timezone?: string | null;
        reminder_timezone?: string | null;
        profile_visibility?: string | null;
        challenge_visibility?: string | null;
        activity_visibility?: string | null;
        target_streak?: number | null;
      };

      const visibility = {
        profile: parseVisibility(p.profile_visibility),
        challenges: parseVisibility(p.challenge_visibility),
        activity: parseVisibility(p.activity_visibility),
      };

      let relationship: ProfileRelationship = "none";
      if (ownerId === ctx.userId && !previewStranger) {
        relationship = "self";
      } else if (!previewStranger && ownerId !== ctx.userId) {
        const [outRes, inRes] = await Promise.all([
          db
            .from("user_follows")
            .select("status")
            .eq("follower_id", ctx.userId)
            .eq("following_id", ownerId)
            .maybeSingle(),
          db
            .from("user_follows")
            .select("status")
            .eq("follower_id", ownerId)
            .eq("following_id", ctx.userId)
            .maybeSingle(),
        ]);
        const outOk = Boolean(outRes.data && followRowAccepted(outRes.data as { status?: string | null }));
        const inOk = Boolean(inRes.data && followRowAccepted(inRes.data as { status?: string | null }));
        relationship = mutualFollowAccepted(outOk, inOk) ? "accepted" : "none";
      }

      const gate = resolveRecordGate({ ...visibility, relationship });
      const timezone = p.timezone?.trim() || p.reminder_timezone?.trim() || "UTC";
      const todayKey = getTodayDateKey(timezone);
      const identity = {
        userId: p.user_id,
        username: p.username ?? "",
        displayName: p.display_name ?? p.username ?? "",
        bio: p.bio ?? "",
        avatarUrl: p.avatar_url ?? null,
      };
      const viewer = { relationship, preview: previewStranger };

      const finish = (record: ProfileRecord, extra: Record<string, unknown> = {}) => {
        const elapsedMs = Date.now() - started;
        if (elapsedMs > 300) {
          logger.warn(
            { userId: ownerId, elapsedMs },
            "[profiles.getRecord] exceeded 300ms — propose a Postgres RPC before adding one"
          );
        }
        return {
          timezone,
          todayKey,
          elapsedMs,
          identity,
          viewer,
          visibility,
          gate,
          ...record,
          ...extra,
        };
      };

      const monthKey = input?.monthKey ?? monthKeyFromDateKey(todayKey);

      const emptyDaySource = {
        enrollments: [] as { challengeId: string; startDateKey: string; endDateKey?: string | null }[],
        securedDays: [] as { dateKey: string; camera: boolean }[],
        frozenDateKeys: [] as string[],
        lastStandDateKeys: [] as string[],
      };

      if (!gate.profile) {
        return finish(emptyRecord(), { monthKey, days: [], daySource: emptyDaySource });
      }

      const [streakRes, historyRes, securesRes, unlocksRes, freezeRes, standRes] = await Promise.all([
        db
          .from("streaks")
          .select("active_streak_count, longest_streak_count, last_completed_date_key")
          .eq("user_id", ownerId)
          .maybeSingle(),
        db
          .from("active_challenges")
          .select("id, challenge_id, status, start_at, end_at, ended_at")
          .eq("user_id", ownerId)
          .in("status", ["active", "completed", "abandoned"])
          .limit(50),
        db
          .from("day_secures")
          .select("date_key")
          .eq("user_id", ownerId)
          .order("date_key", { ascending: true })
          .limit(400),
        db
          .from("user_achievements")
          .select("achievement_key, unlocked_at")
          .eq("user_id", ownerId)
          .limit(200),
        db.from("freeze_uses").select("date_key").eq("user_id", ownerId).limit(365),
        db.from("last_stand_uses").select("date_key").eq("user_id", ownerId).limit(365),
      ]);

      if (streakRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: streakRes.error.message });
      }
      if (historyRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: historyRes.error.message });
      }
      if (securesRes.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: securesRes.error.message });
      }

      const acRows = (historyRes.data ?? []) as ActiveRow[];
      const challengeIds = [...new Set(acRows.map((r) => r.challenge_id))];
      const securedDateKeys = ((securesRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key);

      let challenges: ChallengeRow[] = [];
      let taskRows: TaskCountRow[] = [];
      let checkInRows: CheckInProofRow[] = [];
      if (challengeIds.length > 0 || securedDateKeys.length > 0) {
        const [chRes, taskRes, cinRes] = await Promise.all([
          challengeIds.length > 0
            ? db.from("challenges").select("id, title, duration_days").in("id", challengeIds).limit(50)
            : Promise.resolve({ data: [], error: null }),
          challengeIds.length > 0
            ? db
                .from("challenge_tasks")
                .select("id, title, challenge_id, config, require_photo, require_location, gate_time_mode, task_type")
                .in("challenge_id", challengeIds)
                .limit(400)
            : Promise.resolve({ data: [], error: null }),
          db
            .from("check_ins")
            .select("id, date_key, active_challenge_id, task_id, status, photo_url, proof_url, completion_image_url, created_at")
            .eq("user_id", ownerId)
            .limit(800),
        ]);
        if (chRes.error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: chRes.error.message });
        }
        challenges = (chRes.data ?? []) as ChallengeRow[];
        taskRows = (taskRes.data ?? []) as TaskCountRow[];
        checkInRows = (cinRes.data ?? []) as CheckInProofRow[];
      }

      const titleById = new Map(challenges.map((c) => [c.id, c.title ?? "Challenge"]));
      const durationById = new Map(challenges.map((c) => [c.id, c.duration_days ?? 30]));
      const tasksById = new Map<string, number>();
      for (const t of taskRows) {
        tasksById.set(t.challenge_id, (tasksById.get(t.challenge_id) ?? 0) + 1);
      }

      const ranges: ChallengeRangeInput[] = acRows.map((row) => {
        const startDateKey = dateKeyFromIsoInTimeZone(row.start_at, timezone);
        return {
          id: row.id,
          challengeId: row.challenge_id,
          name: titleById.get(row.challenge_id) ?? "Challenge",
          status: row.status,
          startDateKey,
          endDateKey: exclusiveEndDateKey(row, startDateKey, timezone),
          durationDays: durationById.get(row.challenge_id) ?? 30,
          tasksPerDay: tasksById.get(row.challenge_id) ?? 1,
        };
      });

      const streakRow = streakRes.data as {
        active_streak_count?: number | null;
        longest_streak_count?: number | null;
        last_completed_date_key?: string | null;
      } | null;

      const unlocks: Record<string, string> = {};
      const mappedKeys = new Set(PROFILE_V2_BADGES.flatMap((b) => b.legacyKeys));
      for (const row of (unlocksRes.data ?? []) as { achievement_key: string; unlocked_at: string }[]) {
        if (!mappedKeys.has(row.achievement_key)) continue;
        const prev = unlocks[row.achievement_key];
        if (!prev || row.unlocked_at < prev) unlocks[row.achievement_key] = row.unlocked_at;
      }

      const record = buildProfileRecord({
        todayKey,
        currentStreak: streakRow == null ? 0 : (streakRow.active_streak_count ?? 0),
        bestStreak: streakRow?.longest_streak_count ?? 0,
        lastCompletedDateKey: streakRow?.last_completed_date_key ?? null,
        ranges,
        securedDateKeys,
        badgeUnlocks: unlocks,
        targetStreak: p.target_streak ?? null,
      });

      const { data: proofEvents } = await db
        .from("activity_events")
        .select("id, metadata, created_at, shared")
        .eq("user_id", ownerId)
        .eq("event_type", "task_completed")
        .limit(800);
      const proofs = cameraProofTiles({
        checkIns: checkInRows,
        securedDateKeys,
        enrollments: acRows.map((row) => ({
          id: row.id,
          challengeId: row.challenge_id,
          startDateKey: dateKeyFromIsoInTimeZone(row.start_at, timezone),
        })),
        challenges,
        tasks: taskRows,
        events: (proofEvents ?? []) as {
          id: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          shared?: boolean;
        }[],
      });

      const enrollmentIds = [
        ...record.runs.map((r) => r.id),
        ...record.completed.map((c) => c.id),
      ];
      const split = splitSecuredProof({
        securedDateKeys,
        checkIns: checkInRows,
        enrollmentIds,
      });
      const rangeById = new Map(ranges.map((r) => [r.id, r]));
      const securedSet = new Set(securedDateKeys);
      const byChallenge = record.detail.byChallenge.map((row, i) => {
        const id = enrollmentIds[i];
        const range = id ? rangeById.get(id) : undefined;
        const dateKeys = range ? fractionDateKeysForRange(range, todayKey) : [];
        const part = proofCountsForDateKeys({
          dateKeys,
          securedDateKeys,
          checkIns: checkInRows,
        });
        const verified = dateKeys.filter((k) => securedSet.has(k)).length;
        return {
          ...row,
          value: `${verified} of ${dateKeys.length}`,
          camera: part.camera,
          selfReported: part.selfReported,
        };
      });

      const enrollments: EnrollmentTasks[] = acRows.map((row) => ({
        startDateKey: dateKeyFromIsoInTimeZone(row.start_at, timezone),
        endDateKey: historyEndDateKey(row, timezone),
        tasks: taskRows
          .filter((t) => t.challenge_id === row.challenge_id)
          .filter((t) => isTaskRequired(t as ChallengeTaskRowRaw))
          .map((t) => ({
            id: t.id ?? "",
            title: (t.title ?? "Task").trim() || "Task",
          }))
          .filter((t) => t.id),
      }));
      const days = gate.activity
        ? buildRecordDays({
            monthKey,
            todayKey,
            securedDateKeys,
            lastStandDateKeys: ((standRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key),
            frozenDateKeys: ((freezeRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key),
            enrollments,
            checkIns: checkInRows as (CheckInProofRow & { task_id?: string; status?: string })[],
          })
        : [];

      const sliced: ProfileRecord = {
        ...record,
        proofs: gate.activity ? proofs : [],
        consistency: gate.activity ? { ...record.consistency } : EMPTY_CONSISTENCY,
        detail: gate.activity
          ? ({
              ...record.detail,
              cameraDays: split.cameraDays,
              selfReportedDays: split.selfReportedDays,
              lastStandDays: lastStandDaysAllTime(
                (standRes.data ?? []) as { date_key: string }[],
              ),
              freezeDays: lastStandDaysAllTime(
                (freezeRes.data ?? []) as { date_key: string }[],
              ),
              byChallenge,
            } as ProfileRecord["detail"])
          : emptyRecord().detail,
        runs: gate.challenges ? record.runs : [],
        completed: gate.challenges ? record.completed : [],
        badges: relationship === "self" ? record.badges : [],
      };

      const cameraDays = new Set(
        checkInRows.filter((row) => checkInHasCameraProof(row)).map((row) => row.date_key),
      );
      const daySource = gate.activity
        ? {
            enrollments: ranges
              .map((r) => {
                const inclusiveEnd = inclusiveLastDateKey(r.startDateKey, r.endDateKey);
                return {
                  challengeId: r.challengeId,
                  startDateKey: r.startDateKey,
                  endDateKey: inclusiveEnd || null,
                };
              }),
            securedDays: securedDateKeys.map((dateKey) => ({
              dateKey,
              camera: cameraDays.has(dateKey),
            })),
            frozenDateKeys: ((freezeRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key),
            lastStandDateKeys: ((standRes.data ?? []) as { date_key: string }[]).map((r) => r.date_key),
          }
        : emptyDaySource;

      return finish(sliced, { monthKey, days, daySource });
    }),
};
