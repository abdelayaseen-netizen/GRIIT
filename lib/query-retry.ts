import { TRPC_ERROR_CODE } from "@/lib/trpc-errors";

const NO_RETRY = new Set<string>([
  TRPC_ERROR_CODE.NOT_FOUND,
  TRPC_ERROR_CODE.UNAUTHORIZED,
  TRPC_ERROR_CODE.FORBIDDEN,
  TRPC_ERROR_CODE.BAD_REQUEST,
]);

const STATUS_TO_CODE: Record<string, string> = {
  "400": TRPC_ERROR_CODE.BAD_REQUEST,
  "401": TRPC_ERROR_CODE.UNAUTHORIZED,
  "403": TRPC_ERROR_CODE.FORBIDDEN,
  "404": TRPC_ERROR_CODE.NOT_FOUND,
};

export function trpcErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const e = error as { code?: unknown; data?: { code?: unknown }; message?: unknown };
  if (typeof e.code === "string" && NO_RETRY.has(e.code)) return e.code;
  if (typeof e.data?.code === "string" && NO_RETRY.has(e.data.code)) return e.data.code;
  const msg = typeof e.message === "string" ? e.message : "";
  const status = msg.match(/\((\d{3})\)/)?.[1];
  if (status && STATUS_TO_CODE[status]) return STATUS_TO_CODE[status];
  for (const code of NO_RETRY) {
    if (msg.includes(code)) return code;
  }
  return null;
}

/** No retries on 4xx listed above. Otherwise at most 2 retries. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const code = trpcErrorCode(error);
  if (code && NO_RETRY.has(code)) return false;
  return failureCount < 2;
}
