import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Haptics from "expo-haptics";

interface UseTaskTimerOptions {
  requiredSeconds: number;
  isCountdown: boolean;
  isHardMode: boolean;
  autoStart: boolean;
}

interface UseTaskTimerReturn {
  timerSeconds: number;
  isTimerRunning: boolean;
  /** Foreground-only counter — used to enforce hard-mode "stay on screen" rule. */
  onScreenSecondsRef: MutableRefObject<number>;
  timerDisplay: string;
  progressFrac: number;
  timerOk: boolean;
  hardModeOk: boolean;
  toggleTimer: () => void;
}

/**
 * Wall-clock-driven task timer.
 *
 * Why a ref-based startedAtMs instead of incrementing state every second:
 * iOS suspends the JS engine when the screen turns off or the app goes to
 * background. A setInterval-only timer freezes during that window and on
 * resume the user sees stale time. This implementation derives elapsed
 * time from (now - startedAtMs - pausedMs) on every tick and on every
 * AppState "active" event, so it stays correct across backgrounding.
 *
 * Hard mode keeps a separate `onScreenSecondsRef` that only advances
 * while the screen is foregrounded. `hardModeOk` requires that counter
 * to reach `requiredSeconds`, preserving the "stay on this screen"
 * anti-cheat without resetting the wall-clock timer (which would punish
 * legitimate users like prayer / meditation tasks who put the phone down).
 *
 * Server-side hard-mode validation in checkins.ts validates against
 * timer_seconds_on_screen, which matches onScreenSecondsRef.current.
 */
export function useTaskTimer({
  requiredSeconds,
  isCountdown,
  isHardMode,
  autoStart,
}: UseTaskTimerOptions): UseTaskTimerReturn {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const onScreenSecondsRef = useRef(0);

  // Wall-clock anchor. Null when not started.
  const startedAtMsRef = useRef<number | null>(null);
  // Total milliseconds spent paused since startedAtMsRef was set.
  const accumulatedPausedMsRef = useRef<number>(0);
  // When paused, the moment we paused at (so we can add to accumulatedPausedMs on resume).
  const pausedAtMsRef = useRef<number | null>(null);
  // Last AppState transition out of "active" (for foreground accounting).
  const backgroundedAtMsRef = useRef<number | null>(null);

  const recomputeElapsed = useCallback(() => {
    if (startedAtMsRef.current == null) return;
    const now = Date.now();
    const pausedMs =
      accumulatedPausedMsRef.current +
      (pausedAtMsRef.current != null ? now - pausedAtMsRef.current : 0);
    const elapsed = Math.max(0, Math.floor((now - startedAtMsRef.current - pausedMs) / 1000));
    setTimerSeconds(elapsed);
    if (isCountdown && requiredSeconds > 0 && elapsed >= requiredSeconds) {
      setIsTimerRunning(false);
      if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [isCountdown, requiredSeconds]);

  // Auto-start
  useEffect(() => {
    if (autoStart && requiredSeconds > 0 && !isTimerRunning && timerSeconds === 0 && startedAtMsRef.current == null) {
      startedAtMsRef.current = Date.now();
      accumulatedPausedMsRef.current = 0;
      pausedAtMsRef.current = null;
      setIsTimerRunning(true);
      if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [autoStart, requiredSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // 1Hz tick that recomputes from wall clock (only while running).
  useEffect(() => {
    if (!isTimerRunning) return;
    recomputeElapsed();
    const id = setInterval(() => {
      recomputeElapsed();
      // On-screen accounting: only increment when foregrounded.
      if (AppState.currentState === "active") {
        onScreenSecondsRef.current += 1;
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, recomputeElapsed]);

  // AppState — reconcile immediately on resume so the user sees correct time.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        backgroundedAtMsRef.current = null;
        if (isTimerRunning) recomputeElapsed();
      } else {
        if (backgroundedAtMsRef.current == null) {
          backgroundedAtMsRef.current = Date.now();
        }
      }
    });
    return () => sub.remove();
  }, [isTimerRunning, recomputeElapsed]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((running) => {
      const next = !running;
      const now = Date.now();
      if (next) {
        // Resuming
        if (startedAtMsRef.current == null) {
          startedAtMsRef.current = now;
          accumulatedPausedMsRef.current = 0;
        } else if (pausedAtMsRef.current != null) {
          accumulatedPausedMsRef.current += now - pausedAtMsRef.current;
        }
        pausedAtMsRef.current = null;
      } else {
        // Pausing
        pausedAtMsRef.current = now;
      }
      return next;
    });
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const timerDisplay =
    isCountdown && requiredSeconds > 0
      ? `${String(Math.floor(Math.max(0, requiredSeconds - timerSeconds) / 60)).padStart(2, "0")}:${String(Math.max(0, requiredSeconds - timerSeconds) % 60).padStart(2, "0")}`
      : `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;

  const progressFrac = requiredSeconds > 0 ? Math.min(1, timerSeconds / requiredSeconds) : 0;
  const timerOk = requiredSeconds === 0 || timerSeconds >= requiredSeconds;
  // Hard mode requires foreground-only on-screen seconds to reach required.
  // Wall-clock timerOk can still pass (e.g. for non-hard tasks like prayer)
  // even if onScreenSeconds didn't catch up.
  const hardModeOk = !isHardMode || requiredSeconds === 0 || onScreenSecondsRef.current >= requiredSeconds;

  return {
    timerSeconds,
    isTimerRunning,
    onScreenSecondsRef,
    timerDisplay,
    progressFrac,
    timerOk,
    hardModeOk,
    toggleTimer,
  };
}
