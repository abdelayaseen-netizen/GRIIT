/**
 * Local notifications for "Time to secure your day" and optional "2 hours left".
 * Schedule is updated on app open and after secure so we don't notify if already secured today.
 */

import * as Notifications from "expo-notifications";

const SECURE_REMINDER_ID = "secure-day-reminder";
const TWO_HOURS_LEFT_ID = "secure-two-hours-left";
const STREAK_AT_RISK_ID = "streak-at-risk-45min";
const LAPSED_IDS = ["lapsed_day3", "lapsed_day7", "lapsed_day14"] as const;
const MILESTONE_APPROACHING_ID = "milestone_approaching";

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

/**
 * Schedule re-engagement notifications if the user goes inactive.
 * Call on each app open — timers reset so if the user keeps opening, they never fire.
 */
export async function scheduleLapsedUserReminders(params: {
  streakCount: number;
  challengeName?: string;
  lastSecuredDate?: string;
}): Promise<void> {
  try {
    const { streakCount, challengeName } = params;
    const day3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const day7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const day14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const { track } = await import("@/lib/analytics");

    await Notifications.cancelScheduledNotificationAsync(LAPSED_IDS[0]);
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[0],
      content: {
        title: "Your streak misses you!",
        body: challengeName
          ? `Your ${challengeName} challenge is waiting. Tap to get back on track.`
          : "Don't let your progress slip away. Tap to continue building discipline.",
        sound: true,
      },
      trigger: { type: "date", date: day3 } as Notifications.NotificationTriggerInput,
    });
    track({ name: "lapsed_notification_scheduled", day: 3 });

    await Notifications.cancelScheduledNotificationAsync(LAPSED_IDS[1]);
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[1],
      content: {
        title: "It's been a week...",
        body:
          streakCount > 0
            ? `You had a ${streakCount}-day streak going. It's not too late to restart.`
            : "Your challenges are still here. Come back and start fresh.",
        sound: true,
      },
      trigger: { type: "date", date: day7 } as Notifications.NotificationTriggerInput,
    });
    track({ name: "lapsed_notification_scheduled", day: 7 });

    await Notifications.cancelScheduledNotificationAsync(LAPSED_IDS[2]);
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[2],
      content: {
        title: "Ready for a fresh start?",
        body: "It's never too late to build discipline. Tap to begin a new challenge.",
        sound: true,
      },
      trigger: { type: "date", date: day14 } as Notifications.NotificationTriggerInput,
    });
    track({ name: "lapsed_notification_scheduled", day: 14 });
  } catch {
    // ignore
  }
}

/**
 * Cancel all lapsed-user reminders. Call when the user secures a day or on logout.
 */
export async function cancelLapsedUserReminders(): Promise<void> {
  try {
    for (const id of LAPSED_IDS) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await Notifications.cancelScheduledNotificationAsync(MILESTONE_APPROACHING_ID);
  } catch {
    // ignore
  }
}

const MILESTONE_DAYS = [7, 14, 30, 60, 100] as const;

/**
 * If the next day (streakCount + 1) is a milestone, schedule "One more day!" 12 hours from now.
 * Call from secure-day success handler.
 */
export async function scheduleMilestoneApproachingIfNeeded(streakCount: number): Promise<void> {
  try {
    const nextDay = streakCount + 1;
    if (!MILESTONE_DAYS.includes(nextDay)) return;
    await Notifications.cancelScheduledNotificationAsync(MILESTONE_APPROACHING_ID);
    const in12h = new Date(Date.now() + 12 * 60 * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      identifier: MILESTONE_APPROACHING_ID,
      content: {
        title: "One more day!",
        body: `Tomorrow is Day ${nextDay}! Complete your tasks to hit this milestone.`,
        sound: true,
      },
      trigger: { type: "date", date: in12h } as Notifications.NotificationTriggerInput,
    });
    const { track } = await import("@/lib/analytics");
    track({ name: "milestone_approaching_notification_scheduled", milestone_day: nextDay });
  } catch {
    // ignore
  }
}
