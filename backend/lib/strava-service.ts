/**
 * Strava API client and token management.
 * All Strava API calls and token exchange happen here (backend only).
 */

import { getStravaConfig, STRAVA_SCOPES } from "./strava-config";

const STRAVA_BASE = "https://www.strava.com";
const STRAVA_API = "https://www.strava.com/api/v3";

export interface ConnectedAccountRow {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  metadata_json: Record<string, unknown> | null;
  updated_at: string;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; [key: string]: unknown };
}

export interface StravaActivity {
  id: number;
  type: string;
  sport_type?: string;
  name: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  start_date: string;
  start_date_local?: string;
  [key: string]: unknown;
}

function log(message: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), msg: message, ...meta });
  if (process.env.NODE_ENV === "production") console.log(line);
  else console.log("[strava]", line);
}

export function getAuthorizationUrl(state: string): string {
  const { clientId, redirectUri, enabled } = getStravaConfig();
  if (!enabled) throw new Error("Strava is not configured");
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "force",
    scope: STRAVA_SCOPES,
    state,
  });
  const url = `${STRAVA_BASE}/oauth/authorize?${params.toString()}`;
  log("auth URL generated", { redirectUri: redirectUri ? "(set)" : "(missing)" });
  return url;
}

export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const { clientId, clientSecret, redirectUri, enabled } = getStravaConfig();
  if (!enabled) throw new Error("Strava is not configured");

  const res = await fetch(`${STRAVA_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    log("token exchange failed", { status: res.status, body: text.slice(0, 200) });
    throw new Error(`Strava token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as StravaTokenResponse;
  log("token exchange success", { athleteId: data.athlete?.id });
  return data;
}

export async function refreshAccessToken(connection: ConnectedAccountRow): Promise<StravaTokenResponse> {
  const { clientId, clientSecret, enabled } = getStravaConfig();
  if (!enabled) throw new Error("Strava is not configured");
  if (!connection.refresh_token) throw new Error("No refresh token");

  const res = await fetch(`${STRAVA_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    log("token refresh failed", { status: res.status, body: text.slice(0, 200) });
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  const data = (await res.json()) as StravaTokenResponse;
  log("token refresh success", { athleteId: data.athlete?.id });
  return data;
}

/** Ensure token is valid; refresh if expired. Returns access token and optionally updated connection row. */
export async function ensureValidToken(
  connection: ConnectedAccountRow,
  updateDb: (updates: { access_token: string; refresh_token?: string; expires_at: string }) => Promise<void>
): Promise<string> {
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  const bufferMs = 5 * 60 * 1000; // refresh 5 min before expiry
  if (Date.now() < expiresAt - bufferMs) return connection.access_token;

  const data = await refreshAccessToken(connection);
  const expiresAtIso = new Date(data.expires_at * 1000).toISOString();
  await updateDb({
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? connection.refresh_token ?? undefined,
    expires_at: expiresAtIso,
  });
  return data.access_token;
}

async function stravaFetch(
  accessToken: string,
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${STRAVA_API}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (res.status === 401) throw new Error("Strava token expired or revoked");
  if (res.status === 429) throw new Error("Strava rate limit exceeded");
  return res;
}

export async function getAthlete(accessToken: string): Promise<Record<string, unknown>> {
  const res = await stravaFetch(accessToken, "/athlete");
  if (!res.ok) throw new Error(`Strava getAthlete failed: ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

export async function getAthleteActivities(
  accessToken: string,
  params: { before?: number; after?: number; page?: number; per_page?: number }
): Promise<StravaActivity[]> {
  const q = new URLSearchParams();
  if (params.after != null) q.set("after", String(params.after));
  if (params.before != null) q.set("before", String(params.before));
  if (params.page != null) q.set("page", String(params.page));
  if (params.per_page != null) q.set("per_page", String(params.per_page));
  const path = `/athlete/activities?${q.toString()}`;
  const res = await stravaFetch(accessToken, path);
  if (!res.ok) throw new Error(`Strava getActivities failed: ${res.status}`);
  return (await res.json()) as StravaActivity[];
}

export async function getActivityById(accessToken: string, activityId: number): Promise<StravaActivity> {
  const res = await stravaFetch(accessToken, `/activities/${activityId}`);
  if (!res.ok) throw new Error(`Strava getActivity failed: ${res.status}`);
  return (await res.json()) as StravaActivity;
}
