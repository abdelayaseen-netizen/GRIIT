import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GET_STATS_PROFILE_SELECT,
  RECONCILE_PROFILE_SELECT,
  profilesStatsProcedures,
} from "./profiles-stats";
import { createTRPCRouter } from "../create-context";
import { addCalendarDaysToDateKey, getTodayDateKey, getYesterdayDateKey } from "../../lib/date-utils";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";
const CHALLENGE = "c1111111-1111-4111-8111-111111111111";

/**
 * Production profiles columns from this session's live list + shipped
 * CREATE/ADD COLUMN migrations.
 */
const PRODUCTION_PROFILE_COLUMNS = new Set([
  "user_id",
  "username",
  "display_name",
  "bio",
  "avatar_url",
  "cover_url",
  "tier",
  "subscription_status",
  "subscription_expiry",
  "is_premium",
  "onboarding_completed",
  "onboarding_completed_at",
  "onboarding_answers",
  "onboarding_motivation",
  "notification_time_preference",
  "total_days_secured",
  "reminder_enabled",
  "reminder_time",
  "reminder_timezone",
  "timezone",
  "expo_push_token",
  "push_token",
  "profile_visibility",
  "challenge_visibility",
  "activity_visibility",
  "last_comeback_push_at",
  "created_at",
  "updated_at",
  "weekly_goal",
  "target_streak",
  "distance_unit",
  "morning_kickoff_enabled",
  "last_call_enabled",
  "friend_activity_enabled",
  "weekly_summary_enabled",
  "streak_freezes_remaining",
  "last_freeze_used_at",
]);

function productionStreaksRow(overrides?: Record<string, unknown>) {
  return {
    id: "s1111111-1111-4111-8111-111111111111",
    user_id: USER,
    challenge_id: CHALLENGE,
    current_streak: 5,
    best_streak: 12,
    updated_at: "2026-09-12T00:00:00.000Z",
    last_stands_available: 0,
    last_stands_used_total: 1,
    last_stand_earned_at: "2026-09-01T00:00:00.000Z",
    active_streak_count: 5,
    longest_streak_count: 12,
    last_completed_date_key: addCalendarDaysToDateKey(getTodayDateKey("UTC"), -2),
    last_secured_date: addCalendarDaysToDateKey(getTodayDateKey("UTC"), -2),
    ...overrides,
  };
}

function createCaller(opts?: {
  failProfile?: boolean;
  failStreak?: boolean;
  lastFreezeUsedAt?: string | null;
  streakOverrides?: Record<string, unknown>;
  onStreakUpdate?: (payload: Record<string, unknown>) => void;
}) {
  const router = createTRPCRouter(profilesStatsProcedures);
  const profile = {
    total_days_secured: 7,
    tier: "bronze",
    subscription_status: "free",
    timezone: "UTC",
    reminder_timezone: "UTC",
    last_freeze_used_at: opts?.lastFreezeUsedAt ?? null,
  };
  const streak = productionStreaksRow(opts?.streakOverrides);

  const supabase = {
    from: (table: string) => {
      const state = { table, status: "" as string };
      const inner: Record<string, unknown> = {
        select: () => inner,
        eq: (col: string, val: unknown) => {
          if (col === "status") state.status = String(val);
          return inner;
        },
        limit: () => inner,
        update: (payload: Record<string, unknown>) => {
          if (state.table === "streaks") opts?.onStreakUpdate?.(payload);
          return {
            eq: () => Promise.resolve({ data: null, error: null }),
          };
        },
        insert: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => {
          if (state.table === "profiles" && opts?.failProfile) {
            return Promise.resolve({
              data: null,
              error: { code: "42703", message: "column does not exist" },
            });
          }
          if (state.table === "profiles") {
            return Promise.resolve({ data: profile, error: null });
          }
          if (state.table === "streaks") {
            if (opts?.failStreak) {
              return Promise.resolve({
                data: null,
                error: { code: "42703", message: "column does not exist" },
              });
            }
            return Promise.resolve({ data: streak, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          if (state.table === "active_challenges" && state.status === "active") {
            return Promise.resolve({
              data: [{ id: "a1" }, { id: "a2" }],
              error: null,
              count: null,
            }).then(onFulfilled, onRejected);
          }
          if (state.table === "active_challenges" && state.status === "completed") {
            return Promise.resolve({
              data: [{ id: "c1" }],
              error: null,
              count: null,
            }).then(onFulfilled, onRejected);
          }
          if (state.table === "last_stand_uses" || state.table === "freeze_uses") {
            return Promise.resolve({ data: [], error: null, count: null }).then(
              onFulfilled,
              onRejected
            );
          }
          return Promise.resolve({ data: [], error: null, count: null }).then(
            onFulfilled,
            onRejected
          );
        },
      };
      return inner;
    },
  };

  return router.createCaller({
    userId: USER,
    supabase: supabase as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("profiles.getStats", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("select strings contain only production profile columns", () => {
    for (const select of [GET_STATS_PROFILE_SELECT, RECONCILE_PROFILE_SELECT]) {
      const cols = select.split(",").map((c) => c.trim());
      expect(cols.length).toBeGreaterThan(0);
      for (const col of cols) {
        expect(PRODUCTION_PROFILE_COLUMNS.has(col)).toBe(true);
      }
    }
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "profiles-stats.ts"), "utf8");
    expect(src).toContain(".select(GET_STATS_PROFILE_SELECT)");
    const miss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../lib/miss-reconcile.ts"), "utf8");
    expect(miss).toContain(RECONCILE_PROFILE_SELECT);
  });

  it("mocked reads return challenge and streak totals", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const caller = createCaller({
      streakOverrides: {
        last_completed_date_key: yesterday,
        last_secured_date: yesterday,
        current_streak: 4,
        best_streak: 7,
        active_streak_count: 4,
        longest_streak_count: 7,
      },
    });
    await expect(caller.getStats()).resolves.toMatchObject({
      activeChallenges: 2,
      completedChallenges: 1,
      activeStreak: 4,
      longestStreak: 7,
      lastCompletedDateKey: yesterday,
      effectiveMissedDays: 0,
      totalDaysSecured: 7,
      lastStandsAvailable: 0,
    });
  });

  it("profile read error throws", async () => {
    const caller = createCaller({ failProfile: true });
    await expect(caller.getStats()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to load profile.",
    });
  });
});

describe("profiles.reconcileStreak", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("zeros active_streak_count on a production-shaped streaks row with an unprotected miss", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const updates: Record<string, unknown>[] = [];
    const caller = createCaller({
      onStreakUpdate: (payload) => updates.push(payload),
    });
    await expect(caller.reconcileStreak()).resolves.toEqual({
      streak_broken: true,
      previous_streak: 5,
      lastStandUsedThisSession: false,
      lastStandsAvailable: 0,
    });
    expect(updates).toEqual([{ active_streak_count: 0 }]);
  });

  it("throws when the streaks read fails", async () => {
    const caller = createCaller({ failStreak: true });
    await expect(caller.reconcileStreak()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to reconcile streak.",
    });
  });
});
