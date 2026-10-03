export const LIVE_FEED_PAGE_SIZE = 20;

export type LiveFeedCursor = {
  createdAt: string;
  id: string | null;
};

const ISO_PREFIX = /^\d{4}-\d{2}-\d{2}T/;

export function isLiveFeedDatetime(value: string): boolean {
  if (!ISO_PREFIX.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

/** ISO datetime, `iso|id`, or `{ created_at, id }`. Anything else → first page. */
export function parseLiveFeedCursor(raw: string | null | undefined): LiveFeedCursor | null {
  if (!raw || !raw.trim()) return null;
  const text = raw.trim();
  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { created_at?: unknown; createdAt?: unknown; id?: unknown };
      const createdAt = String(parsed.created_at ?? parsed.createdAt ?? "");
      const id = typeof parsed.id === "string" && parsed.id.trim() ? parsed.id.trim() : null;
      if (isLiveFeedDatetime(createdAt)) return { createdAt, id };
    } catch {
      return null;
    }
    return null;
  }
  const bar = text.indexOf("|");
  if (bar > 0) {
    const createdAt = text.slice(0, bar);
    const id = text.slice(bar + 1).trim();
    if (isLiveFeedDatetime(createdAt) && id) return { createdAt, id };
    return null;
  }
  if (isLiveFeedDatetime(text)) return { createdAt: text, id: null };
  return null;
}

export function encodeLiveFeedCursor(event: { created_at: string; id: string }): string {
  return `${event.created_at}|${event.id}`;
}

/** Sort is created_at DESC, id DESC. True when `ev` is strictly after `cursor`. */
export function eventAfterCursor(
  ev: { created_at: string; id: string },
  cursor: LiveFeedCursor | null,
): boolean {
  if (!cursor) return true;
  if (ev.created_at < cursor.createdAt) return true;
  if (ev.created_at > cursor.createdAt) return false;
  if (!cursor.id) return false;
  return ev.id < cursor.id;
}

export function liveFeedNextCursor(
  lastScanned: { created_at: string; id: string } | null,
  filledPage: boolean,
): string | null {
  if (!filledPage || !lastScanned) return null;
  return encodeLiveFeedCursor(lastScanned);
}

export function collectLiveFeedPage<T extends { created_at: string; id: string }>(opts: {
  source: readonly T[];
  cursorRaw?: string | null;
  limit: number;
  keep: (ev: T) => boolean;
}): { items: T[]; nextCursor: string | null; lastScanned: T | null } {
  const cursor = parseLiveFeedCursor(opts.cursorRaw);
  const items: T[] = [];
  let lastScanned: T | null = null;
  for (const ev of opts.source) {
    if (!eventAfterCursor(ev, cursor)) continue;
    lastScanned = ev;
    if (opts.keep(ev)) items.push(ev);
    if (items.length >= opts.limit) break;
  }
  const filled = items.length >= opts.limit;
  const lastIndex = lastScanned ? opts.source.indexOf(lastScanned) : -1;
  const more = lastIndex >= 0 && lastIndex < opts.source.length - 1;
  return {
    items,
    nextCursor: liveFeedNextCursor(lastScanned, filled && more),
    lastScanned,
  };
}
