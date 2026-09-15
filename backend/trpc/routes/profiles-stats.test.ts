import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { GET_STATS_PROFILE_SELECT, profilesStatsProcedures } from "./profiles-stats";
import { createTRPCRouter } from "../create-context";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";

/**
 * Production profiles columns from this session's live list + shipped
 * CREATE/ADD COLUMN migrations. The three getStats phantoms are excluded.
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

const PHANTOM_GETSTATS_COLUMNS = [
  "streak_freeze_used_count",
  "streak_freeze_reset_at",
  "preferred_secure_time",
];

function createCaller(opts?: { failProfile?: boolean }) {
  const router = createTRPCRouter(profilesStatsProcedures);
  const supabase = {
    from: (table: string) => {
      const state = { table };
      const inner: Record<string, unknown> = {
        select: () => inner,
        eq: () => inner,
        limit: () => inner,
        maybeSingle: () => {
          if (state.table === "profiles" && opts?.failProfile) {
            return Promise.resolve({
              data: null,
              error: { code: "42703", message: "column does not exist" },
            });
          }
          if (state.table === "profiles") {
            return Promise.resolve({
              data: {
                total_days_secured: 1,
                tier: "bronze",
                subscription_status: "free",
                timezone: "UTC",
                reminder_timezone: "UTC",
              },
              error: null,
            });
          }
          if (state.table === "streaks") {
            return Promise.resolve({
              data: {
                user_id: USER,
                active_streak_count: 1,
                longest_streak_count: 1,
                last_completed_date_key: "2026-09-13",
                last_stands_available: 0,
              },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: null });
        },
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null, count: null }).then(onFulfilled, onRejected),
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
  it("select string contains only production profile columns", () => {
    const cols = GET_STATS_PROFILE_SELECT.split(",").map((c) => c.trim());
    expect(cols.length).toBeGreaterThan(0);
    for (const col of cols) {
      expect(PRODUCTION_PROFILE_COLUMNS.has(col)).toBe(true);
    }
    for (const phantom of PHANTOM_GETSTATS_COLUMNS) {
      expect(GET_STATS_PROFILE_SELECT.includes(phantom)).toBe(false);
    }
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "profiles-stats.ts"), "utf8");
    expect(src).toContain(".select(GET_STATS_PROFILE_SELECT)");
  });

  it("profile read error throws", async () => {
    const caller = createCaller({ failProfile: true });
    await expect(caller.getStats()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to load profile.",
    });
  });
});
