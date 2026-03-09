/**
 * Shared date formatting. Use instead of ad-hoc toLocaleDateString across the app.
 */

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
}

export function formatRelativeOrShort(date: Date | string, base: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = base.getTime();
  const t = d.getTime();
  const diffDays = Math.floor((now - t) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatShortDate(d);
}
