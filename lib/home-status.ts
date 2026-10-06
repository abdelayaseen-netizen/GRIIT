import { HOME, WEEK } from "@/lib/copy";

/** One Home status sentence. The card does not repeat it. */
export function homeStatus(s: {
  hasChallenge: boolean;
  secured: boolean;
  left: number;
  total: number;
  lostTask?: string | null;
  lostAt?: string | null;
  otherTask?: string | null;
  otherChallenge?: string | null;
  nextTask?: string | null;
}): string {
  if (!s.hasChallenge) return HOME.noChallenge;
  if (s.secured) return HOME.secured;
  if (s.lostTask) {
    return HOME.lost(
      s.lostTask,
      s.lostAt?.trim() || "the window",
      s.otherTask ?? undefined,
      s.otherChallenge ?? undefined,
    );
  }
  if (s.left === 1 && s.nextTask) return HOME.left1(s.nextTask);
  return HOME.left(s.left, s.total);
}

/** The only week count. Rendered in StreakSheet, not on Home. */
export function weekSheetLine(
  week: readonly { state?: string; filled?: boolean }[],
  todayIndex: number,
): string | null {
  const end = Math.min(week.length, Math.max(0, todayIndex));
  const past = week.slice(0, end);
  if (past.length === 0) return null;
  const secured = past.filter((d) => d.state === "secured" || d.state === "frozen").length;
  return WEEK.line(secured, past.length);
}
