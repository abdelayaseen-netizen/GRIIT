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

/** Adds X-Request-ID, enforces body size limit, rate limits by IP. Runs before tRPC. */
async function trpcPreMiddleware(c: Context, next: () => Promise<void>) {
  const req = c.req.raw;
  const ip = getClientIp(req);
  const requestId = req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const newHeaders = new Headers(req.headers);
  newHeaders.set("x-request-id", requestId);
  // Replace request so downstream sees x-request-id (Hono req is mutable in practice)
  (c as { req: Request }).req = new Request(req.url, {
    method: req.method,
    headers: newHeaders,
    body: req.body,
    duplex: "half",
  });

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
    createContext,
  })
);

app.use("/trpc/*", trpcPreMiddleware);
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

export default app;
