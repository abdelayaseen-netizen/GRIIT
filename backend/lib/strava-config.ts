/**
 * Strava OAuth and API configuration.
 * Only reads env; STRAVA_CLIENT_SECRET must never be sent to frontend.
 */

export const STRAVA_SCOPES = "read,activity:read_all";

export function getStravaConfig(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  enabled: boolean;
} {
  const clientId = process.env.STRAVA_CLIENT_ID ?? "";
  const clientSecret = process.env.STRAVA_CLIENT_SECRET ?? "";
  const redirectUri = process.env.STRAVA_REDIRECT_URI ?? "";
  const enabled = !!(clientId && clientSecret && redirectUri);
  return { clientId, clientSecret, redirectUri, enabled };
}

/** For frontend / auth URL only: no secret. */
export function getStravaPublicConfig(): {
  clientId: string;
  redirectUri: string;
  enabled: boolean;
} {
  const { clientId, redirectUri, enabled } = getStravaConfig();
  return { clientId, redirectUri, enabled };
}
