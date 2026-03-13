/**
 * Human-readable auth error messages for login and signup.
 * Used by app/auth/login.tsx and app/auth/signup.tsx.
 */
export function mapAuthError(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  // Signup
  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (msg.includes("password") && (msg.includes("least") || msg.includes("length"))) {
    return "Password must be at least 8 characters.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("failed to fetch")) {
    return "Network error. Check your connection and try again.";
  }
  // Login
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please confirm your email address first. Check your inbox.";
  }
  return error.message;
}
