import "dotenv/config";
import * as Sentry from "@sentry/node";

// Sentry init MUST happen before any other imports so it can capture import-time errors
Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV ?? "development",
  enabled: !!process.env.SENTRY_DSN_BACKEND,
  tracesSampleRate: 0.1,
});

import { logger } from "./lib/logger";

logger.info(
  {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    supabaseUrlSet: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonSet: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsnSet: !!process.env.SENTRY_DSN_BACKEND,
  },
  "[boot] step 1: dotenv + sentry init complete",
);

function toError(reason: unknown): Error {
  if (reason instanceof Error) return reason;
  if (typeof reason === "string") return new Error(reason);
  try {
    return new Error(JSON.stringify(reason));
  } catch {
    return new Error(String(reason));
  }
}

process.on("uncaughtException", (err) => {
  logger.error({ err }, "[boot] FATAL uncaughtException");
  Sentry.captureException(err);
  setTimeout(() => process.exit(1), 2000);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "[boot] FATAL unhandledRejection");
  Sentry.captureException(toError(reason));
  setTimeout(() => process.exit(1), 2000);
});

async function main() {
  logger.info("[boot] step 2: starting hono import");
  let app: import("hono").Hono;
  try {
    const honoModule = await import("./hono");
    app = honoModule.default;
    logger.info("[boot] step 3: hono imported successfully");
  } catch (err) {
    logger.error({ err }, "[boot] FATAL hono import failed");
    Sentry.captureException(toError(err));
    throw err;
  }

  logger.info("[boot] step 4: importing serve");
  const { serve } = await import("@hono/node-server");
  logger.info("[boot] step 5: serve imported");

  const port = Number(process.env.PORT ?? 8080);
  logger.info({ port }, "[boot] step 6: binding port");

  serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  });

  logger.info({ port }, "[boot] step 7: server listening on 0.0.0.0");
}

main().catch((err) => {
  logger.error({ err }, "[boot] FATAL main() rejected");
  Sentry.captureException(toError(err));
  setTimeout(() => process.exit(1), 2000);
});
