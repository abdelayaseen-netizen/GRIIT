// v52 · onboarding
export const STEPS = ['welcome', 'goals', 'how', 'start', 'reminder', 'account'] as const; // then (tabs)/index
export const MAX_GOALS = 3;
export const startHereQuery = (goals: string[]) => ({ goals, visibility: 'public', joinable: true, limit: 3 });
export const COPY = {
  welcome: { title: 'Daily challenges you prove with a photo.', body: 'Finish all of today’s tasks and the day is secured. Secure days in a row to build your streak.' },
  freeze: 'Missed a day? A freeze holds your streak. You earn one every 7 days in a row.',
  join: 'Join · Day 1 is today',
  reminder: 'One reminder a day, and only if today isn’t secured yet.',
  firstTaskHint: 'Tap the circle when it’s done.',
};
export const doneLabel = (t: { gate: 'self' | 'timer' | 'count' | 'photo'; target?: number; unit?: string }) =>
  t.gate === 'count' ? `Done · ${t.target} ${t.unit}` : t.gate === 'photo' ? 'Done · take photo' : t.gate === 'timer' ? 'Done, already did it' : null; // self → tap the circle

export const FREEZE_RULE = { earnEveryStreakDays: 7, cap: { free: 2, pro: 4 } };
