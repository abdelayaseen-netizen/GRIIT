import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  console.log("[Hono] Root hit");
  return c.json({ status: "ok", message: "GRIT API is running" });
});

app.get("/api/health", (c) => {
  console.log("[Hono] Health check hit at /api/health");
  return c.json({ ok: true, ts: Date.now(), version: "1.0.0" });
});

app.get("/health", (c) => {
  console.log("[Hono] Health check hit at /health");
  return c.json({ ok: true, ts: Date.now(), version: "1.0.0" });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

export default app;
