/**
 * Device cache of profiles.onboarding_completed.
 * Write when the DB says complete. Never read to decide routing.
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
