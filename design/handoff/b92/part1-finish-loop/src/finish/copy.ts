export type Audience = 'friends' | 'everyone' | 'me';
export const CAPTION_MAX = 120;
export const AUDIENCE: Record<Audience, { label: string; icon: string; line: string; button: string }> = {
  friends: { label: 'Friends', icon: 'users', line: 'Your {n} friends see it in their feed.', button: 'Post to friends' },
  everyone: { label: 'Everyone', icon: 'globe', line: 'Anyone on GRIIT can see it.', button: 'Post to everyone' },
  me: { label: 'Only me', icon: 'lock', line: 'Only you can see it. It still counts for today.', button: 'Save privately' },
};
export const COPY = {
  secured: 'Every task today is done.',
  securedFirst: 'A day is secured when every task in all your challenges is done.',
  inARow: (n: number) => (n === 1 ? 'day in a row' : 'days in a row'),
  remaining: (task: string, n: number) => `${task} done. ${n} left today.`,
  shortToast: (short: string) => `Run saved. ${short}, so today isn’t secured yet.`,
  otherOpen: (c: string) => `Today isn’t secured yet. ${c} still needs today.`,
  closedPrivate: 'Saved privately.',
  offline: 'No connection. Your task is saved and counts. Post again when you’re back online.',
  likedBy: (first: string, others: number) => (others ? `Liked by ${first} and ${others} ${others === 1 ? 'other' : 'others'}` : `Liked by ${first}`),
  noComments: 'No comments yet.', sayTo: (name: string) => `Say something to ${name}.`,
  deleteNote: 'Delete removes it from the feed only. The proof stays in your record and the day stays secured.',
  doneCount: (n: number, unit: string) => `Done · ${n} ${unit}`,
  saveShort: (v: string) => `Save ${v} · won’t count today`,
};
