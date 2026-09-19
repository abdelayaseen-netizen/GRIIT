/**
 * Home Today card section expand/collapse (Chunk Q B10).
 * Default: open tasks → expanded; n/n today → collapsed.
 * Manual choice wins, keyed per user + challenge + date.
 */

export const TODAY_SECTION_COLLAPSE_PREFIX = "today_section_collapse";

export function todaySectionCollapseKey(
  userId: string,
  challengeKey: string,
  dateKey: string,
): string {
  return `${TODAY_SECTION_COLLAPSE_PREFIX}:${userId}:${challengeKey}:${dateKey}`;
}

export function todaySectionDefaultExpanded(doneCount: number, totalCount: number): boolean {
  return totalCount > 0 && doneCount < totalCount;
}

/** Stored boolean wins; otherwise default by completion. */
export function todaySectionExpanded(
  stored: boolean | null | undefined,
  doneCount: number,
  totalCount: number,
): boolean {
  if (stored === true || stored === false) return stored;
  return todaySectionDefaultExpanded(doneCount, totalCount);
}

export function parseTodaySectionChoice(raw: string | null | undefined): boolean | null {
  if (raw === "1" || raw === "expanded") return true;
  if (raw === "0" || raw === "collapsed") return false;
  return null;
}

export function serializeTodaySectionChoice(expanded: boolean): string {
  return expanded ? "1" : "0";
}

export function isTodaySectionCollapseKey(key: string, userId?: string | null): boolean {
  if (userId) return key.startsWith(`${TODAY_SECTION_COLLAPSE_PREFIX}:${userId}:`);
  return key.startsWith(`${TODAY_SECTION_COLLAPSE_PREFIX}:`);
}

export function filterTodaySectionCollapseKeys(
  keys: readonly string[],
  userId?: string | null,
): string[] {
  return keys.filter((key) => isTodaySectionCollapseKey(key, userId));
}
