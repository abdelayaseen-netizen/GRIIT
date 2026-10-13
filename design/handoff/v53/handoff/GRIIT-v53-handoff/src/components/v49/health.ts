// v49 · Build 79 · Apple Health (read-only). Label: "From Apple Health", never "Verified".
export type HealthMetric = 'steps' | 'workout_minutes' | 'distance';
export const HEALTH_LABEL = 'From Apple Health';
export const TARGET_RANGE: Record<HealthMetric, [number, number]> = { steps: [1000, 50000], workout_minutes: [5, 300], distance: [0.5, 100] };
// iOS never reports read denial. "not_sharing" = authorization requested but no readable samples.
export type HealthStatus = 'not_requested' | 'requested' | 'has_data' | 'not_sharing';
export function isDone(metric: HealthMetric, target: number, today: { steps?: number; workoutMinutes?: number; longestDistance?: number }) {
  if (metric === 'steps') return (today.steps ?? 0) >= target;
  if (metric === 'workout_minutes') return (today.workoutMinutes ?? 0) >= target;
  return (today.longestDistance ?? 0) >= target; // one run or walk
}
// No data today is "open" until 11:59 pm, never a miss.
