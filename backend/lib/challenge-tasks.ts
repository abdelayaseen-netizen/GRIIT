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
  min_words?: number;
  photo_required?: boolean;
  require_photo_proof?: boolean;
  strict_timer_mode?: boolean;
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
  [key: string]: unknown;
}

/** Map a raw challenge_tasks row to the API shape expected by the frontend. */
export function mapTaskRowToApi(row: ChallengeTaskRowRaw | null | undefined): ChallengeTaskApiShape | null {
  if (!row) return null;
  const config = row.config ?? {};
  const type = row.task_type ?? "manual";
  return {
    id: row.id,
    title: row.title ?? null,
    type,
    required: config.required ?? true,
    duration_minutes: config.duration_minutes ?? null,
    min_words: config.min_words ?? null,
    photo_required: config.photo_required ?? false,
    require_photo_proof: config.require_photo_proof ?? false,
    strict_timer_mode: config.strict_timer_mode ?? false,
    verification_method: config.verification_method ?? null,
    verification_rule_json: (config.verification_rule_json as VerificationRuleStrava) ?? null,
    order_index: row.order_index ?? null,
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
  return type === "simple" || type === "photo" ? "manual" : type;
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
  [key: string]: unknown;
}): ChallengeTaskConfig {
  const type = task.type ?? "manual";
  const config: ChallengeTaskConfig = {
    required: task.required ?? true,
  };
  if (type === "journal") {
    config.min_words = typeof task.minWords === "number" ? task.minWords : 20;
  }
  if ((type === "timer" || type === "run") && task.durationMinutes != null) {
    config.duration_minutes = task.durationMinutes;
  }
  if (task.photoRequired === true || task.requirePhotoProof === true || type === "photo") {
    config.photo_required = true;
    config.require_photo_proof = true;
  }
  if (type === "timer" && task.strictTimerMode === true) {
    config.strict_timer_mode = true;
  }
  if (task.verificationMethod) {
    config.verification_method = task.verificationMethod;
  }
  if (task.verificationRuleJson && typeof task.verificationRuleJson === "object") {
    config.verification_rule_json = task.verificationRuleJson as VerificationRuleStrava;
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
  });
  return {
    challenge_id: challengeId,
    title: task.title,
    task_type,
    order_index: orderIndex,
    config,
  };
}
