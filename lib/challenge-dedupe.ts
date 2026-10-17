/** One row per normalized title. The copy with more members wins. Ties keep the smaller id. */

export type DedupeRow = {
  id: string;
  title?: string | null;
  participants_count?: number | null;
};

export function normalizeChallengeTitle(title: string | null | undefined): string {
  return (title ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function dedupeChallengesByTitle<T extends DedupeRow>(rows: readonly T[]): T[] {
  const best = new Map<string, T>();
  for (const row of rows) {
    const key = normalizeChallengeTitle(row.title) || row.id;
    const prev = best.get(key);
    if (!prev) {
      best.set(key, row);
      continue;
    }
    const nextCount = Number(row.participants_count) || 0;
    const prevCount = Number(prev.participants_count) || 0;
    if (nextCount > prevCount || (nextCount === prevCount && row.id < prev.id)) {
      best.set(key, row);
    }
  }
  return rows.filter((row) => best.get(normalizeChallengeTitle(row.title) || row.id) === row);
}
