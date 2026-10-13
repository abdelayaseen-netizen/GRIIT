export const SETTINGS_NOTIFICATIONS_SUB = "Up to 2 reminders a day";

export const GUEST_SETTINGS_LINE =
  "You're using GRIIT as a guest. Save your account so you don't lose your streak if you delete the app.";

export function settingsPrivacySub(visibility: string | null | undefined): string {
  return String(visibility ?? "public").toLowerCase() === "private"
    ? "Private account"
    : "Public account";
}
