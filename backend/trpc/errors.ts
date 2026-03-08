import { TRPCError } from "@trpc/server";

type SupabaseError = { code?: string; message?: string };

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
