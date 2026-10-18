// 3.4 · the feed: proofs lead, "started" events grouped and limited
export type Item = { kind: 'proof'; id: string } | { kind: 'started'; userId: string; challengeId: string; at: string };
export function buildFeed(items: Item[]) {
  const proofs = items.filter((i) => i.kind === 'proof');
  const started = items.filter((i) => i.kind === 'started');
  if (!proofs.length) return { rows: [], empty: true }; // never a feed of only "started" lines
  const group = started.length ? [{ kind: 'startedGroup' as const, count: started.length, faces: started.slice(0, 3) }] : [];
  const rows: any[] = [];
  proofs.forEach((p, i) => { rows.push(p); if (group.length && (i === 0 || (i + 1) % 5 === 0) && !rows.some((r) => r.kind === 'startedGroup' && i - rows.indexOf(r) < 5)) rows.push(group[0]); });
  return { rows: rows.filter((r, i) => !(r.kind === 'startedGroup' && rows.findIndex((x) => x.kind === 'startedGroup') !== i)), empty: false }; // one group per day, after the first proof, never at the top
}
export const startedLine = (names: string[], others: number, scope: 'today') => (others ? `${names.join(', ')} and ${others} others started challenges ${scope}` : `${names.join(' and ')} started challenges ${scope}`);
export const FEED_CAPTION = { Following: (n: number) => (n ? `Proofs from the ${n} people you follow.` : 'Proofs from people you follow.'), Everyone: () => 'Proofs from everyone on GRIIT, newest first.' };
export const FEED_EMPTY = { Following: 'No proofs from people you follow yet.', Everyone: 'No proofs yet today.', body: 'Find a challenge, or invite a friend to start one with you.', actions: ['Discover', 'Invite'] };
export const HOME_DONE = { line: 'Today is secured. See you tomorrow.', fold: (n: number) => `${n} done` };
export const ERRORS = { windowClosed: (t: string) => `This task’s window closed at ${t}. It opens tomorrow.`, offline: 'Couldn’t save. No connection. Try again' }; // retry only when it can work
