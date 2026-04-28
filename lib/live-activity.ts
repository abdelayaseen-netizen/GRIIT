/**
 * Live Activity wrapper — iOS lock screen + Dynamic Island.
 * Uses expo-live-activity (Software Mansion) v0.4.2.
 *
 * On Android, every export is a no-op. Android continues to use the
 * sticky notification in lib/active-task-timer.ts.
 *
 * Behaviour (expo-live-activity@0.4.2):
 *   - Count-up tasks: no Live Activity; sticky notification only (iOS + Android)
 *   - Countdown tasks (targetSeconds): lock screen / Dynamic Island countdown
 *
 * The native timer updates every second on its own — we do NOT need
 * a JS interval. We only call updateLiveActivity() if title/subtitle changes.
 */
import { Platform } from "react-native";
import * as LiveActivity from "expo-live-activity";
import { captureError } from "@/lib/sentry";
import { useNotificationPrefsStore } from "@/store/notificationPrefsStore";
import { DS_COLORS } from "@/lib/design-system";

export type LiveActivityTimerType = "checkin" | "run_gps" | "run_treadmill";

export interface LiveActivityPayload {
  taskId: string;
  taskTitle: string;
  challengeName?: string;
  timerType: LiveActivityTimerType;
  startedAtMs: number;
  targetSeconds?: number;
  route: string;
}

let currentActivityId: string | undefined;
let lastState: LiveActivity.LiveActivityState | undefined;

function isIOSAndEnabled(): boolean {
  if (Platform.OS !== "ios") return false;
  if (!useNotificationPrefsStore.getState().lockScreenTimer) return false;
  return true;
}

function buildState(payload: LiveActivityPayload): LiveActivity.LiveActivityState | null {
  // expo-live-activity v0.4.2 only supports countdown (`date`) and discrete
  // progress (`progress` 0..1). Native count-up timer is unreleased on main.
  // We therefore only render Live Activities for countdown tasks (treadmill
  // and any check-in with a targetSeconds). Count-up tasks fall through to
  // the existing sticky notification on iOS just like on Android.
  if (!payload.targetSeconds || payload.targetSeconds <= 0) {
    return null;
  }

  const title = payload.challengeName?.trim() || "GRIIT";
  const subtitle = payload.taskTitle;
  const endMs = payload.startedAtMs + payload.targetSeconds * 1000;

  return {
    title,
    subtitle,
    progressBar: { date: endMs },
    imageName: "griit-mark",
    dynamicIslandImageName: "griit-mark",
  };
}

function buildConfig(payload: LiveActivityPayload): LiveActivity.LiveActivityConfig {
  return {
    backgroundColor: "#1A1A1A",
    titleColor: "#FFFFFF",
    subtitleColor: "#B0B0B0",
    progressViewTint: DS_COLORS.DISCOVER_CORAL,
    progressViewLabelColor: "#FFFFFF",
    deepLinkUrl: payload.route,
    timerType: "digital",
    padding: { horizontal: 16, top: 12, bottom: 12 },
    imagePosition: "right",
    imageAlign: "center",
    imageSize: { width: 44, height: 44 },
    contentFit: "contain",
  };
}

/**
 * Start a Live Activity. iOS only. No-op on Android, if disabled in prefs,
 * or if the payload is count-up (no targetSeconds) — count-up is not yet
 * supported in expo-live-activity@0.4.2 and falls back to the sticky
 * notification path.
 */
export function startLiveActivity(payload: LiveActivityPayload): void {
  if (!isIOSAndEnabled()) return;
  const state = buildState(payload);
  if (!state) return; // count-up tasks: fall through to notification path
  try {
    if (currentActivityId && lastState) {
      try {
        LiveActivity.stopActivity(currentActivityId, lastState);
      } catch {}
      currentActivityId = undefined;
      lastState = undefined;
    }
    const config = buildConfig(payload);
    const id = LiveActivity.startActivity(state, config);
    if (id) {
      currentActivityId = id;
      lastState = state;
    }
  } catch (error) {
    captureError(error, "startLiveActivity");
  }
}

/**
 * Update an existing Live Activity. iOS only. No-op otherwise.
 * Most callers do NOT need this — the native timer ticks on its own.
 * Use only when title/subtitle changes (e.g. lap completed).
 */
export function updateLiveActivity(payload: LiveActivityPayload): void {
  if (!isIOSAndEnabled()) return;
  if (!currentActivityId) return;
  const state = buildState(payload);
  if (!state) return;
  try {
    LiveActivity.updateActivity(currentActivityId, state);
    lastState = state;
  } catch (error) {
    captureError(error, "updateLiveActivity");
  }
}

/** Stop the Live Activity. iOS only. No-op otherwise. Safe to call multiple times. */
export function endLiveActivity(): void {
  if (Platform.OS !== "ios") return;
  if (!currentActivityId || !lastState) {
    currentActivityId = undefined;
    lastState = undefined;
    return;
  }
  try {
    LiveActivity.stopActivity(currentActivityId, lastState);
  } catch (error) {
    captureError(error, "endLiveActivity");
  } finally {
    currentActivityId = undefined;
    lastState = undefined;
  }
}

/** True if a Live Activity is currently displayed (iOS only). */
export function hasActiveLiveActivity(): boolean {
  return Platform.OS === "ios" && !!currentActivityId;
}
