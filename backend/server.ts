import "dotenv/config";
import * as Sentry from "@sentry/node";

// Sentry init MUST happen before any other imports so it can capture import-time errors
Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND,
  environment: process.env.NODE_ENV ?? "development",
  enabled: !!process.env.SENTRY_DSN_BACKEND,
  tracesSampleRate: 0.1,
});

console.log("[boot] step 1: dotenv + sentry init complete");
console.log("[boot] step 1: NODE_ENV =", process.env.NODE_ENV);
console.log("[boot] step 1: PORT =", process.env.PORT);
console.log("[boot] step 1: SUPABASE_URL set =", !!process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("[boot] step 1: SUPABASE_ANON set =", !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log("[boot] step 1: SENTRY_DSN_BACKEND set =", !!process.env.SENTRY_DSN_BACKEND);

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
  console.error("[boot] FATAL uncaughtException:", err);
  Sentry.captureException(err);
  // Give Sentry 2s to flush, then exit
  setTimeout(() => process.exit(1), 2000);
});

process.on("unhandledRejection", (reason) => {
  console.error("[boot] FATAL unhandledRejection:", reason);
  Sentry.captureException(toError(reason));
  setTimeout(() => process.exit(1), 2000);
});

async function main() {
  console.log("[boot] step 2: starting hono import");
  let app: import("hono").Hono;
  try {
    const honoModule = await import("./hono");
    app = honoModule.default;
    console.log("[boot] step 3: hono imported successfully");
  } catch (err) {
    console.error("[boot] FATAL hono import failed:", err);
    Sentry.captureException(toError(err));
    throw err;
  }

  console.log("[boot] step 4: importing serve");
  const { serve } = await import("@hono/node-server");
  console.log("[boot] step 5: serve imported");

  const port = Number(process.env.PORT ?? 8080);
  console.log("[boot] step 6: binding port", port);

  serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  });

  console.log(`[boot] step 7: server listening on 0.0.0.0:${port}`);
}

main().catch((err) => {
  console.error("[boot] FATAL main() rejected:", err);
  Sentry.captureException(toError(err));
  setTimeout(() => process.exit(1), 2000);
});
