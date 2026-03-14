/**
 * Rate limiting: Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set;
 * otherwise in-memory (single-instance). Supports global and per-route limits.
 */

const WINDOW_MS = 60_000;
const DEFAULT_MAX_PER_WINDOW = 100;
const AUTH_MAX_PER_MIN = 5;
const WRITE_MAX_PER_MIN = 30;
const CLEANUP_INTERVAL_MS = 60_000;

type Entry = { count: number; resetAt: number };
const memoryStore = new Map<string, Entry>();
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function getMax(): number {
  const env = process.env.RATE_LIMIT_MAX_PER_MIN;
  if (env != null) {
    const n = parseInt(env, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return DEFAULT_MAX_PER_WINDOW;
}

function memoryCleanup(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }
}

function ensureCleanup(): void {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(memoryCleanup, CLEANUP_INTERVAL_MS);
    (cleanupTimer as { unref?: () => void }).unref?.();
  }
}

function memoryLimit(key: string, max: number): { allowed: boolean; remaining: number; resetAt: number } {
  ensureCleanup();
  const now = Date.now();
  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    memoryStore.set(key, entry);
  }
  entry.count += 1;
  const allowed = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);
  return { allowed, remaining, resetAt: entry.resetAt };
}

let redisLimiters: {
  global: { limit: (key: string) => Promise<{ success: boolean; reset: number }> };
  auth: { limit: (key: string) => Promise<{ success: boolean; reset: number }> };
  write: { limit: (key: string) => Promise<{ success: boolean; reset: number }> };
} | null = null;

async function getRedisLimiters() {
  if (redisLimiters) return redisLimiters;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const globalMax = getMax();
    redisLimiters = {
      global: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(globalMax, "1 m"),
        prefix: "rl:global",
      }),
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(AUTH_MAX_PER_MIN, "1 m"),
        prefix: "rl:auth",
      }),
      write: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(WRITE_MAX_PER_MIN, "1 m"),
        prefix: "rl:write",
      }),
    };
    return redisLimiters;
  } catch {
    return null;
  }
}

export type RouteLimitResult = { allowed: boolean; resetAt: number };

/** Global per-IP limit (async for Redis). Use in Hono middleware. */
export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limiters = await getRedisLimiters();
  if (limiters) {
    const res = await limiters.global.limit(key);
    return {
      allowed: res.success,
      remaining: res.success ? 1 : 0,
      resetAt: res.reset,
    };
  }
  return memoryLimit(key, getMax());
}

/** Stricter per-route limit. Call from tRPC middleware. path e.g. "auth.signIn", "checkins.secureDay". */
export async function checkRouteRateLimit(
  path: string,
  opts: { ip: string; userId: string | null }
): Promise<RouteLimitResult> {
  const authPaths = ["auth.signIn", "auth.signUp", "profiles.create"];
  const writePaths = ["checkins.secureDay", "checkins.complete", "challenges.join", "nudges.send", "accountability.invite", "respects.give"];
  const limiters = await getRedisLimiters();

  if (limiters) {
    if (authPaths.includes(path)) {
      const res = await limiters.auth.limit(`ip:${opts.ip}`);
      return { allowed: res.success, resetAt: res.reset };
    }
    if (writePaths.includes(path)) {
      const key = opts.userId ? `user:${opts.userId}` : `ip:${opts.ip}`;
      const res = await limiters.write.limit(key);
      return { allowed: res.success, resetAt: res.reset };
    }
    return { allowed: true, resetAt: Date.now() + WINDOW_MS };
  }

  if (authPaths.includes(path)) {
    const r = memoryLimit(`auth:${opts.ip}`, AUTH_MAX_PER_MIN);
    return { allowed: r.allowed, resetAt: r.resetAt };
  }
  if (writePaths.includes(path)) {
    const k = opts.userId ? `write:${opts.userId}` : `write:${opts.ip}`;
    const r = memoryLimit(k, WRITE_MAX_PER_MIN);
    return { allowed: r.allowed, resetAt: r.resetAt };
  }
  return { allowed: true, resetAt: Date.now() + WINDOW_MS };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}
