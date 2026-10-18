// 3.1 · goals. All 7 must sit above the docked button on iPhone SE (2 columns, 56 pt cards).
export const GOALS = ['Fitness and gym', 'Faith and prayer', 'Running', 'Reading', 'Health', 'Discipline', 'Mind'] as const;
export const MAX_GOALS = 3; // a 4th pick swaps out the oldest and announces it
export const goalHint = (n: number) => (n ? `${n} of 3 picked` : 'Pick at least one');
