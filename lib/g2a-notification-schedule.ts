/**
 * Frame 160 — schedule / cancel today's pair and tomorrow's pair.
 * Cancelling today never touches tomorrow.
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  G2A_TODAY_IDS,
  G2A_TOMORROW_IDS,
  type G2aPushCandidate,
} from "@/lib/g2a-notifications";

export type G2aSlot = "today" | "tomorrow" | "all";

function idsFor(slot: G2aSlot): readonly string[] {
  if (slot === "today") return G2A_TODAY_IDS;
  if (slot === "tomorrow") return G2A_TOMORROW_IDS;
  return [...G2A_TODAY_IDS, ...G2A_TOMORROW_IDS];
}

export async function cancelG2aDayReminders(slot: G2aSlot = "today"): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    for (const id of idsFor(slot)) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch {
    // ignore
  }
}

/** Cancel today's queued G2a pair, then write the fresh plan. An empty day stays empty. */
export async function applyG2aPlan(plan: {
  today: readonly G2aPushCandidate[];
  tomorrow: readonly G2aPushCandidate[];
}): Promise<void> {
  if (plan.today.length === 0) {
    await cancelG2aDayReminders("today");
  } else {
    await scheduleG2aDayReminders([...plan.today], "today");
  }
  if (plan.tomorrow.length === 0) {
    await cancelG2aDayReminders("tomorrow");
  } else {
    await scheduleG2aDayReminders([...plan.tomorrow], "tomorrow");
  }
}

export async function scheduleG2aDayReminders(
  candidates: G2aPushCandidate[],
  slot: "today" | "tomorrow" = "today",
): Promise<void> {
  await cancelG2aDayReminders(slot);
  if (Platform.OS === "web") return;
  const ids = slot === "today" ? G2A_TODAY_IDS : G2A_TOMORROW_IDS;
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
