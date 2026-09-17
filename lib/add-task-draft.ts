/**
 * Add-task sheet draft (frame 42). Builds { type, config, gates, gateTime }.
 */

import type { GateTime, TaskGate, TaskModelType } from "@/backend/lib/task-model";

export const ADD_TASK_HEADING = "Add a task";
export const ADD_TASK_NAME_LABEL = "Task name";
export const ADD_TASK_NAME_PLACEHOLDER = "Name it";
export const ADD_TASK_WHAT_YOU_DO = "What you do";
export const ADD_TASK_WHAT_PROVES = "What proves it";
export const ADD_TASK_CTA = "Add task";
export const ADD_TASK_SET_PLACE = "Set place";
export const NO_GATES_CAPTION = 'No gates. The row will read "Self-reported".';

export const ADD_TASK_TYPE_CHIPS: { id: TaskModelType; label: string }[] = [
  { id: "check_off", label: "Check off" },
  { id: "timer", label: "Timer" },
  { id: "counter", label: "Counter" },
  { id: "text", label: "Text" },
  { id: "run", label: "Run" },
];

export const TIMER_CHIPS = [5, 10, 15, 30] as const;
export const TIMER_CUSTOM = "Custom";

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
  camera: boolean;
  time: boolean;
  location: boolean;
  timeMode: "by" | "between";
  byTime: string;
  fromTime: string;
  toTime: string;
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
  camera: false,
  time: false,
  location: false,
  timeMode: "by",
  byTime: "07:00",
  fromTime: "09:30",
  toTime: "10:30",
};

export function gatesFromDraft(draft: AddTaskDraft): TaskGate[] {
  const gates: TaskGate[] = [];
  if (draft.camera) gates.push("camera");
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
  switch (draft.type) {
    case "timer":
      return { durationMinutes: timerMinutesFromDraft(draft) };
    case "counter":
      return {
        targetValue: parseInt(draft.counterTarget, 10) || 0,
        unit: draft.counterUnit.trim(),
      };
    case "text":
      return { minWords: parseInt(draft.minWords, 10) || 0 };
    case "run":
      return {
        distance: parseFloat(draft.runDistance) || 0,
        unit: draft.runUnit,
      };
    default:
      return {};
  }
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
    requirePhoto: draft.camera,
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
  const gates = task.gates ?? (task.requirePhoto ? (["camera"] as TaskGate[]) : []);
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
    camera: gates.includes("camera"),
    time: gates.includes("time"),
    location: gates.includes("location"),
    timeMode: task.gateTime?.mode === "between" ? "between" : "by",
    byTime: task.gateTime?.start ?? ADD_TASK_DEFAULT.byTime,
    fromTime: task.gateTime?.start ?? ADD_TASK_DEFAULT.fromTime,
    toTime: task.gateTime?.end ?? ADD_TASK_DEFAULT.toTime,
  };
}

export function canSubmitDraft(draft: AddTaskDraft): boolean {
  if (!draft.name.trim()) return false;
  if (draft.type === "timer") return timerMinutesFromDraft(draft) > 0;
  if (draft.type === "counter") return parseInt(draft.counterTarget, 10) > 0;
  if (draft.type === "text") return parseInt(draft.minWords, 10) > 0;
  if (draft.type === "run") return parseFloat(draft.runDistance) > 0;
  return true;
}
