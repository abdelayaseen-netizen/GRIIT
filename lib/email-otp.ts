/**
 * Build 92 chunk 09.4/09.5: save an account by a 6-digit email code (no password).
 * A guest's code attaches the email to the same anonymous user (`updateUser` → `email_change`), so
 * the streak, the challenge and Day 1 carry over. A signed-out person gets a sign-in code.
 * Needs Supabase Auth email OTP and templates that send {{ .Token }} (see docs/reports/build92.md, 09.4).
 */

export const ACCOUNT_COPY = {
  title: "Save your streak",
  subtitle: "So your challenge and Day 1 are kept if you change phones.",
  apple: "Continue with Apple",
  or: "or",
  email: "Email",
  continueEmail: "Continue with email",
  sendCode: "Send code",
  sent: (email: string) => `We sent a 6-digit code to ${email}`,
  different: "Use a different email",
  notNow: "Not now",
  wrongCode: "That code didn't match. Check the latest email.",
  expired: "That code expired. Send a new one.",
};

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;

export function resendLabel(secondsLeft: number): string {
  const s = Math.max(0, Math.ceil(secondsLeft));
  return `Resend in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type AuthErr = { message?: string; code?: string; status?: number } | null;
type AuthUser = { id: string; [key: string]: unknown };

/** The slice of `supabase.auth` this flow uses (stubbed in tests). */
export type OtpAuth = {
  updateUser(args: { email: string }): Promise<{ data: { user: AuthUser | null } | null; error: AuthErr }>;
  signInWithOtp(args: {
    email: string;
    options: { shouldCreateUser: boolean };
  }): Promise<{ data: unknown; error: AuthErr }>;
  verifyOtp(args: {
    email: string;
    token: string;
    type: "email" | "email_change";
  }): Promise<{ data: { user: AuthUser | null; session: unknown } | null; error: AuthErr }>;
};

export function otpErrorCopy(err: AuthErr): string {
  const text = `${err?.code ?? ""} ${err?.message ?? ""}`.toLowerCase();
  if (text.includes("expired")) return ACCOUNT_COPY.expired;
  return ACCOUNT_COPY.wrongCode;
}

function cleanEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function sendEmailCode(
  auth: OtpAuth,
  input: { email: string; guest: boolean },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const email = cleanEmail(input.email);
  const { error } = input.guest
    ? await auth.updateUser({ email })
    : await auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) return { ok: false, message: error.message || "Couldn't send the code. Try again." };
  return { ok: true };
}

export async function verifyEmailCode(
  auth: OtpAuth,
  input: { email: string; code: string; guest: boolean },
): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  const token = input.code.replace(/\D/g, "");
  if (token.length !== OTP_LENGTH) return { ok: false, message: ACCOUNT_COPY.wrongCode };
  const { data, error } = await auth.verifyOtp({
    email: cleanEmail(input.email),
    token,
    type: input.guest ? "email_change" : "email",
  });
  if (error || !data?.user) return { ok: false, message: otpErrorCopy(error) };
  return { ok: true, userId: data.user.id };
}
