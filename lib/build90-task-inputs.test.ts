import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { countJournalWords } from "@/backend/lib/journal-verification";
import { counterDoneEnabled, counterDoneLabel } from "@/lib/counter";
import {
  LOG_SANITY_EDIT,
  LOG_SANITY_MESSAGE,
  LOG_SANITY_SAVE_ANYWAY,
  LOG_SANITY_TITLE,
  WORKOUT_TYPES,
  cyclingSpeedCheck,
  logReady,
  logSanityCheck,
  resolveLogKind,
  runPaceCheck,
  wordCount,
  workoutDistanceField,
  workoutMinimumLine,
} from "@/lib/task-flow-state";
import { runPaceLine } from "@/lib/work-step";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("03.1 workout is not a run", () => {
  it("a pack workout stored as run + tracking_mode time opens the workout log", () => {
    expect(
      resolveLogKind({ taskType: "run", taskName: "Workout", trackingMode: "time", unit: "minutes", targetValue: null }),
    ).toBe("workout");
    expect(resolveLogKind({ taskType: "workout", taskName: "Gym", trackingMode: null, unit: null, targetValue: null })).toBe(
      "workout",
    );
    expect(
      resolveLogKind({ taskType: "run", taskName: "Morning run", trackingMode: "distance", unit: "miles", targetValue: 3 }),
    ).toBe("run");
    // A timed run keeps distance and duration.
    expect(
      resolveLogKind({ taskType: "run", taskName: "Morning run", trackingMode: "time", unit: "minutes", targetValue: null }),
    ).toBe("run");
    // Older rows with no tracking mode fall back to the name.
    expect(resolveLogKind({ taskType: "run", taskName: "Gym session", trackingMode: null, unit: null, targetValue: null })).toBe(
      "workout",
    );
    expect(resolveLogKind({ taskType: "run", taskName: "5K", trackingMode: null, unit: null, targetValue: null })).toBe("run");
  });

  it("workout chips are the seven activity types and distance only shows for Cycling and Swim", () => {
    expect(WORKOUT_TYPES).toEqual(["Strength", "Basketball", "Swim", "Cycling", "Yoga", "Sports", "Other"]);
    expect(workoutDistanceField("Cycling")).toBe("optional");
    expect(workoutDistanceField("Swim")).toBe("optional");
    for (const k of ["Strength", "Basketball", "Yoga", "Sports", "Other", ""]) {
      expect(workoutDistanceField(k)).toBe("none");
    }
  });

  it("the minimum is plain words", () => {
    expect(workoutMinimumLine(30)).toBe("30 min minimum");
    expect(workoutMinimumLine(1)).toBe("1 min minimum");
    expect(workoutMinimumLine(0)).toBeNull();
  });

  it("a workout needs a type and minutes at or above the floor; distance is optional", () => {
    const base = { taskType: "workout", distance: null, durationSec: null, minDurationMinutes: 30 };
    expect(logReady({ ...base, workoutMin: 30, kind: "" })).toBe(false);
    expect(logReady({ ...base, workoutMin: 29, kind: "Strength" })).toBe(false);
    expect(logReady({ ...base, workoutMin: 30, kind: "Strength" })).toBe(true);
    expect(logReady({ ...base, workoutMin: 30, kind: "Cycling", distance: null })).toBe(true);
  });

  it("LogStep renders the workout chips and the config param carries tracking_mode and unit", () => {
    const log = read("components/task-v2/steps/LogStep.tsx");
    expect(log).not.toContain('"Lift"');
    expect(log).toContain("WORKOUT_TYPES");
    expect(log).toContain("workoutDistanceField");
    expect(log).toContain("workoutMinimumLine");
    const param = read("lib/build-task-config-param.ts");
    expect(param).toContain("tracking_mode:");
    expect(param).toContain("unit:");
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    expect(flow).toContain("resolveLogKind(");
    expect(flow).not.toContain('useState("Lift")');
  });
});

describe("03.2 sanity checks", () => {
  it("run pace faster than 4:30 per mile or slower than 30:00 per mile looks off", () => {
    // 3 mi in 12:50 (Yaseen's case) is 4:17 per mile.
    expect(runPaceCheck(3, 12 * 60 + 50, "mi").ok).toBe(false);
    // Edge values per mile.
    expect(runPaceCheck(3, 3 * 270, "mi").ok).toBe(true); // 4:30 exactly
    expect(runPaceCheck(3, 3 * 269, "mi").ok).toBe(false); // 4:29
    expect(runPaceCheck(1, 1800, "mi").ok).toBe(true); // 30:00 exactly
    expect(runPaceCheck(1, 1801, "mi").ok).toBe(false); // 30:01
    // km converts to miles before the check.
    expect(runPaceCheck(5, 14 * 60, "km").ok).toBe(true); // 4:30.4 per mile
    expect(runPaceCheck(5, 13 * 60 + 55, "km").ok).toBe(false); // 4:28.8 per mile
    expect(runPaceCheck(1, 1118, "km").ok).toBe(true); // 29:59 per mile
    expect(runPaceCheck(1, 1119, "km").ok).toBe(false); // 30:00.4 per mile
    expect(runPaceCheck(null, 1119, "km").ok).toBe(true); // nothing to check yet
  });

  it("cycling faster than 35 mph average looks off", () => {
    expect(cyclingSpeedCheck(35, 3600, "mi").ok).toBe(true);
    expect(cyclingSpeedCheck(35.01, 3600, "mi").ok).toBe(false);
    expect(cyclingSpeedCheck(56, 3600, "km").ok).toBe(true); // 34.8 mph
    expect(cyclingSpeedCheck(57, 3600, "km").ok).toBe(false); // 35.4 mph
    expect(cyclingSpeedCheck(null, 3600, "mi").ok).toBe(true);
  });

  it("the check speaks the one sentence, with Edit and Save anyway", () => {
    expect(LOG_SANITY_TITLE).toBe("That pace looks off.");
    expect(LOG_SANITY_MESSAGE).toBe("Check your distance and time.");
    expect(LOG_SANITY_EDIT).toBe("Edit");
    expect(LOG_SANITY_SAVE_ANYWAY).toBe("Save anyway");
    expect(logSanityCheck({ logKind: "run", kind: "", distance: 3, durationSec: 770, unit: "mi" }).ok).toBe(false);
    expect(logSanityCheck({ logKind: "workout", kind: "Cycling", distance: 40, durationSec: 3600, unit: "mi" }).ok).toBe(false);
    expect(logSanityCheck({ logKind: "workout", kind: "Strength", distance: null, durationSec: null, unit: "mi" }).ok).toBe(true);
    expect(logSanityCheck({ logKind: "workout", kind: "Swim", distance: 40, durationSec: 3600, unit: "mi" }).ok).toBe(true);
  });

  it("never says Target met before the check-in is saved", () => {
    expect(runPaceLine(5, 26 * 60 + 35, "km", 5)).not.toContain("Target met");
    expect(read("components/task-v2/steps/CountStep.tsx")).not.toContain("Target met");
    expect(read("lib/work-step.ts")).not.toContain("Target met");
    const flow = read("components/task-v2/TaskFlowV2.tsx");
    expect(flow).toContain("LOG_SANITY_SAVE_ANYWAY");
    expect(flow).toContain("LOG_SANITY_EDIT");
  });
});

describe("03.3 journal counts real words", () => {
  it("'....' scores 0", () => {
    expect(countJournalWords("....")).toBe(0);
    expect(wordCount("....")).toBe(0);
  });

  it("'my my my my my my' scores 3", () => {
    expect(countJournalWords("my my my my my my")).toBe(3);
    expect(wordCount("my my my my my my")).toBe(3);
    expect(countJournalWords("My MY my, my! my. my")).toBe(3);
  });

  it("a normal 20-word sentence scores 20", () => {
    const s =
      "Today we walked to the park, read two chapters of my book, and called my mother before dinner was ready.";
    expect(s.split(/\s+/).length).toBe(20);
    expect(countJournalWords(s)).toBe(20);
    expect(wordCount(s)).toBe(20);
  });

  it("'I went to a park' counts 5 (client and server)", () => {
    expect(countJournalWords("I went to a park")).toBe(5);
    expect(wordCount("I went to a park")).toBe(5);
    expect(countJournalWords("i went to A park.")).toBe(5);
    // Only "I" and "a" get the pass; other single letters still count 0.
    expect(countJournalWords("b c d e")).toBe(0);
    // The repeat cap still applies to them.
    expect(countJournalWords("a a a a a")).toBe(3);
  });

  it("a word needs two letters", () => {
    expect(countJournalWords("x y z q")).toBe(0);
    expect(countJournalWords("I'm ok")).toBe(2);
    expect(countJournalWords("1234 5678")).toBe(0);
    expect(countJournalWords("")).toBe(0);
    expect(countJournalWords("   ")).toBe(0);
  });

  it("client and server share the rule", () => {
    const state = read("lib/task-flow-state.ts");
    expect(state).toContain('from "@/backend/lib/journal-verification"');
    const checkins = read("backend/trpc/routes/checkins.ts");
    expect(checkins).toContain("countJournalWords(");
    expect(checkins).not.toContain("split(/\\s+/).filter(Boolean)");
  });

  it("the editor keeps the first line clear of the word bar", () => {
    const write = read("components/task-v2/steps/WriteStep.tsx");
    const editor = write.slice(write.indexOf("editor: {"), write.indexOf("footer: {"));
    expect(editor).toContain("paddingTop:");
    expect(editor).toContain("minHeight:");
    expect(editor).not.toContain("padding: 0");
    // The title folds while the keyboard is up so the editor keeps three lines.
    expect(write).toContain("keyboardWillShow");
    expect(write).toContain("keyboardUp ? null :");
  });
});

describe("03.4 counter units", () => {
  it("Done cannot finish below target; the button says what is left", () => {
    expect(counterDoneEnabled(0, 30)).toBe(false);
    expect(counterDoneEnabled(29, 30)).toBe(false);
    expect(counterDoneEnabled(30, 30)).toBe(true);
    expect(counterDoneEnabled(31, 30)).toBe(true);
    expect(counterDoneLabel(0, 30, "pages")).toBe("30 pages left");
    expect(counterDoneLabel(8, 30, "pages")).toBe("22 pages left");
    expect(counterDoneLabel(29, 30, "pages")).toBe("1 pages left");
    expect(counterDoneLabel(30, 30, "pages")).toBe("Done · 30 pages");
    expect(counterDoneLabel(2, 8, "")).toBe("6 left");
  });

  it("the flow submits the counted value, not the goal", () => {
    const flow = read("components/task-v2/useTaskFlowV2.ts");
    const complete = flow.slice(flow.indexOf("onCompleteCount:"), flow.indexOf("onDidIt:"));
    expect(complete).not.toContain("value: counterGoal");
    expect(complete).not.toContain("setCount(counterGoal)");
    const step = read("components/task-v2/steps/CountStep.tsx");
    expect(step).toContain("counterDoneEnabled");
    expect(step).toContain("counterDoneLabel");
  });
});
