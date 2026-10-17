/**
 * Discover lists catalog challenges only until v38 Visibility.
 * Catalog vs user-created: creator_id IS NULL (seeded featured, starters, daily).
 * User-created rows always have creator_id set.
 */

export type DiscoverCatalogRow = {
  creator_id?: string | null;
  source_starter_id?: string | null;
  participation_type?: string | null;
};

export function isCatalogChallenge(row: DiscoverCatalogRow): boolean {
  const creator = typeof row.creator_id === "string" ? row.creator_id.trim() : "";
  return creator.length === 0;
}

/**
 * Build 90 08 follow-up: a seeded duo row is one global room. Filling it starts it for
 * everyone and nobody else can join, so it stays off Discover until a per-pair room exists.
 * Only applies when the row carries participation_type (the feed's checks fetch rows without it).
 */
export function isSeededDuoRoom(row: DiscoverCatalogRow): boolean {
  return isCatalogChallenge(row) && String(row.participation_type ?? "").toLowerCase() === "duo";
}

export function keepForDiscover(
  row: DiscoverCatalogRow,
  viewerId?: string | null,
): boolean {
  const creator = typeof row.creator_id === "string" ? row.creator_id.trim() : "";
  if (viewerId && creator && creator === viewerId) return false;
  if (isSeededDuoRoom(row)) return false;
  return isCatalogChallenge(row);
}

export function filterDiscoverCatalog<T extends DiscoverCatalogRow>(
  rows: readonly T[],
  viewerId?: string | null,
): T[] {
  const kept = rows.filter((row) => keepForDiscover(row, viewerId));
  return dedupeCatalogTitles(kept);
}

function dedupeCatalogTitles<T extends DiscoverCatalogRow>(rows: readonly T[]): T[] {
  const best = new Map<string, T>();
  for (const row of rows) {
    const titled = row as T & { id?: string; title?: string | null; participants_count?: number | null };
    const key = (titled.title ?? "").toLowerCase().replace(/\s+/g, " ").trim() || titled.id || "";
    if (!key) continue;
    const prev = best.get(key);
    if (!prev) {
      best.set(key, row);
      continue;
    }
    const prevRow = prev as T & { id?: string; participants_count?: number | null };
    const nextCount = Number(titled.participants_count) || 0;
    const prevCount = Number(prevRow.participants_count) || 0;
    const nextId = titled.id ?? "";
    const prevId = prevRow.id ?? "";
    if (nextCount > prevCount || (nextCount === prevCount && nextId < prevId)) best.set(key, row);
  }
  return rows.filter((row) => {
    const titled = row as T & { id?: string; title?: string | null };
    const key = (titled.title ?? "").toLowerCase().replace(/\s+/g, " ").trim() || titled.id || "";
    return key ? best.get(key) === row : true;
  });
}
