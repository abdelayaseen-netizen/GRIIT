/**
 * Placeholder for daily "secure your day" push reminder.
 * Trigger logic: if user has not secured today and current time >= preferredSecureTime.
 * Actual push delivery (FCM, APNs, etc.) is not wired; this is the structure only.
 */
export interface SecureReminderContext {
  userId: string;
  preferredSecureTime: string; // "HH:mm" e.g. "20:00"
  hasSecuredToday: boolean;
  now: Date;
}

/**
 * Returns true if it's time to send the reminder (user has not secured today and now >= preferred time).
 */
export function shouldSendSecureReminder(ctx: SecureReminderContext): boolean {
  if (ctx.hasSecuredToday) return false;
  const [hours, minutes] = ctx.preferredSecureTime.split(":").map(Number);
  const preferredMinutes = hours * 60 + (minutes ?? 0);
  const nowMinutes = ctx.now.getHours() * 60 + ctx.now.getMinutes();
  return nowMinutes >= preferredMinutes;
}

/**
 * Placeholder: would send push notification to user.
 * In production, wire to FCM (Android), APNs (iOS), or Expo Push.
 */
export function sendSecureReminder(_userId: string): void {
  // TODO: integrate with push provider
  // e.g. Expo: ExpoPush.sendPushNotificationAsync({ to: pushToken, title: "Time to secure your day", body: "..." })
}
