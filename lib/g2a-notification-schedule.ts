/**
 * Frame 160 — schedule / cancel the two local G2a identifiers.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  G2A_PUSH_A,
  G2A_PUSH_B,
  type G2aPushCandidate,
} from "@/lib/g2a-notifications";

export async function cancelG2aDayReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(G2A_PUSH_A);
    await Notifications.cancelScheduledNotificationAsync(G2A_PUSH_B);
  } catch {
    // ignore
  }
}

export async function scheduleG2aDayReminders(candidates: G2aPushCandidate[]): Promise<void> {
  await cancelG2aDayReminders();
  if (Platform.OS === "web") return;
  const ids = [G2A_PUSH_A, G2A_PUSH_B];
  for (let i = 0; i < Math.min(2, candidates.length); i++) {
    const c = candidates[i]!;
    if (c.at.getTime() <= Date.now()) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: ids[i]!,
        content: { title: c.title, body: c.body, sound: true },
        trigger: { type: "date", date: c.at } as Notifications.NotificationTriggerInput,
      });
    } catch {
      // permissions / platform
    }
  }
}
