/**
 * Finish-moment numbers for one enrollment.
 * Secured days are day_secures that fall on a due date.
 * A freeze holds the run and does not add to it. A miss ends the run.
 */
import { dateKeyFromIso } from "./calendar-day";

export type EnrollmentFinishNumbers = {
  securedDays: number;
  longestStreak: number;
  heldDays: number;
  daysDone: number;
};

export function enrollmentFinishNumbers(args: {
  dueDateKeys: readonly string[];
  securedDateKeys: readonly string[];
  frozenDateKeys: readonly string[];
}): EnrollmentFinishNumbers {
  const due = [...args.dueDateKeys].filter(Boolean).sort();
  const secured = new Set(args.securedDateKeys);
  const frozen = new Set(args.frozenDateKeys);
  let securedDays = 0;
  let heldDays = 0;
  let run = 0;
  let longestStreak = 0;
  for (const key of due) {
    if (secured.has(key)) {
      securedDays += 1;
      run += 1;
      if (run > longestStreak) longestStreak = run;
      continue;
    }
    if (frozen.has(key)) {
      heldDays += 1;
      continue;
    }
    run = 0;
  }
  return {
    securedDays,
    longestStreak,
    heldDays,
    daysDone: securedDays + heldDays,
  };
}

/** "Sep 6" in the enrollment time zone. Date parts are formatted in UTC so the key does not shift. */
export function finishStartedLabel(iso: string | null | undefined, timeZone: string): string | null {
  if (!iso) return null;
  const key = dateKeyFromIso(iso, timeZone);
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
