/**
 * One consistency number, one phrasing. Port of design/handoff/src/lib/consistency.ts.
 * Days secured ÷ closed due days, all-time, today excluded.
 */
export type Consistency = {
  secured: number;
  due: number;
  dueToday: boolean;
  firstDueDate: string | null;
};

export function consistencyFromRecord(rec: {
  verifiedClosed?: number;
  closedDueDays?: number;
  dueToday?: boolean;
  dueDayKeys?: string[];
} | null | undefined): Consistency {
  const dueDayKeys = rec?.dueDayKeys ?? [];
  return {
    secured: rec?.verifiedClosed ?? 0,
    due: rec?.closedDueDays ?? 0,
    dueToday: rec?.dueToday === true,
    firstDueDate: dueDayKeys[0] ?? null,
  };
}

/** Account day array: closed due keys before today, secured ∩ that set. A join today does not change N. */
export function consistencyFromDayArray(args: {
  dueDayKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
}): Consistency {
  const closed = args.dueDayKeys.filter((k) => k < args.todayKey);
  const secured = new Set(args.securedDateKeys);
  return {
    secured: closed.filter((k) => secured.has(k)).length,
    due: closed.length,
    dueToday: args.dueDayKeys.includes(args.todayKey),
    firstDueDate: args.dueDayKeys[0] ?? null,
  };
}

export function consistencyHeadline(c: Consistency): string {
  if (c.due === 0) return c.dueToday ? "First day is today." : "No due days yet.";
  return `${c.secured} of ${c.due} days`;
}

export function consistencyLine(c: Consistency): string {
  if (c.due === 0) return c.dueToday ? "Today is the first day due." : "Join a challenge to start the count.";
  return `${c.secured} of ${c.due} days secured.`;
}

export function consistencyContext(
  c: Consistency,
  formatDate: (iso: string) => string,
  todaySecured = false,
): string {
  const since = c.firstDueDate ? `Since ${formatDate(c.firstDueDate)}.` : "";
  const todayBit = todaySecured ? "Today secured." : c.dueToday ? "1 due today." : "";
  return [since, todayBit].filter(Boolean).join(" ");
}

export function consistencyDetailHero(c: Consistency): string {
  if (c.due === 0) return c.dueToday ? "First day is today." : "No due days yet.";
  return `${c.secured} of ${c.due}`;
}
