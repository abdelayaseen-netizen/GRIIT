import { PROFILE_DISPLAY_NAME_MAX } from "@/lib/profile-update-schema";

/**
 * Name written when a guest links an account. Apple's name wins.
 * Otherwise the part of the email before @. Settings can change it later.
 */
export function displayNameFromAccount(input: {
  appleName?: string | null;
  email?: string | null;
}): string | null {
  const apple = (input.appleName ?? "").trim().replace(/\s+/g, " ");
  if (apple) return apple.slice(0, PROFILE_DISPLAY_NAME_MAX);
  const local = (input.email ?? "").trim().split("@")[0]?.trim() ?? "";
  if (!local) return null;
  return local.slice(0, PROFILE_DISPLAY_NAME_MAX);
}
