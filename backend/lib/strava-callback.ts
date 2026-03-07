/**
 * Strava OAuth callback handler.
 * Exchanges code for tokens and upserts connected_accounts.
 * Uses service role Supabase (no user JWT in redirect request).
 */

import { verifyState } from "./strava-oauth-state";
import { exchangeCodeForToken } from "./strava-service";
import { getSupabaseServer } from "./supabase-server";

const PROVIDER = "strava";

function log(msg: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), msg, ...meta });
  if (process.env.NODE_ENV === "production") console.log(line);
  else console.log("[strava-callback]", line);
}

export interface CallbackResult {
  redirect: string;
  status?: number;
}

export async function handleStravaCallback(query: URLSearchParams): Promise<CallbackResult> {
  const code = query.get("code");
  const state = query.get("state");
  const error = query.get("error");

  const successRedirect = process.env.STRAVA_SUCCESS_REDIRECT_URI || "https://griit.app/profile?strava=connected";
  const errorRedirect = process.env.STRAVA_ERROR_REDIRECT_URI || "https://griit.app/profile?strava=error";

  if (error) {
    log("Strava OAuth error from provider", { error, description: query.get("error_description") ?? undefined });
    return { redirect: `${errorRedirect}&reason=${encodeURIComponent(error)}` };
  }

  if (!code || !state) {
    log("Strava callback missing code or state");
    return { redirect: errorRedirect };
  }

  const payload = verifyState(state);
  if (!payload) {
    log("Strava callback invalid or expired state");
    return { redirect: errorRedirect };
  }

  const userId = payload.userId;

  let tokenData: Awaited<ReturnType<typeof exchangeCodeForToken>>;
  try {
    tokenData = await exchangeCodeForToken(code);
  } catch (e) {
    log("Strava token exchange failed", { error: String(e) });
    return { redirect: errorRedirect };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    log("Strava callback: no Supabase server client (missing SUPABASE_SERVICE_ROLE_KEY?)");
    return { redirect: errorRedirect };
  }

  const expiresAt = new Date(tokenData.expires_at * 1000).toISOString();
  const metadata = tokenData.athlete
    ? { athlete_id: tokenData.athlete.id, username: (tokenData.athlete as { username?: string }).username }
    : {};

  const upsertPayload = {
    user_id: userId,
    provider: PROVIDER,
    provider_user_id: String(tokenData.athlete?.id ?? "unknown"),
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: expiresAt,
    scope: "read,activity:read_all",
    metadata_json: metadata,
    updated_at: new Date().toISOString(),
  };
  // Supabase client typings may omit connected_accounts; payload matches DB schema.
  // @ts-expect-error - table type not in generated types
  const { error: upsertError } = await supabase.from("connected_accounts").upsert(upsertPayload, {
    onConflict: "user_id,provider",
  });

  if (upsertError) {
    log("Strava callback upsert failed", { code: upsertError.code, message: upsertError.message });
    return { redirect: errorRedirect };
  }

  log("Strava callback success", { userId, athleteId: tokenData.athlete?.id });
  return { redirect: successRedirect };
}
