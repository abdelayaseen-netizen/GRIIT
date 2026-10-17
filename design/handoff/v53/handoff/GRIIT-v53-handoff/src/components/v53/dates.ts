// v53 · one formatter for every day label (grid, post header, cards, activity)
export function dayLabel(takenAtISO: string, tz: string, now = new Date()): string {
  const d = new Date(new Date(takenAtISO).toLocaleString('en-US', { timeZone: tz }));
  const n = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const days = Math.floor((+new Date(n.toDateString()) - +new Date(d.toDateString())) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== n.getFullYear()) o.year = 'numeric';
  return d.toLocaleDateString('en-US', o);
}
// Day n for the date the proof was taken, not today
export const dayOfChallenge = (takenLocalDate: string, startedOn: string, durationDays: number) => {
  const n = Math.round((Date.parse(takenLocalDate) - Date.parse(startedOn)) / 86400000) + 1;
  return `Day ${Math.min(Math.max(n, 1), durationDays)} of ${durationDays}`;
};
