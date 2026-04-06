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
      min_words: t.min_words,
      timer_direction: t.timer_direction,
      timer_hard_mode: t.timer_hard_mode ?? t.strict_timer_mode,
      require_heart_rate: t.require_heart_rate,
      heart_rate_threshold: t.heart_rate_threshold,
      require_location: requireLoc,
      location_name: t.location_name ?? cfg.location_name,
      location_latitude: t.location_latitude ?? cfg.location_latitude,
      location_longitude: t.location_longitude ?? cfg.location_longitude,
      location_radius_meters: t.location_radius_meters ?? cfg.location_radius_meters,
      journal_prompt: typeof t.journal_prompt === "string" ? t.journal_prompt : undefined,
      hard_mode: cfg.hard_mode === true,
      schedule_window_start: typeof cfg.schedule_window_start === "string" ? cfg.schedule_window_start : undefined,
      schedule_window_end: typeof cfg.schedule_window_end === "string" ? cfg.schedule_window_end : undefined,
      schedule_timezone: typeof cfg.schedule_timezone === "string" ? cfg.schedule_timezone : undefined,
      require_camera_only: cfg.require_camera_only === true,
      require_strava: cfg.require_strava === true,
    });
  } catch (err) {
    captureError(err, "BuildTaskConfigParam");
    return "{}";
  }
}
