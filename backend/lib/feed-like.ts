/** Build 92 04.5: you can't like your own post. The server refuses it; the client never offers it. */
export const SELF_LIKE_MESSAGE = "You can't like your own post.";

export function selfLikeRejected(ownerId: string | null | undefined, userId: string): boolean {
  return Boolean(ownerId) && ownerId === userId;
}
