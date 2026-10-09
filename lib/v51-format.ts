/** Port of the v51 date, hour, and day-state helpers. */

const md = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function dateRange(a: Date, b: Date): string {
  if (a.getUTCFullYear() !== b.getUTCFullYear()) {
    return `${md(a)}, ${a.getUTCFullYear()} – ${md(b)}, ${b.getUTCFullYear()}`;
  }
  const same = a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
  return same ? md(a) : `${md(a)} – ${md(b)}`;
}

/** 0 → "12 am", 8 → "8 am". The frame sentence adds "around". */
export function hourLabel(h: number): string {
  return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? " am" : " pm");
}

export type DayState = "done" | "missed" | "held" | "today" | "future" | "notDue";

export function dayState(d: {
  due: boolean;
  secured: boolean;
  held: boolean;
  isToday: boolean;
  isFuture: boolean;
}): DayState {
  if (d.isFuture) return "future";
  if (d.isToday) return d.secured ? "done" : "today";
  if (!d.due) return "notDue";
  return d.secured ? "done" : d.held ? "held" : "missed";
}

export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
