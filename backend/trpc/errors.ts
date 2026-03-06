import { TRPCError } from "@trpc/server";

type SupabaseError = { code?: string; message?: string };

/**
 * Map Supabase/PostgREST errors to TRPCError. Never leaks raw DB messages to the client
 * except when explicitly passing a safeMessage for INTERNAL_SERVER_ERROR.
 */
export function handleSupabaseError(
  error: SupabaseError | null | undefined,
  options: {
    notFoundMessage?: string;
    conflictMessage?: string;
    defaultMessage?: string;
  } = {}
): never {
  if (!error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: options.defaultMessage ?? "An error occurred.",
    });
  }
  const code = (error as any).code;
  const defaultMsg = options.defaultMessage ?? "An error occurred.";

  if (code === "PGRST116") {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: options.notFoundMessage ?? "Resource not found.",
    });
  }
  if (code === "23505" && options.conflictMessage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: options.conflictMessage,
    });
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: defaultMsg,
  });
}

/**
 * Throw TRPCError for a failed Supabase result. Use when you only care about success/fail
 * and want a single safe message (no PGRST116 or 23505 mapping).
 */
export function requireNoError(
  error: SupabaseError | null | undefined,
  message: string
): void {
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message,
    });
  }
}
