/** Journal · Write / Secured copy helpers (task-states-v2). */

/** Secured meta — `{n} words`. */
export function formatJournalSecuredMeta(wordCount: number): string {
  const n = Math.max(0, Math.round(wordCount));
  return `${n} words`;
}
