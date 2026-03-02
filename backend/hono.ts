import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

const isProd = process.env.NODE_ENV === 'production';
const corsOrigin = process.env.CORS_ORIGIN ?? (isProd ? '' : '*');
app.use(
  '*',
  cors({
    origin: corsOrigin || '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get("/", (c) => c.json({ status: "ok", message: "GRIT API is running" }));

app.get("/api/health", (c) => c.json({ ok: true, ts: Date.now(), version: "1.0.0" }));

app.get("/health", (c) => c.json({ ok: true, ts: Date.now(), version: "1.0.0" }));

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  }),
);

export default app;
