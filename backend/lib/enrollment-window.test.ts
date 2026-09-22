import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { applyEnrollmentWindow } from "./enrollment-window";

type Row = {
  id: string;
  user_id: string;
  status: string;
  start_at: string;
  end_at: string;
};

const USER = "11111111-1111-4111-8111-111111111111";
const NOW = new Date();
const day = 24 * 60 * 60 * 1000;

const ENDED: Row = {
  id: "ac-ended",
  user_id: USER,
  status: "active",
  start_at: new Date(NOW.getTime() - 2 * day).toISOString(),
  end_at: new Date(NOW.getTime() - day).toISOString(),
};

const IN_WINDOW: Row = {
  id: "ac-live",
  user_id: USER,
  status: "active",
  start_at: new Date(NOW.getTime() - day).toISOString(),
  end_at: new Date(NOW.getTime() + 30 * day).toISOString(),
};

const NOT_STARTED: Row = {
  id: "ac-future",
  user_id: USER,
  status: "active",
  start_at: new Date(NOW.getTime() + day).toISOString(),
  end_at: new Date(NOW.getTime() + 31 * day).toISOString(),
};

const ABANDONED: Row = {
  id: "ac-left",
  user_id: USER,
  status: "abandoned",
  start_at: new Date(NOW.getTime() - day).toISOString(),
  end_at: new Date(NOW.getTime() + 30 * day).toISOString(),
};

function filterRows(rows: Row[], now: Date = NOW): Row[] {
  const filters: { col: keyof Row; op: "eq" | "lte" | "gte"; val: string }[] = [];
  const query = {
    eq(col: string, val: string) {
      filters.push({ col: col as keyof Row, op: "eq", val });
      return query;
    },
    lte(col: string, val: string) {
      filters.push({ col: col as keyof Row, op: "lte", val });
      return query;
    },
    gte(col: string, val: string) {
      filters.push({ col: col as keyof Row, op: "gte", val });
      return query;
    },
  };
  applyEnrollmentWindow(query, now);
  return rows.filter((row) =>
    filters.every((f) => {
      const cell = row[f.col];
      if (f.op === "eq") return cell === f.val;
      if (f.op === "lte") return cell <= f.val;
      return cell >= f.val;
    }),
  );
}

describe("applyEnrollmentWindow", () => {
  it("keeps an in-window active enrollment and drops one past end_at", () => {
    const kept = filterRows([ENDED, IN_WINDOW, NOT_STARTED, ABANDONED]);
    expect(kept.map((r) => r.id)).toEqual(["ac-live"]);
  });

  it("does not count an ended enrollment toward the free-tier limit", () => {
    expect(filterRows([ENDED, IN_WINDOW, IN_WINDOW]).length).toBe(2);
    expect(filterRows([ENDED, ENDED, ENDED]).length).toBe(0);
    expect(filterRows([IN_WINDOW, IN_WINDOW, IN_WINDOW]).length).toBe(3);
  });

  it("is the helper listMyActive, the free-tier counts, and the join guard call", () => {
    const list = readFileSync(resolve(__dirname, "../trpc/routes/challenges.ts"), "utf8");
    const join = readFileSync(resolve(__dirname, "../trpc/routes/challenges-join.ts"), "utf8");
    const create = readFileSync(resolve(__dirname, "../trpc/routes/challenges-create.ts"), "utf8");
    const direct = readFileSync(resolve(__dirname, "./join-challenge.ts"), "utf8");
    const home = readFileSync(resolve(__dirname, "../trpc/routes/home.ts"), "utf8");
    const record = readFileSync(resolve(__dirname, "../trpc/routes/profiles-record.ts"), "utf8");
    const stats = readFileSync(resolve(__dirname, "../trpc/routes/profiles-stats.ts"), "utf8");
    const profiles = readFileSync(resolve(__dirname, "../trpc/routes/profiles.ts"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    expect(list).toContain("applyEnrollmentWindow");
    expect(list).toContain("listMyActive");
    expect(join).toContain("applyEnrollmentWindow");
    expect(create).toContain("applyEnrollmentWindow");
    expect(direct).toContain("applyEnrollmentWindow");
    expect(home).toContain("challenges.listMyActive()");
    expect(record).not.toContain("applyEnrollmentWindow");
    expect(stats).toContain("applyEnrollmentWindow");
    expect(profiles).toContain("applyEnrollmentWindow");
    expect(feed).toContain("applyEnrollmentWindow");
  });
});
