import type { Session, User } from "@supabase/supabase-js";
import type { AnonAuthKind } from "@/lib/anon-auth";
import { mapAuthError } from "@/lib/auth-helpers";

export function isRealNonAnonymousSession(
  user: User | null | undefined,
  session: Session | null | undefined
): boolean {
  return Boolean(session && user?.id && user.is_anonymous !== true);
}

export type AccountErrorSurface =
  | { kind: "silent" }
  | { kind: "email_taken" }
  | { kind: "message"; message: string };

const KIND_FALLBACK: Record<Exclude<AnonAuthKind, "ok" | "identity_taken" | "cancelled">, string> = {
  no_anon_session: "No guest session to upgrade. Sign in or create an account.",
  offline: "You're offline. Connect and try again.",
  provider_error: "Could not finish signing in. Please try again.",
};

export function surfaceAccountAuthKind(
  kind: AnonAuthKind,
  message: string | null | undefined
): AccountErrorSurface {
  if (kind === "ok") return { kind: "silent" };
  if (kind === "cancelled") return { kind: "silent" };
  if (kind === "identity_taken") return { kind: "email_taken" };
  if (message) return { kind: "message", message: mapAuthError({ message }) };
  return { kind: "message", message: KIND_FALLBACK[kind] };
}

export function surfaceCaughtAuthError(err: unknown): string {
  if (err instanceof Error && err.message) return mapAuthError(err);
  return "Something went wrong. Please try again.";
}
