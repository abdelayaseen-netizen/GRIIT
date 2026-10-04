export const SETTINGS_NOTIFICATIONS_SUB = "Up to 2 reminders a day";

export function settingsPrivacySub(visibility: string | null | undefined): string {
  return String(visibility ?? "public").toLowerCase() === "private"
    ? "Private account"
    : "Public account";
}
