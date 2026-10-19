import { describe, expect, it } from "vitest";
import type { Run } from "./build90";
import { daysBetween, headline, isWasted, screensCsv, socialActions } from "./build92-report";
import { localDateKey } from "./build92";
import type { AgentResult, Persona, StepLog } from "./types";

const step = (n: number, at: string, over: Partial<StepLog> = {}): StepLog => ({
  step: n,
  timestamp: at,
  screen: "home",
  route: "home",
  screenName: "Home",
  chunk: "x",
  action: "tap",
  target: "Join",
  thought: "",
  confusion: "",
  emotion: "neutral",
  latencyMs: 1000,
  error: "",
  shot: "",
  ...over,
});

const run = (steps: StepLog[], result: Partial<AgentResult> = {}): Run => ({
  steps,
  persona: { id: "p", name: "P", group: "social" } as Persona,
  result: { personaId: "p", group: "social", chunk: "social", endedAt: "2026-10-19T10:00:30.000Z", stages: [], doneTimings: [], interview: null, steps: steps.length, ...result } as AgentResult,
});

describe("12.5 screens.csv", () => {
  it("time, steps, wasted taps and stuck notes per screen", () => {
    const csv = screensCsv([
      run([
        step(1, "2026-10-19T10:00:01.000Z"),
        step(2, "2026-10-19T10:00:11.000Z", { error: "Typed text did not appear", action: "type" }),
        step(3, "2026-10-19T10:00:21.000Z", { screenName: "Profile", screen: "profile", stuck: "stuck: nothing happens" }),
      ]),
    ]).trim().split("\n");
    expect(csv[0]).toBe("persona,group,screen,visits,seconds,steps,wasted_taps,stuck_notes");
    expect(csv[1]).toBe('"p","social","Home","1","20","2","1","0"');
    expect(csv[2]).toBe('"p","social","Profile","1","1","1","1","1"');
  });

  it("refused repeats count as wasted, a clean scroll does not", () => {
    expect(isWasted(step(1, "", { action: "repeat_refused" }))).toBe(true);
    expect(isWasted(step(1, "", { action: "scroll", target: "down" }))).toBe(false);
  });
});

describe("12.5 social and day 2", () => {
  it("counts likes, double-taps, comments and profile screens from the partner's steps", () => {
    const a = socialActions(
      run(
        [
          step(1, "", { target: "Like" }),
          step(2, "", { action: "double_tap", target: "photo" }),
          step(3, "", { action: "type", target: "Add a comment", text: "nice" }),
          step(4, "", { screen: "profile", screenName: "Kim's profile", target: "Kim" }),
          step(5, "", { target: "Like", error: "action failed" }),
        ],
        { stages: ["joined"] },
      ),
    );
    expect(a).toEqual({ likes: 1, doubleTaps: 1, comments: 1, profileOpens: 1, inviteAccepted: true });
  });

  it("days between date keys and the local date key", () => {
    expect(daysBetween("2026-10-17", "2026-10-19")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-01")).toBe(1);
    expect(localDateKey(new Date(2026, 9, 19, 2, 38))).toBe("2026-10-19");
  });

  it("the headline leads with new users who secured Day 1", () => {
    const secured = run([step(1, "", { thought: "Day secured!" })]);
    const lines = headline({ firstDay: [secured, run([])], day2: [{ personaId: "d", lastSecured: "2026-10-19", securedToday: true, sawStreak: true, sawFreeze: false, missedDays: 0 }], social: [], all: [secured] });
    expect(lines[0]).toBe("New users who secured Day 1: 1 of 2.");
    expect(lines[1]).toContain("1 of 1");
  });
});
