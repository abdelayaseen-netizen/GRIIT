/**
 * Apple on login / returning-user overlay.
 * Guest session: linkIdentity first (keep Day 1). If that Apple ID already
 * belongs to someone else, signInWithIdToken — guest Day 1 is abandoned.
 */
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAnonymousUser, upgradeAnonymousWithApple } from "@/lib/anon-auth";
import { captureError } from "@/lib/sentry";
import { writeDeviceTimezone } from "@/lib/write-device-timezone";

export const SIGNED_IN_EXISTING_ACCOUNT = "Signed in to your existing account.";

export type AppleSessionKind =
  | "linked"
  | "signed_in_existing"
  | "signed_in"
  | "cancelled"
  | "error";

export type AppleSessionResult = {
  kind: AppleSessionKind;
  user: User | null;
  session: Session | null;
  message: string | null;
};

async function signInWithAppleIdToken(
  identityToken: string,
  nonce?: string
): Promise<{ user: User | null; session: Session | null; errorMessage: string | null }> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
    nonce,
  });
  if (error) return { user: null, session: null, errorMessage: error.message };
  return { user: data.user ?? null, session: data.session ?? null, errorMessage: null };
}

export async function signInApplePreferringLink(params: {
  identityToken: string;
  nonce?: string;
}): Promise<AppleSessionResult> {
  try {
    const { data: snap } = await supabase.auth.getSession();
    const current = snap.session?.user ?? null;

    if (isAnonymousUser(current)) {
      const linked = await upgradeAnonymousWithApple({
        identityToken: params.identityToken,
        nonce: params.nonce,
      });
      if (linked.kind === "ok" && linked.user && linked.session) {
        return { kind: "linked", user: linked.user, session: linked.session, message: null };
      }
      if (linked.kind === "identity_taken") {
        const existing = await signInWithAppleIdToken(params.identityToken, params.nonce);
        if (existing.errorMessage || !existing.user || !existing.session) {
          return {
            kind: "error",
            user: null,
            session: null,
            message: existing.errorMessage || "Sign in failed. Please try again.",
          };
        }
        await writeDeviceTimezone();
        return {
          kind: "signed_in_existing",
          user: existing.user,
          session: existing.session,
          message: SIGNED_IN_EXISTING_ACCOUNT,
        };
      }
      return {
        kind: "error",
        user: null,
        session: null,
        message: linked.message || "Could not link Apple ID.",
      };
    }

    const signed = await signInWithAppleIdToken(params.identityToken, params.nonce);
    if (signed.errorMessage || !signed.user || !signed.session) {
      return {
        kind: "error",
        user: null,
        session: null,
        message: signed.errorMessage || "Sign in failed. Please try again.",
      };
    }
    await writeDeviceTimezone();
    return { kind: "signed_in", user: signed.user, session: signed.session, message: null };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ERR_REQUEST_CANCELED") {
      return { kind: "cancelled", user: null, session: null, message: null };
    }
    captureError(err, "signInApplePreferringLink");
    return {
      kind: "error",
      user: null,
      session: null,
      message: err instanceof Error ? err.message : "Sign in failed. Please try again.",
    };
  }
}
