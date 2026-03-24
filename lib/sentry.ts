import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.warn("[Sentry] No DSN set — error monitoring disabled");
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    environment: process.env.NODE_ENV ?? (__DEV__ ? "development" : "production"),
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableNativeFramesTracking: true,
    enableAutoSessionTracking: true,
    attachStacktrace: true,
    beforeSend(event) {
      if (__DEV__) {
        console.warn("[Sentry] Would send event:", event.event_id);
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
  const extra = context;
  if (error instanceof Error) {
    Sentry.captureException(error, extra ? { extra } : undefined);
  } else {
    Sentry.captureMessage(String(error), extra ? { extra } : undefined);
  }
}

export { Sentry };
