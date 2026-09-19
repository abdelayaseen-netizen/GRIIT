import { describe, expect, it, vi, afterEach } from "vitest";
import {
  STREAK_FREEZE_PER_MONTH_FREE,
  STREAK_FREEZE_PER_MONTH_PRO,
  effectiveFreezesRemaining,
  monthlyFreezeLimit,
  restoreStreakCount,
  streaksRouter,
} from "./streaks";
import { addCalendarDaysToDateKey, getTodayDateKey, getYesterdayDateKey } from "../../lib/date-utils";
import { evaluateMiss } from "../../lib/miss-reconcile";
import { getSupabaseAdmin } from "../../lib/supabase-admin";
import { logger } from "../../lib/logger";

vi.mock("../../lib/supabase-server", () => ({
  getSupabaseServer: () => null,
}));

vi.mock("../../lib/supabase-admin", () => ({
  getSupabaseAdmin: vi.fn(),
  hasSupabaseAdmin: () => true,
}));

const USER = "11111111-1111-4111-8111-111111111111";

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(getSupabaseAdmin).mockReset();
});

type FreezeWriteErr = { code?: string; message?: string; details?: string };

function createCaller(opts?: {
  isPremium?: boolean;
  remaining?: number | null;
  lastFreezeUsedAt?: string | null;
  lastCompletedDateKey?: string | null;
  activeStreakCount?: number;
  longestStreakCount?: number;
  failProfile?: boolean;
  failUpdate?: boolean;
  failFreezeInsert?: FreezeWriteErr | null;
  securedDateKeys?: string[];
  freezeKeys?: string[];
  lastStandDateKeys?: string[];
  onProfileUpdate?: (payload: Record<string, unknown>, via: "user" | "admin") => void;
  onStreakUpdate?: (payload: Record<string, unknown>, via: "user" | "admin") => void;
  onFreezeInsert?: (payload: Record<string, unknown>, via: "user" | "admin") => void;
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
    active_streak_count: opts?.activeStreakCount ?? 0,
    longest_streak_count: opts?.longestStreakCount ?? 0,
  };
  const freezeKeys = [...(opts?.freezeKeys ?? [])];

  const makeClient = (via: "user" | "admin") => ({
    from: (table: string) => {
      const inner: Record<string, unknown> = {
        select: () => inner,
        eq: () => inner,
        limit: () => inner,
        update: (payload: Record<string, unknown>) => {
          if (table === "profiles") opts?.onProfileUpdate?.(payload, via);
          if (table === "streaks") opts?.onStreakUpdate?.(payload, via);
          if (opts?.failUpdate && via === "admin") {
            return {
              eq: () =>
                Promise.resolve({
                  data: null,
                  error: { code: "PGRST301", message: "update failed", details: "admin update" },
                }),
            };
          }
          if (via === "admin" && table === "profiles") {
            Object.assign(profile, payload);
          }
          if (via === "admin" && table === "streaks") {
            Object.assign(streak, payload);
          }
          return {
            eq: () => Promise.resolve({ data: null, error: null }),
          };
        },
        insert: (payload: Record<string, unknown>) => {
          if (table === "freeze_uses") {
            opts?.onFreezeInsert?.(payload, via);
            if (via === "admin" && opts?.failFreezeInsert) {
              return Promise.resolve({ data: null, error: opts.failFreezeInsert });
            }
            if (via === "admin" && typeof payload.date_key === "string") freezeKeys.push(payload.date_key);
          }
          return Promise.resolve({ data: null, error: null });
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
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          if (table === "day_secures") {
            return Promise.resolve({
              data: (opts?.securedDateKeys ?? []).map((date_key) => ({ date_key })),
              error: null,
            }).then(onFulfilled, onRejected);
          }
          if (table === "freeze_uses") {
            return Promise.resolve({
              data: freezeKeys.map((date_key) => ({ date_key })),
              error: null,
            }).then(onFulfilled, onRejected);
          }
          if (table === "last_stand_uses") {
            return Promise.resolve({
              data: (opts?.lastStandDateKeys ?? []).map((date_key) => ({ date_key })),
              error: null,
            }).then(onFulfilled, onRejected);
          }
          return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
        },
      };
      return inner;
    },
  });

  const supabase = makeClient("user");
  const admin = makeClient("admin");
  vi.mocked(getSupabaseAdmin).mockReturnValue(admin as never);

  return {
    caller: streaksRouter.createCaller({
      userId: USER,
      supabase: supabase as never,
      req: {} as Request,
      requestId: "test",
      clientIp: "127.0.0.1",
    }),
    freezeKeys,
    admin,
    supabase,
  };
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

describe("restoreStreakCount", () => {
  const run = (
    last: string,
    secured: string[],
    extra?: { lastStandDateKeys?: string[]; frozenDateKeys?: string[]; todayKey?: string },
  ) =>
    restoreStreakCount({
      todayKey: extra?.todayKey ?? "2026-09-17",
      lastCompletedDateKey: last,
      securedDateKeys: secured,
      lastStandDateKeys: extra?.lastStandDateKeys,
      frozenDateKeys: extra?.frozenDateKeys,
    });

  it("bridges a Last Stand without incrementing it (streak.ts:19)", () => {
    expect(
      run(
        "2026-09-10",
        ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10"],
        { lastStandDateKeys: ["2026-09-06"] },
      ),
    ).toBe(9);
  });

  it("bridges a frozen day without incrementing it (streak.ts:19)", () => {
    expect(
      run(
        "2026-09-10",
        ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10"],
        { frozenDateKeys: ["2026-09-06"] },
      ),
    ).toBe(9);
  });

  it("includes today when today is already secured", () => {
    expect(
      run(
        "2026-09-17",
        ["2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14", "2026-09-15", "2026-09-17"],
        { frozenDateKeys: ["2026-09-16"], todayKey: "2026-09-17" },
      ),
    ).toBe(6);
  });

  it("returns 0 for an empty walk", () => {
    expect(run("2026-09-12", [])).toBe(0);
    expect(
      restoreStreakCount({
        todayKey: "2026-09-17",
        lastCompletedDateKey: null,
        securedDateKeys: [],
      }),
    ).toBe(0);
  });
});

describe("streaks.getFreezeStatus", () => {
  it("returns remaining from streak_freezes_remaining and free limit", async () => {
    const { caller } = createCaller({ remaining: 1, lastFreezeUsedAt: "2026-09-10T00:00:00.000Z" });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: 1,
      limit: STREAK_FREEZE_PER_MONTH_FREE,
      isPro: false,
      lastFreezeUsedAt: "2026-09-10T00:00:00.000Z",
    });
  });

  it("returns the Pro limit when last_freeze_used_at is null even if stored remaining is 1", async () => {
    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      isPremium: true,
    });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: STREAK_FREEZE_PER_MONTH_PRO,
      limit: STREAK_FREEZE_PER_MONTH_PRO,
      isPro: true,
      lastFreezeUsedAt: null,
    });
  });

  it("refills remaining to the limit after the 30-day window", async () => {
    const { caller } = createCaller({
      remaining: 0,
      lastFreezeUsedAt: "2026-08-01T00:00:00.000Z",
      isPremium: true,
    });
    await expect(caller.getFreezeStatus()).resolves.toEqual({
      remaining: STREAK_FREEZE_PER_MONTH_PRO,
      limit: STREAK_FREEZE_PER_MONTH_PRO,
      isPro: true,
      lastFreezeUsedAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("throws when the profile read fails", async () => {
    const { caller } = createCaller({ failProfile: true });
    await expect(caller.getFreezeStatus()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to load freeze status.",
    });
  });
});

describe("streaks.useFreeze", () => {
  it("restores the streak and inserts freeze_uses", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const inserts: { payload: Record<string, unknown>; via: "user" | "admin" }[] = [];
    const streakUpdates: { payload: Record<string, unknown>; via: "user" | "admin" }[] = [];
    const profileUpdates: { payload: Record<string, unknown>; via: "user" | "admin" }[] = [];

    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 0,
      securedDateKeys: [
        addCalendarDaysToDateKey(lastCompleted, -2),
        addCalendarDaysToDateKey(lastCompleted, -1),
        lastCompleted,
      ],
      onFreezeInsert: (payload, via) => inserts.push({ payload, via }),
      onStreakUpdate: (payload, via) => streakUpdates.push({ payload, via }),
      onProfileUpdate: (payload, via) => profileUpdates.push({ payload, via }),
    });

    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).resolves.toEqual({
      restoredStreak: 3,
      remaining: 0,
    });
    expect(inserts).toEqual([{ payload: { user_id: USER, date_key: yesterday }, via: "admin" }]);
    expect(streakUpdates).toEqual([
      { payload: { active_streak_count: 3, longest_streak_count: 3 }, via: "admin" },
    ]);
    expect(profileUpdates.map((u) => u.via)).toEqual(["admin"]);
  });

  it("writes longest_streak_count when restore 3 exceeds longest 2", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const streakUpdates: { payload: Record<string, unknown>; via: "user" | "admin" }[] = [];
    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 0,
      longestStreakCount: 2,
      securedDateKeys: [
        addCalendarDaysToDateKey(lastCompleted, -2),
        addCalendarDaysToDateKey(lastCompleted, -1),
        lastCompleted,
      ],
      onStreakUpdate: (payload, via) => streakUpdates.push({ payload, via }),
    });
    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).resolves.toEqual({
      restoredStreak: 3,
      remaining: 0,
    });
    expect(streakUpdates).toEqual([
      { payload: { active_streak_count: 3, longest_streak_count: 3 }, via: "admin" },
    ]);
  });

  it("leaves longest_streak_count when restore 3 is under longest 10", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const streakUpdates: { payload: Record<string, unknown>; via: "user" | "admin" }[] = [];
    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 0,
      longestStreakCount: 10,
      securedDateKeys: [
        addCalendarDaysToDateKey(lastCompleted, -2),
        addCalendarDaysToDateKey(lastCompleted, -1),
        lastCompleted,
      ],
      onStreakUpdate: (payload, via) => streakUpdates.push({ payload, via }),
    });
    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).resolves.toEqual({
      restoredStreak: 3,
      remaining: 0,
    });
    expect(streakUpdates).toEqual([
      { payload: { active_streak_count: 3, longest_streak_count: 10 }, via: "admin" },
    ]);
  });

  it("keeps both keys frozen after a second Pro use inside 30 days", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const firstYesterday = getYesterdayDateKey("UTC");
    const firstLast = addCalendarDaysToDateKey(firstYesterday, -1);
    const freezeKeys: string[] = [];

    const first = createCaller({
      isPremium: true,
      remaining: 4,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: firstLast,
      activeStreakCount: 0,
      securedDateKeys: [
        addCalendarDaysToDateKey(firstLast, -4),
        addCalendarDaysToDateKey(firstLast, -3),
        addCalendarDaysToDateKey(firstLast, -2),
        addCalendarDaysToDateKey(firstLast, -1),
        firstLast,
      ],
      freezeKeys,
      onFreezeInsert: (payload) => {
        if (typeof payload.date_key === "string") freezeKeys.push(payload.date_key);
      },
    });
    await first.caller.useFreeze({ dateKeyToFreeze: firstYesterday });

    vi.setSystemTime(new Date("2026-09-15T15:00:00.000Z"));
    const secondYesterday = getYesterdayDateKey("UTC");
    const secondLast = addCalendarDaysToDateKey(secondYesterday, -1);
    const second = createCaller({
      isPremium: true,
      remaining: 3,
      lastFreezeUsedAt: "2026-09-14T15:00:00.000Z",
      lastCompletedDateKey: secondLast,
      activeStreakCount: 0,
      freezeKeys,
      securedDateKeys: [secondLast],
      onFreezeInsert: (payload) => {
        if (typeof payload.date_key === "string") freezeKeys.push(payload.date_key);
      },
    });
    await second.caller.useFreeze({ dateKeyToFreeze: secondYesterday });
    expect(freezeKeys).toEqual([firstYesterday, secondYesterday]);

    const miss = evaluateMiss({
      userId: USER,
      todayKey: getTodayDateKey("UTC"),
      yesterdayKey: secondYesterday,
      lastCompletedDateKey: secondLast,
      activeStreakCount: 5,
      lastStandsAvailable: 0,
      lastStandsUsedTotal: 0,
      subscriptionStatus: "premium",
      frozenDateKeys: freezeKeys,
      lastStandUsedDateKeys: [],
    });
    expect(miss.effectiveMissedDays).toBe(0);
    expect(miss.write.kind).toBe("noop");
  });

  it("forbids a free user's second use", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const { caller } = createCaller({
      remaining: 0,
      lastFreezeUsedAt: "2026-09-13T15:00:00.000Z",
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 4,
    });
    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("after a miss then secure today, freeze restores the bridged count including today", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-17T15:00:00.000Z"));
    const today = getTodayDateKey("UTC");
    const yesterday = getYesterdayDateKey("UTC");
    const lastBeforeMiss = addCalendarDaysToDateKey(yesterday, -1);
    const inserts: Record<string, unknown>[] = [];
    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: today,
      activeStreakCount: 1,
      securedDateKeys: [
        addCalendarDaysToDateKey(lastBeforeMiss, -4),
        addCalendarDaysToDateKey(lastBeforeMiss, -3),
        addCalendarDaysToDateKey(lastBeforeMiss, -2),
        addCalendarDaysToDateKey(lastBeforeMiss, -1),
        lastBeforeMiss,
        today,
      ],
      onFreezeInsert: (payload) => inserts.push(payload),
    });
    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).resolves.toEqual({
      restoredStreak: 6,
      remaining: 0,
    });
    expect(inserts).toEqual([{ user_id: USER, date_key: yesterday }]);
  });

  it("empty walk spends nothing and inserts no freeze_uses row", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-17T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const inserts: Record<string, unknown>[] = [];
    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 0,
      securedDateKeys: [],
      onFreezeInsert: (payload) => inserts.push(payload),
    });
    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "No streak to restore.",
    });
    expect(inserts).toEqual([]);
  });

  it("logs the real write error and does not decrement or restore when freeze_uses insert fails", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T15:00:00.000Z"));
    const yesterday = getYesterdayDateKey("UTC");
    const lastCompleted = addCalendarDaysToDateKey(yesterday, -1);
    const inserts: { via: "user" | "admin" }[] = [];
    const profileUpdates: { via: "user" | "admin" }[] = [];
    const streakUpdates: { via: "user" | "admin" }[] = [];
    const log = vi.spyOn(logger, "error").mockImplementation(() => logger);

    const { caller } = createCaller({
      remaining: 1,
      lastFreezeUsedAt: null,
      lastCompletedDateKey: lastCompleted,
      activeStreakCount: 0,
      securedDateKeys: [lastCompleted],
      failFreezeInsert: {
        code: "42501",
        message: "new row violates row-level security policy for table \"freeze_uses\"",
        details: "RLS",
      },
      onFreezeInsert: (_payload, via) => inserts.push({ via }),
      onProfileUpdate: (_payload, via) => profileUpdates.push({ via }),
      onStreakUpdate: (_payload, via) => streakUpdates.push({ via }),
    });

    await expect(caller.useFreeze({ dateKeyToFreeze: yesterday })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to use streak freeze.",
    });
    expect(inserts).toEqual([{ via: "admin" }]);
    expect(profileUpdates).toEqual([]);
    expect(streakUpdates).toEqual([]);
    expect(log).toHaveBeenCalledWith(
      {
        requestId: "test",
        op: "freeze_uses.insert",
        code: "42501",
        message: "new row violates row-level security policy for table \"freeze_uses\"",
        details: "RLS",
      },
      "useFreeze write failed",
    );
    log.mockRestore();
  });
});
