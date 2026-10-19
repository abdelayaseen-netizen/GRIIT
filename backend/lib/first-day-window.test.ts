/**
 * Build 92 chunk 09.3: a challenge whose task window closed today starts tomorrow, and today
 * is never counted as missed. Fixed clock: 9:41 in New York; Fajr's window is 5:00–6:30.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { joinChallengeDirect } from "./join-challenge";
import { anyTimeWindowClosedToday, enrollmentStartAt } from "./late-join-window";
import { enrollmentProgress } from "./user-stats";

vi.mock("./supabase-server", () => ({ getSupabaseServer: () => null }));

const USER = "11111111-1111-4111-8111-111111111111";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TZ = "America/New_York";
const AT_941 = new Date("2026-10-19T13:41:00.000Z");
const FAJR = { gate_time_mode: "between", gate_time_start: "05:00", gate_time_end: "06:30", config: {} };
const GYM = { gate_time_mode: null, gate_time_start: null, gate_time_end: null, config: {} };

function mockDb(tasks: Record<string, unknown>[]) {
  const inserts: { table: string; row: Record<string, unknown> }[] = [];
  const from = (table: string) => {
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      maybeSingle: () => {
        if (table === "profiles") return Promise.resolve({ data: { user_id: USER, timezone: TZ }, error: null });
        return Promise.resolve({ data: null, error: null });
      },
      single: () =>
        table === "challenges"
          ? Promise.resolve({ data: { id: CH, title: "Fajr Before Sunrise", duration_type: "multi_day", duration_days: 7 }, error: null })
          : Promise.resolve({ data: null, error: { code: "PGRST116" } }),
      then: (ok: (v: unknown) => unknown, bad?: (e: unknown) => unknown) =>
        Promise.resolve({ data: table === "challenge_tasks" ? tasks : null, error: null }).then(ok, bad),
      insert: (row: Record<string, unknown> | Record<string, unknown>[]) => {
        const first = Array.isArray(row) ? row[0]! : row;
        inserts.push({ table, row: first });
        const after: Record<string, unknown> = {
          select: () => after,
          single: () => Promise.resolve({ data: { id: "ac-1", ...first }, error: null }),
          then: (ok: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(ok),
        };
        return after;
      },
      upsert: () => chain,
      update: () => chain,
    };
    return chain;
  };
  return { supabase: { from }, inserts };
}

describe("09.3 closed window at 9:41", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(AT_941);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("Fajr's 5:00–6:30 window is closed at 9:41; the gym task has no window", () => {
    expect(anyTimeWindowClosedToday([FAJR], AT_941, TZ)).toBe(true);
    expect(anyTimeWindowClosedToday([GYM], AT_941, TZ)).toBe(false);
  });

  it("joining Fajr at 9:41 sets Day 1 to tomorrow (local midnight)", async () => {
    const { supabase, inserts } = mockDb([FAJR]);
    await joinChallengeDirect(supabase as never, USER, CH);
    const row = inserts.find((i) => i.table === "active_challenges")?.row;
    expect(row?.start_at).toBe(enrollmentStartAt(AT_941, TZ, true).toISOString());
    expect(row?.start_at).toBe("2026-10-20T04:00:00.000Z");
  });

  it("joining the gym challenge at 9:41 starts today", async () => {
    const { supabase, inserts } = mockDb([GYM]);
    await joinChallengeDirect(supabase as never, USER, CH);
    const row = inserts.find((i) => i.table === "active_challenges")?.row;
    expect(row?.start_at).toBe(AT_941.toISOString());
  });

  it("no missed day is recorded for today when Day 1 is tomorrow", () => {
    const today = enrollmentProgress({
      startDateKey: "2026-10-20",
      durationDays: 7,
      todayKey: "2026-10-19",
      securedKeys: [],
      heldKeys: [],
    });
    expect(today.days.some((d) => d.state === "missed")).toBe(false);
    expect(today.days.some((d) => d.date_key === "2026-10-19")).toBe(false);
    expect(today.elapsed_days).toBe(0);
    expect(today.day_number).toBe(0);
    const tomorrow = enrollmentProgress({
      startDateKey: "2026-10-20",
      durationDays: 7,
      todayKey: "2026-10-20",
      securedKeys: [],
      heldKeys: [],
    });
    expect(tomorrow.day_number).toBe(1);
    expect(tomorrow.days.some((d) => d.state === "missed")).toBe(false);
  });
});
