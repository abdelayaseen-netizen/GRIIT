// Part 2.1 · the profile numbers. One source each; never computed on the client.
export type UserStats = { current_streak: number; best_streak: number; best_from: string; best_to: string; secured_days: number; verified_days: number; proof_count: number; followers: number; following: number };
export const PROFILE_NUMBERS = [
  { key: 'current_streak', label: 'Streak', flame: true, def: 'Days in a row secured, up to today.' },
  { key: 'best_streak', label: 'Best', def: 'The longest streak ever; matches the Best record dates.' },
  { key: 'secured_days', label: 'Days secured', sub: (s: UserStats) => `${s.verified_days} verified`, def: 'Total secured days. Verified = every task had camera or Strava proof.' },
] as const; // max 3 on the profile
export const followLine = (s: UserStats) => `${s.followers} ${s.followers === 1 ? 'follower' : 'followers'} · ${s.following} following`;
// Home, Your record, challenge pages and share cards read the same /me/stats payload.
