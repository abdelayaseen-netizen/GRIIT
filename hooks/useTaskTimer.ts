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
  onScreenSecondsRef: MutableRefObject<number>;
  timerDisplay: string;
  progressFrac: number;
  timerOk: boolean;
  hardModeOk: boolean;
  toggleTimer: () => void;
}

export function useTaskTimer({ requiredSeconds, isCountdown, isHardMode, autoStart }: UseTaskTimerOptions): UseTaskTimerReturn {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const onScreenSecondsRef = useRef(0);
  const bgRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoStart && requiredSeconds > 0 && !isTimerRunning && timerSeconds === 0) {
      setIsTimerRunning(true);
      if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [autoStart, requiredSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        const next = s + 1;
        onScreenSecondsRef.current = next;
        if (isCountdown && requiredSeconds > 0 && next >= requiredSeconds) {
          setIsTimerRunning(false);
          if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, isCountdown, requiredSeconds]);

  useEffect(() => {
    if (!isHardMode) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active" && bgRef.current) {
        const elapsed = Math.floor((Date.now() - bgRef.current) / 1000);
        bgRef.current = null;
        if (elapsed > 3) {
          setTimerSeconds(0);
          onScreenSecondsRef.current = 0;
          setIsTimerRunning(false);
        }
      } else if (state !== "active") {
        bgRef.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [isHardMode]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((r) => !r);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const timerDisplay =
    isCountdown && requiredSeconds > 0
      ? `${String(Math.floor(Math.max(0, requiredSeconds - timerSeconds) / 60)).padStart(2, "0")}:${String(Math.max(0, requiredSeconds - timerSeconds) % 60).padStart(2, "0")}`
      : `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;

  const progressFrac = requiredSeconds > 0 ? Math.min(1, timerSeconds / requiredSeconds) : 0;
  const timerOk = requiredSeconds === 0 || timerSeconds >= requiredSeconds;
  const hardModeOk = !isHardMode || requiredSeconds === 0 || onScreenSecondsRef.current >= requiredSeconds;

  return { timerSeconds, isTimerRunning, onScreenSecondsRef, timerDisplay, progressFrac, timerOk, hardModeOk, toggleTimer };
}
