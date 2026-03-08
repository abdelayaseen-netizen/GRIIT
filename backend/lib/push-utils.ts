/**
 * Shared push token validation. Used by push.ts and push-reminder-expo.ts.
 */
export function isValidExpoToken(token: string): boolean {
  const t = typeof token === "string" ? token.trim() : "";
  return t.length > 0 && (t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken"));
}
