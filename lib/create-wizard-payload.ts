/**
 * Maps wizard / pack tasks to challenges.create task rows.
 * targetValue, locationName, and radiusMeters must already live on the task.
 */

import type { GateTime, TaskGate } from "@/backend/lib/task-model";

export type WizardTaskPayloadSource = {
  name: string;
  type: string;
  durationMinutes?: number;
  minWords?: number;
  requirePhoto?: boolean;
  targetValue?: number;
  locationName?: string;
  radiusMeters?: number;
  config?: Record<string, unknown>;
  gates?: TaskGate[];
  gateTime?: GateTime;
  unit?: string;
};

export function mapWizardTaskToCreateInput(
  t: WizardTaskPayloadSource,
  opts: { requirePhoto: boolean; allowPhoto: boolean },
) {
  const cameraFromTask = t.gates?.includes("camera") === true || t.requirePhoto === true;
  const camera = opts.requirePhoto || (opts.allowPhoto && cameraFromTask);
  const gates: TaskGate[] | undefined = t.gates
    ? camera && !t.gates.includes("camera")
      ? ["camera", ...t.gates]
      : t.gates
    : camera
      ? ["camera"]
      : undefined;

  return {
    title: t.name,
    type: t.type,
    required: true,
    requirePhotoProof: camera,
    strictTimerMode: false,
    durationMinutes: t.durationMinutes,
    minWords: t.minWords,
    targetValue: t.targetValue,
    locationName: t.locationName,
    radiusMeters: t.radiusMeters,
    unit: t.unit,
    config: t.config,
    gates,
    gateTime: t.gateTime,
  };
}
