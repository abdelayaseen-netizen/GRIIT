/**
 * Generate one 24-hour daily challenge from templates.
 * Used by cron (e.g. GET /api/cron/daily-challenge) or manually.
 * Creates a challenge with creator_id null, visibility PUBLIC, status published.
 */

import { buildTaskInsertPayload } from "./challenge-tasks";
import { DAILY_CHALLENGE_TEMPLATES } from "./daily-challenge-templates";

/** Pick a template deterministically by date so the same day gets the same challenge. */
export function pickTemplateForDate(date: Date): (typeof DAILY_CHALLENGE_TEMPLATES)[number] {
  const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let n = 0;
  for (let i = 0; i < dayKey.length; i++) n = (n * 31 + dayKey.charCodeAt(i)) >>> 0;
  const index = n % DAILY_CHALLENGE_TEMPLATES.length;
  return DAILY_CHALLENGE_TEMPLATES[index];
}

/** Create one daily (24h) challenge for the given date. Idempotent per day: check for existing before insert. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDailyChallengeIfMissing(supabase: any, date: Date): Promise<{ created: boolean; id?: string }> {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const template = pickTemplateForDate(date);

  const { data: existing } = await supabase
    .from("challenges")
    .select("id")
    .eq("duration_type", "24h")
    .eq("visibility", "PUBLIC")
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { created: false, id: existing.id };
  }

  const insertPayload = {
    creator_id: null,
    title: template.title,
    description: template.description,
    duration_type: "24h",
    duration_days: 1,
    category: template.category,
    difficulty: "medium",
    status: "published",
    visibility: "PUBLIC",
    participation_type: "solo",
    live_date: start.toISOString(),
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    is_featured: false,
    participants_count: 0,
  };

  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .insert(insertPayload)
    .select("id")
    .single();

  if (challengeError || !challenge) {
    throw new Error(challengeError?.message ?? "Failed to insert daily challenge.");
  }

  const tasksToInsert = template.tasks.map((task, i) =>
    buildTaskInsertPayload(
      {
        title: task.title,
        type: task.type,
        required: task.required ?? true,
        minWords: task.minWords ?? undefined,
        durationMinutes: task.durationMinutes ?? undefined,
        requirePhotoProof: task.type === "photo",
      },
      challenge.id,
      i
    )
  );

  const { error: tasksError } = await supabase.from("challenge_tasks").insert(tasksToInsert);

  if (tasksError) {
    await supabase.from("challenges").delete().eq("id", challenge.id);
    throw new Error(tasksError.message ?? "Failed to insert daily challenge tasks.");
  }

  return { created: true, id: challenge.id };
}
