/**
 * Expo Push API delivery for reminder notifications.
 * Validates token format and handles errors without throwing.
 */

import { isValidExpoToken } from "./push-utils";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a single push notification via Expo Push API.
 * No-op if token is missing or invalid. Logs warnings on failure.
 */
export async function sendPushToUser(
  pushToken: string | null | undefined,
  title: string,
  body: string
): Promise<void> {
  const token = typeof pushToken === "string" ? pushToken.trim() : "";
  if (!token || !isValidExpoToken(token)) return;

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
      const { logger } = await import("./logger");
      logger.warn({ status: res.status, text }, "[push] Expo push failed");
    }
  } catch (err) {
    const { logger } = await import("./logger");
    logger.warn({ err }, "[push] Expo push error");
  }
}
