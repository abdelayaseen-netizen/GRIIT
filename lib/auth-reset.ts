import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-helpers";

export const AUTH_RESET_REDIRECT = "griit://auth/reset-password";
export const AUTH_EMAIL_CONFIRM_REDIRECT = "griit://auth/login";

export const RESET_LINK_EXPIRED =
  "This reset link has expired. Send a new one and try again.";
export const RESET_LINK_INVALID =
  "This reset link is invalid. Send a new one and try again.";

export type ResetLinkPayload =
  | { kind: "code"; code: string }
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "expired"; message: string }
  | { kind: "missing" };

function readParam(query: URLSearchParams, hash: URLSearchParams, key: string): string | null {
  return query.get(key) ?? hash.get(key);
}

export function parseResetRedirectUrl(url: string | null | undefined): ResetLinkPayload {
  if (!url || !url.trim()) return { kind: "missing" };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "missing" };
  }
  const query = parsed.searchParams;
  const hash = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);
  const get = (key: string) => readParam(query, hash, key);

  const errorBlob = [get("error"), get("error_code"), get("error_description")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (errorBlob) {
    return { kind: "expired", message: RESET_LINK_EXPIRED };
  }

  const code = get("code")?.trim();
  if (code) return { kind: "code", code };

  const accessToken = get("access_token")?.trim();
  const refreshToken = get("refresh_token")?.trim();
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  return { kind: "missing" };
}

export type EstablishResetSessionResult =
  | { ok: true }
  | { ok: false; expired: boolean; message: string };

function isExpiredAuthMessage(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes("expir") ||
    msg.includes("otp") ||
    msg.includes("invalid flow") ||
    msg.includes("already been used")
  );
}

export async function establishResetSession(
  payload: ResetLinkPayload
): Promise<EstablishResetSessionResult> {
  if (payload.kind === "expired") {
    return { ok: false, expired: true, message: payload.message };
  }
  if (payload.kind === "missing") {
    return { ok: false, expired: false, message: RESET_LINK_INVALID };
  }
  try {
    if (payload.kind === "code") {
      const { error } = await supabase.auth.exchangeCodeForSession(payload.code);
      if (error) {
        const expired = isExpiredAuthMessage(error.message);
        return {
          ok: false,
          expired,
          message: expired ? RESET_LINK_EXPIRED : mapAuthError(error),
        };
      }
      return { ok: true };
    }
    const { error } = await supabase.auth.setSession({
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken,
    });
    if (error) {
      const expired = isExpiredAuthMessage(error.message);
      return {
        ok: false,
        expired,
        message: expired ? RESET_LINK_EXPIRED : mapAuthError(error),
      };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : RESET_LINK_INVALID;
    return {
      ok: false,
      expired: isExpiredAuthMessage(message),
      message: isExpiredAuthMessage(message) ? RESET_LINK_EXPIRED : mapAuthError({ message }),
    };
  }
}
