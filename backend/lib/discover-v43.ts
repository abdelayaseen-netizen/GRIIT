import { CREATE_CATEGORIES } from "../../lib/challenge-category";

export const DISCOVER_V43_CATEGORY_IDS = CREATE_CATEGORIES.map((c) => c.id);

export const DISCOVER_V43_CHALLENGE_SELECT =
  "id, title, duration_days, difficulty, category, status, visibility, participants_count, created_at, creator_id, participation_type, challenge_tasks (id, title, task_type, order_index, config)";

export function matchesDiscoverV43Category(
  stored: string | null | undefined,
  chip: string | null | undefined,
): boolean {
  const want = String(chip ?? "all").toLowerCase();
  if (!want || want === "all") return true;
  return String(stored ?? "").toLowerCase() === want;
}

export function rankChallengeIdsByJoins(joins: readonly { challenge_id: string }[]): string[] {
  const counts = new Map<string, number>();
  for (const row of joins) {
    counts.set(row.challenge_id, (counts.get(row.challenge_id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([id]) => id);
}

export function weekAgoIso(nowMs = Date.now()): string {
  return new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString();
}
