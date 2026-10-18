// 3.3 · challenge page states and the week dots
export type Dot = 'none' | 'missed' | 'freeze' | 'secured' | 'today';
export const DOT_KEY: Record<Exclude<Dot, 'none'>, string> = { secured: 'Secured', today: 'Today', freeze: 'Held by a freeze', missed: 'Missed' }; // 'none' = before you joined (blank)
export const topNumbers = (e: { day_index: number; duration_days: number; secured_days: number }) => ({ day: `Day ${e.day_index} of ${e.duration_days}`, secured: `${e.secured_days} ${e.secured_days === 1 ? 'day' : 'days'} secured` });
export function primaryAction(s: { joined: boolean; todayDone: boolean; startsTomorrowAt?: string }) {
  if (!s.joined) return s.startsTomorrowAt ? `Join · Day 1 is tomorrow at ${s.startsTomorrowAt}` : 'Join · Day 1 is today'; // started_on = tomorrow; today not counted as missed
  return s.todayDone ? 'Today’s task is done' : 'Start today’s task'; // never "You're already in this challenge"
}
export const visibilityRow = (aud: 'Friends' | 'Everyone' | 'Only me') => `Your posts here: ${aud}`;
export const DIFFICULTY = { standard: 'Standard: miss a day and a freeze can cover it.', hard: 'Strict: a missed day ends the challenge. Freezes don’t apply.' };
// Dot key shows on first view; "Got it" sets seen_dot_key.
