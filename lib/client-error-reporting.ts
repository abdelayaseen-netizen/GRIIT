/**
 * Client-side error reporting for ErrorBoundary and unhandled errors.
 * When EXPO_PUBLIC_ERROR_REPORT_URL is set, POSTs error payload (fire-and-forget).
 * Optional: integrate Sentry via Sentry.captureException when @sentry/react-native is installed.
 */

const REPORT_URL = (process.env.EXPO_PUBLIC_ERROR_REPORT_URL ?? "").trim();

export function reportClientError(error: Error, componentStack?: string | null): void {
  if (__DEV__) {
    return;
  }
  if (REPORT_URL) {
    const payload = {
      message: error.message,
      name: error.name,
      stack: error.stack ?? undefined,
      componentStack: componentStack ?? undefined,
      ts: new Date().toISOString(),
    };
    fetch(REPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
  const g = globalThis as unknown as { Sentry?: { captureException: (e: Error, c?: unknown) => void } };
  if (typeof g.Sentry?.captureException === "function") {
    g.Sentry.captureException(error, { extra: { componentStack } });
  }
}
