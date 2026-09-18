/** Friends who posted while you were away. Own posts do not count. Only followed authors. */

export function countFriendsPostedAway(
  posts: Array<{ userId?: string; author_id?: string }>,
  currentUserId: string | null | undefined,
  followedIds: ReadonlySet<string> | readonly string[] = [],
): number {
  if (!currentUserId) return 0;
  const followed = followedIds instanceof Set ? followedIds : new Set(followedIds);
  if (followed.size === 0) return 0;
  const ids = new Set<string>();
  for (const p of posts) {
    const author = p.author_id ?? p.userId;
    if (!author || author === currentUserId) continue;
    if (!followed.has(author)) continue;
    ids.add(author);
  }
  return ids.size;
}

export function friendsPostedAwayLine(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) return "1 friend posted while you were away.";
  return `${count} friends posted while you were away.`;
}
