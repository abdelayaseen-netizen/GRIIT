import { failureErrorCode } from "@/lib/task-completion-copy";

export const GENERIC_INLINE_ERROR = "Something went wrong. Please try again.";

const NETWORK_OR_UNKNOWN =
  /Failed to fetch|Network request failed|Load failed|NetworkError|Cannot reach server|tRPC mutation failed|invalid JSON/i;

/** Banner copy. Server BAD_REQUEST (and other coded errors) keep their message; network/unknown stay generic. */
export function inlineServerError(err: unknown): string {
  const code = failureErrorCode(err);
  const message =
    err instanceof Error ? err.message.trim() : typeof err === "string" ? err.trim() : "";
  if (!message || NETWORK_OR_UNKNOWN.test(message)) return GENERIC_INLINE_ERROR;
  if (code === "BAD_REQUEST") return message;
  if (code) return message;
  return GENERIC_INLINE_ERROR;
}
