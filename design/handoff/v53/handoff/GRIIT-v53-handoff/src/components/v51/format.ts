// v51 · dates, times, square states
const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function dateRange(a: Date, b: Date) {
  if (a.getFullYear() !== b.getFullYear()) return `${md(a)}, ${a.getFullYear()} – ${md(b)}, ${b.getFullYear()}`;
  return a.toDateString() === b.toDateString() ? md(a) : `${md(a)} – ${md(b)}`; // "Sep 30 – Oct 1"
}
export const hourLabel = (h: number) => (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? ' am' : ' pm'); // 0 → "12 am", 8 → "8 am"
export type DayState = 'done' | 'missed' | 'held' | 'today' | 'future' | 'notDue';
export function dayState(d: { due: boolean; secured: boolean; held: boolean; isToday: boolean; isFuture: boolean }): DayState {
  if (d.isFuture) return 'future';
  if (d.isToday) return d.secured ? 'done' : 'today';
  if (!d.due) return 'notDue';
  return d.secured ? 'done' : d.held ? 'held' : 'missed';
}
