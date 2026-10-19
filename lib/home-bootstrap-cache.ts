// Build 92 chunk 11.2 · Home paints from the last good bootstrap while the network refreshes it.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayDateKey } from "@/lib/date-utils";
import type { HomeBootstrap } from "@/lib/use-home-bootstrap";

export const homeBootstrapCacheKey = (userId: string) => `griit.homeBootstrap.v1:${userId}`;

type Saved = { dateKey: string; savedAt: number; data: HomeBootstrap };

function timezoneOf(data: HomeBootstrap): string | null {
  const tz = (data.profile as { timezone?: unknown } | null)?.timezone;
  return typeof tz === "string" && tz.trim() ? tz : null;
}

/** Only a complete answer is kept; a partial one (any section failed) would paint a wrong Home. */
export function serializeHomeBootstrap(data: HomeBootstrap, now = new Date()): string | null {
  if (!data || !Array.isArray(data.failed) || data.failed.length > 0) return null;
  const tz = timezoneOf(data);
  const saved: Saved = { dateKey: getTodayDateKey(tz), savedAt: now.getTime(), data };
  return JSON.stringify(saved);
}

/**
 * Strict parse. A snapshot from an earlier day keeps the challenges and numbers but drops
 * that day's check-ins, so a new day never opens with yesterday's tasks shown as done.
 */
export function parseHomeBootstrap(raw: string | null | undefined): HomeBootstrap | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Saved>;
    if (!v || typeof v !== "object" || typeof v.dateKey !== "string" || !v.data || typeof v.data !== "object") {
      return null;
    }
    const data = v.data as HomeBootstrap;
    if (!Array.isArray(data.failed) || data.failed.length > 0) return null;
    if (v.dateKey === getTodayDateKey(timezoneOf(data))) return data;
    return { ...data, todayCheckins: [], todayCheckinsForUser: [] };
  } catch {
    return null;
  }
}

const memory = new Map<string, HomeBootstrap | null>();
const reads = new Map<string, Promise<HomeBootstrap | null>>();

export function peekHomeBootstrapCache(userId: string): HomeBootstrap | null | undefined {
  return memory.get(userId);
}

export function readHomeBootstrapCache(userId: string): Promise<HomeBootstrap | null> {
  const known = memory.get(userId);
  if (known !== undefined) return Promise.resolve(known);
  let p = reads.get(userId);
  if (!p) {
    p = AsyncStorage.getItem(homeBootstrapCacheKey(userId))
      .then((raw) => parseHomeBootstrap(raw))
      .catch(() => null)
      .then((data) => {
        if (!memory.has(userId)) memory.set(userId, data);
        reads.delete(userId);
        return memory.get(userId) ?? null;
      });
    reads.set(userId, p);
  }
  return p;
}

export function writeHomeBootstrapCache(userId: string, data: HomeBootstrap): void {
  const raw = serializeHomeBootstrap(data);
  if (!raw) return;
  memory.set(userId, data);
  void AsyncStorage.setItem(homeBootstrapCacheKey(userId), raw).catch(() => {});
}
