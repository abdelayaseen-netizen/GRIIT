export type AccountIdentityState =
  | "default"
  | "email_entry"
  | "malformed"
  | "confirm_email"
  | "email_taken";

export const EMAIL_TAKEN_NOTICE =
  "That email already has a GRIIT account. Log in and today's progress comes with you.";

export const GUEST_PROGRESS_STAYS = "Guest progress stays on this device.";

export const CONFIRM_EMAIL_NOTICE = (email: string) => `We'll confirm at ${email} — correct?`;

export const MALFORMED_EMAIL = "That is not a complete email address.";

export function isCompleteEmail(raw: string): boolean {
  const t = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function emailFieldState(raw: string, blurred: boolean): "ok" | "malformed" | "empty" {
  const t = raw.trim();
  if (!t) return "empty";
  if (isCompleteEmail(t)) return "ok";
  return blurred ? "malformed" : "empty";
}
