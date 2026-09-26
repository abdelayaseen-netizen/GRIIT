/**
 * Discover lists catalog challenges only until v38 Visibility.
 * Catalog vs user-created: creator_id IS NULL (seeded featured, starters, daily).
 * User-created rows always have creator_id set.
 */

export type DiscoverCatalogRow = {
  creator_id?: string | null;
  source_starter_id?: string | null;
};

export function isCatalogChallenge(row: DiscoverCatalogRow): boolean {
  const creator = typeof row.creator_id === "string" ? row.creator_id.trim() : "";
  return creator.length === 0;
}

export function keepForDiscover(
  row: DiscoverCatalogRow,
  viewerId?: string | null,
): boolean {
  const creator = typeof row.creator_id === "string" ? row.creator_id.trim() : "";
  if (viewerId && creator && creator === viewerId) return false;
  return isCatalogChallenge(row);
}

export function filterDiscoverCatalog<T extends DiscoverCatalogRow>(
  rows: readonly T[],
  viewerId?: string | null,
): T[] {
  return rows.filter((row) => keepForDiscover(row, viewerId));
}
