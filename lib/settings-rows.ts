export const SETTINGS_NOTIFICATIONS_SUB = "Up to 2 reminders a day";

export const GUEST_SETTINGS_LINE =
  "You're using GRIIT as a guest. Save your account so you don't lose your streak if you delete the app.";

export function settingsPrivacySub(visibility: string | null | undefined): string {
  return String(visibility ?? "public").toLowerCase() === "private"
    ? "Private account"
    : "Public account";
}

/* Build 92 chunk 08.6 (P2-20, P2-21): the Connections card and the Pro perks list. */
export const CONNECTIONS_TITLE = "Connections";
export const STRAVA_CONNECT_TITLE = "Strava";
export const STRAVA_NOT_CONNECTED_SUB = "Verify runs automatically";
export const STRAVA_CONNECTED_SUB = "Connected";
export const STRAVA_CONNECT = "Connect";
export const STRAVA_DISCONNECT = "Disconnect";
export const STRAVA_NOTE = "Runs from Strava show “Verified by Strava” on the task and the post.";
export const STRAVA_DISCONNECT_TITLE = "Disconnect Strava?";
export const STRAVA_DISCONNECT_BODY = "Runs will need a photo or be self-reported.";
export const STRAVA_CONNECTED_TOAST = "Strava connected.";
export const STRAVA_FAILED_TOAST = "Strava didn’t connect. Try again from here.";

export function stravaConnectedSub(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  return n ? `Connected as ${n}` : STRAVA_CONNECTED_SUB;
}

export type StravaSettingsRow = {
  title: string;
  subtitle: string | null;
  action: "connect" | "disconnect";
  actionLabel: string;
};

/** Settings shows the Strava row only when the auto-verify flag is on and this is not a guest. */
export function stravaSettingsRow(input: {
  flagOn: boolean;
  connected: boolean;
  name?: string | null;
  guest?: boolean;
}): StravaSettingsRow | null {
  if (!input.flagOn || input.guest) return null;
  if (input.connected) {
    return {
      title: STRAVA_CONNECT_TITLE,
      subtitle: stravaConnectedSub(input.name),
      action: "disconnect",
      actionLabel: STRAVA_DISCONNECT,
    };
  }
  return { title: STRAVA_CONNECT_TITLE, subtitle: STRAVA_NOT_CONNECTED_SUB, action: "connect", actionLabel: STRAVA_CONNECT };
}

export const APPLE_HEALTH_ROW = {
  label: "Apple Health",
  sub: "Steps and workouts",
  badge: "Coming soon",
  enabled: false,
} as const;

export const PRO_TITLE = "GRIIT Pro";
export const PRO_FREE_LINE = "Free stays free: challenges, proofs, streaks, badges.";
export const PRO_SEE = "See Pro";
export const PRO_PERKS_TAG = "Pro";
/** Additive. Nothing in the free core is gated by these. */
export const PRO_PERKS = ["Auto-verify runs", "Extra freezes", "Stats", "Premium stickers"] as const;
export const PRO_PERK_SUBS: Partial<Record<(typeof PRO_PERKS)[number], string>> = {
  "Extra freezes": "Hold up to 4 instead of 2",
};
export const FREE_CORE = [
  "Challenges",
  "Proofs",
  "Streaks",
  "Streak history",
  "Per-challenge progress",
  "Badges",
  "Leaderboards",
  "Invites",
] as const;
