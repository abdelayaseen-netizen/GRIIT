/** User-facing join / start-again copy. Never a bare "Server Error". */
export const ALREADY_IN_CHALLENGE_MESSAGE = "You're already in this challenge.";
export const JOIN_FREE_LIMIT_MESSAGE = "Free accounts can run 3 challenges at once.";
export const JOIN_FAILED_FALLBACK = "Couldn't start this challenge. Try again.";

export type PgLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function pgErrorFields(err: unknown): PgLikeError {
  if (!err || typeof err !== "object") return {};
  const e = err as Record<string, unknown>;
  return {
    code: typeof e.code === "string" ? e.code : undefined,
    message: typeof e.message === "string" ? e.message : undefined,
    details: typeof e.details === "string" ? e.details : undefined,
    hint: typeof e.hint === "string" ? e.hint : undefined,
  };
}

export function joinFailureFromInsert(err: unknown): {
  alreadyIn: boolean;
  message: string;
  log: PgLikeError;
} {
  const log = pgErrorFields(err);
  if (log.code === "23505") {
    return { alreadyIn: true, message: ALREADY_IN_CHALLENGE_MESSAGE, log };
  }
  return { alreadyIn: false, message: JOIN_FAILED_FALLBACK, log };
}
