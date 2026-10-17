/** True when email confirmation is still required, so the session is not a saved account yet. */
export function emailSaveStillPending(user: {
  is_anonymous?: boolean;
  email_confirmed_at?: string | null;
}): boolean {
  if (user.is_anonymous === true) return true;
  if (user.email_confirmed_at === null) return true;
  return false;
}

export const CHECK_EMAIL_TO_SAVE = "Check your email to save your streak";
