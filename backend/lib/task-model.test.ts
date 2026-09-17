import { describe, expect, it } from "vitest";
import { buildTaskInsertPayload } from "./challenge-tasks";
import { STARTER_DEFINITIONS } from "./starter-seed";
import {
  gatesFor,
  gateTimeFor,
  normalizeTaskType,
  overlayTaskModel,
  verificationMethodFor,
  type TaskModelRow,
} from "./task-model";

describe("normalizeTaskType — handoff mapping table", () => {
  const rows: { raw: string; expected: string; extra?: TaskModelRow }[] = [
    { raw: "simple", expected: "check_off" },
    { raw: "checkin", expected: "check_off" },
    { raw: "manual", expected: "check_off" },
    { raw: "photo", expected: "check_off" },
    { raw: "timer", expected: "timer" },
    {
      raw: "workout",
      expected: "timer",
      extra: { config: { duration_minutes: 20 } },
    },
    { raw: "workout", expected: "check_off" },
    { raw: "journal", expected: "text" },
    { raw: "counter", expected: "counter" },
    { raw: "water", expected: "counter" },
    { raw: "reading", expected: "counter" },
    { raw: "run", expected: "run" },
    { raw: "check_off", expected: "check_off" },
    { raw: "text", expected: "text" },
  ];

  it.each(rows)("$raw → $expected", ({ raw, expected, extra }) => {
    expect(normalizeTaskType({ task_type: raw, ...extra })).toBe(expected);
  });
});

describe("gatesFor", () => {
  it("orders camera, then time, then location", () => {
    expect(
      gatesFor({
        task_type: "manual",
        require_photo: true,
        require_location: true,
        gate_time_mode: "by",
        gate_time_start: "07:00",
      })
    ).toEqual(["camera", "time", "location"]);
  });

  it("photo type adds camera even without flags", () => {
    expect(gatesFor({ task_type: "photo" })).toEqual(["camera"]);
  });

  it("collapses require_photo_proof / require_photo / photo_required into camera", () => {
    expect(gatesFor({ task_type: "manual", config: { require_photo_proof: true } })).toEqual([
      "camera",
    ]);
    expect(gatesFor({ task_type: "timer", config: { photo_required: true } })).toEqual(["camera"]);
    expect(gatesFor({ task_type: "check_off", require_photo: true })).toEqual(["camera"]);
  });

  it("time gate only from gate_time_mode by|between — not routine_anchor", () => {
    expect(gatesFor({ task_type: "manual", gate_time_mode: "between" })).toEqual(["time"]);
    expect(
      gatesFor({
        task_type: "manual",
        config: { duration_minutes: 5 },
      })
    ).toEqual([]);
  });

  it("location from require_location column or config", () => {
    expect(gatesFor({ task_type: "check_off", require_location: true })).toEqual(["location"]);
    expect(gatesFor({ task_type: "run", config: { require_location: true } })).toEqual(["location"]);
  });
});

describe("verificationMethodFor", () => {
  it("camera → photo; empty or time/location only → self_reported", () => {
    expect(verificationMethodFor(["camera"])).toBe("photo");
    expect(verificationMethodFor(["camera", "time"])).toBe("photo");
    expect(verificationMethodFor([])).toBe("self_reported");
    expect(verificationMethodFor(["time"])).toBe("self_reported");
    expect(verificationMethodFor(["location"])).toBe("self_reported");
  });
});

describe("overlayTaskModel", () => {
  it("keeps raw task_type beside normalized type", () => {
    const out = overlayTaskModel(
      { id: "t1", title: "Journal" },
      { task_type: "journal", require_photo: false }
    );
    expect(out.task_type).toBe("journal");
    expect(out.type).toBe("text");
    expect(out.gates).toEqual([]);
    expect(out.gateTime).toEqual({ mode: null, start: null, end: null });
  });
});

describe("gateTimeFor", () => {
  it("returns by/between or null mode", () => {
    expect(
      gateTimeFor({ gate_time_mode: "by", gate_time_start: "07:00", gate_time_end: null })
    ).toEqual({ mode: "by", start: "07:00", end: null });
    expect(gateTimeFor({ gate_time_mode: "overnight" })).toEqual({
      mode: null,
      start: null,
      end: null,
    });
  });
});

describe("starter seed remap", () => {
  it("new seeds use check_off / text; timer unchanged", () => {
    const byId = Object.fromEntries(STARTER_DEFINITIONS.map((s) => [s.starter_id, s.task_type]));
    expect(byId["onboard-water"]).toBe("check_off");
    expect(byId["onboard-steps"]).toBe("check_off");
    expect(byId["onboard-bed"]).toBe("check_off");
    expect(byId["onboard-journal"]).toBe("text");
    expect(byId["onboard-read"]).toBe("timer");
    expect(byId["onboard-breath"]).toBe("timer");
  });
});

describe("buildTaskInsertPayload — old and new write shapes", () => {
  it("old-shape photo still writes manual + require_photo", () => {
    const row = buildTaskInsertPayload(
      {
        title: "Take photo",
        type: "photo",
        required: true,
        requirePhotoProof: true,
      },
      "challenge-1",
      0
    );
    expect(row.task_type).toBe("manual");
    expect(row.require_photo).toBe(true);
    expect(row.config.require_photo_proof).toBe(true);
    expect(row.gate_time_mode).toBeNull();
  });

  it("old-shape journal still writes journal", () => {
    const row = buildTaskInsertPayload(
      { title: "Write", type: "journal", required: true, minWords: 20 },
      "challenge-1",
      0
    );
    expect(row.task_type).toBe("journal");
    expect(row.config.min_words).toBe(20);
  });

  it("new-shape writes the five types and gate columns", () => {
    const row = buildTaskInsertPayload(
      {
        title: "Morning check",
        type: "check_off",
        required: true,
        gates: ["camera", "time", "location"],
        gateTime: { mode: "by", start: "07:00", end: null },
        require_location: true,
        location_name: "Gym",
      },
      "challenge-1",
      0
    );
    expect(row.task_type).toBe("check_off");
    expect(row.require_photo).toBe(true);
    expect(row.require_location).toBe(true);
    expect(row.gate_time_mode).toBe("by");
    expect(row.gate_time_start).toBe("07:00");
    expect(row.config.require_photo_proof).toBe(true);
  });
});
