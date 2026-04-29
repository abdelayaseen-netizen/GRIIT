/**
 * Production error reporting: structured log + optional webhook.
 * Call on tRPC errors for monitoring/alerting.
 */

import { logger } from "./logger";
import * as Sentry from "@sentry/node";

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
  if (Sentry.isEnabled()) {
    Sentry.captureException(new Error(payload.message), {
      tags: {
        code: payload.code,
        path: payload.path ?? "unknown",
      },
      extra: {
        requestId: payload.requestId,
        path: payload.path ?? null,
        userId: payload.userId,
        code: payload.code,
        message: payload.message,
        ts: payload.ts,
      },
    });
  }

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
