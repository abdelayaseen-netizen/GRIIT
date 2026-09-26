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
