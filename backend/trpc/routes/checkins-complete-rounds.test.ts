/**
 * Build 90 01b.2: a first-day finish on a one-task challenge must not be a long chain of
 * sequential Supabase round trips. Every query against this fake client takes a tick; a
 * "round" starts whenever a query begins with nothing else in flight, so parallel reads
 * count once and sequential reads count each. The deployed server measured ~35 rounds
 * at 50–170 ms each (docs/reports/build90.md "01b.1").
 */
import { describe, expect, it, vi } from "vitest";
import { createTestCaller } from "../create-test-caller";

const USER = "11111111-1111-4111-8111-111111111111";
const AC = "c0000000-0000-4000-8000-000000000003";
const CH = "d0000000-0000-4000-8000-000000000004";
const TASK = "e0000000-0000-4000-8000-000000000005";
const CI = "f0000000-0000-4000-8000-000000000006";
const EV = "a0000000-0000-4000-8000-000000000007";

type Trace = { inflight: number; rounds: number; queries: string[]; upserted: boolean; settled: boolean };

const shared = vi.hoisted(() => ({ client: null as unknown }));
vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => shared.client }));

function makeClient(trace: Trace, opts: { photo?: boolean } = {}) {
  const run = async (label: string) => {
    if (trace.inflight === 0) trace.rounds++;
    trace.inflight++;
    trace.queries.push(label);
    await new Promise((r) => setTimeout(r, 2));
    trace.inflight--;
  };
  const rowFor = (table: string, op: string, single: boolean): unknown => {
    const list = (row: unknown) => (single ? row : row == null ? [] : [row]);
    switch (table) {
      case "active_challenges":
        return list({ id: AC, user_id: USER, challenge_id: CH, start_at: new Date().toISOString(), current_day: 1, status: "active" });
      case "profiles":
        return list({ user_id: USER, timezone: "UTC", reminder_timezone: null, total_days_secured: 0, is_premium: false, streak_freezes_remaining: 0, last_freeze_used_at: null });
      case "challenge_tasks":
        return list({ id: TASK, title: "Walk", task_type: "manual", config: {}, challenge_id: CH, order_index: 0, require_photo: false });
      case "challenges":
        return list({ id: CH, title: "7K Steps", duration_type: "multi_day", duration_days: 7, is_hard_mode: false, participation_type: "solo", run_status: "active", ends_at: null, live_date: null });
      case "check_ins":
        if (op === "upsert") {
          trace.upserted = true;
          return { id: CI, user_id: USER, active_challenge_id: AC, task_id: TASK, date_key: "2026-10-17", status: "completed", proof_url: opts.photo ? `${USER}/p.jpg` : null, photo_url: opts.photo ? `${USER}/p.jpg` : null };
        }
        return single ? null : trace.upserted ? [{ id: CI, task_id: TASK, active_challenge_id: AC, date_key: "2026-10-17" }] : [];
      case "activity_events":
        return op === "insert" ? (single ? { id: EV } : [{ id: EV }]) : single ? null : [];
      case "streaks":
        return list({ active_streak_count: 1, longest_streak_count: 1 });
      case "day_secures":
        return single ? null : [];
      default:
        return single ? null : [];
    }
  };
  const client = {
    rpc(name: string) {
      const p = (async () => {
        await run(`rpc.${name}`);
        return { data: [{ streak: 1, secured: true, challenge_done: true, remaining_challenges: 0 }], error: null };
      })();
      return p;
    },
    storage: { from: () => ({ createSignedUrls: async (paths: string[]) => { await run("storage.sign"); return { data: paths.map((p) => ({ path: p, signedUrl: `https://x/${p}` })), error: null }; } }) },
    from(table: string) {
      let op = "select";
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "eq", "neq", "gte", "lte", "in", "or", "order", "limit", "is", "not"]) chain[m] = () => chain;
      chain.insert = () => ((op = "insert"), chain);
      chain.upsert = () => ((op = "upsert"), chain);
      chain.update = () => ((op = "update"), chain);
      chain.delete = () => ((op = "delete"), chain);
      const exec = async (single: boolean) => {
        await run(`${table}.${op}`);
        return { data: rowFor(table, op, single), error: null, count: 0 };
      };
      chain.single = () => exec(true);
      chain.maybeSingle = () => exec(true);
      chain.then = (f: (v: unknown) => unknown, r?: (e: unknown) => unknown) => exec(false).then(f, r);
      return chain;
    },
  };
  return client;
}

async function finish(input: Record<string, unknown>, opts: { photo?: boolean } = {}) {
  const trace: Trace = { inflight: 0, rounds: 0, queries: [], upserted: false, settled: false };
  const supabase = makeClient(trace, opts);
  shared.client = supabase;
  const caller = createTestCaller({ userId: USER, supabase }) as unknown as {
    checkins: { complete: (i: Record<string, unknown>) => Promise<Record<string, unknown>> };
  };
  const result = await caller.checkins.complete({ activeChallengeId: AC, taskId: TASK, ...input });
  const roundsAtReturn = trace.rounds;
  const queriesAtReturn = [...trace.queries];
  // Let background work (achievements) settle so it does not leak into the next test.
  await new Promise((r) => setTimeout(r, 40));
  return { result, roundsAtReturn, queriesAtReturn, trace };
}

describe("checkins.complete sequential round trips (01b.2)", () => {
  it("a self-reported first finish that secures the day answers in at most 8 rounds", async () => {
    const { result, roundsAtReturn, queriesAtReturn } = await finish({ self_reported: true, audience: "friends" });
    expect(result.requiredRemaining).toBe(0);
    expect((result.daySecure as { secured?: boolean } | null)?.secured).toBe(true);
    expect(result.eventId).toBe(EV);
    expect(roundsAtReturn, queriesAtReturn.join("\n")).toBeLessThanOrEqual(8);
  });

  it("a photo first finish that secures the day answers in at most 8 rounds", async () => {
    const { result, roundsAtReturn, queriesAtReturn } = await finish(
      { photo_url: `${USER}/p.jpg`, proof_payload_json: { capturedAt: new Date().toISOString(), captured_in_app: true }, audience: "friends" },
      { photo: true },
    );
    expect(result.requiredRemaining).toBe(0);
    expect(result.photo_url).toMatch(/^https:\/\//);
    expect(roundsAtReturn, queriesAtReturn.join("\n")).toBeLessThanOrEqual(8);
  });

  it("the achievement reads are not on the response path", async () => {
    const { queriesAtReturn } = await finish({ self_reported: true, audience: "friends" });
    // checkAndUnlockAchievements reads user_follows / feed_comments / feed_reactions; none before the answer.
    expect(queriesAtReturn.filter((q) => /user_follows|feed_comments|feed_reactions/.test(q))).toEqual([]);
  });

  it("no table is read twice for the same row on the response path", async () => {
    const { queriesAtReturn } = await finish({ self_reported: true, audience: "friends" });
    const reads = queriesAtReturn.filter((q) => q.endsWith(".select"));
    const counts = new Map<string, number>();
    for (const q of reads) counts.set(q, (counts.get(q) ?? 0) + 1);
    // One read each of the profile, the challenge and the streak.
    // active_challenges: the enrollment (ownership + start_at + current_day), the person's enrollment
    // list for the day-proof tiles, and current_day again after the secure RPC changed it.
    // day_secures: "already secured today?" before the RPC, and the exact count after it wrote the row.
    const allowed: Record<string, number> = { active_challenges: 3, day_secures: 2 };
    for (const table of ["active_challenges", "profiles", "challenges", "streaks", "day_secures"]) {
      expect(counts.get(`${table}.select`) ?? 0, table).toBeLessThanOrEqual(allowed[table] ?? 1);
    }
  });
});
