/**
 * Shared photo proofs since the viewer's local midnight, from people they
 * follow or share an active challenge with. Blocked and is_test authors drop.
 * One row per person, newest first.
 */
import { dateKeyInTimeZone } from "./date-utils";

export type TodayPosterCandidate = {
  eventId: string;
  userId: string;
  name: string;
  createdAt: string;
  photoUrl: string | null;
  shared: boolean;
  blocked: boolean;
  isTest: boolean;
  inCircle: boolean;
};

export type TodayPosterPick = {
  eventId: string;
  userId: string;
  name: string;
  createdAt: string;
  photoUrl: string | null;
  isViewer: boolean;
};

/** UTC instant of local midnight at the start of `now`'s calendar day. */
export function localDayStartIso(now: Date, timeZone: string): string {
  const tz = timeZone.trim() || "UTC";
  const today = dateKeyInTimeZone(now, tz);
  const [y, m, d] = today.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined) {
    throw new Error(`Invalid date key: ${today}`);
  }
  let lo = Date.UTC(y, m - 1, d, 0, 0, 0) - 16 * 3600 * 1000;
  let hi = Date.UTC(y, m - 1, d, 0, 0, 0) + 16 * 3600 * 1000;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const key = dateKeyInTimeZone(new Date(mid), tz);
    if (key < today) lo = mid + 1;
    else hi = mid;
  }
  return new Date(lo).toISOString();
}

export function pickTodayPosters(
  rows: readonly TodayPosterCandidate[],
  viewerId: string,
  sinceIso: string,
): TodayPosterPick[] {
  const since = Date.parse(sinceIso);
  const newest = new Map<string, TodayPosterCandidate>();
  for (const row of rows) {
    if (!row.shared || row.blocked || row.isTest || !row.inCircle) continue;
    if (!row.photoUrl?.trim()) continue;
    const at = Date.parse(row.createdAt);
    if (!Number.isFinite(at) || !Number.isFinite(since) || at < since) continue;
    const prev = newest.get(row.userId);
    if (!prev || Date.parse(prev.createdAt) < at) newest.set(row.userId, row);
  }
  return [...newest.values()]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((row) => ({
      eventId: row.eventId,
      userId: row.userId,
      name: row.name.trim() || "Someone",
      createdAt: row.createdAt,
      photoUrl: row.photoUrl,
      isViewer: row.userId === viewerId,
    }));
}
