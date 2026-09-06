// Live Activity content per type and state. README §4A.
// Only types that keep running while the phone is away get one: timer, run/workout, counter family.
// Accent is the honesty signal — orange for verified types, muted for the self-entered count —
// and it is what carries the distinction at the compact Dynamic Island size where copy will not fit.

export const ACCENT = { verified: '#DC5401', selfEntered: '#A8A49C' };

export const LIVE_ACTIVITY_TYPES = ['timer', 'run', 'workout', 'counter', 'water', 'reading'];

export const LIVE_ACTIVITIES = {
  timer: {
    accent: ACCENT.verified,
    running: {
      status: 'ends {endsAt}', number: '{remaining}', unit: '',
      sub: 'Day {day} · {challenge}', progress: 'elapsed/required',
      compact: '{remaining}', tap: 'running',
    },
    complete: {
      status: 'ran {startedAt} – {endedAt}', number: '{duration}', unit: '',
      sub: 'Done · Come back to post proof.', progress: 1,
      compact: 'Done', tap: 'verifying',
    },
  },
  run: {
    accent: ACCENT.verified,
    // No distance, no pace, at any size: both are self-entered and we do not fake a number we
    // never measured. The track is a presence indicator, not a percentage.
    running: {
      status: 'started {startedAt}', number: '{elapsed}', unit: '',
      sub: 'Counting up · started {startedAt}', progress: 1,
      compact: '{elapsed}', tap: 'log',
    },
    complete: {
      status: 'ran {startedAt} – {endedAt}', number: '{elapsed}', unit: '',
      sub: 'Stopped · Come back to post proof.', progress: 1,
      compact: 'Done', tap: 'log',
    },
  },
  counter: {
    accent: ACCENT.selfEntered,
    running: {
      status: 'Self-entered', number: '{value}', unit: 'of {goal} {unit}',
      sub: 'Self-entered · nothing checked', progress: 'value/goal',
      compact: '{value}/{goal}', tap: 'count',
      // iOS 17+: Button(intent:) over an AppIntent. Increments without launching the app.
      button: { label: '+1', intent: 'IncrementCountIntent' },
    },
    complete: {
      status: 'Self-entered', number: '{value}', unit: 'of {goal} {unit}',
      sub: 'Goal met · come back to log it.', progress: 1,
      compact: '{value}/{goal}', tap: 'count',
    },
  },
};
LIVE_ACTIVITIES.workout = LIVE_ACTIVITIES.run;
LIVE_ACTIVITIES.water = LIVE_ACTIVITIES.counter;
LIVE_ACTIVITIES.reading = LIVE_ACTIVITIES.counter;

// Start when the doing begins (timer start, session start, first increment). Update on state
// change only. End when the proof posts, when the task is cancelled, or at 8 hours — whichever
// comes first. One activity per task; never two for the same challenge.
export const LIFECYCLE = { maxHours: 8, endsOn: ['proof_posted', 'cancelled', 'timeout'] };
