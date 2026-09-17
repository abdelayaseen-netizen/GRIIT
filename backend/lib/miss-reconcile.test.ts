import { describe, expect, it, vi } from "vitest";
import { addCalendarDaysToDateKey, getTodayDateKey, getYesterdayDateKey } from "./date-utils";
import { shouldEarnLastStand } from "./last-stand";
import {
  LAST_STAND_PUSH_TITLE,
  evaluateMiss,
  lastStandPushBody,
  reconcileMissForUser,
  type MissReconcileInput,
} from "./miss-reconcile";
import { runDailyReset } from "./daily-reset";

vi.mock("./push", () => ({
  sendExpoPush: vi.fn().mockResolvedValue(undefined),
}));

const USER = "11111111-1111-4111-8111-111111111111";

function fixture(overrides?: Partial<MissReconcileInput>): MissReconcileInput {
  const today = getTodayDateKey("UTC");
  const yesterday = getYesterdayDateKey("UTC");
  return {
    userId: USER,
    todayKey: today,
    yesterdayKey: yesterday,
    lastCompletedDateKey: addCalendarDaysToDateKey(yesterday, -1),
    activeStreakCount: 12,
    lastStandsAvailable: 0,
    lastStandsUsedTotal: 0,
    subscriptionStatus: "free",
    frozenDateKeys: [],
    lastStandUsedDateKeys: [],
    ...overrides,
  };
}

type Write = { table: string; op: string; payload: Record<string, unknown> };

function missClient(opts: {
  input: MissReconcileInput;
  writes: Write[];
  freezeKeys?: string[];
  standKeys?: string[];
  afterApply?: (write: Write) => void;
}) {
  let stands = [...(opts.standKeys ?? opts.input.lastStandUsedDateKeys)];
  let freezes = [...(opts.freezeKeys ?? opts.input.frozenDateKeys)];
  let streak = {
    user_id: opts.input.userId,
    active_streak_count: opts.input.activeStreakCount,
    last_completed_date_key: opts.input.lastCompletedDateKey,
    last_stands_available: opts.input.lastStandsAvailable,
    last_stands_used_total: opts.input.lastStandsUsedTotal,
  };
  const profile = {
    subscription_status: opts.input.subscriptionStatus,
    timezone: "UTC",
    reminder_timezone: "UTC",
    expo_push_token: null,
  };

  return {
    from: (table: string) => {
      const inner: Record<string, unknown> = {
        select: () => inner,
        eq: () => inner,
        in: () => inner,
        limit: () => inner,
        maybeSingle: () => {
          if (table === "streaks") return Promise.resolve({ data: streak, error: null });
          if (table === "profiles") return Promise.resolve({ data: profile, error: null });
          return Promise.resolve({ data: null, error: null });
        },
        update: (payload: Record<string, unknown>) => {
          const write: Write = { table, op: "update", payload };
          opts.writes.push(write);
          if (table === "streaks") streak = { ...streak, ...payload };
          opts.afterApply?.(write);
          return { eq: () => Promise.resolve({ data: null, error: null }) };
        },
        insert: (payload: Record<string, unknown>) => {
          const write: Write = { table, op: "insert", payload };
          opts.writes.push(write);
          if (table === "last_stand_uses" && typeof payload.date_key === "string") {
            stands.push(payload.date_key);
          }
          if (table === "freeze_uses" && typeof payload.date_key === "string") {
            freezes.push(payload.date_key);
          }
          opts.afterApply?.(write);
          return Promise.resolve({ data: null, error: null });
        },
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
          if (table === "active_challenges") {
            return Promise.resolve({
              data: [{ user_id: USER }],
              error: null,
            }).then(onFulfilled, onRejected);
          }
          if (table === "freeze_uses") {
            return Promise.resolve({
              data: freezes.map((date_key) => ({ date_key })),
              error: null,
            }).then(onFulfilled, onRejected);
          }
          if (table === "last_stand_uses") {
            return Promise.resolve({
              data: stands.map((date_key) => ({ date_key })),
              error: null,
            }).then(onFulfilled, onRejected);
          }
          if (table === "push_tokens") {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
          }
          return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
        },
      };
      return inner;
    },
  };
}

describe("evaluateMiss", () => {
  it("resets the streak and never nulls last_completed_date_key", () => {
    const d = evaluateMiss(fixture());
    expect(d.write.kind).toBe("reset");
    if (d.write.kind !== "reset") throw new Error("expected reset");
    expect(d.write.streakPatch).toEqual({ active_streak_count: 0 });
    expect(d.write.streakPatch).not.toHaveProperty("last_completed_date_key");
    expect(d.streak_broken).toBe(true);
    expect(d.previous_streak).toBe(12);
  });

  it("consumes a Last Stand for premium with one unprotected miss", () => {
    const d = evaluateMiss(
      fixture({ subscriptionStatus: "premium", lastStandsAvailable: 2, lastStandsUsedTotal: 0 }),
    );
    expect(d.write.kind).toBe("last_stand");
    if (d.write.kind !== "last_stand") throw new Error("expected last_stand");
    expect(d.write.streakPatch).not.toHaveProperty("last_completed_date_key");
    expect(d.write.push.title).toBe(LAST_STAND_PUSH_TITLE);
    expect(d.write.push.body).toBe(lastStandPushBody(12, 1));
    expect(d.lastStandUsedThisSession).toBe(true);
    expect(d.lastStandsAvailable).toBe(1);
  });

  it("does not consume a Last Stand for a free user", () => {
    const d = evaluateMiss(fixture({ lastStandsAvailable: 2, subscriptionStatus: "free" }));
    expect(d.write.kind).toBe("reset");
    expect(d.lastStandUsedThisSession).toBe(false);
  });

  it("treats freeze_uses keys as frozen, not last_freeze_used_at", () => {
    const yesterday = getYesterdayDateKey("UTC");
    const d = evaluateMiss(
      fixture({
        frozenDateKeys: [yesterday],
        activeStreakCount: 12,
      }),
    );
    expect(d.effectiveMissedDays).toBe(0);
    expect(d.write.kind).toBe("noop");
  });
});

describe("one Last Stand push copy", () => {
  it("is the same title and body for both callers", () => {
    expect(LAST_STAND_PUSH_TITLE).toBe("Last Stand used");
    expect(lastStandPushBody(12, 1)).toBe("Your 12-day streak continues. 1 Last Stand remaining.");
    expect(lastStandPushBody(12, 0)).toBe("Your 12-day streak continues. 0 Last Stands remaining.");
  });
});

describe("both callers", () => {
  it("produce identical writes for the same fixture", async () => {
    const input = fixture();
    const cronWrites: Write[] = [];
    const recWrites: Write[] = [];
    await runDailyReset(missClient({ input, writes: cronWrites }) as never);
    await reconcileMissForUser(missClient({ input, writes: recWrites }) as never, USER);
    expect(cronWrites).toEqual(recWrites);
    expect(cronWrites.some((w) => w.payload.last_completed_date_key === null)).toBe(false);
  });

  it("is idempotent: cron then reconcile writes once", async () => {
    const input = fixture();
    const writes: Write[] = [];
    const client = missClient({ input, writes });
    await runDailyReset(client as never);
    const afterCron = writes.length;
    expect(afterCron).toBeGreaterThan(0);
    await reconcileMissForUser(client as never, USER);
    expect(writes.length).toBe(afterCron);
  });
});

describe("shouldEarnLastStand tier gate", () => {
  it("never earns for a free user", () => {
    expect(shouldEarnLastStand(7, 0, "free")).toBe(false);
    expect(shouldEarnLastStand(6, 1, "free")).toBe(false);
  });

  it("earns on premium or trial when the 6/7 rule holds", () => {
    expect(shouldEarnLastStand(6, 0, "premium")).toBe(true);
    expect(shouldEarnLastStand(7, 1, "trial")).toBe(true);
    expect(shouldEarnLastStand(5, 0, "premium")).toBe(false);
    expect(shouldEarnLastStand(7, 2, "premium")).toBe(false);
  });
});
