/**
 * Canonical days-secured window. App and backend import this — do not copy.
 * Window: due keys through yesterday, plus today only if today is secured.
 * An unsecured today is never elapsed.
 */

export type SecuredElapsed = {
  secured: number;
  elapsed: number;
  dueToday: boolean;
  todaySecured: boolean;
  firstDueDate: string | null;
  elapsedKeys: string[];
};

/**
 * day_secures that count inside one enrollment: the key is a due date for that
 * enrollment, and it falls inside the optional inclusive window.
 * A secure before start, or off the due list, does not count.
 */
export function enrollmentSecuredDateKeys(args: {
  securedDateKeys: readonly string[];
  dueDateKeys: readonly string[];
  fromKey?: string;
  throughKey?: string;
}): string[] {
  const due = new Set(args.dueDateKeys);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of args.securedDateKeys) {
    if (!key || seen.has(key) || !due.has(key)) continue;
    if (args.fromKey && key < args.fromKey) continue;
    if (args.throughKey && key > args.throughKey) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** Challenge-board "this week": due dates from Monday through today only. */
export function challengeBoardWeekCount(args: {
  securedDateKeys: readonly string[];
  dueDateKeys: readonly string[];
  weekStartKey: string;
  todayKey: string;
}): number {
  return enrollmentSecuredDateKeys({
    securedDateKeys: args.securedDateKeys,
    dueDateKeys: args.dueDateKeys,
    fromKey: args.weekStartKey,
    throughKey: args.todayKey,
  }).length;
}

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
    secured: enrollmentSecuredDateKeys({
      securedDateKeys: args.securedDateKeys,
      dueDateKeys: elapsedKeys,
    }).length,
    elapsed: elapsedKeys.length,
    dueToday,
    todaySecured,
    firstDueDate: args.dueDayKeys[0] ?? null,
    elapsedKeys,
  };
}
