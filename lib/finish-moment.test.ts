import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { serverSecuredToday } from "@/lib/day-open";
import {
  FINISH_FAILED_BODY,
  FINISH_SLOW_MS,
  FINISH_STATUS,
  finishAfterMutation,
  finishAlsoTodayLabel,
  finishLetter,
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
