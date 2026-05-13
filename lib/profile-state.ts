/**
 * Computes which of the 3 profile-page states the user is in.
 * Used for analytics (profile_state_viewed) and state-aware rendering in ProfileHero.
 *
 * State derivation (priority order — first match wins):
 * - new_user: streak === 0 AND postCount === 0 (no signals at all yet)
 * - growing: streak < 14 OR postCount < 10 (first weeks, building)
 * - established: streak >= 14 AND postCount >= 10 (power user)
 */
export type ProfileState = "new_user" | "growing" | "established";

export interface ProfileStateInput {
  streak: number;
  postCount: number;
}

export function computeProfileState(input: ProfileStateInput): ProfileState {
  if (input.streak === 0 && input.postCount === 0) return "new_user";
  if (input.streak >= 14 && input.postCount >= 10) return "established";
  return "growing";
}
