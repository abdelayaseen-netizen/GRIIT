import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dismissTaskToast,
  publishTaskToast,
  securedMomentTitle,
  streakInARow,
  subscribeTaskToast,
  taskDoneTitle,
  taskLeftBody,
} from "@/lib/task-complete-toast";
import { TOAST_LIFE_MS } from "@/lib/glass";

describe("task complete toast copy", () => {
  it("names a saved photo and a done self-report, and counts what is left", () => {
    expect(taskDoneTitle("Read", false)).toBe("Saved.");
    expect(taskDoneTitle("Gym", true)).toBe("Saved.");
    expect(taskLeftBody(2, false)).toBe("");
    expect(taskLeftBody(1, false)).toBe("");
    expect(taskLeftBody(2, true)).toBe("");
    expect(securedMomentTitle(1, 3)).toBe("Day 3 secured.");
    expect(securedMomentTitle(2, 3)).toBe("Day secured.");
    expect(streakInARow(1)).toBe("day in a row");
    expect(streakInARow(4)).toBe("days in a row");
  });

  it("publishes one toast and clears it", () => {
    const seen: string[] = [];
    const stop = subscribeTaskToast((toast) => {
      seen.push(toast?.title ?? "none");
    });
    publishTaskToast({
      taskId: "t1",
      title: "Read done.",
      body: "1 left to secure today",
      photoUri: null,
      cameraSeal: false,
    });
    dismissTaskToast();
    stop();
    expect(seen).toEqual(["none", "Read done.", "none"]);
  });

  it("leaves the task list on a non-last save instead of the finish moment", () => {
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(flow).toContain("publishTaskToast");
    // Build 92 02.2: the toast reads "{task} done. {n} left today." via lib/finish-flow.
    expect(flow).toContain("remainingToast(");
    expect(flow).toContain("routeAfterFinish(");
    expect(flow).not.toContain("await loadAlsoToday");
    expect(flow).not.toContain('setStep("finish")');
  });

  it("keeps the photo beside Share, and Share stays up for 4 seconds", () => {
    const src = readFileSync(resolve(__dirname, "../components/task-v2/TaskCompleteToast.tsx"), "utf8");
    const share = src.slice(src.indexOf('testID="toast-share"'), src.indexOf("toast.actionLabel"));
    expect(share).not.toContain("<Image");
    expect(share).toContain("styles.pill");
    expect(TOAST_LIFE_MS).toBe(4000);
    expect(src).toContain("PHOTO_LIFE_MS = TOAST_LIFE_MS");
  });
});
