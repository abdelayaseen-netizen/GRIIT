/**
 * Optional Redis response cache (Upstash). No-op when env vars unset.
 */
import { Redis } from "@upstash/redis";

let redis: Redis | null | undefined;

function getRedisClient(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    redis = new Redis({ url, token });
  } else {
    redis = null;
  }
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const r = getRedisClient();
  if (!r) return null;
  try {
    const val = await r.get<T>(key);
    return val ?? null;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("[Cache] get failed:", e);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const r = getRedisClient();
  if (!r) return;
  try {
    await r.set(key, value, { ex: ttlSeconds });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("[Cache] set failed:", e);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  const r = getRedisClient();
  if (!r) return;
  try {
    await r.del(key);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") console.error("[Cache] invalidate failed:", e);
  }
}
