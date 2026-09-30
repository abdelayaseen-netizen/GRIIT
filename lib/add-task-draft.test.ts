import { describe, expect, it } from "vitest";
import {
  ADD_TASK_DEFAULT,
  ADD_TASK_ON_HOME,
  ADD_TASK_PLACE_NO_MAP,
  ADD_TASK_PROOFS,
  ADD_TASK_STARTERS,
  ADD_TASK_WHAT_PROVES,
  applyProof,
  applyStarter,
  canSubmitDraft,
  draftFromWizardTask,
  gatesFromDraft,
  payloadFromDraft,
  previewFromDraft,
  proofFromDraft,
  type AddTaskDraft,
} from "@/lib/add-task-draft";

function draft(partial: Partial<AddTaskDraft> = {}): AddTaskDraft {
  return { ...ADD_TASK_DEFAULT, ...partial };
}

describe("add-task draft", () => {
  it("place radius copy has no design-system note", () => {
    expect(ADD_TASK_PLACE_NO_MAP).toBe("A bigger radius is easier to pass.");
    expect(ADD_TASK_PLACE_NO_MAP.toLowerCase()).not.toMatch(/design system/);
  });

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

  it("proof radio writes the same camera / time / location flags", () => {
    expect(ADD_TASK_WHAT_PROVES).toBe("How it's proven");
    expect(ADD_TASK_ON_HOME).toBe("On Home");
    expect(ADD_TASK_PROOFS.map((p) => p.title)).toEqual([
      "Self-report",
      "Self-report + time window",
      "Photo",
      "Photo + time window",
      "Photo + place",
    ]);
    expect(ADD_TASK_PROOFS.find((p) => p.id === "self_time")?.caption).toBe(
      "You say it is done, only inside the hours you set.",
    );
    expect(ADD_TASK_DEFAULT.fromTime).toBe("05:00");
    expect(ADD_TASK_DEFAULT.toTime).toBe("06:30");
    expect(proofFromDraft(ADD_TASK_DEFAULT)).toBe("self");
    expect(gatesFromDraft(applyProof(draft(), "self"))).toEqual([]);
    expect(applyProof(draft(), "self_time").camera).toBe(false);
    expect(gatesFromDraft(applyProof(draft(), "self_time"))).toEqual(["time"]);
    expect(proofFromDraft(applyProof(draft(), "self_time"))).toBe("self_time");
    expect(gatesFromDraft(applyProof(draft(), "photo"))).toEqual(["camera"]);
    expect(gatesFromDraft(applyProof(draft(), "photo_time"))).toEqual(["camera", "time"]);
    expect(gatesFromDraft(applyProof(draft(), "photo_place"))).toEqual(["camera", "location"]);
    expect(applyProof(draft({ time: true, location: true }), "photo").time).toBe(false);
    expect(applyProof(draft({ time: true, location: true }), "photo").location).toBe(false);
    expect(applyProof(draft({ camera: true, location: true }), "self_time").camera).toBe(false);
    expect(applyProof(draft({ camera: true, location: true }), "self_time").location).toBe(false);
  });

  it("self_time writes the same gate_time as photo_time with camera off", () => {
    const named = draft({ name: "Crew", timeMode: "by", byTime: "07:00" });
    const self = payloadFromDraft(applyProof(named, "self_time"));
    const photo = payloadFromDraft(applyProof(named, "photo_time"));
    expect(self.gateTime).toEqual(photo.gateTime);
    expect(self.gateTime).toEqual({ mode: "by", start: "07:00", end: null });
    expect(self.gates).toEqual(["time"]);
    expect(self.requirePhoto).toBe(false);
    expect(photo.requirePhoto).toBe(true);
    expect(photo.gates).toEqual(["camera", "time"]);
    expect(
      previewFromDraft(applyProof(draft({ name: "Crew" }), "self_time")).caption,
    ).toBe("Self-reported · By 7:00 am");
    expect(
      previewFromDraft({
        ...applyProof(draft({ name: "Crew" }), "self_time"),
        timeMode: "between",
        fromTime: "05:00",
        toTime: "06:30",
      }).caption,
    ).toBe("Self-reported · 5:00–6:30 am");
  });

  it("invalid Between window disables Add task and marks the preview", () => {
    const bad = draft({
      name: "Crew",
      camera: true,
      time: true,
      timeMode: "between",
      fromTime: "05:00",
      toTime: "04:30",
    });
    expect(canSubmitDraft(bad)).toBe(false);
    expect(previewFromDraft(bad).caption).toBe("Camera · Time window not set");
    expect(
      previewFromDraft(
        draft({
          name: "Crew",
          camera: true,
          time: true,
          timeMode: "between",
          fromTime: "05:00",
          toTime: "06:30",
        }),
      ).caption,
    ).toBe("Camera · 5:00–6:30 am");
  });

  it("editing loads saved By / Between values", () => {
    const between = draftFromWizardTask({
      name: "Crew",
      type: "check_off",
      gates: ["camera", "time"],
      gateTime: { mode: "between", start: "05:00", end: "06:30" },
    });
    expect(between.timeMode).toBe("between");
    expect(between.fromTime).toBe("05:00");
    expect(between.toTime).toBe("06:30");
    const by = draftFromWizardTask({
      name: "Crew",
      type: "check_off",
      gates: ["camera", "time"],
      gateTime: { mode: "by", start: "07:00", end: null },
    });
    expect(by.timeMode).toBe("by");
    expect(by.byTime).toBe("07:00");
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
