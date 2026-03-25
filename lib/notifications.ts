/**
 * SUPABASE MIGRATIONS REQUIRED:
 *
 * Run these in the Supabase SQL Editor before testing push notifications:
 *
 * ALTER TABLE public.profiles
 *   ADD COLUMN IF NOT EXISTS push_token TEXT;
 *
 * (Production already uses `profiles.expo_push_token` — prefer that column; `push_token` is optional alias.)
 *
 * These were already run (from previous sprint):
 * - profiles.streak_freezes_remaining INTEGER DEFAULT 1
 * - profiles.last_freeze_used_at TIMESTAMPTZ
 * - active_challenges.task_times JSONB DEFAULT '{}'
 */

/**
 * Local notifications for "Time to secure your day" and optional "2 hours left".
 * Schedule is updated on app open and after secure so we don't notify if already secured today.
 */

import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { captureError } from "@/lib/sentry";
import { DS_COLORS } from "@/lib/design-system";
import {
  pickTemplate,
  type NotifVars,
  TASK_PREP_LEAD_MINUTES,
  pickTaskPrepTemplate,
  normalizeTaskTypeForPrep,
} from "@/lib/notification-copy";

// Foreground: show banner + sound (Expo handler)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SECURE_REMINDER_ID = "secure-day-reminder";
const TWO_HOURS_LEFT_ID = "secure-two-hours-left";
const STREAK_AT_RISK_ID = "streak-at-risk-45min";
const LAPSED_IDS = ["lapsed_day3", "lapsed_day7", "lapsed_day14"] as const;
const MILESTONE_APPROACHING_ID = "milestone_approaching";

const MORNING_MOTIVATION_ID = "morning-motivation";
const TASK_WINDOW_PREFIX = "task-window-";
const TASK_PREP_PREFIX = "task-prep-";
const WEEKLY_SUMMARY_ID = "weekly-summary";
const STREAK_CELEBRATION_ID = "streak-celebration";
/** Reserved for friend-activity / server-triggered social pushes. */
export const SOCIAL_TRIGGER_ID = "social-trigger";
const CHALLENGE_COUNTDOWN_PREFIX = "challenge-countdown-";

/** Default 8pm */
const DEFAULT_PREFERRED_TIME = "20:00";

/** If true, also schedule a "2 hours left" reminder when close to midnight. */
export const ENABLE_TWO_HOURS_LEFT = true;

function parsePreferredTime(preferredTime: string): { hour: number; minute: number } {
  const seg = (preferredTime || DEFAULT_PREFERRED_TIME).split(":");
  const h = Number(seg[0]);
  const m = Number(seg[1]);
  return { hour: Number.isFinite(h) ? h : 20, minute: Number.isFinite(m) ? m : 0 };
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

    const triggerDateKey = triggerDate.toISOString().slice(0, 10);
    const vars: NotifVars = { streak: streakCount ?? 0, tasks: 0 };
    const { title, body } = pickTemplate("secure_reminder", vars, triggerDateKey);

    await Notifications.cancelScheduledNotificationAsync(SECURE_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: SECURE_REMINDER_ID,
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: "date",
        date: triggerDate,
      } as Notifications.NotificationTriggerInput,
    });

    if (ENABLE_TWO_HOURS_LEFT) {
      const twoHoursLeft = new Date(triggerDate);
      twoHoursLeft.setHours(twoHoursLeft.getHours() + 2, 0, 0, 0);
      if (twoHoursLeft.getTime() > Date.now()) {
        await Notifications.cancelScheduledNotificationAsync(TWO_HOURS_LEFT_ID);
        const twoHoursBody =
          streakCount != null && streakCount > 0
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
          } as Notifications.NotificationTriggerInput,
        });
      }
    }
    if (!afterDate) {
      const now = new Date();
      const streakAtRisk = new Date(now);
      streakAtRisk.setHours(23, 15, 0, 0);
      if (streakAtRisk.getTime() > now.getTime()) {
        await Notifications.cancelScheduledNotificationAsync(STREAK_AT_RISK_ID);
        const riskKey = streakAtRisk.toISOString().slice(0, 10);
        const { title: riskTitle, body: riskBodyBase } = pickTemplate(
          "streak_at_risk",
          { streak: streakCount ?? 0 },
          riskKey
        );
        const lsText =
          lastStandsRemaining !== undefined && lastStandsRemaining >= 0
            ? ` You have ${lastStandsRemaining} Last Stand(s) remaining.`
            : "";
        const riskBody = `${riskBodyBase}${lsText}`;
        await Notifications.scheduleNotificationAsync({
          identifier: STREAK_AT_RISK_ID,
          content: {
            title: riskTitle,
            body: riskBody,
            sound: true,
          },
          trigger: { type: "date", date: streakAtRisk } as Notifications.NotificationTriggerInput,
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
    const d3 = pickTemplate("lapsed", { challenge: challengeName ?? "" }, day3.toISOString().slice(0, 10));
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[0],
      content: {
        title: d3.title,
        body: d3.body,
        sound: true,
      },
      trigger: { type: "date", date: day3 } as Notifications.NotificationTriggerInput,
    });
    track({ name: "lapsed_notification_scheduled", day: 3 });

    await Notifications.cancelScheduledNotificationAsync(LAPSED_IDS[1]);
    const d7 = pickTemplate(
      "lapsed",
      { challenge: challengeName ?? "", streak: streakCount },
      day7.toISOString().slice(0, 10)
    );
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[1],
      content: {
        title: d7.title,
        body: d7.body,
        sound: true,
      },
      trigger: { type: "date", date: day7 } as Notifications.NotificationTriggerInput,
    });
    track({ name: "lapsed_notification_scheduled", day: 7 });

    await Notifications.cancelScheduledNotificationAsync(LAPSED_IDS[2]);
    const d14 = pickTemplate("lapsed", { challenge: challengeName ?? "" }, day14.toISOString().slice(0, 10));
    await Notifications.scheduleNotificationAsync({
      identifier: LAPSED_IDS[2],
      content: {
        title: d14.title,
        body: d14.body,
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

const MILESTONE_DAYS: readonly number[] = [7, 14, 30, 60, 100];

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

/**
 * Schedule a morning motivation notification.
 * Sent at user's preferred morning time (default 7 AM).
 */
export async function scheduleMorningMotivation(params: {
  morningTime?: string;
  streakCount: number;
  taskCount: number;
  currentDay?: number;
  challengeName?: string;
}): Promise<void> {
  try {
    const { hour, minute } = parsePreferredTime(params.morningTime ?? "07:00");
    const tomorrow = nextOccurrence(new Date(), hour, minute);

    const tomorrowDateKey = tomorrow.toISOString().slice(0, 10);
    const vars: NotifVars = {
      streak: params.streakCount,
      tasks: params.taskCount,
      day: params.currentDay,
      challenge: params.challengeName,
    };
    const { title, body } = pickTemplate("morning_motivation", vars, tomorrowDateKey);

    await Notifications.cancelScheduledNotificationAsync(MORNING_MOTIVATION_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: MORNING_MOTIVATION_ID,
      content: { title, body, sound: true },
      trigger: { type: "date", date: tomorrow } as Notifications.NotificationTriggerInput,
    });
  } catch {
    // Platform may not support
  }
}

export async function cancelMorningMotivation(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(MORNING_MOTIVATION_ID);
  } catch {
    // ignore
  }
}

/**
 * Schedule task-specific prep and window-open notifications.
 *
 * Prep fires at (window_start - lead_time) with task-type-specific copy.
 * Lead times: run/workout 30min, timer/reading 15min, journal/checkin/photo 10min, water 5min.
 *
 * Window-open fires at window_start.
 */
export async function scheduleTaskWindowAlerts(
  tasks: {
    id: string;
    taskType?: string;
    anchorTimeLocal?: string | null;
    windowStartOffsetMin?: number | null;
    challengeName?: string;
  }[]
): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.identifier.startsWith(TASK_WINDOW_PREFIX) || n.identifier.startsWith(TASK_PREP_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    const now = new Date();

    for (const task of tasks) {
      if (!task.anchorTimeLocal) continue;

      const segments = task.anchorTimeLocal.split(":");
      const h = Number(segments[0]);
      const m = Number(segments[1]);
      if (!Number.isFinite(h) || !Number.isFinite(m)) continue;

      const startOffset = Number(task.windowStartOffsetMin ?? 0);
      const windowOpenTime = nextOccurrence(now, h, m);
      windowOpenTime.setMinutes(windowOpenTime.getMinutes() + startOffset);

      if (windowOpenTime.getTime() <= now.getTime()) continue;

      const taskType = normalizeTaskTypeForPrep(task.taskType);
      const leadMinutes = TASK_PREP_LEAD_MINUTES[taskType] ?? 10;
      const vars: NotifVars = { challenge: task.challengeName ?? "Your challenge" };

      const prepTime = new Date(windowOpenTime.getTime() - leadMinutes * 60 * 1000);
      if (prepTime.getTime() > now.getTime()) {
        const prepKey = prepTime.toISOString().slice(0, 10);
        const { title, body } = pickTaskPrepTemplate(taskType, vars, prepKey);
        await Notifications.scheduleNotificationAsync({
          identifier: `${TASK_PREP_PREFIX}${task.id}`,
          content: { title, body, sound: true },
          trigger: { type: "date", date: prepTime } as Notifications.NotificationTriggerInput,
        });
      }

      const openKey = windowOpenTime.toISOString().slice(0, 10);
      const { title: openTitle, body: openBody } = pickTemplate("task_window", vars, openKey);
      await Notifications.scheduleNotificationAsync({
        identifier: `${TASK_WINDOW_PREFIX}${task.id}`,
        content: { title: openTitle, body: openBody, sound: true },
        trigger: { type: "date", date: windowOpenTime } as Notifications.NotificationTriggerInput,
      });
    }
  } catch {
    // ignore
  }
}

/**
 * Schedule weekly summary for next Sunday at 7 PM.
 */
export async function scheduleWeeklySummary(params: {
  daysSecuredThisWeek: number;
  totalDaysThisWeek: number;
  points: number;
  rank: string;
  streakCount: number;
}): Promise<void> {
  try {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(19, 0, 0, 0);

    if (nextSunday.getTime() <= now.getTime()) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const vars: NotifVars = {
      secured: params.daysSecuredThisWeek,
      totalDays: params.totalDaysThisWeek,
      points: params.points,
      rank: params.rank,
      streak: params.streakCount,
    };
    const sundayDateKey = nextSunday.toISOString().slice(0, 10);
    const { title, body } = pickTemplate("weekly_summary", vars, sundayDateKey);

    await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_SUMMARY_ID,
      content: { title, body, sound: true },
      trigger: { type: "date", date: nextSunday } as Notifications.NotificationTriggerInput,
    });
  } catch {
    // ignore
  }
}

export async function cancelWeeklySummary(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_SUMMARY_ID);
  } catch {
    // ignore
  }
}

/**
 * Fire an immediate celebration notification when a streak milestone is reached.
 */
export async function fireStreakCelebration(streakCount: number): Promise<void> {
  try {
    const vars: NotifVars = { streak: streakCount };
    const { title, body } = pickTemplate("streak_celebration", vars);

    await Notifications.cancelScheduledNotificationAsync(STREAK_CELEBRATION_ID);
    const inFiveSeconds = new Date(Date.now() + 5000);
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_CELEBRATION_ID,
      content: { title, body, sound: true },
      trigger: { type: "date", date: inFiveSeconds } as Notifications.NotificationTriggerInput,
    });
  } catch {
    // ignore
  }
}

const CELEBRATION_MILESTONES = [3, 7, 14, 21, 30, 45, 60, 75, 100, 150, 200, 365];

export function isStreakCelebrationMilestone(streak: number): boolean {
  return CELEBRATION_MILESTONES.includes(streak);
}

/**
 * Schedule countdown notifications as a challenge nears completion.
 */
export async function scheduleChallengeCountdowns(
  challenges: {
    id: string;
    name: string;
    currentDay: number;
    totalDays: number;
  }[]
): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.identifier.startsWith(CHALLENGE_COUNTDOWN_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    const now = new Date();
    for (const ch of challenges) {
      const daysLeft = ch.totalDays - ch.currentDay;
      if (daysLeft <= 0 || daysLeft > 5) continue;

      const vars: NotifVars = {
        daysLeft,
        day: ch.currentDay,
        total: ch.totalDays,
        challenge: ch.name,
      };
      const tomorrow10am = new Date(now);
      tomorrow10am.setDate(tomorrow10am.getDate() + 1);
      tomorrow10am.setHours(10, 0, 0, 0);
      const cdKey = tomorrow10am.toISOString().slice(0, 10);
      const { title, body } = pickTemplate("challenge_countdown", vars, cdKey);

      await Notifications.scheduleNotificationAsync({
        identifier: `${CHALLENGE_COUNTDOWN_PREFIX}${ch.id}`,
        content: { title, body, sound: true },
        trigger: { type: "date", date: tomorrow10am } as Notifications.NotificationTriggerInput,
      });
    }
  } catch {
    // ignore
  }
}

// ─── Sprint 2: push registration, daily task/streak reminders, parse helpers ───

/**
 * Request permission and return the Expo push token.
 * Returns null if permission denied or not on a physical device.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn("[Notifications] No EAS project ID found in app config");
    }

    const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "GRIIT",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: DS_COLORS.DISCOVER_CORAL,
      });
    }

    return tokenData.data;
  } catch (error) {
    captureError(error, "registerForPushNotifications");
    return null;
  }
}

/**
 * Schedule a local notification at a specific time every day.
 */
export async function scheduleTaskReminder(params: {
  taskName: string;
  challengeName: string;
  hour: number;
  minute: number;
  identifier: string;
}): Promise<void> {
  const { taskName, challengeName, hour, minute, identifier } = params;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `Time for ${taskName}`,
        body: `${challengeName} · Don't break your streak`,
        sound: true,
        data: { type: "task_reminder", identifier },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    captureError(error, "scheduleTaskReminder");
  }
}

const STREAK_REMINDER_10PM_ID = "streak-reminder-10pm";

/**
 * Schedule the 10pm streak reminder for users who haven't checked in.
 */
export async function scheduleStreakReminder(streakCount: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_10PM_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_REMINDER_10PM_ID,
      content: {
        title:
          streakCount > 0
            ? `Your ${streakCount}-day streak ends at midnight`
            : `Don't forget to check in today`,
        body: "Complete your tasks to keep the streak alive",
        sound: true,
        data: { type: "streak_reminder" },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: 22,
        minute: 0,
      },
    });
  } catch (error) {
    captureError(error, "scheduleStreakReminder");
  }
}

/**
 * Cancel scheduled notifications for a challenge (task-* identifiers).
 */
export async function cancelChallengeReminders(challengeId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const prefix = `task-${challengeId}`;
    const toCancel = scheduled.filter((n) => (n.identifier ?? "").startsWith(prefix));
    await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier!)));
  } catch (error) {
    captureError(error, "cancelChallengeReminders");
  }
}

/**
 * Cancel ALL scheduled notifications (e.g. sign out).
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    captureError(error, "cancelAllNotifications");
  }
}

/** Parse "7:00 AM" / "10:00 PM" from TimeWindowPrompt. */
export function parseTimeString(timeStr: string): { hour: number; minute: number } | null {
  try {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hour = parseInt(match[1]!, 10);
    const minute = parseInt(match[2]!, 10);
    const period = match[3]!.toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return { hour, minute };
  } catch {
    return null;
  }
}
