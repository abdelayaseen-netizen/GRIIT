/**
 * Shared helpers for the challenge creation flow.
 * Centralizes validation, duration, and API payload building so create screen
 * and future flows (templates, duplication) stay consistent.
 */

import { sanitizeChallengeTitle, sanitizeChallengeDescription } from "@/lib/sanitize";
import type {
  ChallengeType,
  ReplayPolicy,
  ChallengeVisibility,
  ScheduleType,
  TimezoneMode,
  WordLimitMode,
  JournalCategory,
} from "@/types";

/** Per-task Hard Mode fields (create wizard → challenges.create config JSONB). */
export interface TaskWizardHardConfig {
  hard_mode?: boolean;
  schedule_window_start?: string;
  schedule_window_end?: string;
  schedule_timezone?: string;
  require_location?: boolean;
  location_name?: string;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_radius_meters?: number;
  require_camera_only?: boolean;
  require_strava?: boolean;
}

/** Minimal task shape for validation and payload. Aligns with create screen TaskTemplate. */
export interface CreateTaskDraft {
  id: string;
  title: string;
  type: string;
  required: boolean;
  minWords?: number;
  targetValue?: number;
  unit?: string;
  trackingMode?: string;
  photoRequired?: boolean;
  requirePhotoProof?: boolean;
  strictTimerMode?: boolean;
  locationName?: string;
  radiusMeters?: number;
  durationMinutes?: number;
  mustCompleteInSession?: boolean;
  locations?: { id: string; name: string; lat: number; lng: number; radiusMeters: number }[];
  startTime?: string;
  startWindowMinutes?: number;
  minSessionMinutes?: number;
  journalType?: JournalCategory[];
  journalPrompt?: string;
  allowFreeWrite?: boolean;
  captureMood?: boolean;
  captureEnergy?: boolean;
  captureBodyState?: boolean;
  wordLimitEnabled?: boolean;
  wordLimitMode?: WordLimitMode;
  wordLimitWords?: number | null;
  timeEnforcementEnabled?: boolean;
  scheduleType?: ScheduleType;
  anchorTimeLocal?: string | null;
  taskDurationMinutes?: number | null;
  windowStartOffsetMin?: number | null;
  windowEndOffsetMin?: number | null;
  hardWindowEnabled?: boolean;
  hardWindowStartOffsetMin?: number | null;
  hardWindowEndOffsetMin?: number | null;
  timezoneMode?: TimezoneMode;
  challengeTimezone?: string | null;
  verificationMethod?: string;
  verificationRuleJson?: {
    sport?: string;
    min_distance_m?: number;
    min_moving_time_s?: number;
    griit_illustration_url?: string;
    griit_illustration_caption?: string;
  } | null;
  /** Hard Mode verification (merged into API task payload). */
  config?: TaskWizardHardConfig;
}

export type ParticipationTypeUI = "solo" | "duo" | "team" | "shared_goal";
export type DeadlineTypeUI = "none" | "soft" | "hard";

export interface CreateChallengeDraft {
  title: string;
  description: string;
  type: ChallengeType;
  durationDays: number | null;
  customDuration: string;
  categories: string[];
  tasks: CreateTaskDraft[];
  liveDate: string;
  replayPolicy: ReplayPolicy;
  requireSameRules: boolean;
  showReplayLabel: boolean;
  visibility: ChallengeVisibility;
  participationType?: ParticipationTypeUI;
  teamSize?: number;
  sharedGoalTarget?: number;
  sharedGoalUnit?: string;
  deadlineType?: DeadlineTypeUI;
  deadlineDate?: string | null;
  /** Sent to API as challenge difficulty (hard enforces photo proof server-side). */
  difficulty?: "standard" | "hard";
  /** published = live create; draft = saved without launching. */
  status?: "published" | "draft";
}

/** Compute effective duration in days from draft state. */
export function getDurationFromDraft(
  challengeType: ChallengeType,
  durationDays: number | null,
  customDuration: string
): number {
  if (challengeType === "one_day") return 1;
  if (durationDays != null) return durationDays;
  const custom = parseInt(customDuration, 10);
  return Number.isNaN(custom) ? 0 : custom;
}

/** Validate task list for create; returns first error message if invalid. sharedGoal: tasks optional. */
export function validateDraftTasks(
  tasks: CreateTaskDraft[],
  participationType?: ParticipationTypeUI
): { valid: boolean; error?: string } {
  const isSharedGoal = participationType === "shared_goal";
  if (tasks.length === 0 && !isSharedGoal) {
    return { valid: false, error: "Add at least one task" };
  }
  for (const task of tasks) {
    if (!task.title.trim()) {
      return { valid: false, error: "Task is missing a title" };
    }
    switch (task.type) {
      case "journal":
        if (!task.journalPrompt || task.journalPrompt.trim().length < 20) {
          return { valid: false, error: `Task "${task.title}" needs a prompt (min 20 chars)` };
        }
        if ((!task.journalType || task.journalType.length === 0) && !task.allowFreeWrite) {
          return { valid: false, error: `Task "${task.title}" needs at least one journal type` };
        }
        break;
      case "timer":
        if (!task.durationMinutes || task.durationMinutes <= 0) {
          return { valid: false, error: `Task "${task.title}" needs duration` };
        }
        break;
      case "run":
        if (task.trackingMode === "distance") {
          if (!task.targetValue || task.targetValue <= 0) {
            return { valid: false, error: `Task "${task.title}" needs distance` };
          }
        } else if (task.trackingMode === "time") {
          if (!task.targetValue || task.targetValue <= 0) {
            return { valid: false, error: `Task "${task.title}" needs time duration` };
          }
        }
        break;
      case "checkin":
        if (!task.locationName || !task.locationName.trim()) {
          return { valid: false, error: `Task "${task.title}" needs location name` };
        }
        if (!task.radiusMeters || task.radiusMeters <= 0) {
          return { valid: false, error: `Task "${task.title}" needs radius` };
        }
        break;
      case "water":
        if (!task.targetValue || task.targetValue <= 0) {
          return { valid: false, error: `Task "${task.title}" needs a target (glasses)` };
        }
        break;
      case "reading":
        if (!task.targetValue || task.targetValue <= 0) {
          return { valid: false, error: `Task "${task.title}" needs target pages` };
        }
        break;
      case "counter":
        if (!task.targetValue || task.targetValue <= 0) {
          return { valid: false, error: `Task "${task.title}" needs a target count` };
        }
        break;
    }
  }
  return { valid: true };
}

/** Build API payload for challenges.create from draft. Single source of truth for task -> API shape. */
export function buildCreatePayload(draft: CreateChallengeDraft): Record<string, unknown> {
  const partType = draft.participationType ?? "solo";
  let durationDays = getDurationFromDraft(draft.type, draft.durationDays, draft.customDuration);
  if (draft.type === "standard" && durationDays < 1) durationDays = 1;
  if (partType === "shared_goal" && draft.deadlineDate && (draft.deadlineType === "soft" || draft.deadlineType === "hard")) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(draft.deadlineDate);
    end.setHours(0, 0, 0, 0);
    const days = Math.max(1, Math.ceil((end.getTime() - today.getTime()) / 86400000));
    durationDays = days;
  }
  const visibility = (draft.visibility && String(draft.visibility).toUpperCase()) || "FRIENDS";
  const payload: Record<string, unknown> = {
    title: sanitizeChallengeTitle(draft.title),
    description: sanitizeChallengeDescription(draft.description ?? ""),
    type: draft.type,
    durationDays,
    difficulty: draft.difficulty ?? "standard",
    status: draft.status ?? "published",
    categories: draft.categories,
    liveDate: draft.type === "one_day" ? draft.liveDate : undefined,
    replayPolicy: draft.type === "one_day" ? draft.replayPolicy : undefined,
    requireSameRules: draft.requireSameRules,
    showReplayLabel: draft.showReplayLabel,
    visibility: visibility === "PUBLIC" || visibility === "PRIVATE" ? visibility : "FRIENDS",
    participationType: partType,
    teamSize:
      partType === "duo"
        ? 2
        : partType === "team" || partType === "shared_goal"
          ? (draft.teamSize ?? 10)
          : 1,
    tasks: draft.tasks.map((task) => ({
      title: task.title,
      type: task.type,
      required: task.required,
      minWords: task.minWords,
      targetValue: task.targetValue,
      unit: task.unit,
      trackingMode: task.trackingMode,
      photoRequired: task.photoRequired,
      requirePhotoProof: task.requirePhotoProof,
      strictTimerMode: task.type === "timer" ? task.strictTimerMode : undefined,
      locationName: task.locationName,
      radiusMeters: task.radiusMeters,
      durationMinutes: task.durationMinutes,
      mustCompleteInSession: task.mustCompleteInSession,
      locations: task.locations,
      startTime: task.startTime,
      startWindowMinutes: task.startWindowMinutes,
      minSessionMinutes: task.minSessionMinutes,
      journalType: task.journalType,
      journalPrompt: task.journalPrompt,
      allowFreeWrite: task.allowFreeWrite,
      captureMood: task.captureMood,
      captureEnergy: task.captureEnergy,
      captureBodyState: task.captureBodyState,
      wordLimitEnabled: task.wordLimitEnabled,
      wordLimitMode: task.wordLimitMode,
      wordLimitWords: task.wordLimitWords,
      timeEnforcementEnabled: task.timeEnforcementEnabled,
      scheduleType: task.timeEnforcementEnabled ? (task.scheduleType ?? "DAILY") : undefined,
      anchorTimeLocal: task.timeEnforcementEnabled ? task.anchorTimeLocal : undefined,
      taskDurationMinutes: task.timeEnforcementEnabled ? task.taskDurationMinutes : undefined,
      windowStartOffsetMin: task.timeEnforcementEnabled ? task.windowStartOffsetMin : undefined,
      windowEndOffsetMin: task.timeEnforcementEnabled ? task.windowEndOffsetMin : undefined,
      hardWindowEnabled: task.timeEnforcementEnabled ? task.hardWindowEnabled : undefined,
      hardWindowStartOffsetMin:
        task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowStartOffsetMin : undefined,
      hardWindowEndOffsetMin:
        task.timeEnforcementEnabled && task.hardWindowEnabled ? task.hardWindowEndOffsetMin : undefined,
      timezoneMode: task.timeEnforcementEnabled ? task.timezoneMode : undefined,
      challengeTimezone:
        task.timeEnforcementEnabled && task.timezoneMode === "CHALLENGE_TIMEZONE" ? task.challengeTimezone : undefined,
      verificationMethod: task.verificationMethod ?? undefined,
      verificationRuleJson: task.verificationRuleJson ?? undefined,
      hard_mode: task.config?.hard_mode,
      schedule_window_start: task.config?.schedule_window_start,
      schedule_window_end: task.config?.schedule_window_end,
      schedule_timezone: task.config?.schedule_timezone,
      require_location: task.config?.require_location,
      location_name: task.config?.location_name,
      location_latitude: task.config?.location_latitude ?? undefined,
      location_longitude: task.config?.location_longitude ?? undefined,
      location_radius_meters: task.config?.location_radius_meters,
      require_camera_only: task.config?.require_camera_only,
      require_strava: task.config?.require_strava,
    })),
  };
  if (partType === "shared_goal") {
    if (draft.sharedGoalTarget != null) payload.sharedGoalTarget = draft.sharedGoalTarget;
    if (draft.sharedGoalUnit != null) payload.sharedGoalUnit = draft.sharedGoalUnit;
    if (draft.deadlineType != null && draft.deadlineType !== "none") payload.deadlineType = draft.deadlineType;
    if (draft.deadlineDate != null && draft.deadlineDate.trim()) payload.deadlineDate = draft.deadlineDate.trim();
  }
  return payload;
}

/** Step 1 can proceed when title, duration (or shared-goal goal + optional deadline), and (for one_day) liveDate are set. */
export function canProceedStep1(
  title: string,
  duration: number,
  challengeType: ChallengeType,
  liveDate: string,
  participationType?: ParticipationTypeUI,
  sharedGoalTarget?: number,
  sharedGoalUnit?: string,
  deadlineType?: DeadlineTypeUI,
  deadlineDate?: string | null
): boolean {
  if (!title.trim()) return false;
  const isSharedGoal = participationType === "shared_goal";
  if (isSharedGoal) {
    const hasGoal = (sharedGoalTarget ?? 0) > 0 && Boolean((sharedGoalUnit ?? "").trim());
    if (!hasGoal) return false;
    if (deadlineType === "hard" && deadlineDate) {
      const today = new Date().toISOString().slice(0, 10);
      if (deadlineDate < today) return false;
    }
    return true;
  }
  return duration > 0 && (challengeType === "standard" || Boolean(liveDate));
}
