import { describe, expect, it } from "vitest";
import {
  ADD_TASK_DEFAULT,
  ADD_TASK_STARTERS,
  applyStarter,
  canSubmitDraft,
  gatesFromDraft,
  payloadFromDraft,
  previewFromDraft,
  type AddTaskDraft,
} from "@/lib/add-task-draft";

function draft(partial: Partial<AddTaskDraft> = {}): AddTaskDraft {
  return { ...ADD_TASK_DEFAULT, ...partial };
}

describe("add-task draft", () => {
  it("default state is check_off with no gates", () => {
    expect(ADD_TASK_DEFAULT.type).toBe("check_off");
    expect(ADD_TASK_DEFAULT.camera).toBe(false);
    expect(ADD_TASK_DEFAULT.time).toBe(false);
    expect(ADD_TASK_DEFAULT.location).toBe(false);
    expect(gatesFromDraft(ADD_TASK_DEFAULT)).toEqual([]);
    expect(canSubmitDraft(ADD_TASK_DEFAULT)).toBe(false);
  });

  it("gates array follows Camera, Time, Location switch order", () => {
    expect(gatesFromDraft(draft({ location: true, time: true, camera: true }))).toEqual([
      "camera",
      "time",
      "location",
    ]);
    expect(gatesFromDraft(draft({ camera: true }))).toEqual(["camera"]);
    expect(gatesFromDraft(draft({ time: true }))).toEqual(["time"]);
    expect(gatesFromDraft(draft({ location: true }))).toEqual(["location"]);
  });

  it("writes the new-shape payload { type, config, gates, gateTime }", () => {
    const row = payloadFromDraft(
      draft({
        name: "Cold shower",
        type: "check_off",
        camera: true,
        time: true,
        location: true,
        timeMode: "by",
        byTime: "07:00",
      }),
    );
    expect(row).toMatchObject({
      name: "Cold shower",
      type: "check_off",
      config: {},
      gates: ["camera", "time", "location"],
      gateTime: { mode: "by", start: "07:00", end: null },
    });
    expect(row).not.toHaveProperty("requirePhotoProof");
  });

  it("timer and between window land on config + gateTime", () => {
    const row = payloadFromDraft(
      draft({
        name: "Run",
        type: "timer",
        timerPreset: 10,
        time: true,
        timeMode: "between",
        fromTime: "09:30",
        toTime: "10:30",
      }),
    );
    expect(row.type).toBe("timer");
    expect(row.config).toEqual({ durationMinutes: 10 });
    expect(row.gates).toEqual(["time"]);
    expect(row.gateTime).toEqual({ mode: "between", start: "09:30", end: "10:30" });
    expect(row.durationMinutes).toBe(10);
  });

  it("Add task CTA is disabled until the name is non-empty", () => {
    expect(!draft({ name: "" }).name.trim()).toBe(true);
    expect(!draft({ name: "   " }).name.trim()).toBe(true);
    expect(!draft({ name: "Cold shower" }).name.trim()).toBe(false);
    expect(canSubmitDraft(draft({ name: "Cold shower" }))).toBe(true);
    expect(
      canSubmitDraft(draft({ name: "Run", type: "timer", timerPreset: "custom", customMinutes: "" })),
    ).toBe(false);
  });

  it("starters prefill name, type, and counter unit for water/reading", () => {
    const water = applyStarter(ADD_TASK_STARTERS.find((s) => s.label === "Water")!);
    expect(water.name).toBe("Water");
    expect(water.type).toBe("counter");
    expect(water.counterUnit).toBe("oz");
    const read = applyStarter(ADD_TASK_STARTERS.find((s) => s.label === "Read")!);
    expect(read.name).toBe("Read");
    expect(read.type).toBe("counter");
    expect(read.counterUnit).toBe("pages");
    const pray = applyStarter(ADD_TASK_STARTERS.find((s) => s.label === "Pray")!);
    expect(pray.type).toBe("check_off");
    expect(pray.name).toBe("Pray");
  });

  it("preview caption updates with the gate switches", () => {
    expect(previewFromDraft(draft({ name: "Journal" })).caption).toBe("Self-reported");
    expect(previewFromDraft(draft({ name: "Journal", camera: true })).caption).toBe("Camera");
    expect(
      previewFromDraft(
        draft({
          name: "Journal",
          camera: true,
          time: true,
          timeMode: "by",
          byTime: "07:00",
        }),
      ).caption,
    ).toBe("Camera · By 7:00 am");
    expect(previewFromDraft(draft({ name: "" })).title).toBe("Name it");
  });
});
