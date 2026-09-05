/**
 * v2 single-prompt guarantee.
 *
 * The OS notification dialog is owned by RemindersScreen "Turn on reminders"
 * (`requestNotificationPermissions` in handleEnable).
 *
 * PushRegistrationBootstrap (`app/_layout.tsx`) and the AuthContext user-id
 * effect may only read `getPermissionsAsync` and register a token when already
 * granted. They must never call `requestPermissionsAsync`.
 */
export type V2NotificationPermissionSource =
  | "reminders_cta"
  | "bootstrap"
  | "auth_session"
  | "after_first_join";

export function v2MayPromptNotificationPermission(
  source: V2NotificationPermissionSource
): boolean {
  return source === "reminders_cta";
}
