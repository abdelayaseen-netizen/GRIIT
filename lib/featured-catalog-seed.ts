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

function sqlText(value: string | null | undefined): string {
  if (value == null || value === "") return "NULL";
  return sqlStr(value);
}

export function renderFeaturedCatalogSql(rows = buildFeaturedCatalogRows()): string {
  const ids = rows.map((r) => `  ${sqlStr(r.spec.id)}`).join(",\n");
  const challenges = rows
    .map((r) => {
      const s = r.spec;
      return `  (${sqlStr(s.id)}, NULL, ${sqlStr(s.title)}, '', ${s.days}, 'multi_day', 'PUBLIC', 'medium', ${sqlStr(s.category)}, 'published', true, 0, 'solo', 1, NULL, false, NULL, 'allow_replay', false, false)`;
    })
    .join(",\n");
  const tasks = rows
    .map((r) => {
      const t = r.task;
      return `  (${sqlStr(r.spec.id)}::uuid, ${sqlStr(t.title)}, ${sqlStr(t.task_type)}, ${t.order_index}, ${t.require_photo === true}, ${sqlJson(t.config)}, ${sqlStr(t.target_mode)}, NULL, NULL, NULL, NULL, ${t.require_location === true}, NULL, NULL, NULL, NULL, ${sqlText(t.gate_time_mode)}, ${sqlText(t.gate_time_start)}, ${sqlText(t.gate_time_end)})`;
    })
    .join(",\n");

  return `-- DRAFT. DO NOT APPLY.
-- v44 featured catalog. Generated by lib/featured-catalog-seed.ts.
-- Task rows go through payloadFromDraft → mapWizardTaskToCreateInput → buildTaskInsertPayload,
-- the same path challenges.create uses for a standard solo challenge.
-- Catalog overrides vs that path: fixed id, creator_id NULL, is_featured true, participants_count 0.
-- difficulty is medium because create writes medium for Standard (not easy).
-- require_same_rules and show_replay_label are false because the wizard sends those for Standard.
-- location_* columns are NULL. The builder does not write them; these eight tasks have no place.
-- Preview first. The INSERTs are the seed an operator would run later.

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
  challenge_id, title, task_type, order_index, require_photo, config,
  target_mode, start_value, start_duration_minutes, routine_anchor, routine_anchor_custom,
  require_location, location_name, location_latitude, location_longitude, location_radius_meters,
  gate_time_mode, gate_time_start, gate_time_end
)
SELECT v.challenge_id, v.title, v.task_type, v.order_index, v.require_photo, v.config,
  v.target_mode, v.start_value, v.start_duration_minutes, v.routine_anchor, v.routine_anchor_custom,
  v.require_location, v.location_name, v.location_latitude, v.location_longitude, v.location_radius_meters,
  v.gate_time_mode, v.gate_time_start, v.gate_time_end
FROM (VALUES
${tasks}
) AS v(
  challenge_id, title, task_type, order_index, require_photo, config,
  target_mode, start_value, start_duration_minutes, routine_anchor, routine_anchor_custom,
  require_location, location_name, location_latitude, location_longitude, location_radius_meters,
  gate_time_mode, gate_time_start, gate_time_end
)
WHERE EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = v.challenge_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.challenge_tasks ct WHERE ct.challenge_id = v.challenge_id
  );
`;
}
