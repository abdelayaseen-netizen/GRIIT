import { describe, expect, it } from "vitest";
import { canSaveWizardTasks, savedWizardTasks } from "./wizard-saved-tasks";

describe("saved wizard tasks", () => {
  it("keeps the pack and a custom task added on top", () => {
    const tasks = savedWizardTasks(
      [{ name: "Morning run" }, { name: "Workout" }],
      [{ name: "Evening journal" }],
    );
    expect(tasks.map((task) => task.name)).toEqual(["Morning run", "Workout", "Evening journal"]);
    expect(canSaveWizardTasks(tasks)).toBe(true);
  });

  it("does not drop a custom task when no pack is selected", () => {
    const tasks = savedWizardTasks(null, [{ name: "Evening journal" }]);
    expect(tasks.map((task) => task.name)).toEqual(["Evening journal"]);
  });
});
