/**
 * Register device for push: request permission, get Expo token, send to backend.
 * Call when user is authenticated and we want to enable server-sent push (e.g. nudge, reminders).
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpcMutate } from "@/lib/trpc";
import { track } from "@/lib/analytics";
import { registerForPushNotifications } from "@/lib/notifications";
import { captureError } from "@/lib/sentry";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

export async function registerPushTokenWithBackend(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const token = await registerForPushNotifications();
    if (!token) {
      track({ name: "push_permission_denied" });
      return false;
    }
    track({ name: "push_permission_granted" });

    await trpcMutate("notifications.registerToken", {
      token,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Only registers push after the user has joined at least one challenge (cold open should not prompt).
 */
export async function requestNotificationPermissionAfterFirstJoin(): Promise<void> {
  try {
    const hasJoined = await AsyncStorage.getItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE);
    if (!hasJoined) return;
    await registerPushTokenWithBackend();
  } catch (error) {
    captureError(error, "requestNotificationPermissionAfterFirstJoin");
  }
}
