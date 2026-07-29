import { captureError } from "@/lib/sentry";

/** JSON for `app/task/complete` — matches TaskCompleteConfig from mapped challenge_tasks or Supabase task rows. */
export function buildTaskConfigParam(task: Record<string, unknown> | undefined | null): string {
  if (!task) return "{}";
  try {
    const t = task;
    const cfg =
      typeof t.config === "object" && t.config !== null ? (t.config as Record<string, unknown>) : {};
    const requireLoc = t.require_location === true || cfg.require_location === true;
    return JSON.stringify({
      require_photo:
        t.require_photo === true ||
        t.require_photo_proof === true ||
        cfg.photo_required === true ||
        cfg.require_photo_proof === true,
      min_duration_minutes: t.min_duration_minutes ?? t.duration_minutes,
      scheduled_time: typeof t.scheduled_time === "string" ? t.scheduled_time : undefined,
      min_words:
        typeof t.min_words === "number"
          ? t.min_words
          : typeof cfg.min_words === "number"
            ? cfg.min_words
            : undefined,
      timer_direction: t.timer_direction,
      timer_hard_mode: t.timer_hard_mode ?? t.strict_timer_mode,
      require_heart_rate: t.require_heart_rate,
      heart_rate_threshold: t.heart_rate_threshold,
      require_location: requireLoc,
      location_name: t.location_name ?? cfg.location_name,
      location_latitude: t.location_latitude ?? cfg.location_latitude,
      location_longitude: t.location_longitude ?? cfg.location_longitude,
      location_radius_meters: t.location_radius_meters ?? cfg.location_radius_meters,
      // Prefer flattened field; fall back to challenge_tasks.config.journal_prompt.
      journal_prompt:
        typeof t.journal_prompt === "string" && t.journal_prompt.trim()
          ? t.journal_prompt
          : typeof cfg.journal_prompt === "string" && cfg.journal_prompt.trim()
            ? cfg.journal_prompt
            : undefined,
      hard_mode: cfg.hard_mode === true,
      schedule_window_start: typeof cfg.schedule_window_start === "string" ? cfg.schedule_window_start : undefined,
      schedule_window_end: typeof cfg.schedule_window_end === "string" ? cfg.schedule_window_end : undefined,
      schedule_timezone: typeof cfg.schedule_timezone === "string" ? cfg.schedule_timezone : undefined,
      require_camera_only: cfg.require_camera_only === true,
      require_strava: cfg.require_strava === true,
      // Additive only — optional Ready subtype source for run (and others).
      unit_label: typeof cfg.unit_label === "string" ? cfg.unit_label : undefined,
      // Counter/water/reading targets — prefer flattened, fall back to config.
      daily_target:
        typeof t.daily_target === "number"
          ? t.daily_target
          : typeof cfg.daily_target === "number"
            ? cfg.daily_target
            : undefined,
      goal:
        typeof t.goal === "number"
          ? t.goal
          : typeof cfg.goal === "number"
            ? cfg.goal
            : undefined,
      target_value:
        typeof t.target_value === "number"
          ? t.target_value
          : typeof cfg.target_value === "number"
            ? cfg.target_value
            : undefined,
      target_count:
        typeof t.target_count === "number"
          ? t.target_count
          : typeof cfg.target_count === "number"
            ? cfg.target_count
            : undefined,
      target_pages:
        typeof t.target_pages === "number"
          ? t.target_pages
          : typeof cfg.target_pages === "number"
            ? cfg.target_pages
            : undefined,
      cup_count:
        typeof t.cup_count === "number"
          ? t.cup_count
          : typeof cfg.cup_count === "number"
            ? cfg.cup_count
            : undefined,
      pages:
        typeof t.pages === "number"
          ? t.pages
          : typeof cfg.pages === "number"
            ? cfg.pages
            : undefined,
    });
  } catch (err) {
    captureError(err, "BuildTaskConfigParam");
    return "{}";
  }
}
