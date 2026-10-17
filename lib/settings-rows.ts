export const SETTINGS_NOTIFICATIONS_SUB = "Up to 2 reminders a day";

export const GUEST_SETTINGS_LINE =
  "You're using GRIIT as a guest. Save your account so you don't lose your streak if you delete the app.";

export function settingsPrivacySub(visibility: string | null | undefined): string {
  return String(visibility ?? "public").toLowerCase() === "private"
    ? "Private account"
    : "Public account";
}

export const STRAVA_CONNECT_TITLE = "Connect Strava";
export const STRAVA_CONNECTED_SUB = "Connected";
export const STRAVA_DISCONNECT_TITLE = "Disconnect Strava";
export const STRAVA_DISCONNECT_BODY = "Runs logged in Strava will not complete tasks on their own.";
export const STRAVA_DISCONNECT = "Disconnect";

export type StravaSettingsRow = {
  title: string;
  subtitle: string | null;
  action: "connect" | "disconnect";
};

/** Settings shows Connect Strava only when the auto-verify flag is on and this is not a guest. */
export function stravaSettingsRow(input: {
  flagOn: boolean;
  connected: boolean;
  guest?: boolean;
}): StravaSettingsRow | null {
  if (!input.flagOn || input.guest) return null;
  if (input.connected) {
    return { title: STRAVA_CONNECT_TITLE, subtitle: STRAVA_CONNECTED_SUB, action: "disconnect" };
  }
  return { title: STRAVA_CONNECT_TITLE, subtitle: null, action: "connect" };
}
