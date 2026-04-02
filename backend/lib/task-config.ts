/**
 * JSONB shape for `challenge_tasks.config` (core + Hard Mode verification keys).
 */
export interface TaskConfig {
  required?: boolean;
  duration_minutes?: number;
  tracking_mode?: string;
  min_words?: number;
  photo_required?: boolean;
  require_photo_proof?: boolean;
  strict_timer_mode?: boolean;
  timer_hard_mode?: boolean;
  require_location?: boolean;
  location_name?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_radius_meters?: number;
  verification_method?: string;
  verification_rule_json?: Record<string, unknown>;
  target_value?: number;
  target_kind?: string;
  target_pages?: number;
  target_count?: number;
  target_unit?: string;
  unit?: string;
  unit_label?: string;
  journal_prompt?: string;
  capture_mood?: boolean;
  reading_session_minutes?: number;

  hard_mode?: boolean;
  schedule_window_start?: string;
  schedule_window_end?: string;
  schedule_timezone?: string;
  require_camera_only?: boolean;
  require_strava?: boolean;
  strava_min_distance_meters?: number;
  strava_activity_type?: string;
}
