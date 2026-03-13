import { trpcServer } from "@hono/trpc-server";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { checkRateLimit, getClientIp } from "./lib/rate-limit";

const REQUEST_BODY_MAX_BYTES = Number(process.env.REQUEST_BODY_MAX_BYTES) || 1_000_000; // 1MB

const app = new Hono();

const isProd = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN ?? (isProd ? "" : "*");
app.use(
  "*",
  cors({
    origin: corsOrigin || "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  })
);

app.get("/", (c) => c.json({ status: "ok", message: "GRIIT API is running" }));

const healthPayload = () => {
  const commitSha =
    process.env.RAILWAY_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
    "unknown";
  return {
    ok: true,
    service: "backend",
    version: "1.0.0",
    commitSha,
    commit: commitSha,
    time: new Date().toISOString(),
  };
};

app.get("/api/health", (c) => c.json(healthPayload()));
app.get("/health", (c) => c.json(healthPayload()));

/** Cron: send daily morning and streak-at-risk push reminders. Call every hour with CRON_SECRET. */
app.get("/api/cron/send-reminders", async (c) => {
  const secret = c.req.query("secret") ?? c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || secret !== cronSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const { runReminderCron } = await import("./lib/cron-reminders");
    const { getSupabaseAdmin, hasSupabaseAdmin } = await import("./lib/supabase-admin");
    const supabase = hasSupabaseAdmin() ? getSupabaseAdmin() : (await import("./lib/supabase")).supabase;
    const result = await runReminderCron(supabase);
    return c.json({ ok: true, ...result });
  } catch (err) {
    const { logger } = await import("./lib/logger");
    logger.error({ err }, "[cron] send-reminders error");
    return c.json({ ok: false, error: (err as Error).message }, 500);
  }
});

/** Cron: create today's 24h daily challenge from templates (idempotent). Call once per day with CRON_SECRET. */
app.get("/api/cron/daily-challenge", async (c) => {
  const secret = c.req.query("secret") ?? c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || secret !== cronSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const { createDailyChallengeIfMissing } = await import("./lib/daily-challenge-generator");
    const { getSupabaseAdmin, hasSupabaseAdmin } = await import("./lib/supabase-admin");
    const supabase = hasSupabaseAdmin() ? getSupabaseAdmin() : (await import("./lib/supabase")).supabase;
    const result = await createDailyChallengeIfMissing(supabase, new Date());
    return c.json({ ok: true, created: result.created, id: result.id });
  } catch (err) {
    const { logger } = await import("./lib/logger");
    logger.error({ err }, "[cron] daily-challenge error");
    return c.json({ ok: false, error: (err as Error).message }, 500);
  }
});

/** Strava OAuth callback: exchange code for tokens, upsert connected_accounts, redirect to app. */
app.get("/api/auth/strava/callback", async (c) => {
  const url = new URL(c.req.url);
  const result = await import("./lib/strava-callback").then((m) =>
    m.handleStravaCallback(url.searchParams)
  );
  return c.redirect(result.redirect, 302);
});

/** Adds X-Request-ID, enforces body size limit, rate limits by IP. Runs before tRPC. */
async function trpcPreMiddleware(c: Context, next: () => Promise<void>) {
  const req = c.req.raw;
  const ip = getClientIp(req);
  const requestId = req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const newHeaders = new Headers(req.headers);
  newHeaders.set("x-request-id", requestId);
  type RequestInitWithDuplex = RequestInit & { duplex?: "half" };
  const requestWithId = new Request(req.url, {
    method: req.method,
    headers: newHeaders,
    body: req.body,
    ...(req.body != null && { duplex: "half" as const }),
  } as RequestInitWithDuplex);
  c.set("request", requestWithId);

  const contentLength = req.headers.get("content-length");
  if (req.method === "POST" && contentLength) {
    const len = parseInt(contentLength, 10);
    if (!Number.isNaN(len) && len > REQUEST_BODY_MAX_BYTES) {
      return c.json({ error: "Payload too large" }, 413, {
        "retry-after": "60",
      });
    }
  }

  const key = `ip:${ip}`;
  const { allowed, resetAt } = await checkRateLimit(key);
  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return c.json(
      { error: "Too many requests", code: "TOO_MANY_REQUESTS" },
      429,
      {
        "retry-after": String(Math.max(1, retryAfter)),
        "x-request-id": requestId,
      }
    );
  }

  await next();
}

app.use("/api/trpc/*", trpcPreMiddleware);
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext: async (opts, c) =>
      createContext({ req: (c?.get?.("request") as Request | undefined) ?? opts.req }),
  })
);

app.use("/trpc/*", trpcPreMiddleware);
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext: async (opts, c) =>
      createContext({ req: (c?.get?.("request") as Request | undefined) ?? opts.req }),
  })
);

export default app;
