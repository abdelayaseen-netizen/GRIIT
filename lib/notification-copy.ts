/**
 * Notification copy rotation engine.
 * Based on Duolingo's novelty-preserving selection: vary templates daily,
 * never repeat the same copy two days in a row.
 */

export type NotifCategory =
  | "morning_motivation"
  | "task_window"
  | "weekly_summary"
  | "streak_celebration"
  | "social_trigger"
  | "challenge_countdown"
  | "secure_reminder"
  | "streak_at_risk"
  | "lapsed"
  | "task_prep";

export type NotifVars = {
  streak?: number;
  tasks?: number;
  challenge?: string;
  rank?: string;
  points?: number;
  friend?: string;
  day?: number;
  total?: number;
  daysLeft?: number;
  secured?: number;
  totalDays?: number;
};

const TEMPLATES: Record<NotifCategory, { title: string; body: string }[]> = {
  morning_motivation: [
    { title: "Rise and grind", body: "You have {tasks} tasks today. Discipline starts now." },
    { title: "New day, new proof", body: "{tasks} goals waiting. Your {streak}-day streak depends on you." },
    { title: "The grind doesn't pause", body: "Day {day} of your challenge. {tasks} tasks to secure today." },
    { title: "No days off", body: "Your future self is watching. {tasks} tasks left to earn today." },
    { title: "Earn your day", body: "Nobody cares about your excuses. {tasks} tasks. Let's go." },
    { title: "Prove it", body: "Talk is cheap. {tasks} tasks to back it up today." },
    { title: "Discipline > motivation", body: "You don't need to feel like it. You need to do it. {tasks} tasks." },
    { title: "Another chance to show up", body: "Your {streak}-day streak is alive. Keep it that way." },
  ],
  task_window: [
    { title: "Window open", body: "Your {challenge} task starts now. You have 60 minutes." },
    { title: "Time to move", body: "Your scheduled task is live. Don't let the window close." },
    { title: "Clock's ticking", body: "{challenge}: your task window just opened." },
  ],
  weekly_summary: [
    { title: "Your week in discipline", body: "{secured}/{totalDays} days secured · {points} points · {rank} rank. Keep building." },
    { title: "Weekly report", body: "You secured {secured} days this week and earned {points} points. {rank} status." },
    { title: "Week closed", body: "{secured}/{totalDays} days. {streak}-day streak. Every rep counts." },
  ],
  streak_celebration: [
    { title: "🔥 {streak}-day streak!", body: "You're in the top 10% of GRIIT users. Don't stop now." },
    { title: "{streak} days of discipline", body: "Most people quit by Day 3. You didn't. Share your proof." },
    { title: "Milestone: {streak} days", body: "That's {streak} days of choosing hard over easy. Respect." },
    { title: "Streak unlocked: {streak}", body: "Your discipline is rare. Only 12% of users make it this far." },
  ],
  social_trigger: [
    { title: "{friend} just secured their day", body: "Don't fall behind. Tap to complete your tasks." },
    { title: "{friend} completed a task", body: "They're putting in work. Are you?" },
    { title: "Your crew is moving", body: "{friend} just checked in. Join them." },
  ],
  challenge_countdown: [
    { title: "{daysLeft} days left", body: "You're {day}/{total} through {challenge}. Finish what you started." },
    { title: "Almost there", body: "{daysLeft} days to complete {challenge}. Don't quit now." },
    { title: "The finish line is close", body: "{challenge}: {daysLeft} days remaining. Push through." },
  ],
  secure_reminder: [
    { title: "Time to secure your day", body: "It's evening — {tasks} tasks left. Your {streak}-day streak depends on it." },
    { title: "Don't let today slip", body: "You still have {tasks} tasks. Secure your day before midnight." },
    { title: "Unfinished business", body: "{tasks} tasks between you and another secured day. Let's go." },
    { title: "The day isn't over yet", body: "Your {streak}-day streak is on the line. {tasks} tasks to go." },
  ],
  streak_at_risk: [
    { title: "Streak at risk", body: "45 minutes left. Don't throw away {streak} days of discipline." },
    { title: "⚠️ Last chance", body: "Your {streak}-day streak dies at midnight. Complete your tasks now." },
    { title: "You'll regret this tomorrow", body: "{streak} days gone if you don't finish. 45 minutes." },
  ],
  lapsed: [
    { title: "Your streak misses you", body: "It's been 3 days. Your {challenge} challenge is waiting." },
    { title: "Still in this?", body: "You went quiet. Your challenge hasn't. Tap to get back." },
    { title: "Discipline is a choice", body: "Every day you don't show up makes it harder to come back. Start now." },
  ],
  /** Unused by pickTemplate — prep copy uses TASK_PREP_COPY + pickTaskPrepTemplate. */
  task_prep: [],
};

/**
 * Task-specific prep notifications.
 * Each task type has its own copy pool + lead time.
 * Copy uses implementation intention framing (Gollwitzer, NYU, 1999):
 * "When X happens, I will do Y" — telling users what to prepare
 * increases follow-through by 2x vs generic reminders.
 */
export const TASK_PREP_LEAD_MINUTES: Record<string, number> = {
  run: 30,
  workout: 30,
  timer: 15,
  reading: 15,
  journal: 10,
  checkin: 10,
  photo: 10,
  water: 5,
  counter: 10,
  simple: 10,
};

export const TASK_PREP_COPY: Record<string, { title: string; body: string }[]> = {
  run: [
    { title: "Run in 30 min", body: "Lace up, hydrate, and get moving. Your {challenge} run starts soon." },
    { title: "Time to gear up", body: "Your run window opens in 30 minutes. Lay out your kit and stretch." },
    { title: "30 minutes to go", body: "Your morning run is approaching. Water, shoes, headphones — go." },
    { title: "Your body is ready", body: "Run starts in 30 min. Dynamic stretch, lace up, and show up." },
  ],
  workout: [
    { title: "Workout in 30 min", body: "Get your gear ready. Your {challenge} workout starts soon." },
    { title: "Time to warm up", body: "30 minutes until your workout. Hydrate and start your warm-up." },
    { title: "Gym time approaching", body: "Your workout window opens in 30 min. No excuses today." },
    { title: "Iron is waiting", body: "30 min until your session. Pre-workout, playlist, let's go." },
  ],
  timer: [
    { title: "Session in 15 min", body: "Your timed session starts soon. Find a focused space." },
    { title: "15 min heads up", body: "Your {challenge} timer task is coming up. Remove distractions." },
    { title: "Get in position", body: "Timed session in 15 minutes. Phone on silent, space cleared." },
  ],
  reading: [
    { title: "Reading in 15 min", body: "Your reading session starts soon. Grab your book and find a quiet spot." },
    { title: "15 minutes to read", body: "Your {challenge} reading window opens soon. Phone away, book out." },
    { title: "Page time approaching", body: "Reading session in 15 min. Find your corner, settle in." },
  ],
  journal: [
    { title: "Journal in 10 min", body: "Your reflection time is coming up. Find a quiet moment." },
    { title: "Time to reflect", body: "Journal session in 10 minutes. Let your thoughts settle." },
    { title: "Pen to paper soon", body: "Your {challenge} journal opens in 10 min. What's on your mind?" },
  ],
  checkin: [
    { title: "Check-in in 10 min", body: "Your daily check-in is coming up. Tune into how you feel." },
    { title: "Body check-in soon", body: "10 minutes until your {challenge} check-in. Notice your body." },
    { title: "Mindful moment ahead", body: "Check-in window opens in 10 min. Pause. Breathe. Assess." },
  ],
  photo: [
    { title: "Photo proof in 10 min", body: "Your photo task is coming up. Think about what to capture." },
    { title: "Camera ready?", body: "Photo proof window opens in 10 minutes. Get your shot ready." },
    { title: "Snap time soon", body: "Your {challenge} photo check is approaching. Make it count." },
  ],
  water: [
    { title: "Hydration check", body: "Water task in 5 minutes. Fill up your bottle." },
    { title: "Drink up soon", body: "Your hydration window opens in 5 min. Stay ahead of it." },
  ],
  counter: [
    { title: "Task in 10 min", body: "Your counting task starts soon. Get ready to track." },
    { title: "Almost time", body: "Your {challenge} task opens in 10 minutes." },
  ],
  simple: [
    { title: "Task in 10 min", body: "Your daily task is coming up. Show up and check it off." },
    { title: "Time to execute", body: "Your {challenge} task opens in 10 minutes. Simple. Do it." },
  ],
};

export function pickTaskPrepTemplate(
  taskType: string,
  vars: NotifVars = {},
  dateOverride?: string
): { title: string; body: string } {
  const pool = TASK_PREP_COPY[taskType] ?? TASK_PREP_COPY.simple ?? [];
  if (pool.length === 0) return { title: "Task coming up", body: "Your next task starts soon." };

  const dateKey = dateOverride ?? new Date().toISOString().slice(0, 10);
  const seed = (dateKey + taskType + "prep").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = seed % pool.length;
  const template = pool[idx] ?? pool[0] ?? { title: "Task coming up", body: "Your next task starts soon." };

  let title = template.title;
  let body = template.body;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{${key}}`;
    title = title.replaceAll(placeholder, String(value ?? ""));
    body = body.replaceAll(placeholder, String(value ?? ""));
  }

  title = title.replace(/\{[a-zA-Z]+\}/g, "").trim();
  body = body.replace(/\{[a-zA-Z]+\}/g, "").trim();

  return { title, body };
}

/** Map API task_type (e.g. manual) to prep template keys. */
export function normalizeTaskTypeForPrep(raw: string | undefined): string {
  const t = (raw ?? "simple").toLowerCase();
  if (t === "manual" || t === "checklist") return "simple";
  return t;
}

/**
 * Pick a template for today. Uses date + category as seed for deterministic daily rotation.
 * Same message all day, different tomorrow. Never the same as yesterday.
 */
export function pickTemplate(
  category: NotifCategory,
  vars: NotifVars = {},
  dateOverride?: string
): { title: string; body: string } {
  const pool = TEMPLATES[category];
  if (!pool || pool.length === 0) return { title: "GRIIT", body: "Time to show up." };

  const dateKey = dateOverride ?? new Date().toISOString().slice(0, 10);
  const seed = (dateKey + category).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = seed % pool.length;
  const template = pool[idx] ?? pool[0] ?? { title: "GRIIT", body: "Time to show up." };

  let title = template.title;
  let body = template.body;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{${key}}`;
    const strVal = String(value ?? "");
    title = title.replaceAll(placeholder, strVal);
    body = body.replaceAll(placeholder, strVal);
  }

  title = title.replace(/\{[a-zA-Z]+\}/g, "");
  body = body.replace(/\{[a-zA-Z]+\}/g, "");

  return { title: title.trim(), body: body.trim() };
}

export default TEMPLATES;
