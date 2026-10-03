/**
 * Human-readable auth error messages for login and signup.
 * Never return a raw provider string.
 */
export const AUTH_ERROR_GENERIC = "Something went wrong. Please try again.";

export function mapAuthError(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (msg.includes("already linked") || msg.includes("identity_already") || msg.includes("identity is already")) {
    return "This Apple ID is already linked to another GRIIT account. Sign in with that account.";
  }
  if (msg.includes("invalid email") || msg.includes("unable to validate email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("password") && (msg.includes("least") || msg.includes("length") || msg.includes("short"))) {
    return "Password must be at least 8 characters.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch") ||
    msg.includes("offline") ||
    msg.includes("authretryablefetch")
  ) {
    return "Network error. Check your connection and try again.";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email address first. Check your inbox.";
  }
  if (msg.includes("guest session")) {
    return "No guest session to upgrade. Sign in or create an account.";
  }
  if (msg.includes("provider") && (msg.includes("not enabled") || msg.includes("disabled"))) {
    return "That sign-in method is not available. Use email instead.";
  }
  if (msg.includes("nonce") || msg.includes("invalid_grant") || msg.includes("invalid token") || msg.includes("id token")) {
    return "Apple Sign-In failed. Please try again.";
  }
  return AUTH_ERROR_GENERIC;
}
