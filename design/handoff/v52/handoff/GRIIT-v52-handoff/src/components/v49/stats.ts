// v49 · Your data. GET /me/stats?range=7d|30d|all
export type DayState = 'secured' | 'held' | 'missed' | 'none';
export type UserStats = {
  secured_days: number; due_days: number; held_days: number; missed_days: number;
  current_streak: number; best_streak: number; best_streak_start: string | null; best_streak_end: string | null;
  proofs_by_method: { camera: number; self_reported: number; apple_health: number };
  proof_hour_histogram: number[]; // 24, user's time zone
};
export type StatsResponse = { range: '7d' | '30d' | 'all'; user_stats: UserStats; day_secures: { date: string; state: DayState }[];
  enrollments: { id: string; title: string; secured_days: number; due_days: number; status: 'running' | 'finished'; finished_at: string | null }[] };
export const consistencyPct = (s: UserStats) => (s.due_days >= 7 ? Math.round((s.secured_days / s.due_days) * 100) : null); // decision 219
export const usualHour = (h: number[]) => (h.reduce((a, b) => a + b, 0) >= 5 ? h.indexOf(Math.max(...h)) : null);
