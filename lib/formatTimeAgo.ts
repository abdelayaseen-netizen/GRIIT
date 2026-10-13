/**
 * Relative time string (e.g. "now", "5m", "2h", "3d").
 * Use for activity feeds and chat timestamps.
 */
export function formatTimeAgo(dateString: string): { text: string; isDayOrMore: boolean } {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return { text: "now", isDayOrMore: false };
  if (diffMins < 60) return { text: `${diffMins}m`, isDayOrMore: false };
  if (diffHours < 24) return { text: `${diffHours}h`, isDayOrMore: false };
  if (diffDays < 7) return { text: `${diffDays}d`, isDayOrMore: true };
  return { text: calendarDateLabel(dateString), isDayOrMore: true };
}

/** "Sep 30". Used once a timestamp is a week old, and on a finished challenge card. */
export function calendarDateLabel(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Compact relative time for feeds (e.g. "now", "5m", "2h", "3d"). */
export function formatTimeAgoCompact(dateString: string): string {
  return formatTimeAgo(dateString).text;
}
