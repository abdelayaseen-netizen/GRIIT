/**
 * Build 92 chunk 08.5: the two tie-breakers on the challenge board.
 * - verifiedThisWeek: counted secured days where every completed check-in carried a proof
 *   (same rule as `computeUserStats.verified_days`).
 * - lastSecuredAt: when the latest counted day was secured; earlier wins a tie.
 */
import { checkInHasProof, type UserStatsCheckIn } from "./user-stats";

export function boardVerifiedCount(args: {
  countedKeys: readonly string[];
  checkIns: readonly UserStatsCheckIn[];
}): number {
  const byDay = new Map<string, UserStatsCheckIn[]>();
  for (const row of args.checkIns) {
    if ((row.status ?? "completed") !== "completed") continue;
    const list = byDay.get(row.date_key) ?? [];
    list.push(row);
    byDay.set(row.date_key, list);
  }
  let n = 0;
  for (const key of new Set(args.countedKeys)) {
    const rows = byDay.get(key) ?? [];
    if (rows.length > 0 && rows.every(checkInHasProof)) n += 1;
  }
  return n;
}

export function boardLastSecuredAt(args: {
  countedKeys: readonly string[];
  secures: readonly { date_key: string; created_at?: string | null }[];
}): string | null {
  const counted = new Set(args.countedKeys);
  let latest: string | null = null;
  for (const s of args.secures) {
    if (!counted.has(s.date_key) || !s.created_at) continue;
    if (!latest || s.created_at > latest) latest = s.created_at;
  }
  return latest;
}
