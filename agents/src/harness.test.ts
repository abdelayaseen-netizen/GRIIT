import { readFileSync } from "node:fs";
import { resolve } from "node:path";
/**
 * Build 90 10.3: the four harness rules. On Oct 15 only 7 of 38 sessions saw onboarding and
 * 11 ended before 15 taps; the step log had no chunk, no real screen name, no Done timing.
 */
import { describe, expect, it } from "vitest";
import { otherBooted } from "./device";
import { parseDecision } from "./gate";
import { needsFreshSignup } from "./goals";
import { freezeRight, scoreInterview, securedRight, selfReportedRight, tomorrowScore } from "./interview";
import { doneMarker, isDoneTap } from "./loop";
import { MIN_STEPS, interviewPrompt, systemPrompt, userPrompt } from "./prompt";
import { classifyScreen, dayClaims, isWelcomeScreen } from "./screen";
import type { Persona, StepLog } from "./types";

const persona: Persona = {
  id: "t1",
  name: "Test",
  age: 30,
  gender: "unspecified",
  group: "first-timers",
  background: "",
  why: "",
  goals: ["Finish one task"],
  tech: "med",
  patience: 3,
  phone: "small",
  textSize: "default",
  motivation: "curious",
  english: "native",
  fresh: true,
  chunk: "2-first-day",
};

function step(n: number, extra: Partial<StepLog> = {}): StepLog {
  return {
    step: n,
    timestamp: "",
    screen: "home",
    route: "home",
    screenName: "home",
    chunk: "2-first-day",
    action: "tap",
    target: "x",
    thought: "",
    confusion: "",
    emotion: "neutral",
    latencyMs: 0,
    error: "",
    shot: "",
    ...extra,
  };
}

describe("fresh personas start at Welcome", () => {
  it("the persona decides, not the AGENTS_FRESH switch", () => {
    delete process.env.AGENTS_FRESH;
    expect(needsFreshSignup({ id: "p13", fresh: true })).toBe(true);
    expect(needsFreshSignup({ id: "p13", fresh: false })).toBe(false);
    expect(needsFreshSignup({ id: "p13" })).toBe(false);
    expect(needsFreshSignup({ id: "lowtech-01" })).toBe(true);
  });

  it("recognises the Welcome screen by Start plus the account link or the headline", () => {
    expect(isWelcomeScreen(["GRIIT", "Daily challenges you prove with a photo.", "Start", "I already have an account"])).toBe(true);
    expect(isWelcomeScreen(["Start", "I already have an account"])).toBe(true);
    expect(isWelcomeScreen(["Today", "Start"])).toBe(false);
    expect(isWelcomeScreen(["Good morning", "7K Steps", "Done"])).toBe(false);
    expect(classifyScreen(["Start", "I already have an account"])).toBe("welcome");
  });
});

describe("the 15-tap minimum", () => {
  it("is 15", () => {
    expect(MIN_STEPS).toBe(15);
  });

  it("tells the model how many actions are still owed and that done is refused until then", () => {
    const prompt = userPrompt({ persona, mode: "goal", creds: { email: "a@b.c", password: "pw", username: "u" }, lines: ["Today"], history: [step(1), step(2)], goalStatus: [], prepared: false });
    expect(prompt).toContain(`You have used 2 of the ${MIN_STEPS} actions you owe before you may stop`);
    expect(prompt).toContain("action done will be refused until then");
    const later = userPrompt({ persona, mode: "goal", creds: { email: "a@b.c", password: "pw", username: "u" }, lines: ["Today"], history: Array.from({ length: 15 }, (_, i) => step(i + 1)), goalStatus: [], prepared: false });
    expect(later).not.toContain("actions you owe");
    expect(systemPrompt()).toContain(`use at least ${MIN_STEPS} actions before action done`);
  });

  it("carries the harness note for a repeated screen", () => {
    const prompt = userPrompt({ persona, mode: "goal", creds: { email: "a@b.c", password: "pw", username: "u" }, lines: [], history: [], goalStatus: [], prepared: true, note: "The screen has not changed for 3 steps." });
    expect(prompt).toContain("Note from the test: The screen has not changed for 3 steps.");
  });
});

describe("chunk and the real screen name", () => {
  it("the model's screen name survives parsing", () => {
    const decision = parseDecision('{"screen":"Post or keep private","action":"tap","target":"Keep it private","thought":"","emotion":"neutral"}');
    expect(decision?.screen).toBe("Post or keep private");
    expect(parseDecision('{"action":"wait","target":"","thought":"","emotion":"neutral"}')?.screen).toBeUndefined();
  });

  it("the step log carries chunk and screenName and the prompt shows the real name", () => {
    const row = step(3, { screen: "other", screenName: "Day secured", chunk: "2-first-day" });
    expect(row.chunk).toBe("2-first-day");
    const prompt = userPrompt({ persona, mode: "goal", creds: { email: "a@b.c", password: "pw", username: "u" }, lines: [], history: [row], goalStatus: [], prepared: true });
    expect(prompt).toContain("3. Day secured tap x");
  });
});

describe("Done to visible", () => {
  it("knows a Done tap on a task", () => {
    expect(isDoneTap("tap", "Done", "Done")).toBe(true);
    expect(isDoneTap("tap", "Done · 7,000 steps", "")).toBe(true);
    expect(isDoneTap("tap", "Keep it private", "Keep it private")).toBe(false);
    expect(isDoneTap("scroll", "down", "")).toBe(false);
    expect(isDoneTap("tap", "Undone", "")).toBe(false);
  });

  it("sees the post-or-private sheet and the done marker", () => {
    expect(doneMarker(["Post to friends", "Keep it private"])).toEqual({ sheet: true, visible: "" });
    expect(doneMarker(["Today", "7K Steps", "1 of 1 done"])).toEqual({ sheet: false, visible: "1 of 1 done" });
    expect(doneMarker(["Day secured", "See you tomorrow"]).visible).toBe("Day secured");
    expect(doneMarker(["Walk 7,000 steps", "Done"])).toEqual({ sheet: false, visible: "" });
  });
});

describe("exit interview", () => {
  it("asks the three words and tomorrow", () => {
    const prompt = interviewPrompt(persona, [step(1, { screenName: "Welcome" })]);
    expect(prompt).toContain('"secured"');
    expect(prompt).toContain('"freeze"');
    expect(prompt).toContain('"self_reported"');
    expect(prompt).toContain("Welcome");
  });

  it("scores secured", () => {
    expect(securedRight("It means I finished every task for today so the day counts.")).toBe(true);
    expect(securedRight("All of today's tasks are done.")).toBe(true);
    expect(securedRight("Day secured means you've completed the daily challenge requirement and it's been recorded for that day.")).toBe(true);
    expect(securedRight("Day secured means you completed your daily challenge goal of no screens for 60 minutes before bed.")).toBe(false);
    expect(securedRight("It means my account is safe with a password.")).toBe(false);
    expect(securedRight("The app never explained it.")).toBe(false);
  });

  it("scores freeze", () => {
    expect(freezeRight("A freeze lets me miss a day without losing my streak.")).toBe(true);
    expect(freezeRight("A pass that keeps the streak when you skip a day.")).toBe(true);
    expect(freezeRight("A freeze can cover a missed day so you don't break your streak.")).toBe(true);
    expect(freezeRight("It pauses the timer on a task.")).toBe(false);
    expect(freezeRight("I don't know, I didn't see it.")).toBe(false);
  });

  it("scores self-reported", () => {
    expect(selfReportedRight("I mark it done myself, there is no photo proof.")).toBe(true);
    expect(selfReportedRight("The app takes my word for it.")).toBe(true);
    expect(selfReportedRight("A report I send about another user.")).toBe(false);
  });

  it("parses the model's JSON and the tomorrow number", () => {
    const scored = scoreInterview('{"secured":"every task done today","freeze":"skip a day and keep the streak","self_reported":"no photo, I just tap done","tomorrow":"7, the first task was quick"}');
    expect(scored.asked).toBe(true);
    expect(scored.securedRight).toBe(true);
    expect(scored.freezeRight).toBe(true);
    expect(scored.selfReportedRight).toBe(true);
    expect(tomorrowScore(scored.tomorrow)).toBe(7);
    expect(scoreInterview("not json").asked).toBe(false);
  });
});

describe("reading recorded runs", () => {
  it("drops the secured-day display shape from wrong numbers and keeps real mismatches", async () => {
    const { cleanTiming, isSecuredDayShape } = await import("./build90");
    expect(isSecuredDayShape("Screen said Day 1 of 7. Enrollment day is 2 (stored current_day 2).")).toBe(true);
    expect(isSecuredDayShape("Screen said Day 1 of 7. Enrollment day is 2, 2 (stored current_day 2, 2).")).toBe(true);
    expect(isSecuredDayShape("Screen said Day 3 of 7. Enrollment day is 1 (stored current_day 1).")).toBe(false);
    expect(isSecuredDayShape("Screen said Day 1 of 7. Enrollment day is 5 (stored current_day 5).")).toBe(false);
    expect(cleanTiming({ toVisibleMs: 153037, marker: "Day secured" }).toVisibleMs).toBeNull();
    expect(cleanTiming({ toVisibleMs: 2411, marker: "Day secured" }).toVisibleMs).toBe(2411);
  });
});

describe("13 day claims read only a real Day n of N", () => {
  it("Home's Today header next to its done count is not a day claim", () => {
    expect(dayClaims(["Today", "0 of 1 done"])).toEqual([]);
    expect(dayClaims(["Today 0 of 2 done"])).toEqual([]);
  });

  it("still reads the day lines the app shows", () => {
    expect(dayClaims(["Drink Water Today · Day 1 of 1", "Gym before work · Day 3 of 7"])).toEqual([
      { n: 1, total: 1 },
      { n: 3, total: 7 },
    ]);
    expect(dayClaims(["Day 1"])).toEqual([]);
  });
});

describe("12b.5 two booted simulators", () => {
  const list = (devices: { udid: string; name: string; state: string }[]) => JSON.stringify({ devices: { "iOS-26-4": devices } });
  const PM = "B6CC0160-9C9F-4D0B-840D-70D790EF7FFD";
  const SE = "575796A4-0937-4BBD-B863-5F926C173844";

  it("names the other booted simulator", () => {
    const json = list([
      { udid: PM, name: "GRIIT 16 Pro Max b92", state: "Booted" },
      { udid: SE, name: "GRIIT SE b92", state: "Booted" },
    ]);
    expect(otherBooted(json, PM)).toEqual([`GRIIT SE b92 (${SE})`]);
  });

  it("only the target booted passes", () => {
    expect(otherBooted(list([{ udid: PM, name: "PM", state: "Booted" }, { udid: SE, name: "SE", state: "Shutdown" }]), PM)).toEqual([]);
  });

  it("every Maestro session checks before it starts", () => {
    const src = readFileSync(resolve(__dirname, "./maestro.ts"), "utf8");
    expect(src).toMatch(/async start\(\) \{\s*if \(this\.proc\) return;\s*await assertOnlySimulator\(\);/);
  });
});
