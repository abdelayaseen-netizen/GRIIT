/**
 * Active Task Timer — lock screen notification widget
 * Uses expo-notifications local notifications to show a persistent
 * timer on the lock screen while a time-based task is in progress.
 * Tapping the notification deep-links to the active task screen.
 * No native modules required.
 */
import * as Notifications from "expo-notifications";
import { formatSecondsToMMSS } from "@/lib/formatTime";
import { useNotificationPrefsStore } from "@/store/notificationPrefsStore";

const ACTIVE_TASK_NOTIF_ID = "griit-active-task-timer";

export type ActiveTaskTimerType = "checkin" | "run_gps" | "run_treadmill";

export interface ActiveTaskTimerPayload {
  taskId: string;
  taskTitle: string;
  timerType: ActiveTaskTimerType;
  startedAtMs: number;
  targetSeconds?: number; // if set, show countdown; if absent, show count-up
  route: string; // ROUTES constant value to deep-link on tap
}

/** Call once when a timer task starts. Shows the initial notification. */
export async function startActiveTaskNotification(
  payload: ActiveTaskTimerPayload
): Promise<void> {
  if (!useNotificationPrefsStore.getState().lockScreenTimer) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(ACTIVE_TASK_NOTIF_ID).catch(() => {});
    await Notifications.dismissNotificationAsync(ACTIVE_TASK_NOTIF_ID).catch(() => {});

    const { title, body } = buildNotifContent(payload, 0);

    await Notifications.scheduleNotificationAsync({
      identifier: ACTIVE_TASK_NOTIF_ID,
      content: {
        title,
        body,
        sound: false,
        sticky: true,
        data: {
          type: "active_task_timer",
          route: payload.route,
          taskId: payload.taskId,
        },
      },
      trigger: null, // fire immediately
    });
  } catch {
    // notifications may not be permitted — fail silently
  }
}

/** Call every 30 seconds from the task screen's interval to update elapsed time. */
export async function updateActiveTaskNotification(
  payload: ActiveTaskTimerPayload,
  elapsedSeconds: number
): Promise<void> {
  if (!useNotificationPrefsStore.getState().lockScreenTimer) {
    return;
  }
  try {
    const { title, body } = buildNotifContent(payload, elapsedSeconds);
    await Notifications.scheduleNotificationAsync({
      identifier: ACTIVE_TASK_NOTIF_ID,
      content: {
        title,
        body,
        sound: false,
        sticky: true,
        data: {
          type: "active_task_timer",
          route: payload.route,
          taskId: payload.taskId,
        },
      },
      trigger: null,
    });
  } catch {
    // fail silently
  }
}

/** Call when task completes, is abandoned, or screen unmounts. */
export async function clearActiveTaskNotification(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(ACTIVE_TASK_NOTIF_ID).catch(() => {});
    await Notifications.dismissNotificationAsync(ACTIVE_TASK_NOTIF_ID).catch(() => {});
  } catch {
    // fail silently
  }
}

function buildNotifContent(
  payload: ActiveTaskTimerPayload,
  elapsedSeconds: number
): { title: string; body: string } {
  const { taskTitle, timerType, targetSeconds } = payload;

  if (timerType === "run_gps") {
    // run.tsx manages its own elapsed via GPS — body shows elapsed
    return {
      title: `${taskTitle} — in progress`,
      body: `${formatSecondsToMMSS(elapsedSeconds)} elapsed · tap to open`,
    };
  }

  if (targetSeconds && targetSeconds > 0) {
    // countdown mode (cold shower, treadmill timer)
    const remaining = Math.max(0, targetSeconds - elapsedSeconds);
    const done = remaining === 0;
    return {
      title: done ? `${taskTitle} — target reached!` : `${taskTitle} — ${formatSecondsToMMSS(remaining)} left`,
      body: done ? "Tap to submit your proof" : `${formatSecondsToMMSS(elapsedSeconds)} elapsed · tap to open`,
    };
  }

  // count-up mode (prayer, checkin)
  return {
    title: `${taskTitle} — ${formatSecondsToMMSS(elapsedSeconds)} elapsed`,
    body: "GRIIT · tap to return to task",
  };
}
