import { DS_V3 } from "@/lib/design-system";

/** Frame 39. Not MemberRow (40) and not ListRow. */
export const COMMENT_AVATAR_SIZE = DS_V3.size.avatar.xs;

export type CommentRowParts = {
  name: string;
  time: string;
  body: string;
  avatarSize: typeof COMMENT_AVATAR_SIZE;
};

/** Name and time stay separate so they share one baseline; body wraps below. */
export function commentRowParts(input: {
  displayName?: string | null;
  username?: string | null;
  createdAt: string;
  text: string;
  formatTime: (iso: string) => string;
}): CommentRowParts {
  const name = (input.displayName ?? "").trim() || (input.username ?? "").trim();
  return {
    name,
    time: input.formatTime(input.createdAt),
    body: input.text,
    avatarSize: COMMENT_AVATAR_SIZE,
  };
}
