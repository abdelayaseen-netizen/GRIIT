/**
 * Register device for push: request permission, get Expo token, send to backend.
 * Call when user is authenticated and we want to enable server-sent push (e.g. nudge, reminders).
 */

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { trpcMutate } from "@/lib/trpc";
import { track } from "@/lib/analytics";

export async function registerPushTokenWithBackend(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== "granted") {
      track({ name: "push_permission_denied" });
      return false;
    }
    track({ name: "push_permission_granted" });

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: (typeof process !== "undefined" && process.env ? (process.env as { EXPO_PUBLIC_EAS_PROJECT_ID?: string }).EXPO_PUBLIC_EAS_PROJECT_ID : undefined) ?? undefined,
    });
    const token = tokenData?.data;
    if (!token) return false;

    await trpcMutate("notifications.registerToken", {
      token,
    });
    return true;
  } catch {
    return false;
  }
}
