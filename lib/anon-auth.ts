/**
 * Anonymous session bootstrap + uid-preserving upgrade to Apple / email.
 *
 * Day 1 (active_challenges, day_secures, streaks) is keyed on auth.uid().
 * Upgrading MUST keep that uid — use linkIdentity / updateUser, never
 * signInWithIdToken (that mints a new user and abandons Day 1).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { captureError } from "@/lib/sentry";

export type AnonAuthKind =
  | "ok"
  | "no_anon_session"
  | "identity_taken"
  | "offline"
  | "provider_error"
  | "cancelled";

export type AnonAuthResult = {
  kind: AnonAuthKind;
  user: User | null;
  session: Session | null;
  /** Human-readable message when kind !== "ok". */
  message: string | null;
  /** Previous anonymous uid when known (lost-session / conflict diagnostics). */
  previousAnonUserId: string | null;
};

function isIdentityTakenError(err: AuthError | null | undefined): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  const code = (err as { code?: string }).code ?? "";
  return (
    code === "identity_already_exists" ||
    msg.includes("identity is already linked") ||
    msg.includes("identity_already_exists") ||
    msg.includes("already linked to another user") ||
    msg.includes("already been registered")
  );
}

function isOfflineError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg = "message" in err && typeof (err as { message: unknown }).message === "string"
    ? (err as { message: string }).message.toLowerCase()
    : "";
  const name = "name" in err && typeof (err as { name: unknown }).name === "string"
    ? (err as { name: string }).name
    : "";
  return (
    name === "AuthRetryableFetchError" ||
    msg.includes("network") ||
    msg.includes("offline") ||
    msg.includes("failed to fetch")
  );
}

/** True when the current session user is an anonymous Supabase user. */
export function isAnonymousUser(user: User | null | undefined): boolean {
  return user?.is_anonymous === true;
}

/**
 * Persist the anon uid so a later lost session can be reported honestly
 * (no fabricated streak). Best-effort; never throws.
 */
export async function rememberAnonUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ANON_USER_ID, userId);
  } catch {
    /* non-fatal */
  }
}

export async function readRememberedAnonUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ANON_USER_ID);
  } catch {
    return null;
  }
}

export async function clearRememberedAnonUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ANON_USER_ID);
  } catch {
    /* non-fatal */
  }
}

/**
 * Ensure there is a session that can write (join / secure).
 * - Existing permanent or anon session → return it.
 * - No session → signInAnonymously (lazy; call only at write boundaries).
 *
 * Does NOT run on app launch.
 */
export async function ensureAnonymousSession(): Promise<AnonAuthResult> {
  const previousAnonUserId = await readRememberedAnonUserId();
  try {
    const { data: existing, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      if (isOfflineError(sessionError)) {
        return {
          kind: "offline",
          user: null,
          session: null,
          message: "You're offline. Connect and try again.",
          previousAnonUserId,
        };
      }
      captureError(sessionError, "ensureAnonymousSession.getSession");
    }
    if (existing.session?.user) {
      if (isAnonymousUser(existing.session.user)) {
        await rememberAnonUserId(existing.session.user.id);
      }
      return {
        kind: "ok",
        user: existing.session.user,
        session: existing.session,
        message: null,
        previousAnonUserId: isAnonymousUser(existing.session.user)
          ? existing.session.user.id
          : previousAnonUserId,
      };
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      if (isOfflineError(error)) {
        return {
          kind: "offline",
          user: null,
          session: null,
          message: "You're offline. Connect and try again.",
          previousAnonUserId,
        };
      }
      captureError(error, "ensureAnonymousSession.signInAnonymously");
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: error.message || "Could not start a guest session.",
        previousAnonUserId,
      };
    }
    const user = data.user;
    const session = data.session;
    if (!user || !session) {
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: "Could not start a guest session.",
        previousAnonUserId,
      };
    }
    await rememberAnonUserId(user.id);
    return {
      kind: "ok",
      user,
      session,
      message: null,
      previousAnonUserId: user.id,
    };
  } catch (err) {
    if (isOfflineError(err)) {
      return {
        kind: "offline",
        user: null,
        session: null,
          message: "You're offline. Connect and try again.",
        previousAnonUserId,
      };
    }
    captureError(err, "ensureAnonymousSession");
    return {
      kind: "provider_error",
      user: null,
      session: null,
      message: err instanceof Error ? err.message : "Could not start a guest session.",
      previousAnonUserId,
    };
  }
}

/**
 * Link Apple to the current anonymous session (preserves uid).
 * Never falls back to signInWithIdToken — that would abandon Day 1.
 */
export async function upgradeAnonymousWithApple(params: {
  identityToken: string;
  nonce?: string;
}): Promise<AnonAuthResult> {
  const previousAnonUserId = await readRememberedAnonUserId();
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError && isOfflineError(sessionError)) {
      return {
        kind: "offline",
        user: null,
        session: null,
          message: "You're offline. Connect and try again.",
        previousAnonUserId,
      };
    }
    const user = sessionData.session?.user ?? null;
    if (!user || !isAnonymousUser(user)) {
      return {
        kind: "no_anon_session",
        user: null,
        session: null,
        message:
          previousAnonUserId
            ? "Your guest session was lost. Sign in to recover an existing account — a new guest Day 1 cannot be restored."
            : "No guest session to upgrade. Sign in or create an account.",
        previousAnonUserId,
      };
    }

    const { data, error } = await supabase.auth.linkIdentity({
      provider: "apple",
      token: params.identityToken,
      nonce: params.nonce,
    });

    if (error) {
      if (isOfflineError(error)) {
        return {
          kind: "offline",
          user: null,
          session: null,
          message: "You're offline. Connect and try again.",
          previousAnonUserId: user.id,
        };
      }
      if (isIdentityTakenError(error)) {
        return {
          kind: "identity_taken",
          user: null,
          session: null,
          message:
            "This Apple ID is already linked to another GRIIT account. Sign in with that account — Day 1 on this guest session cannot be merged.",
          previousAnonUserId: user.id,
        };
      }
      captureError(error, "upgradeAnonymousWithApple.linkIdentity");
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: error.message || "Could not link Apple ID.",
        previousAnonUserId: user.id,
      };
    }

    const nextUser = data.user;
    const nextSession = data.session;
    if (!nextUser || !nextSession) {
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: "Apple link succeeded but no session was returned.",
        previousAnonUserId: user.id,
      };
    }
    if (nextUser.id !== user.id) {
      // Should not happen with link_identity — treat as failure, do not silently accept.
      captureError(
        new Error(`linkIdentity changed uid ${user.id} → ${nextUser.id}`),
        "upgradeAnonymousWithApple.uidChanged"
      );
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: "Account upgrade changed user id unexpectedly. Day 1 was not preserved.",
        previousAnonUserId: user.id,
      };
    }

    await clearRememberedAnonUserId();
    return {
      kind: "ok",
      user: nextUser,
      session: nextSession,
      message: null,
      previousAnonUserId: user.id,
    };
  } catch (err) {
    if (isOfflineError(err)) {
      return {
        kind: "offline",
        user: null,
        session: null,
          message: "You're offline. Connect and try again.",
        previousAnonUserId,
      };
    }
    captureError(err, "upgradeAnonymousWithApple");
    return {
      kind: "provider_error",
      user: null,
      session: null,
      message: err instanceof Error ? err.message : "Could not link Apple ID.",
      previousAnonUserId,
    };
  }
}

/**
 * Attach email+password to the current anonymous session (preserves uid).
 * Uses updateUser — the documented anon→permanent path for email.
 */
export async function upgradeAnonymousWithEmail(params: {
  email: string;
  password: string;
}): Promise<AnonAuthResult> {
  const previousAnonUserId = await readRememberedAnonUserId();
  const email = params.email.trim();
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError && isOfflineError(sessionError)) {
      return {
        kind: "offline",
        user: null,
        session: null,
          message: "You're offline. Connect and try again.",
        previousAnonUserId,
      };
    }
    const user = sessionData.session?.user ?? null;
    if (!user || !isAnonymousUser(user)) {
      return {
        kind: "no_anon_session",
        user: null,
        session: null,
        message:
          previousAnonUserId
            ? "Your guest session was lost. Sign in to recover an existing account — a new guest Day 1 cannot be restored."
            : "No guest session to upgrade. Sign in or create an account.",
        previousAnonUserId,
      };
    }

    const { data, error } = await supabase.auth.updateUser({
      email,
      password: params.password,
    });

    if (error) {
      if (isOfflineError(error)) {
        return {
          kind: "offline",
          user: null,
          session: null,
          message: "You're offline. Connect and try again.",
          previousAnonUserId: user.id,
        };
      }
      if (isIdentityTakenError(error)) {
        return {
          kind: "identity_taken",
          user: null,
          session: null,
          message:
            "That email is already registered. Sign in with that account — Day 1 on this guest session cannot be merged.",
          previousAnonUserId: user.id,
        };
      }
      captureError(error, "upgradeAnonymousWithEmail.updateUser");
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: error.message || "Could not attach email.",
        previousAnonUserId: user.id,
      };
    }

    const nextUser = data.user;
    if (!nextUser) {
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: "Email update succeeded but no user was returned.",
        previousAnonUserId: user.id,
      };
    }
    if (nextUser.id !== user.id) {
      captureError(
        new Error(`updateUser changed uid ${user.id} → ${nextUser.id}`),
        "upgradeAnonymousWithEmail.uidChanged"
      );
      return {
        kind: "provider_error",
        user: null,
        session: null,
        message: "Account upgrade changed user id unexpectedly. Day 1 was not preserved.",
        previousAnonUserId: user.id,
      };
    }

    const { data: refreshed } = await supabase.auth.getSession();
    await clearRememberedAnonUserId();
    return {
      kind: "ok",
      user: nextUser,
      session: refreshed.session,
      message: null,
      previousAnonUserId: user.id,
    };
  } catch (err) {
    if (isOfflineError(err)) {
      return {
        kind: "offline",
        user: null,
        session: null,
          message: "You're offline. Connect and try again.",
        previousAnonUserId,
      };
    }
    captureError(err, "upgradeAnonymousWithEmail");
    return {
      kind: "provider_error",
      user: null,
      session: null,
      message: err instanceof Error ? err.message : "Could not attach email.",
      previousAnonUserId,
    };
  }
}

/** Exported for unit tests — pure classification helpers. */
export const __anonAuthTestUtils = {
  isIdentityTakenError,
  isOfflineError,
};
