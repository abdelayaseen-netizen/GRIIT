import { captureError, captureMessage } from "@/lib/sentry";

type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, tag: string, message: string, error?: unknown): void {
  if (__DEV__) {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`[${tag}] ${message}`, error ?? "");
  }
  if (level === "error" && error instanceof Error) {
    captureError(error, tag);
  } else if (level === "warn" || level === "error") {
    captureMessage(`[${tag}] ${message}`, level === "error" ? "error" : "warning");
  }
}

export const logger = {
  info: (tag: string, msg: string) => log("info", tag, msg),
  warn: (tag: string, msg: string, err?: unknown) => log("warn", tag, msg, err),
  error: (tag: string, msg: string, err?: unknown) => log("error", tag, msg, err),
  debug: (tag: string, msg: string, err?: unknown) => log("debug", tag, msg, err),
};
