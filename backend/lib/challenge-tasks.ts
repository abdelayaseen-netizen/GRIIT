/**
 * Real schema: public.challenge_tasks has (id, created_at, challenge_id, title, task_type, order_index, config).
 * This module maps between DB shape and the API shape the frontend expects (type, required, duration_minutes, etc.).
 */

/** Strava (or other provider) verification rule stored in config.verification_rule_json */
export interface VerificationRuleStrava {
  sport?: string;
  min_distance_m?: number;
  min_moving_time_s?: number;
}

/** Config JSONB shape stored in challenge_tasks.config */
export interface ChallengeTaskConfig {
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
  verification_rule_json?: VerificationRuleStrava | Record<string, unknown>;
  [key: string]: unknown;
}

/** Raw row from DB (task_type + config, no flat columns) */
export interface ChallengeTaskRowRaw {
  id: string;
  challenge_id?: string;
  title?: string | null;
  task_type: string;
  order_index?: number | null;
  config?: ChallengeTaskConfig | null;
  created_at?: string | null;
}

/** Raw row may include advanced verification columns (migration 20250330000000). */
type TaskRowWithVerification = ChallengeTaskRowRaw & {
  require_photo?: boolean | null;
  timer_direction?: string | null;
  timer_hard_mode?: boolean | null;
  require_heart_rate?: boolean | null;
  heart_rate_threshold?: number | null;
  require_location?: boolean | null;
  location_name?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_radius_meters?: number | null;
  min_duration_minutes?: number | null;
};

/** API shape returned to frontend (flat fields) */
export interface ChallengeTaskApiShape {
  id: string;
  title?: string | null;
  type: string;
  required: boolean;
  duration_minutes?: number | null;
  min_words?: number | null;
  photo_required?: boolean;
  require_photo_proof?: boolean;
  strict_timer_mode?: boolean;
  verification_method?: string | null;
  verification_rule_json?: VerificationRuleStrava | null;
  order_index?: number | null;
  require_photo?: boolean;
  timer_direction?: string | null;
  timer_hard_mode?: boolean;
  tracking_mode?: string | null;
  require_heart_rate?: boolean;
  heart_rate_threshold?: number | null;
  require_location?: boolean;
  location_name?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_radius_meters?: number | null;
  min_duration_minutes?: number | null;
  [key: string]: unknown;
}

/** Map a raw challenge_tasks row to the API shape expected by the frontend. */
export function mapTaskRowToApi(row: ChallengeTaskRowRaw | null | undefined): ChallengeTaskApiShape | null {
  if (!row) return null;
  const config = row.config ?? {};
  const r = row as TaskRowWithVerification;
  const type = row.task_type ?? "manual";
  const ruleJson = config.verification_rule_json as { min_avg_bpm?: number } | undefined;
  const hrFromConfig = config.verification_method === "heart_rate";
  const locFromConfig = config.require_location === true;
  return {
    id: row.id,
    title: row.title ?? null,
    type,
    required: config.required ?? true,
    duration_minutes: r.min_duration_minutes ?? config.duration_minutes ?? null,
    min_words: config.min_words ?? null,
    photo_required: config.photo_required ?? false,
    require_photo_proof: config.require_photo_proof ?? false,
    strict_timer_mode: config.strict_timer_mode ?? false,
    verification_method: config.verification_method ?? null,
    verification_rule_json: (config.verification_rule_json as VerificationRuleStrava) ?? null,
    order_index: row.order_index ?? null,
    require_photo: r.require_photo ?? config.require_photo_proof ?? false,
    timer_direction: r.timer_direction ?? "countdown",
    timer_hard_mode: r.timer_hard_mode ?? config.strict_timer_mode ?? config.timer_hard_mode ?? false,
    tracking_mode: typeof config.tracking_mode === "string" ? config.tracking_mode : null,
    require_heart_rate: r.require_heart_rate === true || hrFromConfig,
    heart_rate_threshold:
      r.heart_rate_threshold ??
      (typeof ruleJson?.min_avg_bpm === "number" ? ruleJson.min_avg_bpm : 100),
    require_location: r.require_location === true || locFromConfig,
    location_name: r.location_name ?? (typeof config.location_name === "string" ? config.location_name : null),
    location_latitude:
      r.location_latitude ??
      (typeof config.location_latitude === "number" ? config.location_latitude : null),
    location_longitude:
      r.location_longitude ??
      (typeof config.location_longitude === "number" ? config.location_longitude : null),
    location_radius_meters:
      r.location_radius_meters ??
      (typeof config.location_radius_meters === "number" ? config.location_radius_meters : 200),
    min_duration_minutes:
      r.min_duration_minutes ??
      (type === "run" && config.tracking_mode === "time" && typeof config.duration_minutes === "number"
        ? config.duration_minutes
        : null),
  };
}

/** Map an array of raw task rows to API shape. */
export function mapTaskRowsToApi(rows: ChallengeTaskRowRaw[] | null | undefined): ChallengeTaskApiShape[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => mapTaskRowToApi(r)!).filter(Boolean);
}

/** Whether the task is required (for filtering). Reads from config. */
export function isTaskRequired(row: ChallengeTaskRowRaw | null | undefined): boolean {
  if (!row) return false;
  const config = row.config ?? {};
  return config.required ?? true;
}

/** Get task type for verification (timer, journal, etc.). */
export function getTaskType(row: ChallengeTaskRowRaw | null | undefined): string {
  if (!row) return "manual";
  return row.task_type ?? "manual";
}

/** Get verification settings from a raw task row. */
export function getTaskVerification(row: ChallengeTaskRowRaw | null | undefined): {
  needsProof: boolean;
  minWords: number;
  durationMinutes: number;
  verificationMethod: string | null;
  verificationRule: VerificationRuleStrava | null;
} {
  const config = row?.config ?? {};
  const needsProof = config.photo_required === true || config.require_photo_proof === true;
  const minWords = typeof config.min_words === "number" ? config.min_words : 0;
  const durationMinutes = typeof config.duration_minutes === "number" ? config.duration_minutes : 0;
  const verificationMethod =
    typeof config.verification_method === "string" ? config.verification_method : null;
  const verificationRule =
    config.verification_rule_json && typeof config.verification_rule_json === "object"
      ? (config.verification_rule_json as VerificationRuleStrava)
      : null;
  return { needsProof, minWords, durationMinutes, verificationMethod, verificationRule };
}

/** Map UI task type to DB task_type (e.g. simple/photo -> manual). */
export function toTaskType(type: string): string {
  if (type === "simple" || type === "photo") return "manual";
  if (type === "workout") return "run";
  return type;
}

/** Build config object for a task from create-flow input. */
export function buildTaskConfigFromInput(task: {
  type: string;
  required?: boolean;
  minWords?: number | null;
  durationMinutes?: number | null;
  photoRequired?: boolean;
  requirePhotoProof?: boolean;
  strictTimerMode?: boolean;
  verificationMethod?: string | null;
  verificationRuleJson?: VerificationRuleStrava | Record<string, unknown> | null;
  journalPrompt?: string | null;
  captureMood?: boolean;
  locationName?: string | null;
  radiusMeters?: number | null;
  [key: string]: unknown;
}): ChallengeTaskConfig {
  const rawType = task.type ?? "manual";
  const type = rawType === "workout" ? "run" : rawType;
  const config: ChallengeTaskConfig = {
    required: task.required ?? true,
  };
  if (type === "journal") {
    config.min_words = typeof task.minWords === "number" ? task.minWords : 20;
    if (typeof task.journalPrompt === "string" && task.journalPrompt.trim()) {
      config.journal_prompt = task.journalPrompt.trim();
    }
    if (task.captureMood === true) {
      config.capture_mood = true;
    }
  }
  if (type === "timer" && task.durationMinutes != null) {
    config.duration_minutes = task.durationMinutes;
  }
  if (type === "run") {
    if (typeof task.trackingMode === "string") {
      config.tracking_mode = task.trackingMode;
    }
    if (task.targetValue != null && typeof task.targetValue === "number") {
      if (task.trackingMode === "time") {
        config.duration_minutes = task.targetValue;
      } else {
        config.target_value = task.targetValue;
      }
    }
    if (typeof task.unit === "string") {
      config.unit = task.unit;
    }
  }
  if (type === "water" && task.targetValue != null && typeof task.targetValue === "number") {
    config.target_value = task.targetValue;
    config.target_kind = "glasses";
  }
  if (type === "reading" && task.targetValue != null && typeof task.targetValue === "number") {
    config.target_pages = task.targetValue;
  }
  if (type === "reading" && task.durationMinutes != null && typeof task.durationMinutes === "number" && task.durationMinutes > 0) {
    config.reading_session_minutes = task.durationMinutes;
  }
  if (type === "counter" && task.targetValue != null && typeof task.targetValue === "number") {
    config.target_count = task.targetValue;
  }
  if (type === "counter" && typeof task.unit === "string" && task.unit.trim()) {
    config.unit_label = task.unit.trim();
  }
  if (task.photoRequired === true || task.requirePhotoProof === true || type === "photo") {
    config.photo_required = true;
    config.require_photo_proof = true;
  }
  if (type === "timer" && task.strictTimerMode === true) {
    config.strict_timer_mode = true;
  }
  if (rawType === "workout" && task.strictTimerMode === true) {
    config.strict_timer_mode = true;
  }
  if (task.verificationMethod) {
    config.verification_method = task.verificationMethod;
  }
  if (task.verificationRuleJson && typeof task.verificationRuleJson === "object") {
    config.verification_rule_json = task.verificationRuleJson as VerificationRuleStrava;
  }
  if (
    (rawType === "workout" || type === "checkin") &&
    typeof task.locationName === "string" &&
    task.locationName.trim()
  ) {
    config.require_location = true;
    config.location_name = task.locationName.trim();
  }
  if (task.radiusMeters != null && typeof task.radiusMeters === "number" && task.radiusMeters > 0) {
    config.location_radius_meters = task.radiusMeters;
  }
  return config;
}

/** Build insert payload for one challenge_task (real schema: challenge_id, title, task_type, order_index, config). */
export function buildTaskInsertPayload(
  task: {
    title: string;
    type: string;
    required?: boolean;
    minWords?: number | null;
    durationMinutes?: number | null;
    photoRequired?: boolean;
    requirePhotoProof?: boolean;
    strictTimerMode?: boolean;
    verificationMethod?: string | null;
    verificationRuleJson?: VerificationRuleStrava | Record<string, unknown> | null;
    [key: string]: unknown;
  },
  challengeId: string,
  orderIndex: number
): { challenge_id: string; title: string; task_type: string; order_index: number; config: ChallengeTaskConfig } {
  const task_type = toTaskType(task.type ?? "manual");
  const t = task as Record<string, unknown>;
  const config = buildTaskConfigFromInput({
    type: task.type,
    required: task.required,
    minWords: task.minWords,
    durationMinutes: task.durationMinutes,
    photoRequired: task.photoRequired,
    requirePhotoProof: task.requirePhotoProof,
    strictTimerMode: task.strictTimerMode,
    verificationMethod: task.verificationMethod,
    verificationRuleJson: task.verificationRuleJson,
    targetValue: t.targetValue,
    trackingMode: t.trackingMode,
    unit: t.unit,
    journalPrompt: typeof t.journalPrompt === "string" ? t.journalPrompt : undefined,
    captureMood: t.captureMood === true,
    locationName: typeof t.locationName === "string" ? t.locationName : undefined,
    radiusMeters: typeof t.radiusMeters === "number" ? t.radiusMeters : undefined,
  });
  return {
    challenge_id: challengeId,
    title: task.title,
    task_type,
    order_index: orderIndex,
    config,
  };
}
