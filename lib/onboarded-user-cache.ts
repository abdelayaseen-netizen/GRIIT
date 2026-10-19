/**
 * Build 92 chunk 11.2 · per-user record that the database said this account finished onboarding.
 * A returning person's launch routes from it at once instead of waiting on the profile fetch;
 * the fetch still runs and can still send them to onboarding. Written only from a successful
 * complete fetch, so it never skips onboarding for a new account.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const onboardedUserKey = (userId: string) => `griit.onboarded.v1:${userId}`;

export type OnboardedUser = { username: string | null; createdAt: string | null };

export function parseOnboardedUser(raw: string | null | undefined): OnboardedUser | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (!v || typeof v !== "object" || v.completed !== true) return null;
    return {
      username: typeof v.username === "string" ? v.username : null,
      createdAt: typeof v.createdAt === "string" ? v.createdAt : null,
    };
  } catch {
    return null;
  }
}

export function serializeOnboardedUser(u: OnboardedUser): string {
  return JSON.stringify({ completed: true, username: u.username, createdAt: u.createdAt });
}

export async function readOnboardedUser(userId: string): Promise<OnboardedUser | null> {
  try {
    return parseOnboardedUser(await AsyncStorage.getItem(onboardedUserKey(userId)));
  } catch {
    return null;
  }
}

export function writeOnboardedUser(userId: string, u: OnboardedUser): void {
  void AsyncStorage.setItem(onboardedUserKey(userId), serializeOnboardedUser(u)).catch(() => {});
}
