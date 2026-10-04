import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { gateTimeFor, gatesFor, photoModeFor, type TaskModelRow } from "@/backend/lib/task-model";
import { gateLabel } from "@/lib/task-ui";
import {
  buildFeaturedCatalogRows,
  renderFeaturedCatalogSql,
} from "@/lib/featured-catalog-seed";

function asModel(row: ReturnType<typeof buildFeaturedCatalogRows>[number]["task"]): TaskModelRow {
  return {
    task_type: row.task_type,
    require_photo: row.require_photo === true,
    require_location: row.require_location === true,
    gate_time_mode: row.gate_time_mode,
    gate_time_start: row.gate_time_start,
    gate_time_end: row.gate_time_end,
    config: row.config,
  };
}

describe("featured catalog seed matches the create-route readers", () => {
  const rows = buildFeaturedCatalogRows();

  it("emits the eight tasks the draft SQL file contains", () => {
    const sql = readFileSync(resolve(__dirname, "../docs/drafts/v44-featured-catalog.sql"), "utf8");
    expect(sql).toBe(renderFeaturedCatalogSql(rows));
    expect(sql.startsWith("-- DRAFT. DO NOT APPLY.")).toBe(true);
  });

  it("Show Up 7 is check_off, photo required, no place, no window", () => {
    const row = rows.find((r) => r.spec.title === "Show Up 7")!;
    const model = asModel(row.task);
    expect(row.task.task_type).toBe("check_off");
    expect(row.task.title).toBe("Get to the gym");
    expect(photoModeFor(model)).toBe("required");
    expect(row.task.require_photo).toBe(true);
    expect(row.task.config.photo_mode).toBe("required");
    expect(row.task.config.photo_required).toBe(true);
    expect(row.task.config.require_photo_proof).toBe(true);
    expect(gatesFor(model)).toEqual(["camera"]);
    expect(gateTimeFor(model)).toEqual({ mode: null, start: null, end: null });
    expect(gatesFor(model)).not.toContain("location");
    expect(gateLabel({ gates: gatesFor(model), gateTime: gateTimeFor(model) })).toBe("Camera");
  });

  it("7K Steps is a check-off with no photo", () => {
    const row = rows.find((r) => r.spec.title === "7K Steps")!;
    const model = asModel(row.task);
    expect(row.task.task_type).toBe("check_off");
    expect(row.task.title).toBe("Walk 7,000 steps");
    expect(photoModeFor(model)).toBe("none");
    expect(row.task.require_photo).toBeUndefined();
    expect(gateLabel({ gates: gatesFor(model), gateTime: gateTimeFor(model) })).toBe("Self-reported");
  });

  it("Early Riser is photo required by 06:30", () => {
    const row = rows.find((r) => r.spec.title === "Early Riser 7")!;
    const model = asModel(row.task);
    expect(row.task.title).toBe("Up and out of bed");
    expect(photoModeFor(model)).toBe("required");
    expect(row.task.gate_time_mode).toBe("by");
    expect(row.task.gate_time_start).toBe("06:30");
    expect(row.task.gate_time_end).toBeNull();
    expect(gateTimeFor(model).mode).toBe("by");
    expect(gateLabel({ gates: gatesFor(model), gateTime: gateTimeFor(model) })).toBe(
      "Camera · By 6:30 am",
    );
  });

  it("Fajr is photo optional by 07:00", () => {
    const row = rows.find((r) => r.spec.title === "Fajr Before Sunrise")!;
    const model = asModel(row.task);
    expect(photoModeFor(model)).toBe("optional");
    expect(row.task.require_photo).toBeUndefined();
    expect(row.task.config.require_photo_proof).toBe(false);
    expect(row.task.gate_time_mode).toBe("by");
    expect(row.task.gate_time_start).toBe("07:00");
    expect(gatesFor(model)).toEqual(["time"]);
    expect(gateLabel({ gates: gatesFor(model), gateTime: gateTimeFor(model) })).toBe("By 7:00 am");
  });

  it("3 Good Things is the text type create writes, with no photo", () => {
    const row = rows.find((r) => r.spec.title === "3 Good Things")!;
    const model = asModel(row.task);
    expect(row.task.task_type).toBe("text");
    expect(row.task.title).toBe("Write 3 good things from today");
    expect(photoModeFor(model)).toBe("none");
    expect(typeof row.task.config.min_words).toBe("number");
  });

  it("10 Pages a Day is a counter of 10 pages", () => {
    const row = rows.find((r) => r.spec.title === "10 Pages a Day")!;
    const model = asModel(row.task);
    expect(row.task.task_type).toBe("counter");
    expect(row.task.config.target_count).toBe(10);
    expect(row.task.config.unit_label).toBe("pages");
    expect(photoModeFor(model)).toBe("none");
    expect(gatesFor(model)).toEqual([]);
  });

  it("Quran Daily and Cold Finish are check-offs with no photo and no place", () => {
    for (const title of ["Quran Daily", "30-Second Cold Finish"]) {
      const row = rows.find((r) => r.spec.title === title)!;
      const model = asModel(row.task);
      expect(row.task.task_type).toBe("check_off");
      expect(photoModeFor(model)).toBe("none");
      expect(row.task.require_location).toBeUndefined();
      expect(gatesFor(model)).not.toContain("location");
    }
    expect(rows.find((r) => r.spec.title === "Quran Daily")!.task.title).toBe(
      "Read at least 1 page of Quran",
    );
    expect(rows.find((r) => r.spec.title === "30-Second Cold Finish")!.task.title).toBe(
      "End your shower with 30 seconds cold",
    );
  });
});
