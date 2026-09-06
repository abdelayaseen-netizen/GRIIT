import { isValidAccountUsername, normalizeAccountUsername } from "@/lib/onboarding-v2-account-name";

export type UsernameFieldState = "idle" | "checking" | "available" | "taken" | "tooShort";

export function normalizeProfileUsername(raw: string): string {
  return normalizeAccountUsername(raw).slice(0, 20);
}

export function usernameFieldState(input: {
  normalized: string;
  original: string;
  inFlight: boolean;
  taken: boolean | null;
}): UsernameFieldState {
  if (input.normalized === input.original) return "idle";
  if (input.normalized.length < 3) return "tooShort";
  if (input.inFlight) return "checking";
  if (input.taken === true) return "taken";
  if (input.taken === false) return "available";
  return "idle";
}

export function usernameSaveBlocked(state: UsernameFieldState): boolean {
  return state === "tooShort" || state === "taken" || state === "checking";
}

export function isUsernameUnchanged(normalized: string, original: string): boolean {
  return normalized === original || !isValidAccountUsername(normalized);
}
