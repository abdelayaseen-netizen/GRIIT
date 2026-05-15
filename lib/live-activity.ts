/**
 * Live Activity wrapper — iOS lock screen + Dynamic Island.
 * Uses expo-live-activity (Software Mansion) v0.5.0-alpha1+.
 *
 * On Android, every export is a no-op. Android continues to use the
 * sticky notification in lib/active-task-timer.ts.
 *
 * Behaviour:
 *   - Countdown tasks (targetSeconds set): progressBar.date drives a countdown
 *     timer in the Live Activity card and Dynamic Island.
 *   - Count-up tasks (no targetSeconds): progressBar.elapsedTimer.startDate
 *     drives a tick-up timer in the Live Activity card and Dynamic Island.
 *
 * The native timer updates every second on its own — no JS interval needed
 * for countdown or count-up modes.
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

function buildState(payload: LiveActivityPayload): LiveActivity.LiveActivityState {
  const title = payload.challengeName?.trim() || "GRIIT";
  const subtitle = payload.taskTitle;

  // Countdown mode (treadmill, cold shower, time-gated check-ins): native
  // ActivityKit ticks toward `date` every second, with no JS work required.
  if (payload.targetSeconds && payload.targetSeconds > 0) {
    const endMs = payload.startedAtMs + payload.targetSeconds * 1000;
    return {
      title,
      subtitle,
      progressBar: { date: endMs },
      imageName: "griit-mark",
      dynamicIslandImageName: "griit-mark",
    };
  }

  // Count-up mode (prayer, GPS run, journal, anything without a target):
  // native ActivityKit ticks elapsed seconds from startDate every second.
  return {
    title,
    subtitle,
    progressBar: { elapsedTimer: { startDate: payload.startedAtMs } },
    imageName: "griit-mark",
    dynamicIslandImageName: "griit-mark",
  };
}

function buildConfig(payload: LiveActivityPayload): LiveActivity.LiveActivityConfig {
  return {
    backgroundColor: DS_COLORS.LIVE_ACTIVITY_BG,
    titleColor: DS_COLORS.LIVE_ACTIVITY_TITLE,
    subtitleColor: DS_COLORS.LIVE_ACTIVITY_SUBTITLE,
    progressViewTint: DS_COLORS.DISCOVER_CORAL,
    progressViewLabelColor: DS_COLORS.LIVE_ACTIVITY_LABEL,
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
 * Start a Live Activity. iOS only. No-op on Android or if disabled in prefs.
 * Both countdown (targetSeconds set) and count-up (no targetSeconds) tasks
 * render natively via expo-live-activity 0.5.0-alpha1+; count-up uses
 * progressBar.elapsedTimer.startDate to tick up every second on its own.
 */
export function startLiveActivity(payload: LiveActivityPayload): void {
  if (!isIOSAndEnabled()) return;
  const state = buildState(payload);
  try {
    if (currentActivityId && lastState) {
      try {
        LiveActivity.stopActivity(currentActivityId, lastState);
      } catch (error) {
        captureError(error, "startLiveActivityStopPrior");
      }
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
