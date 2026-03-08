/**
 * Server-side push via Expo Push API. Does not crash on missing/invalid tokens.
 */

import { isValidExpoToken } from "./push-utils";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notification(s) to Expo device(s). No-op if tokens empty/invalid.
 */
export async function sendExpoPush(
  tokens: string | string[] | null | undefined,
  title: string,
  body: string
): Promise<void> {
  const list = Array.isArray(tokens) ? tokens : tokens ? [tokens] : [];
  const valid = list.filter((t) => isValidExpoToken(t));
  if (valid.length === 0) return;

  try {
    const messages = valid.map((to) => ({ to, title, body, sound: "default" as const }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[push] Expo push failed:", res.status, text);
    }
  } catch (err) {
    console.warn("[push] Expo push error:", err);
  }
}
