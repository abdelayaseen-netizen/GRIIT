import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TRPCError } from "@trpc/server";
import {
  applyFinalizeEnded,
  applyMarkEndSeen,
  endedStatusForFinalize,
  isUnseenEnding,
  shouldEmitCompletedChallenge,
} from "./finalize-ended";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const AC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CH = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = new Date("2026-09-20T12:00:00.000Z");

type AcRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  end_at: string;
  ended_at?: string | null;
  end_seen_at?: string | null;
};

type EventRow = {
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown> | null;
  shared?: boolean;
};

function createDb(seed: { ac: AcRow[]; events: EventRow[] }, opts?: { insertError?: { code: string } }) {
  const ac = seed.ac.map((r) => ({ ...r }));
  const events = seed.events.map((r) => ({ ...r }));
  const updates: Record<string, unknown>[] = [];
  const inserts: EventRow[] = [];

  function acChain() {
    const filters: { col: string; op: string; val: unknown }[] = [];
    let patch: Record<string, unknown> | null = null;
    const match = () =>
      ac.filter((row) =>
        filters.every((f) => {
          const cell = (row as Record<string, unknown>)[f.col];
          if (f.op === "eq") return cell === f.val;
          if (f.op === "in") return (f.val as string[]).includes(String(cell));
          return true;
        }),
      );
    const chain = {
      select: () => chain,
      eq: (col: string, val: string) => {
        filters.push({ col, op: "eq", val });
        return chain;
      },
      in: (col: string, val: string[]) => {
        filters.push({ col, op: "in", val });
        return chain;
      },
      update: (p: Record<string, unknown>) => {
        patch = p;
        return chain;
      },
      then: (resolve: (v: { data: unknown; error: null }) => unknown) => {
        const rows = match();
        if (patch) {
          updates.push({ ...patch, _ids: rows.map((r) => r.id) });
          for (const row of rows) Object.assign(row, patch);
        }
        return Promise.resolve(resolve({ data: rows, error: null }));
      },
    };
    return chain;
  }

  function evChain() {
    const filters: { col: string; val: string }[] = [];
    const chain = {
      select: () => chain,
      eq: (col: string, val: string) => {
        filters.push({ col, val });
        return chain;
      },
      insert: (row: EventRow) => {
        if (opts?.insertError) {
          return Promise.resolve({ data: null, error: opts.insertError });
        }
        inserts.push(row);
        events.push(row);
        return Promise.resolve({ data: row, error: null });
      },
      then: (resolve: (v: { data: unknown; error: null }) => unknown) => {
        const rows = events.filter((e) =>
          filters.every((f) => (e as Record<string, unknown>)[f.col] === f.val),
        );
        return Promise.resolve(resolve({ data: rows, error: null }));
      },
    };
    return chain;
  }

  function chChain() {
    const chain = {
      select: () => chain,
      in: () => Promise.resolve({ data: [{ id: CH, title: "Quick Steps", duration_days: 1 }], error: null }),
    };
    return chain;
  }

  const supabase = {
    from: (table: string) => {
      if (table === "active_challenges") return acChain();
      if (table === "activity_events") return evChain();
      if (table === "challenges") return chChain();
      throw new Error(table);
    },
    _ac: ac,
    _events: events,
    _updates: updates,
    _inserts: inserts,
  };
  return supabase;
}

describe("endedStatusForFinalize", () => {
  it("solo hard-mode maps to completed, not failed", () => {
    expect(endedStatusForFinalize({ is_hard_mode: true, participation_type: "solo" })).toBe(
      "completed",
    );
    const src = readFileSync(resolve(__dirname, "./finalize-ended.ts"), "utf8");
    expect(src).toContain("solo hard-mode failure deferred, see Chunk T ruling");
  });
});

describe("isUnseenEnding", () => {
  it("completed and failed with null end_seen_at; never abandoned", () => {
    expect(isUnseenEnding({ status: "completed", end_seen_at: null })).toBe(true);
    expect(isUnseenEnding({ status: "failed", end_seen_at: null })).toBe(true);
    expect(isUnseenEnding({ status: "abandoned", end_seen_at: null })).toBe(false);
    expect(isUnseenEnding({ status: "completed", end_seen_at: NOW.toISOString() })).toBe(false);
  });
});

describe("applyFinalizeEnded", () => {
  it("idempotency: call twice, one event", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: USER,
          challenge_id: CH,
          status: "active",
          end_at: "2026-09-19T23:59:59.999Z",
        },
      ],
      events: [],
    });
    const first = await applyFinalizeEnded(db as never, USER, NOW);
    const second = await applyFinalizeEnded(db as never, USER, NOW);
    expect(first.eventsEmitted).toBe(1);
    expect(second.eventsEmitted).toBe(0);
    expect(db._inserts.filter((e) => e.event_type === "completed_challenge")).toHaveLength(1);
    expect(db._ac[0]?.status).toBe("completed");
    expect(db._ac[0]?.ended_at).toBe("2026-09-19T23:59:59.999Z");
  });

  it("zombie already completed is not re-emitted", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: USER,
          challenge_id: CH,
          status: "completed",
          end_at: "2026-09-18T23:59:59.999Z",
          ended_at: "2026-09-18T23:59:59.999Z",
          end_seen_at: "2026-09-18T23:59:59.999Z",
        },
      ],
      events: [],
    });
    const result = await applyFinalizeEnded(db as never, USER, NOW);
    expect(result.finalized).toEqual([]);
    expect(result.eventsEmitted).toBe(0);
    expect(db._inserts).toHaveLength(0);
  });

  it("old emitter without metadata key is not doubled", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: USER,
          challenge_id: CH,
          status: "active",
          end_at: "2026-09-19T23:59:59.999Z",
        },
      ],
      events: [
        {
          user_id: USER,
          event_type: "completed_challenge",
          challenge_id: CH,
          metadata: { challenge_name: "Quick Steps", duration_days: 1 },
        },
      ],
    });
    const result = await applyFinalizeEnded(db as never, USER, NOW);
    expect(result.finalized).toEqual([AC]);
    expect(result.eventsEmitted).toBe(0);
    expect(db._inserts).toHaveLength(0);
    expect(shouldEmitCompletedChallenge(db._events, { id: AC, challenge_id: CH })).toBe(false);
  });

  it("concurrent: two simultaneous calls, one event, neither throws", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: USER,
          challenge_id: CH,
          status: "active",
          end_at: "2026-09-19T23:59:59.999Z",
        },
      ],
      events: [],
    });
    const [a, b] = await Promise.all([
      applyFinalizeEnded(db as never, USER, NOW),
      applyFinalizeEnded(db as never, USER, NOW),
    ]);
    expect(a.eventsEmitted + b.eventsEmitted).toBe(1);
    expect(db._inserts.filter((e) => e.event_type === "completed_challenge")).toHaveLength(1);
    expect(db._ac[0]?.status).toBe("completed");
    expect(db._ac[0]?.ended_at).toBe("2026-09-19T23:59:59.999Z");
  });

  it("23505 on event insert resolves as success", async () => {
    const db = createDb(
      {
        ac: [
          {
            id: AC,
            user_id: USER,
            challenge_id: CH,
            status: "active",
            end_at: "2026-09-19T23:59:59.999Z",
          },
        ],
        events: [],
      },
      { insertError: { code: "23505" } },
    );
    await expect(applyFinalizeEnded(db as never, USER, NOW)).resolves.toMatchObject({
      finalized: [AC],
    });
    expect(db._ac[0]?.status).toBe("completed");
    expect(db._ac[0]?.ended_at).toBe("2026-09-19T23:59:59.999Z");
  });

  it("non-duplicate insert error does not throw and leaves status completed", async () => {
    const db = createDb(
      {
        ac: [
          {
            id: AC,
            user_id: USER,
            challenge_id: CH,
            status: "active",
            end_at: "2026-09-19T23:59:59.999Z",
          },
        ],
        events: [],
      },
      { insertError: { code: "40001" } },
    );
    await expect(applyFinalizeEnded(db as never, USER, NOW)).resolves.toMatchObject({
      finalized: [AC],
      eventsEmitted: 0,
    });
    expect(db._ac[0]?.status).toBe("completed");
    expect(db._inserts).toHaveLength(0);
  });

  it("loser of the race emits nothing", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: USER,
          challenge_id: CH,
          status: "active",
          end_at: "2026-09-19T23:59:59.999Z",
        },
      ],
      events: [],
    });
    const winner = await applyFinalizeEnded(db as never, USER, NOW);
    const loser = await applyFinalizeEnded(db as never, USER, NOW);
    expect(winner.eventsEmitted).toBe(1);
    expect(loser.finalized).toEqual([]);
    expect(loser.eventsEmitted).toBe(0);
    expect(db._inserts).toHaveLength(1);
  });
});

describe("wiring", () => {
  it("checkins no longer emits completed_challenge", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    expect(src).not.toContain('event_type: "completed_challenge"');
  });

  it("join and starters compute end_at through enrollmentEndAt", () => {
    const join = readFileSync(resolve(__dirname, "./join-challenge.ts"), "utf8");
    const starters = readFileSync(resolve(__dirname, "../trpc/routes/starters.ts"), "utf8");
    expect(join).toContain("enrollmentEndAt");
    expect(starters).toContain("enrollmentEndAt");
  });
});

describe("applyMarkEndSeen", () => {
  it("ownership check rejects another user's enrollment", async () => {
    const db = createDb({
      ac: [
        {
          id: AC,
          user_id: OTHER,
          challenge_id: CH,
          status: "completed",
          end_at: "2026-09-19T23:59:59.999Z",
        },
      ],
      events: [],
    });
    await expect(applyMarkEndSeen(db as never, USER, [AC], NOW)).rejects.toMatchObject({
      code: "FORBIDDEN",
    } satisfies Partial<TRPCError>);
    expect(db._ac[0]?.end_seen_at).toBeUndefined();
  });
});
