import { describe, expect, it, vi, afterEach } from "vitest";
import {
  STREAK_FREEZE_PER_MONTH_FREE,
  STREAK_FREEZE_PER_MONTH_PRO,
  effectiveFreezesRemaining,
  monthlyFreezeLimit,
  streaksRouter,
} from "./streaks";
import { addCalendarDaysToDateKey, getTodayDateKey, getYesterdayDateKey } from "../../lib/date-utils";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

const USER = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  vi.useRealTimers();
});

function createCaller(opts?: {
  isPremium?: boolean;
  remaining?: number | null;
  lastFreezeUsedAt?: string | null;
  lastCompletedDateKey?: string | null;
  activeStreakCount?: number;
  failProfile?: boolean;
  failUpdate?: boolean;
  onProfileUpdate?: (payload: Record<string, unknown>) => void;
}) {
  const profile = {
    is_premium: opts?.isPremium ?? false,
    streak_freezes_remaining: opts?.remaining === undefined ? 1 : opts.remaining,
    last_freeze_used_at: opts?.lastFreezeUsedAt ?? null,
    timezone: "UTC",
    reminder_timezone: "UTC",
  };
  const streak = {
    last_completed_date_key: opts?.lastCompletedDateKey ?? addCalendarDaysToDateKey(getTodayDateKey("UTC"), -2),
    active_streak_count: opts?.activeStreakCount ?? 4,
  };

  const supabase = {
    from: (table: string) => {
      const inner: Record<string, unknown> = {
        select: () => inner,
        eq: () => inner,
        update: (payload: Record<string, unknown>) => {
          opts?.onProfileUpdate?.(payload);
          if (opts?.failUpdate) {
            return {
              eq: () =>
                Promise.resolve({
                  data: null,
                  error: { message: "update failed" },
                }),
            };
          }
          return {
            eq: () => Promise.resolve({ data: null, error: null }),
          };
        },
        single: () => {
          if (table === "profiles") {
            if (opts?.failProfile) {
              return Promise.resolve({
                data: null,
                error: { code: "42703", message: "column does not exist" },
              });
            }
            return Promise.resolve({ data: profile, error: null });
          }
          if (table === "streaks") {
            return Promise.resolve({ data: streak, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        maybeSingle: () => {
          if (table === "profiles") {
            return Promise.resolve({ data: profile, error: null });
          }
          if (table === "streaks") {
            return Promise.resolve({ data: streak, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
      };
      return inner;
    },
  };

  return streaksRouter.createCaller({
    userId: USER,
    supabase: supabase as never,
    req: {} as Request,
    requestId: "test",
    clientIp: "127.0.0.1",
  });
}

describe("monthly freeze limit", () => {
  it("is 1 free / 4 pro", () => {
    expect(STREAK_FREEZE_PER_MONTH_FREE).toBe(1);
    expect(STREAK_FREEZE_PER_MONTH_PRO).toBe(4);
    expect(monthlyFreezeLimit(false)).toBe(1);
    expect(monthlyFreezeLimit(true)).toBe(4);
  });
});

describe("effectiveFreezesRemaining", () => {
  it("uses stored remaining when the last use is inside the 30-day window", () => {
    expect(
      effectiveFreezesRemaining({
        storedRemaining: 0,
        lastFreezeUsedAt: new Date("2026-09-01T00:00:00.000Z").toISOString(),
        isPro: false,
        now: new Date("2026-09-14T00:00:00.000Z"),
      })
    ).toEqual({ remaining: 0, limit: 1 });
  });

  it("uses the monthly limit when last_freeze_used_at is null", () => {
    expect(
      effectiveFreezesRemaining({
        storedRemaining: 1,
        lastFreezeUsedAt: null,
        isPro: true,
        now: new Date("2026-09-14T00:00:00.000Z"),
      })
    ).toEqual({ remaining: STREAK_FREEZE_PER_MONTH_PRO, limit: STREAK_FREEZE_PER_MONTH_PRO });
  });

  it("refills to the limit when last_freeze_used_at is 30+ days ago", () => {
    expect(
      effectiveFreezesRemaining({
        storedRemaining: 0,
        lastFreezeUsedAt: new Date("2026-08-01T00:00:00.000Z").toISOString(),
        isPro: false,
        now: new Date("2026-09-14T00:00:00.000Z"),
      })
    ).toEqual({ remaining: 1, limit: 1 });
  });
});

describe("streaks.getFreezeStatus", () => {
  it("returns remaining from streak_freezes_remaining and free limit", async () => {
    const caller = createCaller({ remaining: 1, lastFreezeUsedAt: "2026-09-10T00:00:00.000Z" });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: 1,
      limit: STREAK_FREEZE_PER_MONTH_FREE,
      isPro: false,
    });
  });

  it("returns the Pro limit when last_freeze_used_at is null even if stored remaining is 1", async () => {
    const caller = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      isPremium: true,
    });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: STREAK_FREEZE_PER_MONTH_PRO,
      limit: STREAK_FREEZE_PER_MONTH_PRO,
      isPro: true,
    });
  });

  it("refills remaining to the limit after the 30-day window", async () => {
    const caller = createCaller({
      remaining: 0,
      lastFreezeUsedAt: "2026-08-01T00:00:00.000Z",
      isPremium: true,
    });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: STREAK_FREEZE_PER_MONTH_PRO,
      limit: STREAK_FREEZE_PER_MONTH_PRO,
      isPro: true,
    });
  });

  it("throws when the profile read fails", async () => {
    const caller = createCaller({ failProfile: true });
    await expect(caller.getFreezeStatus()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to load freeze status.",
    });
  });
});

describe("streaks.useFreeze", () => {
  it("decrements streak_freezes_remaining and sets last_freeze_used_at", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const updates: Record<string, unknown>[] = [];

    const caller = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 3,
      onProfileUpdate: (payload) => updates.push(payload),
    });

    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).resolves.toEqual({
      success: true,
    });
    expect(updates).toEqual([
      {
        streak_freezes_remaining: 0,
        last_freeze_used_at: "2026-09-14T15:00:00.000Z",
      },
    ]);
  });
});
