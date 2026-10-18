// Build 92 chunk 07.4 · "Your record" (P2-03, P2-05, P2-06). Copy from the Part 2 copy table.
import type { ProfileRecordCounts } from "@/components/profile/ProfileHeader";

export const YOUR_RECORD_TITLE = "Your record";
export const STREAK_HISTORY = "Streak history";
export const FREE_TAG = "free";
export const STAT_BEST = "Best";
export const STAT_CURRENT = "Current";
export const DEEPER_STATS = "Deeper stats";
export const PRO_TAG = "GRIIT Pro";
export const DEEPER_STATS_BODY = "Deeper stats are part of GRIIT Pro";
export const DEEPER_STATS_LIST = "Charts, best times, verified %, month over month.";
export const TRY_PRO = "Try GRIIT Pro";

export function recordCountsFromRecord(
  record:
    | {
        runs?: readonly unknown[];
        completed?: readonly { status: string }[];
        badgeGrid?: readonly { earned: boolean }[];
      }
    | null
    | undefined,
): ProfileRecordCounts {
  return {
    running: record?.runs?.length ?? 0,
    finished: (record?.completed ?? []).filter((c) => c.status === "completed").length,
    badges: (record?.badgeGrid ?? []).filter((b) => b.earned).length,
  };
}

/** "{start} – {end}" for a streak span; a one-day span is just the date. */
export function streakSpanLine(start: string | null | undefined, end: string | null | undefined, fmt: (key: string) => string): string {
  if (!start || !end) return "";
  if (start === end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}
