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

  it("every timer and workout pack task has durationMinutes > 0", () => {
    for (const pack of CHALLENGE_PACKS) {
      const sources = wizardTasksFromPack(pack);
      expect(sources.some((t) => t.type === "timer" || t.type === "workout")).toBe(
        pack.tasks.some((t) => t.type === "timer" || t.type === "workout"),
      );
      for (const t of sources) {
        if (t.type !== "timer" && t.type !== "workout") continue;
        const row = mapWizardTaskToCreateInput(t, {
          requirePhoto: false,
          allowPhoto: true,
        });
        expect(
          row.durationMinutes,
          `${pack.id} ${t.name} (${t.type})`,
        ).toBeGreaterThan(0);
      }
    }
  });
});


describe("v43.1 photo_mode on create payload", () => {
  it("writes optional without a camera gate", () => {
    const row = mapWizardTaskToCreateInput(
      { name: "Read", type: "check_off", photoMode: "optional" },
      { requirePhoto: false, allowPhoto: true },
    );
    expect(row.photo_mode).toBe("optional");
    expect(row.requirePhotoProof).toBe(false);
    expect(row.gates ?? []).not.toContain("camera");
  });

  it("writes required when photoMode is required", () => {
    const row = mapWizardTaskToCreateInput(
      { name: "Shower", type: "check_off", photoMode: "required" },
      { requirePhoto: false, allowPhoto: true },
    );
    expect(row.photo_mode).toBe("required");
    expect(row.requirePhotoProof).toBe(true);
    expect(row.gates).toEqual(["camera"]);
  });
});
