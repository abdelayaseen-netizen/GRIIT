/**
 * Local notifications for "Time to secure your day" and optional "2 hours left".
 * Schedule is updated on app open and after secure so we don't notify if already secured today.
 */

import * as Notifications from "expo-notifications";

const SECURE_REMINDER_ID = "secure-day-reminder";
const TWO_HOURS_LEFT_ID = "secure-two-hours-left";
const STREAK_AT_RISK_ID = "streak-at-risk-45min";

/** Default 8pm */
const DEFAULT_PREFERRED_TIME = "20:00";

/** If true, also schedule a "2 hours left" reminder when close to midnight. */
export const ENABLE_TWO_HOURS_LEFT = true;

function parsePreferredTime(preferredTime: string): { hour: number; minute: number } {
  const [h, m] = (preferredTime || DEFAULT_PREFERRED_TIME).split(":").map(Number);
  return { hour: isNaN(h) ? 20 : h, minute: isNaN(m) ? 0 : m };
}

/** Format hour/minute as "8:00 PM" for notification body. */
export function formatTimeForNotification(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

/** Next calendar date at hour:minute on or after fromDate. */
function nextOccurrence(fromDate: Date, hour: number, minute: number): Date {
  const next = new Date(fromDate);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= fromDate.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/** Cancel all secure reminders. */
export async function cancelSecureReminders(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(SECURE_REMINDER_ID);
    await Notifications.cancelScheduledNotificationAsync(TWO_HOURS_LEFT_ID);
    await Notifications.cancelScheduledNotificationAsync(STREAK_AT_RISK_ID);
  } catch {
    // ignore
  }
}

/**
 * Schedule the next "Time to secure your day" notification at preferred time on or after `afterDate`.
 * Call after secure (with tomorrow) or on app open (with today or tomorrow depending on secured today).
 * Optional streakCount improves copy (e.g. "Your X-day streak is at risk!").
 */
export async function scheduleNextSecureReminder(
  preferredTime: string,
  afterDate?: Date,
  lastStandsRemaining?: number,
  streakCount?: number
): Promise<void> {
  try {
    const { hour, minute } = parsePreferredTime(preferredTime);
    const from = afterDate ?? new Date();
    const triggerDate = nextOccurrence(from, hour, minute);

    const timeStr = formatTimeForNotification(hour, minute);
    const streakLine = streakCount != null && streakCount > 0
      ? ` Your ${streakCount}-day streak is at risk! Complete your tasks to keep it alive.`
      : " Complete your tasks to secure your day.";
    await Notifications.cancelScheduledNotificationAsync(SECURE_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: SECURE_REMINDER_ID,
      content: {
        title: "Time to secure your day",
        body: `It's ${timeStr} — time to secure your day.${streakLine}`,
        sound: true,
      },
      trigger: {
        type: "date",
        date: triggerDate,
      } as import("expo-notifications").NotificationTriggerInput,
    });

      if (ENABLE_TWO_HOURS_LEFT) {
      const twoHoursLeft = new Date(triggerDate);
      twoHoursLeft.setHours(twoHoursLeft.getHours() + 2, 0, 0, 0);
      if (twoHoursLeft.getTime() > Date.now()) {
        await Notifications.cancelScheduledNotificationAsync(TWO_HOURS_LEFT_ID);
        const twoHoursBody = streakCount != null && streakCount > 0
          ? `Only 2 hours left to secure today. Don't break your ${streakCount}-day streak!`
          : "Only 2 hours left to secure today. Don't break your streak!";
        await Notifications.scheduleNotificationAsync({
          identifier: TWO_HOURS_LEFT_ID,
          content: {
            title: "2 hours left",
            body: twoHoursBody,
            sound: true,
          },
          trigger: {
            type: "date",
            date: twoHoursLeft,
          } as import("expo-notifications").NotificationTriggerInput,
        });
      }
    }
    if (!afterDate) {
      const now = new Date();
      const streakAtRisk = new Date(now);
      streakAtRisk.setHours(23, 15, 0, 0);
      if (streakAtRisk.getTime() > now.getTime()) {
        await Notifications.cancelScheduledNotificationAsync(STREAK_AT_RISK_ID);
        const lsText =
          lastStandsRemaining !== undefined && lastStandsRemaining >= 0
            ? ` You have ${lastStandsRemaining} Last Stand(s) remaining.`
            : "";
        const riskBody = streakCount != null && streakCount > 0
          ? `Only 45 minutes left to secure today. Don't break your ${streakCount}-day streak!${lsText}`
          : `45 minutes left to protect your streak.${lsText}`;
        await Notifications.scheduleNotificationAsync({
          identifier: STREAK_AT_RISK_ID,
          content: {
            title: "Streak at risk",
            body: riskBody,
            sound: true,
          },
          trigger: { type: "date", date: streakAtRisk } as import("expo-notifications").NotificationTriggerInput,
        });
      }
    }
  } catch {
    // Permissions or platform may not support
  }
}

/**
 * Set up notification channel (Android). Call once on app load.
 */
export async function setupNotificationChannel(): Promise<void> {
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  } catch {
    // ignore
  }
}

/**
 * Request permissions and return whether we can schedule.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}
