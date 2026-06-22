import type { JournalCategory, WordLimitMode, ScheduleType, WindowMode, TimezoneMode } from "@/types";
import type { TaskWizardHardConfig } from "@/lib/create-challenge-helpers";

type TaskType =
  | "journal"
  | "timer"
  | "photo"
  | "run"
  | "simple"
  | "checkin"
  | "water"
  | "reading"
  | "counter"
  | "workout";
type TrackingMode = "distance" | "time";
type DistanceUnit = "miles" | "km" | "meters";

interface LocationItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface TaskEditorTask {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  required: boolean;
  minWords?: number;
  targetValue?: number;
  unit?: DistanceUnit | "minutes" | "glasses" | "pages";
  trackingMode?: TrackingMode;
  photoRequired?: boolean;
  locationName?: string;
  radiusMeters?: number;
  durationMinutes?: number;
  mustCompleteInSession?: boolean;
  locations?: LocationItem[];
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
  routineAnchor?: "wake_up" | "morning_coffee" | "after_breakfast" | "after_work" | "before_bed" | "after_brushing_teeth" | "lunch_break" | "custom";
  routineAnchorCustom?: string | null;
  taskDurationMinutes?: number | null;
  windowMode?: WindowMode;
  windowStartOffsetMin?: number | null;
  windowEndOffsetMin?: number | null;
  hardWindowStartOffsetMin?: number | null;
  hardWindowEndOffsetMin?: number | null;
  hardWindowEnabled?: boolean;
  timezoneMode?: TimezoneMode;
  challengeTimezone?: string | null;
  requirePhotoProof?: boolean;
  strictTimerMode?: boolean;
  targetMode?: "fixed" | "ramp";
  startValue?: number;
  startDurationMinutes?: number;
  verificationMethod?: string;
  verificationRuleJson?: {
    sport?: string;
    min_distance_m?: number;
    min_moving_time_s?: number;
    min_avg_bpm?: number;
    workout_type?: string;
    griit_illustration_url?: string;
    griit_illustration_caption?: string;
  } | null;
  config?: TaskWizardHardConfig;
}
