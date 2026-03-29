/**
 * Client-side error reporting for ErrorBoundary and unhandled errors.
 * When EXPO_PUBLIC_ERROR_REPORT_URL is set, POSTs error payload (fire-and-forget).
 * Also forwards to Sentry via `lib/sentry.ts` when DSN is configured.
 */

import { captureError } from "@/lib/sentry";

const REPORT_URL = (process.env.EXPO_PUBLIC_ERROR_REPORT_URL ?? "").trim();

export function reportClientError(error: Error, componentStack?: string | null): void {
  if (!__DEV__ && REPORT_URL) {
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
    }).catch(() => {
      // Error reporter itself must not throw
    });
  }
  captureError(error, componentStack ? { componentStack } : undefined);
}
