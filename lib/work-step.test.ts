import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { chromeTitle, initialStep, submitWithoutPhotoNext } from "@/lib/task-flow-state";
import {
  COUNT_HONESTY,
  COUNT_POST,
  COUNT_TYPE,
  RUN_HONESTY_GPS,
  RUN_HONESTY_TYPED,
  RUN_HONESTY_TYPED_NO_CAMERA,
  RUN_PHOTO_AFTER,
  RUN_TAKE_PHOTO,
  SESSION_HONESTY,
  TIMER_HONESTY,
  TIMER_LEAVING,
  TIMER_PHOTO_AFTER,
  countCtaEnabled,
  countCtaLabel,
  countOfLine,
  formatRunPace,
  runHonestyLine,
  runPaceLine,
  runPrimaryLabel,
  timerPostEnabled,
  timerStartLabel,
  workDoneLine,
  workStepHeader,
  workThenCamera,
} from "@/lib/work-step";

describe("count of line", () => {
  it("omits the unit word when none is set", () => {
    expect(countOfLine(0, 10, "")).toEqual({ n: "0", rest: " of 10" });
    expect(countOfLine(0, 10, "count")).toEqual({ n: "0", rest: " of 10 count" });
  });
});

describe("work step CTA labels", () => {
  it("counter logs the pending action, then Post at target", () => {
    expect(countCtaLabel(3, 8)).toBe("Log 3 of 8");
    expect(countCtaEnabled(3, 8)).toBe(false);
    expect(countCtaLabel(8, 8)).toBe(COUNT_POST);
    expect(countCtaLabel(8, 8)).toBe("Post");
    expect(countCtaEnabled(8, 8)).toBe(true);
    expect(COUNT_TYPE).toBe("Type it");
    expect(COUNT_HONESTY).toBe("Self-entered count. Nothing is checked.");
  });

  it("timer Start {mm:ss}; Post stays closed until zero", () => {
    expect(timerStartLabel(600)).toBe("Start 10:00");
    expect(timerPostEnabled(1)).toBe(false);
    expect(timerPostEnabled(0)).toBe(true);
    expect(TIMER_HONESTY).toBe("Runs on the clock. Lock the phone if you want.");
    expect(TIMER_LEAVING).toBe("Leaving the app does not stop it.");
  });
});

describe("gate-last ordering", () => {
  it("camera on counter/timer/run does the work first, then capture", () => {
    expect(initialStep("counter", ["camera"])).toBe("count");
    expect(initialStep("timer", ["camera"])).toBe("entry");
    expect(initialStep("run", ["camera"])).toBe("log");
    expect(workThenCamera("counter", ["camera"])).toBe(true);
    expect(workThenCamera("timer", ["camera"])).toBe(true);
    expect(workThenCamera("run", ["camera"])).toBe(true);
    expect(workThenCamera("check_off", ["camera"])).toBe(false);
    expect(submitWithoutPhotoNext(true)).toBe("capture");
  });
});

describe("header title", () => {
  it("names the gate when present, the type when not", () => {
    expect(workStepHeader(12, [], "timer")).toBe("Day 12 · Timer");
    expect(workStepHeader(12, ["camera"], "timer")).toBe("Day 12 · Camera");
    expect(workStepHeader(12, ["camera"], "counter")).toBe("Day 12 · Camera");
    expect(workStepHeader(1, [], "counter")).toBe("Day 1 · Counter");
    expect(workStepHeader(1, [], "run")).toBe("Day 1 · Run");
    expect(chromeTitle("timer", ["camera"])).toBe("Camera");
    expect(chromeTitle("timer")).toBe("Timer");
    expect(chromeTitle("counter")).toBe("Counter");
    expect(chromeTitle("run")).toBe("Run");
  });
});

describe("camera-after-work copy", () => {
  it("names the finished work, then the photo", () => {
    expect(workDoneLine("10:00")).toBe("10:00 done");
    expect(TIMER_PHOTO_AFTER).toBe("The photo comes after the timer");
    expect(SESSION_HONESTY).toBe("Stopping fills in the duration. The photo is still required.");
  });
});

describe("run honesty", () => {
  it("picks typed, GPS, or no-camera copy", () => {
    expect(runHonestyLine(false, true)).toBe(RUN_HONESTY_TYPED);
    expect(runHonestyLine(true, true)).toBe(RUN_HONESTY_GPS);
    expect(runHonestyLine(false, false)).toBe(RUN_HONESTY_TYPED_NO_CAMERA);
    expect(RUN_HONESTY_TYPED).toBe("You type the distance and time. The photo is what is checked.");
    expect(RUN_HONESTY_GPS).toBe("Distance and time from GPS. The photo is still required.");
    expect(RUN_HONESTY_TYPED_NO_CAMERA).toBe("You type the distance and time. Nothing is checked.");
  });

  it("does not render the no-map sentence on the manual log step", () => {
    const src = readFileSync(resolve(__dirname, "../components/task-v2/steps/LogStep.tsx"), "utf8");
    expect(src).not.toContain("There is no map in the design system");
    expect(src).toContain("runHonestyLine(fromGps, hasCamera)");
    expect(src).toContain('from "@/components/ds/TextField"');
    expect(src).not.toContain("TaskKeypad");
    expect(src).toContain('behavior="padding"');
    expect(src).toContain('keyboardShouldPersistTaps="handled"');
    expect(src).toContain("Keyboard.dismiss");
    expect(src).toContain("InputAccessoryView");
  });
});

describe("run pace line", () => {
  it("formats mm:ss per unit and names the shortfall", () => {
    expect(formatRunPace(26 * 60 + 35, 5)).toBe("5:19");
    expect(runPaceLine(5, 26 * 60 + 35, "km", 5)).toBe("5:19 per km. Target met.");
    expect(runPaceLine(4.2, 26 * 60 + 35, "km", 5)).toBe(`${formatRunPace(26 * 60 + 35, 4.2)} per km. 0.8 km short.`);
    expect(runPaceLine(null, 100, "km", 5)).toBeNull();
    const noTarget = runPaceLine(5, 26 * 60 + 35, "km", null);
    expect(noTarget).toBe("5:19 per km.");
    expect(noTarget).not.toContain("Target");
  });

  it("Take photo when Camera applies, Post when it does not", () => {
    expect(runPrimaryLabel(true)).toBe(RUN_TAKE_PHOTO);
    expect(runPrimaryLabel(false)).toBe("Post");
    expect(RUN_PHOTO_AFTER).toBe("The photo comes after the numbers");
  });
});

describe("TaskKeypad retired", () => {
  it("Count Type it and Log steps use ds/TextField", () => {
    const count = readFileSync(resolve(__dirname, "../components/task-v2/steps/CountStep.tsx"), "utf8");
    const log = readFileSync(resolve(__dirname, "../components/task-v2/steps/LogStep.tsx"), "utf8");
    expect(count).toContain('from "@/components/ds/TextField"');
    expect(count).toContain('keyboardType="number-pad"');
    expect(count).not.toContain("TaskKeypad");
    expect(log).toContain('keyboardType="decimal-pad"');
    expect(log).toContain('keyboardType="number-pad"');
  });
});
