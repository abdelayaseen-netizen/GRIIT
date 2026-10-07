/**
 * Add-task sheet draft (frame 42). Builds { type, config, gates, gateTime }.
 */

import type { GateTime, PhotoMode, TaskGate, TaskModelType } from "@/backend/lib/task-model";
import { SELF_REPORTED, taskQuantityLine, wizardGateLine } from "@/lib/task-ui";
import {
  DEFAULT_BETWEEN_END_HHMM,
  DEFAULT_BETWEEN_START_HHMM,
  DEFAULT_BY_HHMM,
  betweenEndAfterStart,
} from "@/lib/time-gate-picker";

export const ADD_TASK_HEADING = "Add a task";
export const ADD_TASK_NAME_LABEL = "Task name";
export const ADD_TASK_NAME_PLACEHOLDER = "e.g. Read 10 pages";
export const ADD_TASK_WHAT_YOU_DO = "What you do";
export const ADD_TASK_WHAT_PROVES = "How it's proven";
export const ADD_TASK_PHOTO = "Photo";
export const ADD_TASK_LIMITS = "Limits";
export const ADD_TASK_ON_HOME = "On Home";
export const ADD_TASK_PHOTO_SEGMENTS = ["Required", "Optional", "None"] as const;
export const ADD_TASK_PHOTO_CAPTIONS: Record<PhotoMode, string> = {
  required: "Only counts with a photo taken in the app.",
  optional: "Add a photo or mark it done. With no photo it posts as self-reported.",
  none: "Mark it done. Posts as self-reported.",
};
export const OPTIONAL_PHOTO_BODY =
  "Photo optional. With a photo it shows the camera seal. Without one it posts as self-reported.";
export const OPTIONAL_PHOTO_ADD = "Add a photo";
export const OPTIONAL_PHOTO_DONE = "Done without photo";

export type AddTaskProof = "self" | "self_time" | "photo" | "photo_time" | "photo_place";

export const ADD_TASK_PROOFS: readonly {
  id: AddTaskProof;
  title: string;
  caption: string;
}[] = [
  {
    id: "self",
    title: "Self-report",
    caption: "Self-reported.",
  },
  {
    id: "self_time",
    title: "Self-report + time window",
    caption: "You say it is done, only inside the hours you set.",
  },
  {
    id: "photo",
    title: "Photo",
    caption: "A photo taken in the app.",
  },
  {
    id: "photo_time",
    title: "Photo + time window",
    caption: "A photo, only inside the hours you set.",
  },
  {
    id: "photo_place",
    title: "Photo + place",
    caption: "A photo, only at the place you set.",
  },
] as const;
export const ADD_TASK_CTA = "Add task";
export const ADD_TASK_SET_PLACE = "Set place";
export const ADD_TASK_COMMON = "Common tasks";
export const ADD_TASK_SEARCH_PLACE = "Search an address";
export const ADD_TASK_USE_LOCATION = "Use my current location";
export const ADD_TASK_HOW_CLOSE = "How close you have to be";
export const ADD_TASK_SAVE_PLACE = "Save place";
export const ADD_TASK_PLACE_NO_MAP = "A bigger radius is easier to pass.";

export const ADD_TASK_TYPE_CHIPS: { id: TaskModelType; label: string }[] = [
  { id: "check_off", label: "Check off" },
  { id: "timer", label: "Timer" },
  { id: "counter", label: "Counter" },
  { id: "text", label: "Text" },
  { id: "run", label: "Run" },
];

export const TIMER_CHIPS = [5, 10, 15, 30] as const;
export const TIMER_CUSTOM = "Custom";

export const PLACE_RADIUS_CHIPS = [
  { meters: 100, label: "100 m" },
  { meters: 250, label: "250 m" },
  { meters: 1000, label: "1 km" },
] as const;

export type AddTaskStarter = {
  label: string;
  name: string;
  type: TaskModelType;
  counterTarget?: string;
  counterUnit?: string;
  minWords?: string;
  runDistance?: string;
};

export const ADD_TASK_STARTERS: AddTaskStarter[] = [
  { label: "Pray", name: "Pray", type: "check_off" },
  { label: "Read", name: "Read", type: "counter", counterTarget: "10", counterUnit: "pages" },
  { label: "Water", name: "Water", type: "counter", counterTarget: "8", counterUnit: "oz" },
  { label: "Journal", name: "Journal", type: "text", minWords: "30" },
  { label: "Workout", name: "Workout", type: "check_off" },
  { label: "Stretch", name: "Stretch", type: "check_off" },
];

export type AddTaskDraft = {
  name: string;
  type: TaskModelType;
  timerPreset: number | "custom";
  customMinutes: string;
  counterTarget: string;
  counterUnit: string;
  minWords: string;
  runDistance: string;
  runUnit: "km" | "mi";
  photoMode: PhotoMode;
  camera: boolean;
  time: boolean;
  location: boolean;
  timeMode: "by" | "between";
  byTime: string;
  fromTime: string;
  toTime: string;
  placeName: string;
  placeLat: number | null;
  placeLng: number | null;
  placeRadius: number;
};

export const ADD_TASK_DEFAULT: AddTaskDraft = {
  name: "",
  type: "check_off",
  timerPreset: 5,
  customMinutes: "",
  counterTarget: "",
  counterUnit: "",
  minWords: "",
  runDistance: "",
  runUnit: "km",
  photoMode: "none",
  camera: false,
  time: false,
  location: false,
  timeMode: "by",
  byTime: DEFAULT_BY_HHMM,
  fromTime: DEFAULT_BETWEEN_START_HHMM,
  toTime: DEFAULT_BETWEEN_END_HHMM,
  placeName: "",
  placeLat: null,
  placeLng: null,
  placeRadius: 100,
};

export function proofFromDraft(draft: Pick<AddTaskDraft, "camera" | "time" | "location">): AddTaskProof {
  if (draft.location) return "photo_place";
  if (draft.time) return draft.camera ? "photo_time" : "self_time";
  if (draft.camera) return "photo";
  return "self";
}

export function applyProof(draft: AddTaskDraft, proof: AddTaskProof): AddTaskDraft {
  switch (proof) {
    case "self":
      return { ...draft, photoMode: "none", camera: false, time: false, location: false };
    case "self_time":
      return { ...draft, photoMode: "none", camera: false, time: true, location: false };
    case "photo":
      return { ...draft, photoMode: "required", camera: true, time: false, location: false };
    case "photo_time":
      return { ...draft, photoMode: "required", camera: true, time: true, location: false };
    case "photo_place":
      return { ...draft, photoMode: "required", camera: true, time: false, location: true };
  }
}

export function photoModeFromDraft(draft: Pick<AddTaskDraft, "photoMode" | "camera">): PhotoMode {
  if (draft.photoMode === "required" || draft.photoMode === "optional" || draft.photoMode === "none") {
    return draft.photoMode;
  }
  return draft.camera ? "required" : "none";
}

export function photoPreviewLabel(mode: PhotoMode): string {
  if (mode === "required") return "Camera";
  if (mode === "optional") return "Photo optional";
  return SELF_REPORTED;
}

export function placePreviewLine(draft: Pick<AddTaskDraft, "placeName" | "placeRadius">): string {
  const name = draft.placeName.trim() || "Place";
  const chip = PLACE_RADIUS_CHIPS.find((c) => c.meters === draft.placeRadius);
  const radius = chip?.label ?? `${draft.placeRadius} m`;
  return `${name} · Within ${radius}`;
}

export function gatesFromDraft(draft: AddTaskDraft): TaskGate[] {
  const gates: TaskGate[] = [];
  if (photoModeFromDraft(draft) === "required") gates.push("camera");
  if (draft.time) gates.push("time");
  if (draft.location) gates.push("location");
  return gates;
}

export function gateTimeFromDraft(draft: AddTaskDraft): GateTime | undefined {
  if (!draft.time) return undefined;
  if (draft.timeMode === "by") {
    return { mode: "by", start: draft.byTime, end: null };
  }
  return { mode: "between", start: draft.fromTime, end: draft.toTime };
}

export function timerMinutesFromDraft(draft: AddTaskDraft): number {
  if (draft.timerPreset === "custom") {
    const n = parseInt(draft.customMinutes, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return draft.timerPreset;
}

export function configFromDraft(draft: AddTaskDraft): Record<string, unknown> {
  let config: Record<string, unknown> = {};
  switch (draft.type) {
    case "timer":
      config = { durationMinutes: timerMinutesFromDraft(draft) };
      break;
    case "counter":
      config = {
        targetValue: parseInt(draft.counterTarget, 10) || 0,
        unit: draft.counterUnit.trim(),
      };
      break;
    case "text":
      config = { minWords: parseInt(draft.minWords, 10) || 0 };
      break;
    case "run":
      config = {
        distance: parseFloat(draft.runDistance) || 0,
        unit: draft.runUnit,
      };
      break;
    default:
      config = {};
  }
  if (draft.location && canSavePlace(draft)) {
    config = {
      ...config,
      location_name: draft.placeName.trim() || undefined,
      location_latitude: draft.placeLat,
      location_longitude: draft.placeLng,
      location_radius_meters: draft.placeRadius,
    };
  }
  config = { ...config, photo_mode: photoModeFromDraft(draft) };
  return config;
}

export function applyStarter(starter: AddTaskStarter): AddTaskDraft {
  return {
    ...ADD_TASK_DEFAULT,
    name: starter.name,
    type: starter.type,
    counterTarget: starter.counterTarget ?? "",
    counterUnit: starter.counterUnit ?? "",
    minWords: starter.minWords ?? "",
    runDistance: starter.runDistance ?? "",
  };
}

export function previewFromDraft(draft: AddTaskDraft): { title: string; caption: string } {
  const title = draft.name.trim() || ADD_TASK_NAME_PLACEHOLDER;
  const mode = photoModeFromDraft(draft);
  const task = {
    type: draft.type,
    gates: gatesFromDraft(draft),
    gateTime: gateTimeFromDraft(draft),
    requirePhoto: mode === "required",
    photoMode: mode,
    targetValue: parseInt(draft.counterTarget, 10) || undefined,
    unit: draft.type === "run" ? draft.runUnit : draft.counterUnit,
    durationMinutes: timerMinutesFromDraft(draft),
    minWords: parseInt(draft.minWords, 10) || undefined,
    locationName: draft.location ? draft.placeName.trim() || "Place" : undefined,
    config: configFromDraft(draft),
  };
  if (
    draft.time &&
    draft.timeMode === "between" &&
    !betweenEndAfterStart(draft.fromTime, draft.toTime)
  ) {
    return {
      title,
      caption: [taskQuantityLine(task), photoPreviewLabel(mode), "Time window not set"]
        .filter(Boolean)
        .join(" · "),
    };
  }
  return { title, caption: wizardGateLine(task) };
}

export function placeAccuracyLine(meters: number): string {
  return `Accurate to about ${Math.max(0, Math.round(meters))} m right now`;
}

export function canSavePlace(draft: Pick<AddTaskDraft, "placeName" | "placeLat" | "placeLng">): boolean {
  if (draft.placeName.trim()) return true;
  return draft.placeLat != null && draft.placeLng != null;
}

/** Place sheet save: keep Time window and turn Place on. Never clears other limits. */
export function commitPlace(draft: AddTaskDraft): AddTaskDraft {
  return { ...draft, location: true };
}

export type AddTaskPayload = {
  name: string;
  type: TaskModelType;
  config: Record<string, unknown>;
  gates: TaskGate[];
  gateTime?: GateTime;
  durationMinutes?: number;
  minWords?: number;
  targetValue?: number;
  requirePhoto: boolean;
  photoMode: PhotoMode;
  unit?: string;
};

export function payloadFromDraft(draft: AddTaskDraft): AddTaskPayload {
  const config = configFromDraft(draft);
  const durationMinutes =
    typeof config.durationMinutes === "number" ? config.durationMinutes : undefined;
  const minWords = typeof config.minWords === "number" ? config.minWords : undefined;
  const targetValue =
    typeof config.targetValue === "number"
      ? config.targetValue
      : typeof config.distance === "number"
        ? config.distance
        : undefined;
  const unit = typeof config.unit === "string" && config.unit ? config.unit : undefined;
  return {
    name: draft.name.trim(),
    type: draft.type,
    config,
    gates: gatesFromDraft(draft),
    gateTime: gateTimeFromDraft(draft),
    durationMinutes,
    minWords,
    targetValue,
    requirePhoto: photoModeFromDraft(draft) === "required",
    photoMode: photoModeFromDraft(draft),
    unit,
  };
}

export function draftFromWizardTask(task: {
  name: string;
  type: string;
  config?: Record<string, unknown>;
  gates?: TaskGate[];
  gateTime?: GateTime;
  durationMinutes?: number;
  minWords?: number;
  targetValue?: number;
  unit?: string;
  requirePhoto?: boolean;
  photoMode?: PhotoMode;
  locationName?: string;
  radiusMeters?: number;
}): AddTaskDraft {
  const type: TaskModelType =
    task.type === "timer" || task.type === "counter" || task.type === "text" || task.type === "run"
      ? task.type
      : "check_off";
  const mins =
    task.durationMinutes ??
    (typeof task.config?.durationMinutes === "number" ? task.config.durationMinutes : 5);
  const timerPreset = (TIMER_CHIPS as readonly number[]).includes(mins) ? mins : "custom";
  const target =
    task.targetValue ??
    (typeof task.config?.targetValue === "number" ? task.config.targetValue : undefined);
  const minWords =
    task.minWords ?? (typeof task.config?.minWords === "number" ? task.config.minWords : undefined);
  const distance =
    typeof task.config?.distance === "number" ? task.config.distance : target;
  const unit =
    task.unit ?? (typeof task.config?.unit === "string" ? task.config.unit : "");
  const rawMode = String(task.photoMode ?? task.config?.photo_mode ?? "").toLowerCase();
  const photoMode: PhotoMode =
    rawMode === "required" || rawMode === "optional" || rawMode === "none"
      ? rawMode
      : task.requirePhoto || (task.gates ?? []).includes("camera")
        ? "required"
        : "none";
  const gates = task.gates ?? (photoMode === "required" ? (["camera"] as TaskGate[]) : []);
  const cfg = task.config ?? {};
  const placeName =
    (typeof task.locationName === "string" && task.locationName.trim()) ||
    (typeof cfg.location_name === "string" ? cfg.location_name : "") ||
    "";
  const placeLat = typeof cfg.location_latitude === "number" ? cfg.location_latitude : null;
  const placeLng = typeof cfg.location_longitude === "number" ? cfg.location_longitude : null;
  const placeRadius =
    (typeof task.radiusMeters === "number" && task.radiusMeters > 0
      ? task.radiusMeters
      : typeof cfg.location_radius_meters === "number"
        ? cfg.location_radius_meters
        : ADD_TASK_DEFAULT.placeRadius);
  return {
    ...ADD_TASK_DEFAULT,
    name: task.name,
    type,
    timerPreset: timerPreset === "custom" ? "custom" : timerPreset,
    customMinutes: timerPreset === "custom" && mins > 0 ? String(mins) : "",
    counterTarget: target != null ? String(target) : "",
    counterUnit: unit,
    minWords: minWords != null ? String(minWords) : "",
    runDistance: distance != null ? String(distance) : "",
    runUnit: unit === "mi" ? "mi" : "km",
    photoMode,
    camera: photoMode === "required",
    time: gates.includes("time"),
    location: gates.includes("location"),
    timeMode: task.gateTime?.mode === "between" ? "between" : "by",
    byTime: task.gateTime?.start ?? ADD_TASK_DEFAULT.byTime,
    fromTime: task.gateTime?.start ?? ADD_TASK_DEFAULT.fromTime,
    toTime: task.gateTime?.end ?? ADD_TASK_DEFAULT.toTime,
    placeName,
    placeLat,
    placeLng,
    placeRadius,
  };
}

export function canSubmitDraft(draft: AddTaskDraft): boolean {
  if (!draft.name.trim()) return false;
  if (draft.time && draft.timeMode === "between" && !betweenEndAfterStart(draft.fromTime, draft.toTime)) {
    return false;
  }
  if (draft.type === "timer") return timerMinutesFromDraft(draft) > 0;
  if (draft.type === "counter") return parseInt(draft.counterTarget, 10) > 0;
  if (draft.type === "text") return parseInt(draft.minWords, 10) > 0;
  if (draft.type === "run") return parseFloat(draft.runDistance) > 0;
  return true;
}
