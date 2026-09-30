import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { serverSecuredToday } from "@/lib/day-open";
import {
  FINISH_FAILED_BODY,
  FINISH_SLOW_MS,
  FINISH_STATUS,
  FINISH_BACK_HOME,
  alsoTodayFromTasks,
  enrollmentDueToday,
  finishAfterMutation,
  finishAlsoTodayLabel,
  finishLetter,
  finishNextLabel,
  finishPrimaryCta,
  finishSaveFromElapsed,
  finishShareLabel,
  resolveHeldShare,
} from "@/lib/finish-moment";

describe("finish moment A–F from save and secured_today", () => {
  it("maps saving, held, saved, failed, slow, and secured_nav", () => {
    expect(finishLetter({ save: "saving", share: "none", camera: true })).toBe("A");
    expect(finishLetter({ save: "saving", share: "feed_held", camera: false })).toBe("B");
    expect(finishLetter({ save: "saved", share: "none", camera: true })).toBe("C");
    expect(finishLetter({ save: "failed", share: "feed_held", camera: true })).toBe("D");
    expect(finishLetter({ save: "slow", share: "none", camera: true })).toBe("E");
    expect(
      finishLetter({ save: "saving", share: "none", camera: true, after: "secured_nav" }),
    ).toBe("F");
    expect(finishSaveFromElapsed(FINISH_SLOW_MS - 1)).toBe("saving");
    expect(finishSaveFromElapsed(FINISH_SLOW_MS)).toBe("slow");
    expect(FINISH_STATUS.saving).toBe("Saving…");
    expect(FINISH_STATUS.slow).toBe("Still saving. It keeps going if you leave.");
    expect(FINISH_STATUS.saved).toBe("Task saved.");
    expect(FINISH_STATUS.failed).toBe("Didn't save. Try again.");
    expect(FINISH_FAILED_BODY).toContain("Nothing was saved and nothing was shared");
    expect(finishAlsoTodayLabel(1)).toBe("Also today · 1 task");
    expect(finishAlsoTodayLabel(2)).toBe("Also today · 2 tasks");
    expect(finishShareLabel("none")).toBe("Share to the feed");
    expect(finishShareLabel("feed_held")).toBe("Shares when saved");
  });
});

describe("held share posts only after save succeeds", () => {
  it("keeps the hold while pending and posts on saved", () => {
    expect(resolveHeldShare({ held: true, after: "pending" })).toBe("keep_held");
    expect(resolveHeldShare({ held: true, after: "saved" })).toBe("call_share");
    expect(resolveHeldShare({ held: false, after: "saved" })).toBe("keep_held");
  });
});

describe("held share is dropped on failed save", () => {
  it("drops the hold so nothing is posted", () => {
    expect(resolveHeldShare({ held: true, after: "failed" })).toBe("drop");
    expect(finishAfterMutation({ complete: {}, securedToday: false, error: true })).toBe(
      "failed",
    );
  });
});

describe("held share still posts if the user leaves after choosing Share", () => {
  it("call_share after a later success, even if they already left", () => {
    expect(resolveHeldShare({ held: true, after: "pending" })).toBe("keep_held");
    expect(resolveHeldShare({ held: true, after: "saved" })).toBe("call_share");
    expect(resolveHeldShare({ held: true, after: "secured_nav" })).toBe("call_share");
  });
});

describe("branch reads secured_today not a client count", () => {
  it("uses the server flag only", () => {
    expect(finishAfterMutation({ complete: { requiredRemaining: 0 }, securedToday: false })).toBe(
      "saved",
    );
    expect(finishAfterMutation({ complete: { requiredRemaining: 1 }, securedToday: true })).toBe(
      "secured_nav",
    );
    expect(finishAfterMutation({ complete: null, securedToday: true })).toBe("failed");
    expect(serverSecuredToday({ dayAlreadySecured: false, secureDaySecured: true })).toBe(true);
    const src = readFileSync(resolve(__dirname, "./finish-moment.ts"), "utf8");
    expect(src).toContain("securedToday");
    expect(src).not.toContain("requiredRemaining");
    expect(src).toContain("finishSubmitOutcome");
  });
});

describe("next task skips closed windows the way Home does", () => {
  it("points at the first open task and goes Home when every remaining window is closed", () => {
    expect(
      alsoTodayFromTasks(
        [
          { id: "workout", name: "Workout", done: false, windowState: "closed" },
          { id: "bed", name: "Make your bed", done: false, windowState: "open" },
        ],
        "current",
      ),
    ).toEqual([{ id: "bed", title: "Make your bed", gate_line: "Self-reported" }]);
    expect(finishPrimaryCta(alsoTodayFromTasks(
      [
        { id: "workout", name: "Workout", done: false, windowState: "closed" },
        { id: "bed", name: "Make your bed", done: false, windowState: "open" },
      ],
      "current",
    )[0]?.title)).toBe("Next task · Make your bed");
    expect(
      alsoTodayFromTasks(
        [{ id: "workout", name: "Workout", done: false, windowState: "closed" }],
        "current",
      ),
    ).toEqual([]);
    expect(finishPrimaryCta(undefined)).toBe(FINISH_BACK_HOME);
    expect(finishPrimaryCta("")).toBe("Back to Home");
    expect(finishNextLabel("Make your bed")).toBe("Next task · Make your bed");
    const src = readFileSync(resolve(__dirname, "./finish-moment.ts"), "utf8");
    const ui = readFileSync(resolve(__dirname, "../components/task-v2/FinishMomentV3.tsx"), "utf8");
    expect(src).toContain("homeWindowClosed");
    expect(ui).toContain("finishPrimaryCta");
    expect(ui).toContain("onLeave");
    expect(ui).not.toContain("onStory");
  });
});

describe("also today skips pre-start enrollments like Home", () => {
  it("drops startDateKey after today and undone others become rows", () => {
    expect(
      enrollmentDueToday({ startAt: "2026-09-28T12:00:00.000Z", timeZone: "UTC", todayKey: "2026-09-27" }),
    ).toBe(false);
    expect(
      enrollmentDueToday({ startAt: "2026-09-27T12:00:00.000Z", timeZone: "UTC", todayKey: "2026-09-27" }),
    ).toBe(true);
    expect(
      alsoTodayFromTasks(
        [
          { id: "done", name: "Done", done: true },
          { id: "current", name: "Current", done: true },
          { id: "next", name: "Run", done: false, gates: ["camera"] },
        ],
        "current",
      ),
    ).toEqual([{ id: "next", title: "Run", gate_line: "Camera" }]);
  });
});

describe("source: takeover symbols gone", () => {
  it("has no VERIFYING_TAKEOVER_MS, VerifyingStep, or verifying step", () => {
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    const screen = readFileSync(resolve(__dirname, "../components/task-v2/TaskFlowV2.tsx"), "utf8");
    const state = readFileSync(resolve(__dirname, "./task-flow-state.ts"), "utf8");
    expect(flow).not.toContain("VERIFYING_TAKEOVER_MS");
    expect(flow).not.toContain("VerifyingStep");
    expect(flow).not.toContain('setStep("verifying")');
    expect(screen).not.toContain("VerifyingStep");
    expect(screen).not.toContain('step === "verifying"');
    expect(state).not.toContain('| "verifying"');
    expect(flow).toContain('setStep("finish")');
    expect(flow).toContain("shareChoicePending: true");
    expect(flow).not.toContain("hasCameraProof ? { shareChoicePending");
  });
});
