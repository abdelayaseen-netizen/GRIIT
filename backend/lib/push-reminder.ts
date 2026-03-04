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

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a push notification via Expo Push API.
 * Caller should look up push token from profiles (expo_push_token) and pass it.
 * If pushToken is null/empty, no-op (nudge is still recorded in DB and activity feed).
 */
export async function sendPushToUser(
  pushToken: string | null | undefined,
  title: string,
  body: string
): Promise<void> {
  const token = typeof pushToken === "string" ? pushToken.trim() : "";
  if (!token || !token.startsWith("ExponentPushToken")) return;

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: "default",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[push] Expo push failed:", res.status, text);
    }
  } catch (err) {
    console.warn("[push] Expo push error:", err);
  }
}
