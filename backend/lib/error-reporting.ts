/**
 * Production error reporting: structured log + optional webhook.
 * Call on tRPC errors for monitoring/alerting.
 */

export interface ErrorReportPayload {
  requestId: string;
  path?: string;
  userId: string | null;
  code: string;
  message: string;
  ts: string;
}

export function reportError(payload: ErrorReportPayload): void {
  const line = JSON.stringify({
    level: "error",
    ...payload,
  });
  if (process.env.NODE_ENV === "production") {
    console.error(line);
  } else {
    console.error("[trpc:error]", line);
  }

  const url = process.env.ERROR_REPORT_URL?.trim();
  if (url) {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: line,
    }).catch(() => {
      // Fire-and-forget; do not throw
    });
  }
}
