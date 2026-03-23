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
  | "lapsed";

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
};

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
