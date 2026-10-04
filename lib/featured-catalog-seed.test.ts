import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { gateTimeFor, gatesFor, photoModeFor, type TaskModelRow } from "@/backend/lib/task-model";
import { gateLabel } from "@/lib/task-ui";
import {
  assertTypedValuesCells,
  buildFeaturedCatalogRows,
  renderFeaturedCatalogSql,
  sqlTypedNull,
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

describe("typed NULL in a VALUES list", () => {
  it("casts NULL and rejects a bare NULL", () => {
    expect(sqlTypedNull("numeric")).toBe("NULL::numeric");
    expect(sqlTypedNull("integer")).toBe("NULL::integer");
    expect(() => assertTypedValuesCells(["NULL"])).toThrow(/Untyped NULL/);
    expect(() => assertTypedValuesCells([sqlTypedNull("numeric")])).not.toThrow();
  });

  it("does not put a bare NULL in the task VALUES list", () => {
    const sql = renderFeaturedCatalogSql();
    const values = sql.slice(sql.indexOf("FROM (VALUES\n"), sql.indexOf(") AS v("));
    expect(values).not.toMatch(/(^|[\s,(])NULL([\s,)]|$)/);
    expect(sql).toContain("gate_time_start = '06:30'");
    expect(sql).toContain("gate_time_start = '07:00'");
  });
});

describe("featured catalog seed matches the create-route readers", () => {
  const rows = buildFeaturedCatalogRows();

  it("emits the eight tasks the draft SQL file contains", () => {
    const sql = readFileSync(resolve(__dirname, "../docs/drafts/v44-featured-catalog.sql"), "utf8");
    expect(sql).toBe(renderFeaturedCatalogSql(rows));
    expect(sql).toContain("APPLIED 2026-10-04");
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

const CATALOG_TYPES = `
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY,
  creator_id uuid,
  title text NOT NULL,
  description text,
  duration_days integer NOT NULL,
  duration_type text NOT NULL,
  visibility text,
  difficulty text,
  category text,
  status text,
  is_featured boolean,
  participants_count integer,
  participation_type text,
  team_size integer,
  run_status text,
  is_hard_mode boolean NOT NULL DEFAULT false,
  live_date timestamptz,
  replay_policy text,
  require_same_rules boolean,
  show_replay_label boolean
);
CREATE TABLE public.challenge_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id),
  title text NOT NULL,
  task_type text NOT NULL,
  order_index integer,
  require_photo boolean DEFAULT false,
  config jsonb,
  target_mode text,
  require_location boolean DEFAULT false,
  start_value numeric,
  start_duration_minutes integer,
  location_latitude numeric,
  location_longitude numeric,
  location_radius_meters integer,
  gate_time_mode text,
  gate_time_start text,
  gate_time_end text
);
`;

describe("catalog SQL against column types", () => {
  it("runs the applied seed, and rejects an untyped NULL for start_value", async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite();
    await db.exec(CATALOG_TYPES);
    await db.exec(renderFeaturedCatalogSql());
    const challenges = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM public.challenges");
    const tasks = await db.query<{ n: number }>("SELECT count(*)::int AS n FROM public.challenge_tasks");
    expect(challenges.rows[0]?.n).toBe(8);
    expect(tasks.rows[0]?.n).toBe(8);
    const windows = await db.query<{ title: string; gate_time_mode: string; gate_time_start: string }>(
      `SELECT title, gate_time_mode, gate_time_start
       FROM public.challenge_tasks
       WHERE gate_time_mode IS NOT NULL
       ORDER BY gate_time_start`,
    );
    expect(windows.rows).toEqual([
      { title: "Up and out of bed", gate_time_mode: "by", gate_time_start: "06:30" },
      { title: "Pray Fajr", gate_time_mode: "by", gate_time_start: "07:00" },
    ]);

    const untyped = `
      INSERT INTO public.challenge_tasks (challenge_id, title, task_type, start_value)
      SELECT v.challenge_id, v.title, v.task_type, v.start_value
      FROM (VALUES (
        'e44f0001-4000-4000-8000-000000000001'::uuid,
        'bad',
        'check_off',
        NULL
      )) AS v(challenge_id, title, task_type, start_value)
    `;
    await expect(db.exec(untyped)).rejects.toThrow(/numeric but expression is of type text/);

    await db.exec(`
      INSERT INTO public.challenge_tasks (challenge_id, title, task_type, start_value)
      SELECT v.challenge_id, v.title, v.task_type, v.start_value
      FROM (VALUES (
        'e44f0001-4000-4000-8000-000000000001'::uuid,
        'typed',
        'check_off',
        NULL::numeric
      )) AS v(challenge_id, title, task_type, start_value)
    `);
    await db.close();
  });
});
