import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { addCalendarDaysToDateKey } from "./date-utils";
import { enrollmentFinishNumbers } from "./enrollment-finish";

function keys(from: string, n: number): string[] {
  const out: string[] = [];
  let cur = from;
  for (let i = 0; i < n; i += 1) {
    out.push(cur);
    cur = addCalendarDaysToDateKey(cur, 1);
  }
  return out;
}

describe("enrollmentFinishNumbers", () => {
  it("counts secured days and the longest held run, not the day index", () => {
    const due = keys("2026-09-01", 30);
    const secured = [...due.slice(0, 18), ...due.slice(19, 28)];
    const frozen = [due[18] ?? ""];
    const n = enrollmentFinishNumbers({ dueDateKeys: due, securedDateKeys: secured, frozenDateKeys: frozen });
    expect(n.securedDays).toBe(27);
    expect(n.heldDays).toBe(1);
    expect(n.daysDone).toBe(28);
    expect(n.longestStreak).toBe(27);
  });

  it("ends the run on a miss, so the longest streak can be shorter than secured days", () => {
    const due = keys("2026-09-01", 30);
    const secured = [...due.slice(0, 18), ...due.slice(20, 29)];
    const n = enrollmentFinishNumbers({ dueDateKeys: due, securedDateKeys: secured, frozenDateKeys: [] });
    expect(n.securedDays).toBe(27);
    expect(n.longestStreak).toBe(18);
    expect(n.heldDays).toBe(0);
    expect(n.daysDone).toBe(27);
  });

  it("ignores a secure that is not a due day", () => {
    const n = enrollmentFinishNumbers({
      dueDateKeys: ["2026-10-02"],
      securedDateKeys: ["2026-10-01", "2026-10-02"],
      frozenDateKeys: ["2026-10-01"],
    });
    expect(n).toEqual({ securedDays: 1, longestStreak: 1, heldDays: 0, daysDone: 1 });
  });
});

describe("finishRecord query", () => {
  it("reads day_secures and freeze_uses for the enrollment", () => {
    const route = readFileSync(resolve(__dirname, "../trpc/routes/challenges.ts"), "utf8");
    expect(route).toContain("finishRecord:");
    expect(route).toContain('from("day_secures")');
    expect(route).toContain('from("freeze_uses")');
    expect(route).toContain("enrollmentFinishNumbers");
  });
});
