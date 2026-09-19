/**
 * Same window as secure_day remaining enrollments:
 * status = 'active' AND start_at <= now() AND end_at >= now().
 * See supabase/migrations/20260910090000_today_state.sql:109-111.
 */
type WindowQuery = {
  eq: (column: string, value: string) => WindowQuery;
  lte: (column: string, value: string) => WindowQuery;
  gte: (column: string, value: string) => WindowQuery;
};

export function applyEnrollmentWindow<Q>(query: Q, now: Date = new Date()): Q {
  const iso = now.toISOString();
  const q = query as unknown as WindowQuery;
  return q.eq("status", "active").lte("start_at", iso).gte("end_at", iso) as Q;
}
