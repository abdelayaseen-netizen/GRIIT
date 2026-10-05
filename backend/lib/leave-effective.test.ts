import { describe, expect, it } from "vitest";
import { applyScheduledLeaves } from "./daily-reset";
import { leaveHasPassed, nextLocalMidnightIso } from "./leave-effective";

const NY = "America/New_York";

describe("nextLocalMidnightIso", () => {
  it("is the next UTC midnight in UTC", () => {
    expect(nextLocalMidnightIso(new Date("2026-10-04T22:00:00.000Z"), "UTC")).toBe(
      "2026-10-05T00:00:00.000Z",
    );
  });

  it("is local midnight, not UTC midnight", () => {
    expect(nextLocalMidnightIso(new Date("2026-10-05T03:00:00.000Z"), NY)).toBe(
      "2026-10-05T04:00:00.000Z",
    );
  });
});

describe("leaveHasPassed", () => {
  it("waits through the evening even after the UTC date has rolled", () => {
    expect(
      leaveHasPassed({
        leaveEffectiveAt: "2026-10-05T04:00:00.000Z",
        now: new Date("2026-10-05T03:30:00.000Z"),
        timeZone: NY,
      }),
    ).toBe(false);
  });

  it("is true at that local midnight", () => {
    expect(
      leaveHasPassed({
        leaveEffectiveAt: "2026-10-05T04:00:00.000Z",
        now: new Date("2026-10-05T04:00:00.000Z"),
        timeZone: NY,
      }),
    ).toBe(true);
  });
});

describe("applyScheduledLeaves", () => {
  it("abandons only memberships whose local midnight has passed", async () => {
    const rows = [
      {
        id: "due",
        user_id: "u1",
        status: "active",
        leave_effective_at: "2026-10-05T04:00:00.000Z",
        ended_at: null as string | null,
        end_seen_at: null as string | null,
      },
      {
        id: "later",
        user_id: "u1",
        status: "active",
        leave_effective_at: "2026-10-06T04:00:00.000Z",
        ended_at: null as string | null,
        end_seen_at: null as string | null,
      },
    ];
    const supabase = {
      from(table: string) {
        if (table === "profiles") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { timezone: NY, reminder_timezone: null },
                    error: null,
                  }),
              }),
            }),
          };
        }
        const filters: { col: string; val: unknown }[] = [];
        const chain: Record<string, unknown> = {
          select: () => chain,
          eq: (col: string, val: unknown) => {
            filters.push({ col, val });
            return chain;
          },
          not: () => chain,
          update: (payload: Record<string, unknown>) => {
            chain._payload = payload;
            return chain;
          },
          then: (ok: (v: unknown) => unknown, err?: (e: unknown) => unknown) => {
            const payload = chain._payload as Record<string, unknown> | undefined;
            const matched = rows.filter((row) =>
              filters.every((f) => (row as Record<string, unknown>)[f.col] === f.val),
            );
            if (payload) {
              for (const row of matched) Object.assign(row, payload);
              chain._payload = undefined;
            }
            return Promise.resolve({ data: matched, error: null }).then(ok, err);
          },
        };
        return chain;
      },
    };

    const result = await applyScheduledLeaves(
      supabase as never,
      new Date("2026-10-05T04:00:00.000Z"),
    );
    expect(result.errors).toEqual([]);
    expect(result.applied).toBe(1);
    expect(rows[0]?.status).toBe("abandoned");
    expect(rows[0]?.ended_at).toBe("2026-10-05T04:00:00.000Z");
    expect(rows[1]?.status).toBe("active");
    expect(rows[1]?.ended_at).toBeNull();
  });
});
