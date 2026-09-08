/**
 * Maps wizard / pack tasks to challenges.create task rows.
 * targetValue, locationName, and radiusMeters must already live on the task.
 */

export type WizardTaskPayloadSource = {
  name: string;
  type: string;
  durationMinutes?: number;
  minWords?: number;
  requirePhoto?: boolean;
  targetValue?: number;
  locationName?: string;
  radiusMeters?: number;
};

export function mapWizardTaskToCreateInput(
  t: WizardTaskPayloadSource,
  opts: { requirePhoto: boolean; allowPhoto: boolean },
) {
  return {
    title: t.name,
    type: t.type,
    required: true,
    requirePhotoProof: opts.requirePhoto || (opts.allowPhoto && t.requirePhoto === true),
    strictTimerMode: false,
    durationMinutes: t.durationMinutes,
    minWords: t.minWords,
    targetValue: t.targetValue,
    locationName: t.locationName,
    radiusMeters: t.radiusMeters,
  };
}
