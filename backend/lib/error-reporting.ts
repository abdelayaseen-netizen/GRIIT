/**
 * Production error reporting: structured log + optional webhook.
 * Call on tRPC errors for monitoring/alerting.
 */

import { logger } from "./logger";

export interface ErrorReportPayload {
  requestId: string;
  path?: string;
  userId: string | null;
  code: string;
  message: string;
  ts: string;
}

export function reportError(payload: ErrorReportPayload): void {
  const body = JSON.stringify({ level: "error", ...payload });
  logger.error({ ...payload }, "trpc:error");

  const url = process.env.ERROR_REPORT_URL?.trim();
  if (url) {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {
      // Fire-and-forget; do not throw
    });
  }
}
