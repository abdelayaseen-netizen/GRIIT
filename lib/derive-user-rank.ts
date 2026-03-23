import type { StatsFromApi } from "@/types";

/** Display rank from stats tier or streak ladder (matches home pill logic). */
export function deriveUserRank(stats: StatsFromApi | null | undefined): string {
  if (stats?.tier && String(stats.tier).trim()) return String(stats.tier);
  const streak = stats?.activeStreak ?? 0;
  if (streak >= 75) return "Legend";
  if (streak >= 30) return "Elite";
  if (streak >= 14) return "Disciplined";
  if (streak >= 7) return "Builder";
  return "Starter";
}
