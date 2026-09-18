import { describe, expect, it } from "vitest";
import { chromeTitle, initialStep, submitWithoutPhotoNext } from "@/lib/task-flow-state";
import {
  COUNT_HONESTY,
  COUNT_POST,
  COUNT_TYPE,
  SESSION_HONESTY,
  TIMER_HONESTY,
  TIMER_LEAVING,
  TIMER_PHOTO_AFTER,
  countCtaEnabled,
  countCtaLabel,
  timerPostEnabled,
  timerStartLabel,
  workDoneLine,
  workStepHeader,
  workThenCamera,
} from "@/lib/work-step";

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
