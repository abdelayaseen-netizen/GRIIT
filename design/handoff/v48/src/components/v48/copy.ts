// v48 single-source copy. Home and challenge detail import the SAME strings (Part 4: freeze copy).
export const FREEZE = {
  title: (day: string) => `${day} wasn’t secured.`,
  offer: (left: number) => `A freeze can hold it until midnight. ${left} left.`,
  none: 'No freezes left. Your streak resets to 0 at midnight.',
  button: 'Use a freeze',
  sheetTitle: (day: string) => `Use a freeze on ${day}?`,
  sheetBody: (day: string, streak: number, left: number, next: string) => `${day} shows as held and your ${streak}-day streak continues. This uses ${left === 1 ? 'your 1 freeze' : `1 of ${left} freezes`}; the next arrives ${next}.`,
  used: (day: string) => `${day} is held by a freeze.`,
} as const;

export const HOME = {
  left: (n: number, total: number) => (n === total ? `${n} task${n === 1 ? '' : 's'} left today.` : `${n} of ${total} left today.`),
  secured: 'Day secured. Come back tomorrow.',
  lost: (task: string, closedAt: string, other?: string, otherCh?: string) => `${task} closed at ${closedAt}, so today can’t be secured.` + (other ? ` ${other} still counts for ${otherCh}.` : ''),
  noChallenge: 'No challenge yet. Join one and Day 1 is today.',
  left1: (task: string) => `Today needs 1 task now: ${task}.`,
  offline: (t: string) => `Offline. Showing what was saved at ${t}.`,
};
export const WINDOW = { opensAt: (start: string) => `Opens at ${start}`, closed: (a: string, b: string) => `Window closed · ${a}–${b}` };
export const WEEK = { line: (s: number, closed: number) => `This week: ${s} of ${closed} days secured` };  // the only week count (StreakSheet)
export const FEED = { everyoneHint: (n: number) => `Showing everyone until you follow 3 people. You follow ${n}.` }; // render only when Everyone is selected
