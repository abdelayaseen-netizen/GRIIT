/**
 * Featured catalog rows, built the same way Create writes them:
 * add-task draft → mapWizardTaskToCreateInput → buildTaskInsertPayload.
 * Standard difficulty, so hard mode does not touch photo fields.
 * creator_id stays null and is_featured is true — those are catalog
 * overrides. Create would set the signed-in user and leave featured false.
 */

import { payloadFromDraft, type AddTaskDraft } from "@/lib/add-task-draft";
import { mapWizardTaskToCreateInput } from "@/lib/create-wizard-payload";
import { buildTaskInsertPayload } from "@/backend/lib/challenge-tasks";

export type FeaturedSeedDraft = Partial<AddTaskDraft> &
  Pick<AddTaskDraft, "name" | "type" | "photoMode">;

export type FeaturedSeedSpec = {
  id: string;
  title: string;
  category: "fitness" | "health" | "discipline" | "faith" | "mind" | "learning";
  days: number;
  draft: FeaturedSeedDraft;
};

export const FEATURED_SEED_SPECS: readonly FeaturedSeedSpec[] = [
  {
    id: "e44f0001-4000-4000-8000-000000000001",
    title: "Show Up 7",
    category: "fitness",
    days: 7,
    draft: { name: "Get to the gym", type: "check_off", photoMode: "required" },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000002",
    title: "7K Steps",
    category: "health",
    days: 7,
    draft: { name: "Walk 7,000 steps", type: "check_off", photoMode: "none" },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000003",
    title: "Early Riser 7",
    category: "discipline",
    days: 7,
    draft: {
      name: "Up and out of bed",
      type: "check_off",
      photoMode: "required",
      time: true,
      timeMode: "by",
      byTime: "06:30",
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000004",
    title: "Fajr Before Sunrise",
    category: "faith",
    days: 7,
    draft: {
      name: "Pray Fajr",
      type: "check_off",
      photoMode: "optional",
      time: true,
      timeMode: "by",
      byTime: "07:00",
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000005",
    title: "3 Good Things",
    category: "mind",
    days: 7,
    draft: { name: "Write 3 good things from today", type: "text", photoMode: "none" },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000006",
    title: "10 Pages a Day",
    category: "learning",
    days: 14,
    draft: {
      name: "Read 10 pages",
      type: "counter",
      photoMode: "none",
      counterTarget: "10",
      counterUnit: "pages",
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000007",
    title: "Quran Daily",
    category: "faith",
    days: 30,
    draft: { name: "Read at least 1 page of Quran", type: "check_off", photoMode: "none" },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000008",
    title: "30-Second Cold Finish",
    category: "discipline",
    days: 14,
    draft: { name: "End your shower with 30 seconds cold", type: "check_off", photoMode: "none" },
  },
];

export type FeaturedTaskInsert = ReturnType<typeof buildTaskInsertPayload>;

export type FeaturedCatalogRow = {
  spec: FeaturedSeedSpec;
  task: FeaturedTaskInsert;
};

function draftFor(spec: FeaturedSeedSpec): AddTaskDraft {
  return {
    name: spec.draft.name,
    type: spec.draft.type,
    timerPreset: spec.draft.timerPreset ?? 5,
    customMinutes: spec.draft.customMinutes ?? "",
    counterTarget: spec.draft.counterTarget ?? "",
    counterUnit: spec.draft.counterUnit ?? "",
    minWords: spec.draft.minWords ?? "",
    runDistance: spec.draft.runDistance ?? "",
    runUnit: spec.draft.runUnit ?? "km",
    photoMode: spec.draft.photoMode,
    camera: spec.draft.photoMode === "required",
    time: spec.draft.time ?? false,
    location: false,
    timeMode: spec.draft.timeMode ?? "by",
    byTime: spec.draft.byTime ?? "07:00",
    fromTime: spec.draft.fromTime ?? "05:00",
    toTime: spec.draft.toTime ?? "06:30",
    placeName: "",
    placeLat: null,
    placeLng: null,
    placeRadius: 100,
  };
}

/** One task, as challenges.create inserts it for a standard solo challenge. */
export function buildFeaturedTask(spec: FeaturedSeedSpec): FeaturedTaskInsert {
  const wizard = payloadFromDraft(draftFor(spec));
  const input = mapWizardTaskToCreateInput(wizard, { requirePhoto: false, allowPhoto: true });
  return buildTaskInsertPayload(input, spec.id, 0);
}

export function buildFeaturedCatalogRows(): FeaturedCatalogRow[] {
  return FEATURED_SEED_SPECS.map((spec) => ({ spec, task: buildFeaturedTask(spec) }));
}

function sqlStr(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: unknown): string {
  return `${sqlStr(JSON.stringify(value))}::jsonb`;
}

/**
 * A bare NULL inside `INSERT … SELECT … FROM (VALUES …)` is text.
 * Numeric and integer columns then fail with
 * "column is numeric but expression is text".
 */
export function sqlTypedNull(
  pgType: "numeric" | "integer" | "text" | "uuid" | "timestamptz" | "boolean" | "jsonb",
): string {
  return `NULL::${pgType}`;
}

const BARE_NULL = /^NULL$/i;

/** Throws if a VALUES cell is an untyped NULL. Direct `INSERT … VALUES` may still use bare NULL. */
export function assertTypedValuesCells(cells: readonly string[]): void {
  for (const cell of cells) {
    if (BARE_NULL.test(cell.trim())) {
      throw new Error(
        `Untyped NULL in a VALUES list is text. Cast it, for example ${sqlTypedNull("numeric")}.`,
      );
    }
  }
}

export function renderFeaturedCatalogSql(rows = buildFeaturedCatalogRows()): string {
  const ids = rows.map((r) => `  ${sqlStr(r.spec.id)}`).join(",\n");
  const challenges = rows
    .map((r) => {
      const s = r.spec;
      const description = r.task.title;
      return `  (${sqlStr(s.id)}, NULL, ${sqlStr(s.title)}, ${sqlStr(description)}, ${s.days}, 'multi_day', 'PUBLIC', 'medium', ${sqlStr(s.category)}, 'published', true, 0, 'solo', 1, NULL, false, NULL, 'allow_replay', false, false)`;
    })
    .join(",\n");
  const taskRows = rows.map((r) => {
    const t = r.task;
    const cells = [
      `${sqlStr(r.spec.id)}::uuid`,
      sqlStr(t.title),
      sqlStr(t.task_type),
      String(t.order_index),
      String(t.require_photo === true),
      sqlJson(t.config),
      sqlStr(t.target_mode),
      String(t.require_location === true),
    ];
    assertTypedValuesCells(cells);
    return `  (${cells.join(", ")})`;
  });
  const tasks = taskRows.join(",\n");
  const windows = rows.filter((r) => r.task.gate_time_mode === "by" && r.task.gate_time_start);
  const updates = windows
    .map((r) => {
      const start = r.task.gate_time_start ?? "";
      return `UPDATE public.challenge_tasks
SET gate_time_mode = 'by', gate_time_start = ${sqlStr(start)}, gate_time_end = NULL
WHERE challenge_id = ${sqlStr(r.spec.id)};`;
    })
    .join("\n\n");

  return `-- APPLIED 2026-10-04 in Supabase.
-- Generated by lib/featured-catalog-seed.ts.
-- The first draft failed: an untyped NULL in FROM (VALUES) is text, and start_value is numeric.
-- What ran: challenges INSERT with descriptions; task INSERT of only
-- challenge_id, title, task_type, order_index, require_photo, config, target_mode, require_location;
-- then UPDATE gate_time_* for Early Riser 7 (by 06:30) and Fajr (by 07:00).
-- Task rows still come from payloadFromDraft → mapWizardTaskToCreateInput → buildTaskInsertPayload.
-- Description is the task sentence. difficulty is medium because create writes medium for Standard.

SELECT id, title, duration_days, category, status, visibility, creator_id, is_featured, participants_count
FROM public.challenges
WHERE id IN (
${ids}
);

INSERT INTO public.challenges (
  id, creator_id, title, description, duration_days, duration_type,
  visibility, difficulty, category, status, is_featured, participants_count,
  participation_type, team_size, run_status, is_hard_mode,
  live_date, replay_policy, require_same_rules, show_replay_label
) VALUES
${challenges}
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.challenge_tasks (
  challenge_id, title, task_type, order_index, require_photo, config, target_mode, require_location
)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.require_photo, v.config, v.target_mode, v.require_location
FROM (VALUES
${tasks}
) AS v(challenge_id, title, task_type, order_index, require_photo, config, target_mode, require_location)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id
  );

${updates}
`;
}
