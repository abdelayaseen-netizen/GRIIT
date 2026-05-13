/**
 * Computes which of the 4 home-page states a user is currently in.
 * Used for analytics (home_state_viewed event) and for state-aware rendering
 * in the redesigned home (PR#4+).
 *
 * State derivation (priority order — first match wins):
 * - new_user: streak === 0 (no fire yet)
 * - streak_at_risk: streak >= 1, tasks remaining, < 60min to midnight
 * - day_in_progress: streak >= 1, tasks remaining, >= 60min to midnight
 * - streak_healthy: streak >= 1, all tasks done today
 */
export type HomeState =
  | "new_user"
  | "day_in_progress"
  | "streak_at_risk"
  | "streak_healthy";

export interface HomeStateInput {
  streak: number;
  tasksRemaining: number;
  minutesToMidnight: number;
}

export function computeHomeState(input: HomeStateInput): HomeState {
  if (input.streak === 0) return "new_user";
  if (input.tasksRemaining === 0) return "streak_healthy";
  if (input.minutesToMidnight < 60) return "streak_at_risk";
  return "day_in_progress";
}
