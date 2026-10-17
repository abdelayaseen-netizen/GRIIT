/** Minutes for a timer task. Prefer flattened fields, then nested config. */
export function timerDurationMinutes(config: {
  min_duration_minutes?: number | null;
  duration_minutes?: number | null;
}): number {
  const min = config.min_duration_minutes;
  if (typeof min === "number" && Number.isFinite(min) && min > 0) return Math.floor(min);
  const dur = config.duration_minutes;
  if (typeof dur === "number" && Number.isFinite(dur) && dur > 0) return Math.floor(dur);
  return 10;
}

export function timerRequiredSeconds(config: {
  min_duration_minutes?: number | null;
  duration_minutes?: number | null;
}): number {
  return Math.max(1, timerDurationMinutes(config) * 60);
}

export const FINISHED_EARLY_TITLE = "Finished early?";
export const FINISHED_EARLY_MESSAGE = "It posts as self-reported.";
export const FINISHED_EARLY_CONFIRM = "Yes";
