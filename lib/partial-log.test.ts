/**
 * Build 92 chunk 03: task inputs and partial logs.
 * Part 1 checklist lines 146–152; copy rows Counter, Run, Partial, Short toast, Home row.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { counterDoneEnabled, counterDoneLabel, counterGoalLine, step } from "@/lib/counter";
import {
  formatDurationInput,
  formatKeypadBuffer,
  KEYPAD_MAX,
  parseDurationInput,
  parseKeypadBuffer,
} from "@/lib/keypad-masks";
import { LOG_SANITY_MESSAGE, LOG_SANITY_TITLE, RUN_PACE_FAST_SEC_PER_MI, runPaceCheck, runPaceTooFast } from "@/lib/task-flow-state";
import {
  dayTotal,
  homePartialLine,
  parseHms,
  partialLogTotal,
  shortOfGoal,
  shortSaveLabel,
  shortToast,
  soFarLine,
  WONT_COUNT_NOTE,
} from "@/lib/partial-log";

const read = (p: string) => readFileSync(p, "utf8");

describe("03.1 counter past the goal", () => {
  it("+/− keep working past the goal and nothing caps the count", () => {
    expect(step(9, 1, 10)).toBe(10);
    expect(step(10, 1, 10)).toBe(11);
    expect(step(10, 10, 10)).toBe(20);
    expect(step(1, -1, 10)).toBe(0);
    expect(step(0, -1, 10)).toBe(0);
  });

  it("says Goal reached at the goal and what is left under it", () => {
    expect(counterGoalLine(10, 10)).toEqual({ reached: true, line: "Goal reached. Done saves it." });
    expect(counterGoalLine(12, 10)).toEqual({ reached: true, line: "Goal reached. Done saves it." });
    expect(counterGoalLine(7, 10)).toEqual({ reached: false, line: "3 to go." });
    expect(counterGoalLine(0, 10)).toEqual({ reached: false, line: "10 to go." });
  });

  it("the footer is Done at the goal and a short save under it", () => {
    expect(counterDoneLabel(12, 10, "pages")).toBe("Done · 10 pages");
    expect(counterDoneLabel(10, 10, "pages")).toBe("Done · 10 pages");
    expect(counterDoneLabel(4, 10, "pages")).toBe("Save 4 · won't count today");
    expect(counterDoneLabel(0, 10, "pages")).toBe("Save 0 · won't count today");
    expect(counterDoneEnabled(0, 10)).toBe(false);
    expect(counterDoneEnabled(4, 10)).toBe(true);
    expect(counterDoneEnabled(12, 10)).toBe(true);
  });

  it("the Count step no longer disables or dims the add buttons and shows the goal line", () => {
    const s = read("components/task-v2/steps/CountStep.tsx");
    expect(s).not.toContain("disabled={atTarget}");
    expect(s).not.toContain("styles.dim");
    expect(s).not.toContain("Math.min(counterGoal");
    expect(s).toContain("counterGoalLine(");
    expect(s).toContain('testID="count-goal-check"');
    expect(s).toContain("onSaveShort");
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    expect(hook).not.toContain("setCount(Math.min(counterGoal");
  });
});

describe("03.2 run time takes h:mm:ss", () => {
  it("parses h:mm:ss and mm:ss strings", () => {
    expect(parseHms("1:05:00")).toBe(3900);
    expect(parseHms("27:41")).toBe(27 * 60 + 41);
    expect(parseHms("0:45")).toBe(45);
    expect(parseHms("x")).toBeNull();
  });

  it("the duration keypad takes six digits and formats hours past four", () => {
    expect(KEYPAD_MAX.duration).toBe(6);
    expect(formatKeypadBuffer("2741", "duration")).toBe("27:41");
    expect(parseKeypadBuffer("2741", "duration")).toBe(27 * 60 + 41);
    expect(formatKeypadBuffer("10500", "duration")).toBe("1:05:00");
    expect(parseKeypadBuffer("10500", "duration")).toBe(3900);
    expect(formatDurationInput("123456")).toBe("12:34:56");
    expect(parseDurationInput("123456")).toBe(12 * 3600 + 34 * 60 + 56);
    const s = read("components/task-v2/steps/LogStep.tsx");
    expect(s).toContain("h:mm:ss");
    expect(s).not.toContain(">mm:ss<");
  });
});

describe("03.3 impossible pace", () => {
  it("faster than 3:30 per mile blocks; 3:30 passes; km converts", () => {
    expect(RUN_PACE_FAST_SEC_PER_MI).toBe(210);
    expect(runPaceTooFast(3, 3 * 210, "mi")).toBe(false);
    expect(runPaceTooFast(3, 3 * 209, "mi")).toBe(true);
    expect(runPaceTooFast(1, 10, "mi")).toBe(true);
    expect(runPaceTooFast(5, 17 * 60, "km")).toBe(false); // 5:28 per mile
    expect(runPaceTooFast(5, 10 * 60, "km")).toBe(true); // 3:13 per mile
    expect(runPaceTooFast(null, 10, "mi")).toBe(false);
    expect(runPaceCheck(3, 12 * 60 + 50, "mi").ok).toBe(true); // 4:17 is a fast real run now
    expect(`${LOG_SANITY_TITLE} ${LOG_SANITY_MESSAGE}`).toBe("That pace looks off. Check the distance and time.");
  });

  it("the Log step shows the line inline and disables Done", () => {
    const s = read("components/task-v2/steps/LogStep.tsx");
    expect(s).toContain("runPaceTooFast(");
    expect(s).toContain('testID="log-pace-error"');
    expect(s).toMatch(/disabled=\{!ready \|\| paceOff/);
  });
});

describe("03.4 short of the goal", () => {
  it("says how short before Done and what the save does", () => {
    expect(shortOfGoal(2, 3, "mi")).toEqual({ done: "2 of 3 mi", short: "1 mi short" });
    expect(shortOfGoal(1.5, 3, "mi")).toEqual({ done: "1.5 of 3 mi", short: "1.5 mi short" });
    expect(shortOfGoal(3, 3, "mi")).toBeNull();
    expect(shortOfGoal(4, 3, "mi")).toBeNull();
    expect(WONT_COUNT_NOTE(3, "mi")).toBe(
      "Today won't count toward the 3 mi goal. The run is saved, the task stays open and today isn't secured.",
    );
    expect(shortSaveLabel("2 mi")).toBe("Save 2 mi · won't count today");
    expect(shortSaveLabel("4")).toBe("Save 4 · won't count today");
    expect(shortToast("Run", "1 mi")).toBe("Run saved. 1 mi short, so today isn't secured yet.");
    expect(shortToast("Count", "6 pages")).toBe("Count saved. 6 pages short, so today isn't secured yet.");
  });

  it("the short save goes through saveProgress, never complete", () => {
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    const short = hook.slice(hook.indexOf("const onSaveShort"), hook.indexOf("const onPostRun"));
    expect(short).toContain("TRPC.checkins.saveProgress");
    expect(short).not.toContain("TRPC.checkins.complete");
    expect(short).toContain("shortToast(");
    expect(short).toContain("returnToOrigin()");
    const s = read("components/task-v2/steps/LogStep.tsx");
    expect(s).toContain("shortOfGoal(");
    expect(s).toContain("shortSaveLabel(");
    expect(s).toContain("WONT_COUNT_NOTE(");
  });
});

describe("03.5 partial logs add up", () => {
  it("sums the logs of one local day and resets on the next", () => {
    const logs = [
      { value: 2, localDate: "2026-10-18" },
      { value: 1, localDate: "2026-10-18" },
      { value: 5, localDate: "2026-10-17" },
    ];
    expect(dayTotal(logs, "2026-10-18")).toBe(3);
    expect(dayTotal(logs, "2026-10-19")).toBe(0);
  });

  it("reads so far until the goal, then the goal", () => {
    expect(soFarLine(2, 3, "mi")).toBe("2 of 3 mi so far");
    expect(soFarLine(2, 3, "mi", true)).toBe("2 of 3 mi so far today");
    expect(soFarLine(3, 3, "mi")).toBe("3 of 3 mi");
    expect(soFarLine(3.5, 3, "mi")).toBe("3 of 3 mi");
    expect(partialLogTotal(2, 1)).toBe(3);
    expect(partialLogTotal(2, null)).toBe(2);
    expect(partialLogTotal(0.1, 0.2)).toBe(0.3);
    expect(homePartialLine(2, 3, "mi")).toBe("2 of 3 mi logged");
    expect(homePartialLine(0, 3, "mi")).toBeNull();
  });

  it("the Log step shows today's total and the hook hydrates today's pending row", () => {
    const s = read("components/task-v2/steps/LogStep.tsx");
    expect(s).toContain("soFarLine(");
    expect(s).toContain('testID="log-so-far"');
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    expect(hook).toContain("TRPC.checkins.getTodayCheckins");
    expect(hook).toContain("partial_logs");
    const server = read("backend/trpc/routes/checkins.ts");
    expect(server).toContain('mode: z.enum(["set", "add"])');
    expect(server).toContain("decidePartialLogWrite(");
    const forUser = server.slice(server.indexOf("getTodayCheckinsForUser:"), server.indexOf("secureDay:"));
    expect(forUser).toContain("status, value, proof_payload_json, proof_url");
  });
});
