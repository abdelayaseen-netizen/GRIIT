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

describe("task complete toast copy", () => {
  it("names a saved photo and a done self-report, and counts what is left", () => {
    expect(taskDoneTitle("Read", false)).toBe("Read done.");
    expect(taskDoneTitle("Gym", true)).toBe("Gym saved.");
    expect(taskLeftBody(2, false)).toBe("2 left to secure today");
    expect(taskLeftBody(1, false)).toBe("1 left to secure today");
    expect(taskLeftBody(2, true)).toBe("Private until you share it · 2 left");
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
    expect(flow).toContain("taskDoneTitle");
    expect(flow).toContain('setStep("finish")');
  });
});
