import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

/** Call once at app startup (see `app/_layout.tsx`). */
export function initialiseSentry(): void {
  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 0 : 0.2,
    environment: __DEV__ ? "development" : "production",
    enabled: !__DEV__,
    enableNativeFramesTracking: true,
    enableAutoSessionTracking: true,
    attachStacktrace: true,
  });
}

/** @deprecated Use `initialiseSentry` — kept for existing imports. */
export const initSentry = initialiseSentry;

export function setSentryUser(userId: string, email?: string): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser(): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export function captureError(error: unknown, context?: string | Record<string, unknown>): void {
  if (__DEV__) {
    const label = typeof context === "string" ? context : JSON.stringify(context ?? {});
    console.error(`[${label}]`, error);
    return;
  }
  if (!SENTRY_DSN) return;
  if (typeof context === "string") {
    if (error instanceof Error) {
      Sentry.captureException(error, { tags: { context: context || "unknown" } });
    } else {
      Sentry.captureMessage(String(error), { tags: { context: context || "unknown" } });
    }
    return;
  }
  const extra = context;
  if (error instanceof Error) {
    Sentry.captureException(error, extra ? { extra } : undefined);
  } else {
    Sentry.captureMessage(String(error), extra ? { extra } : undefined);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {
  if (__DEV__) {
    return;
  }
  if (SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}

export { Sentry };
