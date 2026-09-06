// GRIIT task completion v2 — the per-type table.
// Single source of truth for anything type-specific. Add a new task type HERE first.
// `verified` is written as user-facing copy on purpose: if you cannot write an honest
// sentence for a new type, it does not get the verified treatment.

export const TASK_TYPES = {
  photo: {
    label: 'Photo',
    chromeTitle: 'Photo proof',
    gates: ['Camera only · live capture'],
    verified: 'Live capture, camera only. Time window if the challenge sets one.',
    confirmLine: 'Captured live in the app · {time}',
    states: ['capture', 'review'],
    honest: true,
    taps: 3,
    tapSequence: 'task → shutter → post',
  },
  timer: {
    label: 'Timer',
    chromeTitle: 'Timer',
    gates: ['{duration} timer', 'Runs on the clock — lock your phone if you want'],
    verified: 'A {duration} timer ran on the clock, start to finish, with both timestamps recorded.',
    confirmLine: 'Timer ran {duration} · started {startedAt}',
    states: ['entry', 'running'],
    honest: true,
    taps: 3,
    tapSequence: 'task → start → done',
  },
  run: {
    label: 'Run',
    chromeTitle: 'Run',
    gates: ['Camera only · live capture'],
    verified: 'The photo is a live capture. Distance and duration are self-entered.',
    confirmLine: 'Photo captured live · {distance} and {duration} self-entered',
    states: ['log', 'capture', 'review'],
    honest: true,
    taps: 5,
    tapSequence: 'task → log → shutter → post → done',
  },
  workout: {
    label: 'Workout',
    chromeTitle: 'Workout',
    gates: ['Camera only · live capture', 'At least {minimum} minutes'],
    verified: 'The photo is a live capture. Duration is self-entered unless the in-app timer ran.',
    confirmLine: 'Photo captured live · {duration} self-entered',
    states: ['log', 'capture', 'review'],
    honest: true,
    taps: 5,
    tapSequence: 'task → kind → shutter → post → done',
  },
  journal: {
    label: 'Journal',
    chromeTitle: 'Journal',
    gates: ['{minWords} words minimum'],
    verified: 'Word count only. The text is the proof; nobody checks what it says.',
    confirmLine: 'Word count met · {words} words',
    states: ['write'],
    honest: true,
    taps: 3,
    tapSequence: 'task → write → post',
  },
  counter: {
    label: 'Water / count',
    chromeTitle: 'Count',
    gates: ['Self-entered count · nothing checked'],
    verified: 'Nothing. You entered the count yourself.',
    confirmLine: 'Self-entered count · nothing was checked',
    states: ['count'],
    honest: false,
    taps: '2 + goal',
    tapSequence: 'task → n taps → submit',
  },
  checkin: {
    label: 'Check-in',
    chromeTitle: 'Check-in',
    gates: ['Be within {radius} m of {place}'],
    verified: 'GPS inside the radius at the moment you tap.',
    confirmLine: 'GPS {distance} m from the saved location · ±{accuracy} m accuracy',
    states: ['entry'],
    honest: true,
    taps: 3,
    tapSequence: "task → I'm here → done",
  },
  manual: {
    label: 'Self-report',
    chromeTitle: 'Self-report',
    gates: ['Self-reported · nothing checked'],
    verified: 'Nothing is checked.',
    confirmLine: 'Nothing was checked. You said you did it.',
    states: ['ask'],
    honest: false,
    taps: 3,
    tapSequence: 'task → I did it → done',
  },
};

// water/reading are counter variants; simple is a manual variant.
TASK_TYPES.water = { ...TASK_TYPES.counter, label: 'Water' };
TASK_TYPES.reading = { ...TASK_TYPES.counter, label: 'Reading', chromeTitle: 'Pages' };
TASK_TYPES.simple = { ...TASK_TYPES.manual };

// Distance unit is a persisted user preference (user_prefs.distance_unit), not a per-entry
// field: the unit button on the distance field writes it and every distance in the app follows.
// A workout duration back-filled by the session timer is still treated as self-entered until the
// backend distinguishes it — README open question 16.

export const TYPE_ORDER = ['photo', 'timer', 'run', 'workout', 'journal', 'counter', 'checkin', 'manual'];
