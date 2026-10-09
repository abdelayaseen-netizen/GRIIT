import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { difficultyChip, discoverPreviewTasks } from "./discover-preview-tasks";

describe("discover preview tasks", () => {
  it("lists each task with its gate and keeps difficulty off the task line", () => {
    const tasks = discoverPreviewTasks([
      {
        title: "Workout",
        task_type: "check_off",
        config: { photo_mode: "none" },
      },
      {
        title: "Cardio",
        task_type: "timer",
        config: { photo_mode: "required" },
      },
    ]);
    expect(tasks.map((task) => task.title)).toEqual(["Workout", "Cardio"]);
    expect(tasks[0]?.gate).toBe("Self-reported");
    expect(tasks[1]?.gate).toContain("Camera");
    expect(difficultyChip("HARD")).toBe("Hard");
    expect(tasks.some((task) => task.title === "Hard" || task.gate === "Hard")).toBe(false);
  });

  it("renders tasks in the preview and difficulty as a chip", () => {
    const sheet = readFileSync(resolve(__dirname, "../components/discover/ChallengePreviewSheet.tsx"), "utf8");
    const discover = readFileSync(resolve(__dirname, "../components/discover/DiscoverV3.tsx"), "utf8");
    expect(sheet).toContain("item.tasks");
    expect(sheet).toContain("Chip");
    expect(discover).not.toContain('proof: item.difficulty === "HARD" ? "Hard"');
  });
});
