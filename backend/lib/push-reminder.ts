/**
 * Daily "Secure Your Day" and "Streak at Risk" push notifications.
 * Sends at user's reminder_time (morning) and at 20:00 local (evening).
 * Uses variable copy (random template) for behavioral reinforcement.
 */

import { sendPushToUser } from "./push-reminder-expo";

export interface SecureReminderContext {
  userId: string;
  /** Morning reminder time "HH:mm" e.g. "09:00" */
  reminderTime: string;
  /** User's IANA timezone e.g. "America/New_York" */
  timezone: string;
  hasSecuredToday: boolean;
  now: Date;
}

/**
 * Returns true if it's time to send the morning reminder (user has not secured today and now >= reminder time in their TZ).
 */
export function shouldSendMorningReminder(ctx: SecureReminderContext): boolean {
  if (ctx.hasSecuredToday) return false;
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: ctx.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(ctx.now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "0";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "0";
    const [prefHour, prefMin] = ctx.reminderTime.split(":").map(Number);
    const nowMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);
    const prefMinutes = (prefHour ?? 9) * 60 + (prefMin ?? 0);
    return nowMinutes >= prefMinutes && nowMinutes < prefMinutes + 60;
  } catch {
    return false;
  }
}

/** Streak-at-risk fires at 20:00 (8pm) local. */
export function shouldSendStreakAtRiskReminder(ctx: SecureReminderContext): boolean {
  if (ctx.hasSecuredToday) return false;
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: ctx.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(ctx.now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "0";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "0";
    const nowMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);
    const targetMinutes = 20 * 60;
    return nowMinutes >= targetMinutes && nowMinutes < targetMinutes + 60;
  } catch {
    return false;
  }
}

/** Morning notification templates (variable reinforcement). */
const MORNING_TEMPLATES: { title: string; body: (streak: number) => string }[] = [
  { title: "Day {streak} starts now", body: (_s) => `Secure your day 💪` },
  { title: "Your {streak}-day streak is waiting", body: (_s) => `Let's go.` },
  { title: "Rise and grind", body: (s) => `Day ${s} won't secure itself.` },
  { title: "You've shown up {streak} days straight", body: (s) => `Make it ${s + 1}.` },
  { title: "The grind doesn't stop", body: (s) => `Secure Day ${s}.` },
];

/** Evening streak-at-risk templates (loss-aversion framing). */
const EVENING_TEMPLATES: { title: (streak: number) => string; body: (streak: number) => string }[] = [
  {
    title: (s) => (s > 0 ? `Your ${s}-day streak expires at midnight` : "Your day isn't secured yet"),
    body: (s) => (s > 0 ? "Still time." : "Secure your day before midnight."),
  },
  {
    title: (s) => (s > 0 ? `Don't throw away ${s} days of work` : "Last chance today"),
    body: (_s) => "Secure your day now.",
  },
  {
    title: (s) => (s > 0 ? `${s} days of discipline on the line` : "Day resets at midnight"),
    body: (_s) => "Finish strong.",
  },
];

function pickMorningCopy(streak: number): { title: string; body: string } {
  const fallback = MORNING_TEMPLATES[0];
  if (!fallback) return { title: "Secure your day", body: "Open GRIIT" };
  const i = Math.floor(Math.random() * MORNING_TEMPLATES.length);
  const template = MORNING_TEMPLATES[i] ?? fallback;
  const displayStreak = Math.max(1, streak);
  const title = template.title.replace(/\{streak\}/g, String(displayStreak));
  return { title, body: template.body(displayStreak) };
}

function pickEveningCopy(streak: number): { title: string; body: string } {
  const fallback = EVENING_TEMPLATES[0];
  if (!fallback) return { title: "Secure your day", body: "Before midnight." };
  const i = Math.floor(Math.random() * EVENING_TEMPLATES.length);
  const template = EVENING_TEMPLATES[i] ?? fallback;
  return { title: template.title(streak), body: template.body(streak) };
}

/** "Come back" notification templates for users inactive 3+ days. */
export const COMEBACK_TEMPLATES: { title: string; body: string }[] = [
  { title: "We miss you", body: "Your streak is waiting. Come back and secure today." },
  { title: "Ready when you are", body: "A few days off — no judgment. Tap to pick up where you left off." },
  { title: "Your discipline doesn't expire", body: "Come back and secure your next day." },
  { title: "One tap to get back on track", body: "Open GRIIT and secure today." },
  { title: "Still here for you", body: "Whenever you're ready, we're here. Secure your day." },
];

export interface SendReminderOptions {
  type: "morning" | "streak_at_risk";
  pushToken: string | null | undefined;
  streak: number;
}

/**
 * Sends a "Secure Your Day" (morning) or "Streak at Risk" (evening) push.
 * Uses personalized copy and variable template selection.
 */
export async function sendSecureReminder(
  _userId: string,
  options: SendReminderOptions
): Promise<void> {
  const { type, pushToken, streak } = options;
  const token = typeof pushToken === "string" ? pushToken.trim() : "";
  if (!token || (!token.startsWith("ExponentPushToken") && !token.startsWith("ExpoPushToken"))) {
    return;
  }

  const copy =
    type === "morning"
      ? pickMorningCopy(streak)
      : pickEveningCopy(streak);

  await sendPushToUser(token, copy.title, copy.body);
}

/**
 * Send a comeback push to an inactive user.
 * Picks a random template for variable reinforcement.
 */
export async function sendComebackPush(pushToken: string): Promise<void> {
  const token = typeof pushToken === "string" ? pushToken.trim() : "";
  if (!token || (!token.startsWith("ExponentPushToken") && !token.startsWith("ExpoPushToken"))) {
    return;
  }

  const i = Math.floor(Math.random() * COMEBACK_TEMPLATES.length);
  const template = COMEBACK_TEMPLATES[i] ?? COMEBACK_TEMPLATES[0];
  if (!template) return;

  await sendPushToUser(token, template.title, template.body);
}
