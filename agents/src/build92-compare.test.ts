import { describe, expect, it } from "vitest";
import { compareTable, loops, numbers, readRunDir } from "./build92-compare";
import type { StepLog } from "./types";

const step = (screenName: string, extra: Partial<StepLog> = {}): StepLog =>
  ({ step: 1, timestamp: "2026-10-19T00:00:00Z", screen: "other", screenName, action: "tap", target: "", thought: "", confusion: "", emotion: "neutral", latencyMs: 0, error: "", shot: "", ...extra }) as StepLog;

describe("13 build 90 vs build 92 counts", () => {
  it("a loop is 3+ steps in a row on one screen, counted once per run", () => {
    expect(loops(["Home", "Home", "Home", "Home", "Discover", "Home", "Home", "Home"].map((s) => step(s)))).toBe(2);
    expect(loops(["Home", "Discover", "Home", "Discover"].map((s) => step(s)))).toBe(0);
    expect(loops([step("Home"), step("home"), step("HOME ")])).toBe(1);
  });

  it("build 90's recorded run reads as its own headline, 4 of 13 new users secured", () => {
    const dir = new URL("../../../GRIIT/docs/reports/oct-build90", import.meta.url).pathname;
    const runs = readRunDir(dir);
    if (!runs.length) return;
    const n = numbers(runs, `${dir}/spend.txt`);
    expect([n.day1Secured, n.newUsers, n.sessions]).toEqual([4, 13, 40]);
    expect(n.words).toEqual({ secured: 18, selfReported: 13, freeze: 4 });
    expect(compareTable(n, n)[2]).toContain("4 of 13 (31%)");
  });
});
