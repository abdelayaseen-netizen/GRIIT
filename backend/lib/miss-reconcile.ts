/**
 * One miss evaluation for runDailyReset and profiles.reconcileStreak.
 * Same inputs, same writes. Never nulls last_completed_date_key (useFreeze needs it).
 * frozenDateKeys come from freeze_uses, not last_freeze_used_at.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { daysBetweenKeys, getTodayDateKey, getYesterdayDateKey } from "./date-utils";
import { canSpendLastStand, newAvailableAfterUse } from "./last-stand";
import { sendExpoPush } from "./push";

export const LAST_STAND_PUSH_TITLE = "Last Stand used";

export function lastStandPushBody(streak: number, remaining: number): string {
  const n = Math.max(0, remaining);
  const stand = n === 1 ? "Last Stand" : "Last Stands";
  return `Your ${Math.max(0, streak)}-day streak continues. ${n} ${stand} remaining.`;
}

export type MissReconcileInput = {
  userId: string;
  todayKey: string;
  yesterdayKey: string;
  lastCompletedDateKey: string | null;
  activeStreakCount: number;
  lastStandsAvailable: number;
  lastStandsUsedTotal: number;
  subscriptionStatus: string;
  frozenDateKeys: readonly string[];
  lastStandUsedDateKeys: readonly string[];
};

export type MissWrite =
  | { kind: "noop" }
  | { kind: "reset"; streakPatch: { active_streak_count: 0 } }
  | {
      kind: "last_stand";
      insert: { user_id: string; date_key: string };
      streakPatch: { last_stands_available: number; last_stands_used_total: number };
      push: { title: string; body: string };
    };

export type MissDecision = {
  write: MissWrite;
  streak_broken: boolean;
  previous_streak: number;
  lastStandUsedThisSession: boolean;
  lastStandsAvailable: number;
  effectiveMissedDays: number;
  missedDateKeys: string[];
};

export function evaluateMiss(input: MissReconcileInput): MissDecision {
  const frozen = new Set(input.frozenDateKeys);
  const stood = new Set(input.lastStandUsedDateKeys);
  const lastKey = input.lastCompletedDateKey;
  const missedDateKeys =
    lastKey != null && lastKey < input.todayKey ? daysBetweenKeys(lastKey, input.yesterdayKey) : [];
  const unprotected = missedDateKeys.filter((k) => !frozen.has(k) && !stood.has(k));
  const effectiveMissedDays = unprotected.length;
  const lastStandsAvailable = Math.min(2, Math.max(0, input.lastStandsAvailable));
  const premium = canSpendLastStand(input.subscriptionStatus);
  const streak = Math.max(0, input.activeStreakCount);

  if (effectiveMissedDays === 1 && lastStandsAvailable > 0 && premium) {
    const dateKey = unprotected[0]!;
    const nextAvailable = newAvailableAfterUse(lastStandsAvailable);
    const nextUsed = input.lastStandsUsedTotal + 1;
    return {
      write: {
        kind: "last_stand",
        insert: { user_id: input.userId, date_key: dateKey },
        streakPatch: {
          last_stands_available: nextAvailable,
          last_stands_used_total: nextUsed,
        },
        push: {
          title: LAST_STAND_PUSH_TITLE,
          body: lastStandPushBody(streak, nextAvailable),
        },
      },
      streak_broken: false,
      previous_streak: 0,
      lastStandUsedThisSession: true,
      lastStandsAvailable: nextAvailable,
      effectiveMissedDays,
      missedDateKeys,
    };
  }

  if (effectiveMissedDays >= 1 && streak > 0) {
    return {
      write: { kind: "reset", streakPatch: { active_streak_count: 0 } },
      streak_broken: true,
      previous_streak: streak,
      lastStandUsedThisSession: false,
      lastStandsAvailable,
      effectiveMissedDays,
      missedDateKeys,
    };
  }

  return {
    write: { kind: "noop" },
    streak_broken: false,
    previous_streak: 0,
    lastStandUsedThisSession: false,
    lastStandsAvailable,
    effectiveMissedDays,
    missedDateKeys,
  };
}

export async function loadMissInput(
  supabase: SupabaseClient,
  userId: string,
): Promise<MissReconcileInput | null> {
  const [streakRes, profileRes, freezeRes, standRes] = await Promise.all([
    supabase
      .from("streaks")
      .select(
        "user_id, active_streak_count, last_completed_date_key, last_stands_available, last_stands_used_total",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("subscription_status, timezone, reminder_timezone")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("freeze_uses").select("date_key").eq("user_id", userId).limit(365),
    supabase.from("last_stand_uses").select("date_key").eq("user_id", userId).limit(365),
  ]);

  if (streakRes.error && streakRes.error.code !== "PGRST116") {
    throw streakRes.error;
  }
  if (profileRes.error && profileRes.error.code !== "PGRST116") {
    throw profileRes.error;
  }
  if (freezeRes.error) throw freezeRes.error;
  if (standRes.error) throw standRes.error;

  const streak = streakRes.data as {
    active_streak_count?: number | null;
    last_completed_date_key?: string | null;
    last_stands_available?: number | null;
    last_stands_used_total?: number | null;
  } | null;
  if (!streak) return null;

  const profile = profileRes.data as {
    subscription_status?: string | null;
    timezone?: string | null;
    reminder_timezone?: string | null;
  } | null;
  const tz = profile?.timezone?.trim() || profile?.reminder_timezone?.trim() || "UTC";

  return {
    userId,
    todayKey: getTodayDateKey(tz),
    yesterdayKey: getYesterdayDateKey(tz),
    lastCompletedDateKey: streak.last_completed_date_key ?? null,
    activeStreakCount: streak.active_streak_count ?? 0,
    lastStandsAvailable: streak.last_stands_available ?? 0,
    lastStandsUsedTotal: streak.last_stands_used_total ?? 0,
    subscriptionStatus: profile?.subscription_status ?? "free",
    frozenDateKeys: (freezeRes.data ?? []).map((r: { date_key: string }) => r.date_key),
    lastStandUsedDateKeys: (standRes.data ?? []).map((r: { date_key: string }) => r.date_key),
  };
}

export async function applyMissWrite(
  supabase: SupabaseClient,
  userId: string,
  write: MissWrite,
): Promise<void> {
  if (write.kind === "noop") return;

  if (write.kind === "reset") {
    const { error } = await supabase.from("streaks").update(write.streakPatch).eq("user_id", userId);
    if (error) throw error;
    return;
  }

  const { error: insertErr } = await supabase.from("last_stand_uses").insert(write.insert);
  if (insertErr) throw insertErr;
  const { error: updateErr } = await supabase
    .from("streaks")
    .update(write.streakPatch)
    .eq("user_id", userId);
  if (updateErr) throw updateErr;

  const [pushRes, profileRes] = await Promise.all([
    supabase.from("push_tokens").select("token").eq("user_id", userId).limit(200),
    supabase.from("profiles").select("expo_push_token").eq("user_id", userId).maybeSingle(),
  ]);
  const tokens = (pushRes.data ?? []).map((r: { token: string }) => r.token).filter(Boolean);
  const profileToken =
    (profileRes.data as { expo_push_token?: string | null } | null)?.expo_push_token ?? null;
  const all = [...new Set([...tokens, profileToken].filter(Boolean))].filter(
    (t): t is string => typeof t === "string",
  );
  if (all.length > 0) {
    await sendExpoPush(all, write.push.title, write.push.body);
  }
}

export type MissApplied = MissDecision & { lastCompletedDateKey: string | null };

export async function reconcileMissForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<MissApplied> {
  const input = await loadMissInput(supabase, userId);
  if (!input) {
    return {
      write: { kind: "noop" },
      streak_broken: false,
      previous_streak: 0,
      lastStandUsedThisSession: false,
      lastStandsAvailable: 0,
      effectiveMissedDays: 0,
      missedDateKeys: [],
      lastCompletedDateKey: null,
    };
  }
  const decision = evaluateMiss(input);
  await applyMissWrite(supabase, userId, decision.write);
  return { ...decision, lastCompletedDateKey: input.lastCompletedDateKey };
}
