/**
 * Local notifications for "Time to secure your day" and optional "2 hours left".
 * Schedule is updated on app open and after secure so we don't notify if already secured today.
 */

import * as Notifications from "expo-notifications";

const SECURE_REMINDER_ID = "secure-day-reminder";
const TWO_HOURS_LEFT_ID = "secure-two-hours-left";

/** Default 8pm */
const DEFAULT_PREFERRED_TIME = "20:00";

/** If true, also schedule a "2 hours left" reminder when close to midnight. */
export const ENABLE_TWO_HOURS_LEFT = true;

function parsePreferredTime(preferredTime: string): { hour: number; minute: number } {
  const [h, m] = (preferredTime || DEFAULT_PREFERRED_TIME).split(":").map(Number);
  return { hour: isNaN(h) ? 20 : h, minute: isNaN(m) ? 0 : m };
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
  } catch {
    // ignore
  }
}

/**
 * Schedule the next "Time to secure your day" notification at preferred time on or after `afterDate`.
 * Call after secure (with tomorrow) or on app open (with today or tomorrow depending on secured today).
 */
export async function scheduleNextSecureReminder(
  preferredTime: string,
  afterDate?: Date
): Promise<void> {
  try {
    const { hour, minute } = parsePreferredTime(preferredTime);
    const from = afterDate ?? new Date();
    const triggerDate = nextOccurrence(from, hour, minute);

    await Notifications.cancelScheduledNotificationAsync(SECURE_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: SECURE_REMINDER_ID,
      content: {
        title: "Time to secure your day",
        body: "Lock in your discipline before midnight.",
        sound: true,
      },
      trigger: {
        type: "date" as const,
        date: triggerDate,
      },
    });

    if (ENABLE_TWO_HOURS_LEFT) {
      const twoHoursLeft = new Date(triggerDate);
      twoHoursLeft.setHours(twoHoursLeft.getHours() + 2, 0, 0, 0);
      if (twoHoursLeft.getTime() > Date.now()) {
        await Notifications.cancelScheduledNotificationAsync(TWO_HOURS_LEFT_ID);
        await Notifications.scheduleNotificationAsync({
          identifier: TWO_HOURS_LEFT_ID,
          content: {
            title: "2 hours left",
            body: "Secure your day before midnight.",
            sound: true,
          },
          trigger: {
            type: "date" as const,
            date: twoHoursLeft,
          },
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
