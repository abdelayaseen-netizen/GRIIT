import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log("[Sentry] No DSN configured, skipping init");
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableAutoSessionTracking: true,
    attachStacktrace: true,
    beforeSend(event) {
      if (__DEV__) {
        console.log("[Sentry] Would send event:", event.event_id);
        return null;
      }
      return event;
    },
  });
}

export function setSentryUser(userId: string, email?: string): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser(): void {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) return;
  if (context) {
    Sentry.setContext("extra", context);
  }
  if (error instanceof Error) {
    Sentry.captureException(error);
  } else {
    Sentry.captureMessage(String(error));
  }
}

export { Sentry };
