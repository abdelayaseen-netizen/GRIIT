// GRIIT task completion v2 — fixtures.
// These stand in for the submit response. Shape matches SubmitResult in README §9;
// in production every field here comes from the server, never from the client.

export const SUBMIT_RESULTS = {
  secured: {
    taskComplete: true, daySecured: true, daySecuredEarlier: false, requiredRemaining: 0,
    streakDays: 14, streakDaysBefore: 13, challengeDay: 3, challengeLength: 14,
    challengeName: 'Consistent Bedtime',
  },
  left: {
    taskComplete: true, daySecured: false, daySecuredEarlier: false, requiredRemaining: 1,
    streakDays: 13, streakDaysBefore: 13, challengeDay: 3, challengeLength: 14,
    challengeName: 'Consistent Bedtime',
  },
  already: {
    taskComplete: true, daySecured: true, daySecuredEarlier: true, requiredRemaining: 0,
    streakDays: 14, streakDaysBefore: 14, challengeDay: 3, challengeLength: 14,
    challengeName: 'Consistent Bedtime',
  },
};

// Headline + footnote by day state. Variant D (self-report) reuses these headlines
// but swaps the mark, eyebrow, verification line and CTA colour. README §6.1.
export const DAY_STATE_COPY = {
  secured: {
    headline: 'Day secured',
    footnote: 'Streak: consecutive days where every required task was completed.',
  },
  left: {
    headline: '{n} required task{s} left',
    footnote: 'The streak moves only when every required task for the day is done.',
  },
  already: {
    headline: 'Task done',
    footnote: 'The day was already secured earlier today. Nothing changes on the streak.',
  },
};

export const BLOCKED_COPY = {
  window: {
    eyebrow: 'NOT OPEN YET',
    headline: 'Opens at {openAt}',
    body: 'This task only counts inside its window: {openAt} to {closeAt}. You can shoot the photo then. Nothing is logged before it opens.',
    meta: "Window opens in {countdown} · we'll remind you at {openAt}",
    primary: 'Remind me at {openAt}',
  },
  range: {
    eyebrow: 'OUT OF RANGE',
    headline: "You're not at {place}",
    body: "You need to be within {radius} m of the saved location. Right now you're {distance} away. Nothing is logged until you're inside the radius.",
    meta: 'GPS accuracy ±{accuracy} m · last checked {checkedAt}',
    primary: 'Check again',
  },
  hardmode: {
    eyebrow: 'TIMER RESET',
    headline: 'You left the app',
    body: 'Hard mode is on for this task, so the timer went back to {duration}. Nothing was logged. Start it again and stay in the app.',
    meta: 'Ran {ran} of {duration} before the app went to the background',
    primary: 'Start over',
  },
  upload: {
    eyebrow: 'NOT POSTED',
    headline: "Upload didn't go through",
    body: 'Your photo is saved on this device. The day is not secured yet. Retry when you have signal — the capture keeps its original timestamp.',
    meta: '',
    primary: 'Retry now',
    secondary: 'Keep it for later',
  },
};

export const DEMO_TASK = {
  photo: { name: 'Drink water and post a photo', day: 3 },
  timer: { name: 'Meditate 10 minutes', day: 3, duration: '10:00', durationSec: 600 },
  run: { name: 'Run 5k', day: 3, distance: '5.02 km', duration: '27:41' },
  workout: { name: 'Lift for 45 minutes', day: 3, duration: '45 min', minimum: 30 },
  journal: { name: 'Write 150 words', day: 3, minWords: 150 },
  counter: { name: 'Drink 8 glasses', day: 3, goal: 8, unit: 'glasses' },
  checkin: { name: "Train at Gold's Gym", day: 3, place: "Gold's Gym", radius: 100, distance: 24, accuracy: 8 },
  manual: { name: 'Hit your bedtime', day: 3 },
};
