/**
 * Register device for push: request permission, get Expo token, send to backend.
 * Call when user is authenticated and we want to enable server-sent push (e.g. nudge, reminders).
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { track } from "@/lib/analytics";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { logger } from "@/lib/logger";

export async function registerPushTokenWithBackend(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const token = await registerForPushNotificationsAsync();
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") {
      try {
        track({ name: "notification_permission_granted" });
      } catch {
        /* non-fatal */
      }
    } else {
      try {
        track({ name: "notification_permission_denied" });
      } catch {
        /* non-fatal */
      }
    }
    if (!token) {
      try {
        track({ name: "push_permission_denied" });
      } catch {
        /* non-fatal */
      }
      return false;
    }
    try {
      track({ name: "push_permission_granted" });
    } catch {
      /* non-fatal */
    }

    await trpcMutate(TRPC.profiles.updatePushToken, { pushToken: token });
    await trpcMutate(TRPC.notifications.registerToken, {
      token,
    });
    return true;
  } catch (error) {
    logger.warn(
      "PushToken",
      `Push token registration skipped: ${error instanceof Error ? error.message : "unknown"}`,
      error
    );
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
    logger.warn(
      "PushToken",
      error instanceof Error ? error.message : "unknown",
      error
    );
  }
}
