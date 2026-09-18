import { describe, expect, it } from "vitest";
import {
  blockedEyebrow,
  checkinGpsNextStep,
  checkinReady,
  chromeFlags,
  chromeTitle,
  clockLabel,
  countReady,
  discardPhotoStep,
  finishSubmitOutcome,
  fmtMmSs,
  flowOpensCamera,
  initialStep,
  isHonest,
  journalReady,
  logReady,
  resolveGoBack,
  resolveGoBackFromFailure,
  resolveRetryFailedSubmit,
  shouldBlockOnWindow,
  submitWithoutPhotoNext,
  timerResumeStep,
  timerShouldAutoSubmit,
  verificationKindFor,
  verifyingLine,
  wordCount,
} from "@/lib/task-flow-state";

describe("initialStep", () => {
  it("maps each task type to its entry step", () => {
    expect(initialStep("photo")).toBe("capture");
    expect(initialStep("timer")).toBe("entry");
    expect(initialStep("checkin")).toBe("entry");
    expect(initialStep("run")).toBe("log");
    expect(initialStep("workout")).toBe("log");
    expect(initialStep("journal")).toBe("write");
    expect(initialStep("counter")).toBe("count");
    expect(initialStep("water")).toBe("count");
    expect(initialStep("reading")).toBe("count");
    expect(initialStep("manual")).toBe("ask");
    expect(initialStep("simple")).toBe("ask");
    expect(initialStep("check_off")).toBe("ask");
    expect(initialStep("unknown")).toBe("ask");
  });

  it("a task with gates [\"camera\"] never enters AskStep", () => {
    expect(initialStep("check_off", ["camera"])).toBe("capture");
    expect(initialStep("manual", ["camera"])).toBe("capture");
    expect(initialStep("simple", ["camera"])).toBe("capture");
    expect(initialStep("check_off", ["camera"])).not.toBe("ask");
    expect(initialStep("counter", ["camera"])).toBe("count");
  });
});

describe("flowOpensCamera", () => {
  it("reads the normalized gates array and nothing else", () => {
    expect(flowOpensCamera(["camera"])).toBe(true);
    expect(flowOpensCamera(["time", "camera"])).toBe(true);
    expect(flowOpensCamera([])).toBe(false);
    expect(flowOpensCamera(["time"])).toBe(false);
    expect(flowOpensCamera(["location"])).toBe(false);
  });
});

describe("chromeTitle", () => {
  it("uses the TaskFlowV2 labels", () => {
    expect(chromeTitle("photo")).toBe("Photo proof");
    expect(chromeTitle("water")).toBe("Counter");
    expect(chromeTitle("reading")).toBe("Counter");
    expect(chromeTitle("counter")).toBe("Counter");
    expect(chromeTitle("simple")).toBe("Self-report");
    expect(chromeTitle("manual")).toBe("Self-report");
    expect(chromeTitle("timer")).toBe("Timer");
    expect(chromeTitle("run")).toBe("Run");
    expect(chromeTitle("journal")).toBe("Journal");
    expect(chromeTitle("check_off", ["camera"])).toBe("Camera");
    expect(chromeTitle("manual", ["camera"])).toBe("Camera");
    expect(chromeTitle("check_off")).toBe("Self-report");
  });
});

describe("fmtMmSs", () => {
  it("zero-pads minutes and seconds and floors", () => {
    expect(fmtMmSs(0)).toBe("00:00");
    expect(fmtMmSs(9)).toBe("00:09");
    expect(fmtMmSs(60)).toBe("01:00");
    expect(fmtMmSs(600)).toBe("10:00");
    expect(fmtMmSs(-3)).toBe("00:00");
    expect(fmtMmSs(61.9)).toBe("01:01");
  });
});

describe("clockLabel", () => {
  it("formats en-US hour:minute", () => {
    expect(clockLabel("2026-01-15T18:02:00.000Z")).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
    expect(clockLabel(Date.parse("2026-01-15T18:02:00.000Z"))).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
  });
});

describe("wordCount", () => {
  it("counts trimmed words; empty and whitespace are 0", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount("one")).toBe(1);
    expect(wordCount("one two three")).toBe(3);
    expect(wordCount("  a   b  ")).toBe(2);
  });
});

describe("isHonest", () => {
  it("self-report types are never honest; reading is honest only with a photo", () => {
    expect(isHonest("manual", true)).toBe(false);
    expect(isHonest("simple", false)).toBe(false);
    expect(isHonest("counter", true)).toBe(false);
    expect(isHonest("water", false)).toBe(false);
    expect(isHonest("reading", false)).toBe(false);
    expect(isHonest("reading", true)).toBe(true);
    expect(isHonest("photo", false)).toBe(true);
    expect(isHonest("timer", false)).toBe(true);
    expect(isHonest("journal", false)).toBe(true);
  });
});

describe("verificationKindFor", () => {
  it("matches the submit kind TaskFlowV2 sends", () => {
    expect(verificationKindFor("photo", false)).toBe("live_photo");
    expect(verificationKindFor("reading", true)).toBe("live_photo");
    expect(verificationKindFor("reading", false)).toBe("self_report");
    expect(verificationKindFor("run", false)).toBe("live_photo");
    expect(verificationKindFor("workout", true)).toBe("live_photo");
    expect(verificationKindFor("timer", false)).toBe("timer");
    expect(verificationKindFor("checkin", false)).toBe("gps");
    expect(verificationKindFor("journal", false)).toBe("word_count");
    expect(verificationKindFor("manual", false)).toBe("self_report");
    expect(verificationKindFor("water", false)).toBe("self_report");
  });
});

describe("chromeFlags", () => {
  it("dark on capture/review; hide chrome on confirmation/challenge_done/verifying/capture", () => {
    expect(chromeFlags("write")).toEqual({ dark: false, hideChrome: true });
    expect(chromeFlags("capture")).toEqual({ dark: true, hideChrome: true });
    expect(chromeFlags("review")).toEqual({ dark: true, hideChrome: false });
    expect(chromeFlags("verifying")).toEqual({ dark: false, hideChrome: true });
    expect(chromeFlags("confirmation")).toEqual({ dark: false, hideChrome: true });
    expect(chromeFlags("challenge_done")).toEqual({ dark: false, hideChrome: true });
    expect(chromeFlags("day_open")).toEqual({ dark: false, hideChrome: true });
    expect(chromeFlags("entry")).toEqual({ dark: false, hideChrome: false });
    expect(chromeFlags("failed")).toEqual({ dark: false, hideChrome: false });
    expect(chromeFlags("window_closed")).toEqual({ dark: false, hideChrome: true });
  });
});

describe("shouldBlockOnWindow", () => {
  it("blocks photo tasks or any capture step when the window is closed", () => {
    expect(shouldBlockOnWindow({ windowStatus: "out_of_window", taskType: "photo", step: "entry" })).toBe(true);
    expect(shouldBlockOnWindow({ windowStatus: "out_of_window", taskType: "journal", step: "capture" })).toBe(true);
    expect(shouldBlockOnWindow({ windowStatus: "out_of_window", taskType: "journal", step: "write" })).toBe(false);
    expect(shouldBlockOnWindow({ windowStatus: "open", taskType: "photo", step: "capture" })).toBe(false);
  });
});

describe("checkinGpsNextStep", () => {
  it("blocks outside the radius; otherwise returns entry for checkin", () => {
    expect(checkinGpsNextStep(80, 50, "checkin")).toBe("blocked");
    expect(checkinGpsNextStep(50, 50, "checkin")).toBe("entry");
    expect(checkinGpsNextStep(10, 50, "checkin")).toBe("entry");
    expect(checkinGpsNextStep(10, 50, "photo")).toBe(null);
  });
});

describe("timer resume and auto-submit", () => {
  it("restores running so Post can open at zero", () => {
    expect(timerResumeStep(0)).toBe("running");
    expect(timerResumeStep(-1)).toBe("running");
    expect(timerResumeStep(1)).toBe("running");
  });

  it("does not auto-submit; Post opens when remaining is zero", () => {
    expect(timerShouldAutoSubmit("running", 0, true)).toBe(false);
    expect(timerShouldAutoSubmit("running", 1, true)).toBe(false);
    expect(timerShouldAutoSubmit("entry", 0, true)).toBe(false);
    expect(timerShouldAutoSubmit("running", 0, false)).toBe(false);
  });
});

describe("resolveGoBack", () => {
  it("review with caption asks to discard; empty caption clears photo and returns to log or capture", () => {
    expect(resolveGoBack({ step: "review", caption: "keep?", taskType: "photo" })).toEqual({
      action: "discard_ask",
    });
    expect(resolveGoBack({ step: "review", caption: "  ", taskType: "photo" })).toEqual({
      action: "set_step",
      step: "capture",
      clearPhoto: true,
    });
    expect(resolveGoBack({ step: "review", caption: "", taskType: "run" })).toEqual({
      action: "set_step",
      step: "log",
      clearPhoto: true,
    });
    expect(resolveGoBack({ step: "review", caption: "", taskType: "workout" })).toEqual({
      action: "set_step",
      step: "log",
      clearPhoto: true,
    });
  });

  it("running stays; session returns to log", () => {
    expect(resolveGoBack({ step: "running", caption: "", taskType: "timer" })).toEqual({ action: "stay" });
    expect(resolveGoBack({ step: "session", caption: "", taskType: "run" })).toEqual({
      action: "set_step",
      step: "log",
    });
  });

  it("capture returns to the type's prior step; photo capture exits", () => {
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "run" })).toEqual({
      action: "set_step",
      step: "log",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "journal" })).toEqual({
      action: "set_step",
      step: "write",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "water" })).toEqual({
      action: "set_step",
      step: "count",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "checkin" })).toEqual({
      action: "set_step",
      step: "entry",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "manual" })).toEqual({
      action: "set_step",
      step: "ask",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "check_off", gates: ["camera"] })).toEqual({
      action: "exit",
    });
    expect(resolveGoBack({ step: "capture", caption: "", taskType: "photo" })).toEqual({ action: "exit" });
  });

  it("other steps exit", () => {
    expect(resolveGoBack({ step: "entry", caption: "", taskType: "timer" })).toEqual({ action: "exit" });
    expect(resolveGoBack({ step: "write", caption: "", taskType: "journal" })).toEqual({ action: "exit" });
    expect(resolveGoBack({ step: "ask", caption: "", taskType: "manual" })).toEqual({ action: "exit" });
  });
});

describe("resolveGoBackFromFailure", () => {
  it("prefer capture when require_photo and no local photo; else review if a photo exists", () => {
    expect(resolveGoBackFromFailure({ requirePhoto: true, hasPhoto: false, taskType: "timer" })).toBe("capture");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: true, taskType: "timer" })).toBe("review");
  });

  it("otherwise returns the type's input step", () => {
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "timer" })).toBe("entry");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "checkin" })).toBe("entry");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "journal" })).toBe("write");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "reading" })).toBe("count");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "run" })).toBe("log");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "photo" })).toBe("capture");
    expect(resolveGoBackFromFailure({ requirePhoto: false, hasPhoto: false, taskType: "manual" })).toBe("ask");
  });
});

describe("resolveRetryFailedSubmit", () => {
  it("follows the TaskFlowV2 retry order", () => {
    expect(
      resolveRetryFailedSubmit({ hasPhoto: true, taskType: "timer", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("submit_photo");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "timer", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("start_timer");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "journal", requirePhoto: true, timerReadyToSubmit: false }),
    ).toBe("capture");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "timer", requirePhoto: false, timerReadyToSubmit: true }),
    ).toBe("submit_timer");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "journal", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("submit_journal");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "water", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("submit_count");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "checkin", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("submit_checkin");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "run", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("log");
    expect(
      resolveRetryFailedSubmit({ hasPhoto: false, taskType: "manual", requirePhoto: false, timerReadyToSubmit: false }),
    ).toBe("submit_self");
  });
});

describe("submitWithoutPhotoNext", () => {
  it("require_photo intercepts to capture instead of submitting", () => {
    expect(submitWithoutPhotoNext(true)).toBe("capture");
    expect(submitWithoutPhotoNext(false)).toBe("submit");
  });
});

describe("discardPhotoStep", () => {
  it("run/workout return to log; everything else to capture", () => {
    expect(discardPhotoStep("run")).toBe("log");
    expect(discardPhotoStep("workout")).toBe("log");
    expect(discardPhotoStep("photo")).toBe("capture");
    expect(discardPhotoStep("reading")).toBe("capture");
  });
});

describe("verifyingLine", () => {
  it("uses the three TaskFlowV2 strings", () => {
    expect(verifyingLine("timer")).toBe("Recording the session…");
    expect(verifyingLine("manual")).toBe("Saving…");
    expect(verifyingLine("simple")).toBe("Saving…");
    expect(verifyingLine("counter")).toBe("Saving…");
    expect(verifyingLine("water")).toBe("Saving…");
    expect(verifyingLine("photo")).toBe("Posting your proof…");
    expect(verifyingLine("journal")).toBe("Posting your proof…");
    expect(verifyingLine("reading")).toBe("Posting your proof…");
  });
});

describe("input ready / what done means", () => {
  it("journal is done when word count meets the minimum", () => {
    expect(journalReady("one two", 3)).toBe(false);
    expect(journalReady("one two three", 3)).toBe(true);
  });

  it("counter is done when count meets the goal", () => {
    expect(countReady(7, 8)).toBe(false);
    expect(countReady(8, 8)).toBe(true);
  });

  it("checkin is done when GPS is present and inside the radius", () => {
    expect(checkinReady(null, 50)).toBe(false);
    expect(checkinReady(51, 50)).toBe(false);
    expect(checkinReady(50, 50)).toBe(true);
  });

  it("run needs both fields; workout needs minutes at or above the floor", () => {
    expect(logReady({ taskType: "run", distance: null, durationSec: 60, workoutMin: null, minDurationMinutes: 0 })).toBe(false);
    expect(logReady({ taskType: "run", distance: 1, durationSec: 60, workoutMin: null, minDurationMinutes: 0 })).toBe(true);
    expect(logReady({ taskType: "workout", distance: null, durationSec: null, workoutMin: 9, minDurationMinutes: 10 })).toBe(false);
    expect(logReady({ taskType: "workout", distance: null, durationSec: null, workoutMin: 10, minDurationMinutes: 10 })).toBe(true);
    expect(logReady({ taskType: "workout", distance: null, durationSec: null, workoutMin: 1, minDurationMinutes: 0 })).toBe(true);
  });
});

describe("finishSubmitOutcome", () => {
  it("5 of 6 done → frame 48 because the server is not secured", () => {
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 1 }, securedToday: false })).toBe("day_open");
  });

  it("6 of 6 but server not secured → frame 48, never Secured", () => {
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 0 }, securedToday: false })).toBe("day_open");
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 0 }, securedToday: false })).not.toBe("secured_nav");
  });

  it("server secured → Secured screen; never frame 48", () => {
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 0 }, securedToday: true })).toBe("secured_nav");
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 1 }, securedToday: true })).toBe("secured_nav");
    expect(finishSubmitOutcome({ complete: { requiredRemaining: 0 }, securedToday: true })).not.toBe("day_open");
  });

  it("failed when complete is missing", () => {
    expect(finishSubmitOutcome({ complete: null, securedToday: false })).toBe("failed");
    expect(finishSubmitOutcome({ complete: undefined, securedToday: true })).toBe("failed");
  });
});

describe("blockedEyebrow", () => {
  it("splits window vs range copy", () => {
    expect(blockedEyebrow("out_of_window")).toBe("NOT OPEN YET");
    expect(blockedEyebrow("in_range")).toBe("OUT OF RANGE");
  });
});
