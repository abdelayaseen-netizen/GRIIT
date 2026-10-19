import { describe, expect, it } from "vitest";
import {
  markOptimisticTaskDone,
  mergeOptimisticCheckins,
  OPTIMISTIC_SAVE_ERROR,
  optimisticSaveError,
  optimisticTaskDones,
  rollbackOptimisticTaskDone,
} from "@/lib/optimistic-home";

describe("mergeOptimisticCheckins", () => {
  it("marks the task done for Home before the server check-in arrives", () => {
    markOptimisticTaskDone({ taskId: "task-1", activeChallengeId: "ac-1" });
    const merged = mergeOptimisticCheckins(
      [{ task_id: "other", active_challenge_id: "ac-1", status: "completed" }],
      optimisticTaskDones(),
    );
    expect(merged).toEqual([
      { task_id: "other", active_challenge_id: "ac-1", status: "completed" },
      { task_id: "task-1", active_challenge_id: "ac-1", status: "completed" },
    ]);
    const again = mergeOptimisticCheckins(merged, optimisticTaskDones());
    expect(again).toHaveLength(2);
  });

  it("rolls a failed save back and keeps the retry sentence", () => {
    markOptimisticTaskDone({ taskId: "task-2", activeChallengeId: "ac-1" });
    rollbackOptimisticTaskDone("task-2");
    expect(optimisticTaskDones().some((row) => row.taskId === "task-2")).toBe(false);
    // Build 92 10.3: the error says whether a retry can work; with no reason it is the generic retry.
    expect(optimisticSaveError()).toEqual({ taskId: "task-2", message: OPTIMISTIC_SAVE_ERROR, retry: true });
    expect(OPTIMISTIC_SAVE_ERROR).toBe("Couldn't save. Tap to try again.");
  });
});
