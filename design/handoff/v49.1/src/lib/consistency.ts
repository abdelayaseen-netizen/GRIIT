/**
 * One consistency number, one phrasing.
 *
 * Home showed "3 days · 67%" and Profile showed "2 of 7" for the same user:
 * profileConsistencyFromBootstrap counts a rolling 7-day window, and Home's
 * hero counted the current streak. Two windows, two units, one truth.
 *
 * The definition: days secured over due days that have closed, since the first
 * day the user was due. Today is excluded and reported separately — a day still
 * open is not a miss.
 *
 * The phrasing: "{secured} of {due} days". No percentage anywhere. A percentage
 * is a second way of saying the same thing, and at 13 due days one miss moves
 * it eight points, which reads as volatility rather than information.
 */

export type Consistency = {
  secured: number;
  due: number;          // closed due days, today excluded
  dueToday: boolean;
  firstDueDate: string | null;
};

export function consistencyHeadline(c: Consistency): string {
  if (c.due === 0) return c.dueToday ? 'First day is today.' : 'No due days yet.';
  return `${c.secured} of ${c.due} days`;
}

/** Home's streak-hero sub-line. Same numbers, sentence form. */
export function consistencyLine(c: Consistency): string {
  if (c.due === 0) return c.dueToday ? 'Today is the first day due.' : 'Join a challenge to start the count.';
  return `${c.secured} of ${c.due} days secured.`;
}

/** Profile's card sub-line: where the count starts, and what is still open. */
export function consistencyContext(c: Consistency, formatDate: (iso: string) => string): string {
  const since = c.firstDueDate ? `Since ${formatDate(c.firstDueDate)}.` : '';
  return [since, c.dueToday ? '1 due today.' : ''].filter(Boolean).join(' ');
}
