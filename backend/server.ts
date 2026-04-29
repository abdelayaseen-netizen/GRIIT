import "dotenv/config";
import app from "./hono";
import { serve } from "@hono/node-server";
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV ?? "development",
  enabled: !!process.env.SENTRY_DSN_BACKEND,
  tracesSampleRate: 0.1,
});

const port = Number(process.env.PORT ?? 8080);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
