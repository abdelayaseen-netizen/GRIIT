import { describe, expect, it } from "vitest";
import { CHALLENGE_PACKS, wizardTasksFromPack } from "@/lib/challenge-packs";
import { mapWizardTaskToCreateInput } from "@/lib/create-wizard-payload";
import { validateCreateTask } from "@/backend/lib/create-task-validation";

describe("create payload packs (regression)", () => {
  it("every CHALLENGE_PACKS task passes challenges.create per-task validation", () => {
    expect(CHALLENGE_PACKS.length).toBeGreaterThan(0);

    for (const pack of CHALLENGE_PACKS) {
      const payloadTasks = wizardTasksFromPack(pack).map((t) =>
        mapWizardTaskToCreateInput(t, { requirePhoto: false, allowPhoto: true }),
      );
      expect(payloadTasks.length).toBe(pack.taskCount);

      for (let i = 0; i < payloadTasks.length; i++) {
        const err = validateCreateTask(payloadTasks[i], i);
        expect(err, `${pack.id} task ${i + 1} (${payloadTasks[i]?.title})`).toBeNull();
      }
    }
  });
});
