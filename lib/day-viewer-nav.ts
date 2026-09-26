import { proofsDateLabel } from "@/lib/proofs-grid";

export type DayViewerCursor = {
  dateKey: string;
  photoIndex: number;
};

/** Newest date first — same order as the Proofs grid. */
export function dayViewerDateKeys(items: readonly { dateKey: string }[]): string[] {
  return [...new Set(items.map((i) => i.dateKey))].sort((a, b) => (a < b ? 1 : -1));
}

/** Flattened pages: each day's photos, days newest → oldest. */
export function dayViewerPages<T extends { dateKey: string }>(items: readonly T[]): T[] {
  return dayViewerDateKeys(items).flatMap((key) => items.filter((i) => i.dateKey === key));
}

export function dayViewerPhotoCount(
  pages: readonly { dateKey: string }[],
  dateKey: string,
): number {
  return pages.filter((p) => p.dateKey === dateKey).length;
}

export function dayViewerCursorFromPage(
  pages: readonly { dateKey: string }[],
  pageIndex: number,
): DayViewerCursor | null {
  const item = pages[pageIndex];
  if (!item) return null;
  let photoIndex = 0;
  for (let i = 0; i < pageIndex; i++) {
    if (pages[i]?.dateKey === item.dateKey) photoIndex += 1;
  }
  return { dateKey: item.dateKey, photoIndex };
}

export function dayViewerPageFromCursor(
  pages: readonly { dateKey: string }[],
  cursor: DayViewerCursor,
): number {
  let seen = 0;
  for (let i = 0; i < pages.length; i++) {
    if (pages[i]?.dateKey !== cursor.dateKey) continue;
    if (seen === cursor.photoIndex) return i;
    seen += 1;
  }
  return pages.findIndex((p) => p.dateKey === cursor.dateKey);
}

export function dayViewerCountLabel(cursor: DayViewerCursor, dayCount: number): string {
  if (dayCount <= 0) return "1 of 1";
  return `${cursor.photoIndex + 1} of ${dayCount}`;
}

/** Swipe left: next photo, or first photo of the previous (older) day. */
export function dayViewerSwipeNext(
  pages: readonly { dateKey: string }[],
  pageIndex: number,
): number | null {
  if (pageIndex < 0 || pageIndex >= pages.length - 1) return null;
  return pageIndex + 1;
}

/** Swipe right: previous photo, or last photo of the next (newer) day. */
export function dayViewerSwipePrev(
  pages: readonly { dateKey: string }[],
  pageIndex: number,
): number | null {
  if (pages.length === 0 || pageIndex <= 0) return null;
  return pageIndex - 1;
}

export function dayViewerNextDayHint(args: {
  pages: readonly { dateKey: string }[];
  pageIndex: number;
  isOwner: boolean;
}): string | null {
  const cur = args.pages[args.pageIndex];
  const next = args.pages[args.pageIndex + 1];
  if (!cur || !next || next.dateKey === cur.dateKey) return null;
  if (!args.isOwner) return "Swipe left at the last photo for the previous shared day";
  return `Swipe left at the last photo for ${proofsDateLabel(next.dateKey)}`;
}
