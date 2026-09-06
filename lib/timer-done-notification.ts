import * as Notifications from "expo-notifications";

const TIMER_DONE_ID_PREFIX = "griit-timer-done-";

export async function scheduleTimerDoneNotification(opts: {
  taskId: string;
  at: Date;
  durationLabel: string;
  sound: boolean;
  route: string;
}): Promise<void> {
  const identifier = `${TIMER_DONE_ID_PREFIX}${opts.taskId}`;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
    if (opts.at.getTime() <= Date.now()) return;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `${opts.durationLabel} done`,
        body: "Come back to post proof.",
        sound: opts.sound,
        data: { type: "active_task_timer", route: opts.route, taskId: opts.taskId },
      },
      trigger: { type: "date", date: opts.at } as Notifications.NotificationTriggerInput,
    });
  } catch {
    /* permission may be denied */
  }
}

export async function cancelTimerDoneNotification(taskId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`${TIMER_DONE_ID_PREFIX}${taskId}`);
  } catch {
    /* ignore */
  }
}
