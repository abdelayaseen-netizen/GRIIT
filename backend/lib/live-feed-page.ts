export const LIVE_FEED_PAGE_SIZE = 20;

export function liveFeedNextCursor(
  posts: readonly { createdAt?: string | null }[],
  pageSize: number,
): string | null {
  if (posts.length < pageSize) return null;
  const last = posts[posts.length - 1]?.createdAt;
  return last && last.length > 0 ? last : null;
}
