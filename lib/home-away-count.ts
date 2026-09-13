/** Friends who posted while you were away. Own posts do not count. */
export function countFriendsPostedAway(
  posts: Array<{ userId?: string; author_id?: string }>,
  currentUserId: string | null | undefined
): number {
  if (!currentUserId) return 0;
  const ids = new Set<string>();
  for (const p of posts) {
    const author = p.author_id ?? p.userId;
    if (!author || author === currentUserId) continue;
    ids.add(author);
  }
  return ids.size;
}
