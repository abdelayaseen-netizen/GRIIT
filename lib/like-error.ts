/** The server message, so a rejected like is not a silent rollback. */
export function likeFailureMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return "Like failed.";
}

export function logLikeFailure(err: unknown, where: string): string {
  const message = likeFailureMessage(err);
  console.error(`[${where}] ${message}`);
  return message;
}
