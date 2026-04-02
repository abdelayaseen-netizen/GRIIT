/**
 * Hard Mode verification fields for task completion UI (mirrors backend task config JSONB subset).
 */

export interface TaskHardVerificationConfig {
  hard_mode?: boolean;
  schedule_window_start?: string;
  schedule_window_end?: string;
  schedule_timezone?: string;
  require_location?: boolean;
  location_latitude?: number;
  location_longitude?: number;
  location_radius_meters?: number;
  location_name?: string;
  require_camera_only?: boolean;
  require_strava?: boolean;
}
