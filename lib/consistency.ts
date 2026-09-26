/**
 * One consistency number, one phrasing.
 * Window: due keys from join through yesterday, plus today only if today is secured.
 * An unsecured today is never elapsed.
 */

export type Consistency = {
  secured: number;
  due: number;
  dueToday: boolean;
  firstDueDate: string | null;
};

export type SecuredElapsed = {
  secured: number;
  elapsed: number;
  dueToday: boolean;
  todaySecured: boolean;
  firstDueDate: string | null;
  elapsedKeys: string[];
};

/** Canonical account / enrollment days-secured window. */
export function securedElapsed(args: {
  dueDayKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
}): SecuredElapsed {
  const securedSet = new Set(args.securedDateKeys);
  const dueToday = args.dueDayKeys.includes(args.todayKey);
  const todaySecured = dueToday && securedSet.has(args.todayKey);
  const elapsedKeys = args.dueDayKeys.filter(
    (k) => k < args.todayKey || (k === args.todayKey && todaySecured),
  );
  return {
    secured: elapsedKeys.filter((k) => securedSet.has(k)).length,
    elapsed: elapsedKeys.length,
    dueToday,
    todaySecured,
    firstDueDate: args.dueDayKeys[0] ?? null,
    elapsedKeys,
  };
}

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

/** @deprecated wrap of securedElapsed — do not add a second window. */
export function consistencyFromDayArray(args: {
  dueDayKeys: readonly string[];
  securedDateKeys: readonly string[];
  todayKey: string;
}): Consistency {
  const w = securedElapsed(args);
  return {
    secured: w.secured,
    due: w.elapsed,
    dueToday: w.dueToday,
    firstDueDate: w.firstDueDate,
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
