/**
 * Feed likes live in feed_reactions (feed.react writes reaction "fire").
 * The respects table is not in production.
 */

export function respectCountsByOwner(
  events: readonly { id: string; user_id: string }[],
  reactions: readonly { event_id: string }[],
): Map<string, number> {
  const ownerByEvent = new Map<string, string>();
  for (const event of events) ownerByEvent.set(event.id, event.user_id);
  const counts = new Map<string, number>();
  for (const reaction of reactions) {
    const owner = ownerByEvent.get(reaction.event_id);
    if (!owner) continue;
    counts.set(owner, (counts.get(owner) ?? 0) + 1);
  }
  return counts;
}
