// v53 · copy and constants
export const VISIBILITY = {
  friends: { icon: 'users', label: 'Friends', line: 'Your {n} friends see it in their feed.', button: 'Post to friends' },
  everyone: { icon: 'globe', label: 'Everyone', line: 'Anyone on GRIIT can see it, in the feed and on the challenge board.', button: 'Post to everyone' },
  me: { icon: 'lock', label: 'Only me', line: 'Only you can see it. It still counts for today.', button: 'Save privately' },
} as const;
export const DEFAULT_VISIBILITY = 'friends';
export const COPY = {
  countDone: (target: number, unit: string) => `Done · ${target} ${unit}`,
  timerStart: (mmss: string) => `Start ${mmss}`,
  timerAlready: 'Done, already did it',
  timerFinishEarly: 'Finish early',
  timerElapsed: (done: string, total: string) => `${done} of ${total}`,
  securedFirst: 'Secured. Every task done today.',
  secured: 'Day secured.',
  savedToast: 'Saved privately. It counts for today.',
  shareOutside: 'Share outside GRIIT',
  backToToday: 'Back to today',
  addPhoto: 'Add a photo',
  changeVisibility: 'Change who sees this',
  sparseFeed: 'Everyone is on until you follow 3 people.',
  finishedTitle: (c: string) => `Finished ${c}`,
  likedBy: (first: string, others: number) => others ? `Liked by ${first} and ${others} ${others === 1 ? 'other' : 'others'}` : `Liked by ${first}`,
  laZero: 'Done. Tap to post.',
  laSecures: 'Secures today',
  laSecured: (n: number) => `Day secured · ${n} ${n === 1 ? 'day' : 'days'} in a row`,
  starterTitle: 'Pick something easy. Do it today.',
  starterFreeze: '+1 freeze. It covers one missed day.',
  accountDone: 'Save your streak and your freeze.',
  accountNotDone: 'Save your challenge.',
  todayOnly: 'Today only',
};
export const STARTERS = ['Drink a glass of water', 'Write one thing you’re grateful for', 'Lay out tomorrow’s workout clothes', 'Set tomorrow’s alarm', 'Read one page', 'Make your bed'];
export const STARTER_MAX = 40;
export const SAVED_TOAST_MS = 4000;
export const UNDO_MS = 5000;
export const LA_SECURED_DISMISS_MIN = 5;
export const showBestBadge = (current: number, best: number) => current > 1 && current >= best;

// v53.1
export const STARTER_RULES = { securesTodayAlone: true, challengeDay1: 'tomorrow', freezeOncePerLifetime: true };
export const STARTER_COPY = {
  homeLine: (challenge: string) => `Today is secured when the starter is done. Day 1 of ${challenge} starts tomorrow.`,
  startsTomorrow: (challenge: string) => `${challenge} · Starts tomorrow`,
  tomorrowLine: (task: string, n: number) => `Tomorrow · ${task} · Day 1 of ${n}`,
};
export const TABS = [
  { key: 'home', label: 'Home', sf: 'house' },
  { key: 'discover', label: 'Discover', sf: 'safari' },
  { key: 'create', label: 'Create', sf: 'plus', opensSheet: true },
  { key: 'activity', label: 'Activity', sf: 'bell' },
  { key: 'profile', label: 'Profile', sf: 'person' },
] as const;
export const GLASS_SURFACES = ['tabBar', 'feedSwitch', 'savedToast', 'timerControls', 'profileFeedTopBar', 'visibilityBadge'] as const;
