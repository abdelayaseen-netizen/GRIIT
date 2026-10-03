/**
 * Device cache of profiles.onboarding_completed.
 * Write when the DB says complete.
 * Read only to prefer Home when the profile fetch times out (null).
 * Never used to skip onboarding after a successful incomplete fetch.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export async function cacheOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
  } catch {
    // cache only
  }
}

export async function readOnboardingCompletedCache(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return raw === "true";
  } catch {
    return false;
  }
}
