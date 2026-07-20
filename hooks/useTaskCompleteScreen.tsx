/**
 * Task completion screen state, handlers, and layout (extracted from app/task/complete.tsx).
 */
import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, Animated } from "react-native";
import { useCelebrationStore } from "@/store/celebrationStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useApp } from "@/contexts/AppContext";
import { haversineDistance } from "@/lib/geo";
import { DS_COLORS_V2, DS_SPACING, GRIIT_COLORS } from "@/lib/design-system";
import { useInlineError } from "@/hooks/useInlineError";
import { captureError } from "@/lib/sentry";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useQueryClient } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";
import type { TaskHardVerificationConfig } from "@/lib/task-hard-verification";
import ViewShot from "react-native-view-shot";
import { styles } from "@/components/task/task-complete-styles";
import { usePhotoCapture } from "@/hooks/usePhotoCapture";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import {
  startActiveTaskNotification,
  updateActiveTaskNotification,
  clearActiveTaskNotification,
  type ActiveTaskTimerPayload,
} from "@/lib/active-task-timer";
import { startLiveActivity, type LiveActivityPayload, endLiveActivity } from "@/lib/live-activity";
import { ROUTES } from "@/lib/routes";
import { useActiveSessionStore } from "@/store/activeSessionStore";
import { useJournalInput } from "@/hooks/useJournalInput";
import { useTaskCompleteShareCardProps } from "@/hooks/useTaskCompleteShareCardProps";
import { TaskCompleteCelebration } from "@/components/task/TaskCompleteCelebration";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TaskShell, type TaskShellGates, type TaskShellMissedState } from "@/components/task/TaskShell";
import { TaskSimpleBody } from "@/components/task/bodies/TaskSimpleBody";
import { TaskPhotoBody } from "@/components/task/bodies/TaskPhotoBody";
import { TaskTimerBody, type TimerSound } from "@/components/task/bodies/TaskTimerBody";
import { TaskRunBody } from "@/components/task/bodies/TaskRunBody";
import { TaskWorkoutBody } from "@/components/task/bodies/TaskWorkoutBody";
import { TaskJournalBody } from "@/components/task/bodies/TaskJournalBody";
import { TaskCounterBody, type CounterVariant } from "@/components/task/bodies/TaskCounterBody";
import { TaskCheckinBody } from "@/components/task/bodies/TaskCheckinBody";
import { TaskReadyCard } from "@/components/task/bodies/TaskReadyCard";
import {
  VerifyingOverlay,
  buildVerifyingRows,
  getTypeSuccessLine,
} from "@/components/task/VerifyingOverlay";
import * as ImagePicker from "expo-image-picker";
import { FLAGS } from "@/lib/feature-flags";
import {
  firstString,
  parseConfig,
  getDailyPrompt,
  inferRunOrWorkout,
  WORKOUT_KINDS,
  goBackOrHome,
  type TaskCompleteConfig,
} from "@/lib/task-helpers";


export function TaskCompleteScreenInner() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    activeChallengeId: string;
    taskType: string;
    taskName?: string;
    taskDescription?: string;
    taskConfig?: string;
    challengeName?: string;
    currentDay?: string;
    durationDays?: string;
  }>();
  const queryClient = useQueryClient();
  const { activeChallenge, completeTask, secureDay, challenge, stats, computeProgress, todayCheckins } = useApp();
  /** Always call the latest secureDay — submit closure would otherwise hold a pre-completion canSecureDay=false instance. */
  const secureDayRef = useRef(secureDay);
  secureDayRef.current = secureDay;
  const showCelebration = useCelebrationStore((s) => s.show);
  const setActiveSession = useActiveSessionStore((s) => s.setActiveSession);
  const clearActiveSession = useActiveSessionStore((s) => s.clearActiveSession);
  const updateTimerRunning = useActiveSessionStore((s) => s.updateTimerRunning);
  const [submitted, setSubmitted] = useState(false);
  const [shareFeedErr, setShareFeedErr] = useState("");
  const [variableReward, setVariableReward] = useState<{ label: string; color: string; bg: string } | null>(null);

  const taskId = firstString(params.taskId) || "";
  const activeChallengeId = firstString(params.activeChallengeId) || activeChallenge?.id || "";
  const taskTypeRaw = (firstString(params.taskType) || "manual").toLowerCase();
  const taskName = (firstString(params.taskName) || "Task").trim() || "Task";
  const config = useMemo(() => parseConfig(firstString(params.taskConfig)), [params.taskConfig]);

  const headerChallengeName =
    firstString(params.challengeName).trim() ||
    (challenge as { title?: string })?.title ||
    "Challenge";
  const headerCurrentDay = Math.max(1, parseInt(firstString(params.currentDay) || "1", 10) || 1);
  const headerDurationDays = Math.max(1, parseInt(firstString(params.durationDays) || "14", 10) || 14);

  const { error, showError, clearError } = useInlineError();
  const [heartRateData, setHeartRateData] = useState<{ avg: number; peak: number } | null>(null);
  const [heartRateManual, setHeartRateManual] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minimumConfirmVisible, setMinimumConfirmVisible] = useState(false);
  const [paramsReady, setParamsReady] = useState(false);
  const manualScale = useRef(new Animated.Value(1)).current;
  const runDistanceKm = useRef("0.0");
  const runDurationMin = useRef("0");
  const [runDistance, setRunDistance] = useState("0.0");
  const [runDuration, setRunDuration] = useState("0");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutKind, setWorkoutKind] = useState<string>(WORKOUT_KINDS[0] ?? "Gym");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [postedInline, setPostedInline] = useState(false);
  const manualSubmitScheduled = useRef(false);
  const clockedInAtRef = useRef<string | null>(null);
  /** Timestamp (ms) when the submit mutation started — used for 600 ms Verifying floor. */
  const verifyStartMsRef = useRef<number>(0);
  /** Human-readable time label captured at submit-press (e.g. "07:42 AM"). */
  const [submitTimeLabel, setSubmitTimeLabel] = useState<string>("");
  /** Streak count returned by the server after task completion — shown on Secured screen. */
  const [completedStreakCount, setCompletedStreakCount] = useState<number | undefined>(undefined);
  const [hardGatesPassed, setHardGatesPassed] = useState(true);
  const [timeWindowFailed, setTimeWindowFailed] = useState(false);
  const [gatesLocation, setGatesLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Arming state — true once the user taps Start (simple/manual start armed immediately).
  // Phase 2 adds the full ReadyCard + permission-arming logic.
  const [isArmed, setIsArmed] = useState<boolean>(
    FLAGS.TASK_START_ARMING
      ? taskTypeRaw === "simple" || taskTypeRaw === "manual"
      : true
  );
  // V2 body-component local state (counter / water / reading + timer sound)
  const [counterValue, setCounterValue] = useState<number>(0);
  const [bookTitle, setBookTitle] = useState<string>("");
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [timerSound, setTimerSound] = useState<TimerSound>("silent");
  const [photoCapturedAt, setPhotoCapturedAt] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [completionMeta, setCompletionMeta] = useState<{
    taskId: string;
    details: string;
    timeLabel: string;
  } | null>(null);
  const [completionIdForShare, setCompletionIdForShare] = useState<string | undefined>(undefined);

  const shareRef = useRef<ViewShot>(null);
  const transparentCardRef = useRef<ViewShot>(null);
  const proofCardRef = useRef<ViewShot>(null);
  const recapCardRef = useRef<ViewShot>(null);
  const completeCardRef = useRef<ViewShot>(null);
  const minimalStreakCardRef = useRef<ViewShot>(null);

  useEffect(() => {
    const timer = setTimeout(() => setParamsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isHardVerificationTask = config.hard_mode === true;
  const isChallengeHardMode =
    ((challenge as { is_hard_mode?: boolean } | null)?.is_hard_mode ?? false) ||
    ((activeChallenge as { challenges?: { is_hard_mode?: boolean } } | null)?.challenges?.is_hard_mode ?? false);
  const hardVerificationConfig = useMemo((): TaskHardVerificationConfig => {
    return {
      hard_mode: config.hard_mode,
      schedule_window_start: config.schedule_window_start,
      schedule_window_end: config.schedule_window_end,
      schedule_timezone: config.schedule_timezone,
      require_location: config.require_location,
      location_latitude: config.location_latitude,
      location_longitude: config.location_longitude,
      location_radius_meters: config.location_radius_meters,
      location_name: config.location_name,
      require_camera_only: config.require_camera_only,
      require_strava: config.require_strava,
    };
  }, [config]);

  useLayoutEffect(() => {
    setHardGatesPassed(!isHardVerificationTask);
    setTimeWindowFailed(false);
    setGatesLocation(null);
    // Reset arming state for the new task
    if (FLAGS.TASK_START_ARMING) {
      setIsArmed(taskTypeRaw === "simple" || taskTypeRaw === "manual");
    }
    if (isHardVerificationTask) {
      clockedInAtRef.current = new Date().toISOString();
    } else {
      clockedInAtRef.current = null;
    }
  }, [taskId, isHardVerificationTask, params.taskConfig, taskTypeRaw]);

  const onHardGatesResolved = useCallback((ok: boolean, loc?: { lat: number; lng: number }) => {
    setHardGatesPassed(ok);
    if (loc) setGatesLocation(loc);
  }, []);

  const onHardTimeWindowFailed = useCallback(() => {
    setTimeWindowFailed(true);
  }, []);

  const minDurMinutes = config.min_duration_minutes ?? 0;
  const requiredSeconds = minDurMinutes * 60;
  const isCountdown = config.timer_direction === "countdown";
  const isHardMode = config.timer_hard_mode === true;
  const isRunTimed = taskTypeRaw === "run" && minDurMinutes > 0;
  const effectiveRunOrWorkout =
    taskTypeRaw === "run" || taskTypeRaw === "workout" ? inferRunOrWorkout(taskTypeRaw, taskName) : null;
  const showWorkoutTimer =
    taskTypeRaw === "timer" ||
    (taskTypeRaw === "workout" && minDurMinutes > 0) ||
    (taskTypeRaw === "run" && isRunTimed && isHardMode);
  const showRunEntry = taskTypeRaw === "run" && effectiveRunOrWorkout === "run" && !showWorkoutTimer;
  const showWorkoutEntry =
    !showWorkoutTimer &&
    ((taskTypeRaw === "workout" && effectiveRunOrWorkout === "workout") ||
      (taskTypeRaw === "run" && effectiveRunOrWorkout === "workout"));

  const photoCapture = usePhotoCapture({
    requireCameraOnly: config.require_camera_only === true,
    onError: showError,
  });
  const { photoUri, photoUrl, photoUploading } = photoCapture;
  const handleTakePhoto = useCallback(async () => {
    await photoCapture.handleTakePhoto();
    setPhotoCapturedAt(new Date().toISOString());
  }, [photoCapture]);
  const handlePickImage = useCallback(async () => {
    await photoCapture.handlePickImage();
    setPhotoCapturedAt(new Date().toISOString());
  }, [photoCapture]);
  const clearPhoto = useCallback(() => {
    photoCapture.clearPhoto();
    setPhotoCapturedAt(null);
  }, [photoCapture]);

  const { timerSeconds, isTimerRunning, onScreenSecondsRef, timerDisplay, progressFrac, timerOk, hardModeOk, toggleTimer, resetTimer } =
    useTaskTimer({
      requiredSeconds,
      isCountdown,
      isHardMode,
      // Timer auto-starts only after the user taps Start now (isArmed).
      // For non-TASK_START_ARMING builds, keep the legacy autoStart behaviour.
      autoStart: FLAGS.TASK_START_ARMING ? showWorkoutTimer && isArmed : showWorkoutTimer,
    });

  const wasTimerRunningRef = useRef(false);
  useEffect(() => {
    if (!taskId.trim() || !activeChallengeId.trim()) return;
    setActiveSession({
      taskId,
      taskName,
      taskType: taskTypeRaw,
      activeChallengeId,
      challengeName: headerChallengeName,
      startedAtMs: Date.now(),
      targetSeconds: requiredSeconds > 0 ? requiredSeconds : undefined,
      isTimerRunning: false,
    });
    return () => {
      clearActiveSession();
    };
  }, [
    taskId,
    activeChallengeId,
    taskName,
    taskTypeRaw,
    headerChallengeName,
    requiredSeconds,
    setActiveSession,
    clearActiveSession,
  ]);

  useEffect(() => {
    if (!showWorkoutTimer || requiredSeconds <= 0) {
      wasTimerRunningRef.current = false;
      return;
    }
    if (isTimerRunning && !wasTimerRunningRef.current) {
      wasTimerRunningRef.current = true;
      setActiveSession({
        taskId,
        taskName,
        taskType: taskTypeRaw,
        activeChallengeId,
        challengeName: headerChallengeName,
        startedAtMs: Date.now() - timerSeconds * 1000,
        targetSeconds: requiredSeconds,
        isTimerRunning: true,
      });
    }
    if (!isTimerRunning) {
      wasTimerRunningRef.current = false;
    }
  }, [
    showWorkoutTimer,
    requiredSeconds,
    isTimerRunning,
    timerSeconds,
    taskId,
    taskName,
    taskTypeRaw,
    activeChallengeId,
    headerChallengeName,
    setActiveSession,
  ]);

  // Lock-screen timer notification — starts when a timer task begins,
  // updates every 30s, and clears on unmount / pause / submit.
  // Mirrors the pattern in app/task/checkin.tsx (startSession) so timer
  // tasks going through the unified screen get the same lock-screen widget.
  useEffect(() => {
    // Only timer-based tasks get the lock screen widget.
    if (showWorkoutTimer && requiredSeconds > 0) {
      updateTimerRunning(isTimerRunning);
    }
    if (!showWorkoutTimer || requiredSeconds <= 0) {
      return;
    }
    // Only run while the timer is actually running.
    if (!isTimerRunning) {
      return;
    }
    // Build payload — route deep-links back to this task via the active-challenge screen,
    // since nothing pushes to TASK_CHECKIN/TASK_RUN anymore.
    const notifPayload: ActiveTaskTimerPayload = {
      taskId,
      taskTitle: taskName,
      timerType: "checkin",
      startedAtMs: Date.now() - timerSeconds * 1000,
      targetSeconds: isCountdown && requiredSeconds > 0 ? requiredSeconds : undefined,
      route: activeChallengeId ? ROUTES.CHALLENGE_ACTIVE(activeChallengeId) : ROUTES.TABS_HOME,
    };
    const liveActivityPayload: LiveActivityPayload = {
      ...notifPayload,
      challengeName: headerChallengeName,
    };
    startLiveActivity(liveActivityPayload);
    void startActiveTaskNotification(notifPayload);
    // Update every 30 seconds while running. Using a local counter ref to avoid
    // depending on timerSeconds in the effect deps (which would churn every second).
    const intervalId = setInterval(() => {
      const elapsed = Math.max(
        0,
        Math.floor((Date.now() - notifPayload.startedAtMs) / 1000)
      );
      void updateActiveTaskNotification(notifPayload, elapsed);
    }, 30000);
    return () => {
      clearInterval(intervalId);
      endLiveActivity();
      void clearActiveTaskNotification();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timerSeconds intentionally excluded; we derive elapsed from startedAtMs instead to avoid re-subscribing every second
  }, [showWorkoutTimer, requiredSeconds, isTimerRunning, taskId, taskName, isCountdown, activeChallengeId, updateTimerRunning]);

  const { journalText, handleJournalChange, wordCount, journalOk } = useJournalInput({
    minWords: config.min_words ?? 0,
    onError: showError,
  });
  const minWords = config.min_words ?? 0;

  const handleCheckLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showError("Allow location access to verify you are at the required location.");
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (err) {
      captureError(err, "TaskCompleteGetCurrentPosition");
      showError("Could not get your location. Please try again.");
    }
  }, [showError]);

  const journalPrompt = useMemo(
    () => getDailyPrompt(taskId, (config as TaskCompleteConfig).journal_prompt),
    [taskId, config]
  );
  const needsPhotoProof = config.require_photo === true || taskTypeRaw === "photo";
  /** Submit only after upload returns a URL (not just local uri). */
  const photoOk = !needsPhotoProof || !!photoUrl;
  const threshold = config.heart_rate_threshold ?? 100;
  const heartRateOk = !config.require_heart_rate || (heartRateData !== null && heartRateData.avg >= threshold);
  const distance = useMemo(() => {
    if (!userLocation || config.location_latitude == null || config.location_longitude == null) return null;
    return haversineDistance(config.location_latitude, config.location_longitude, userLocation.lat, userLocation.lng);
  }, [userLocation, config.location_latitude, config.location_longitude]);
  const radius = config.location_radius_meters ?? 200;
  const locationOk = !config.require_location || (distance !== null && distance <= radius);

  const runKm = parseFloat(runDistance.replace(",", "."));
  const runMin = parseInt(runDuration.trim(), 10);
  const runFormOk =
    !showRunEntry ||
    (isRunTimed && isHardMode
      ? timerOk && hardModeOk
      : isRunTimed && !isHardMode
        ? !Number.isNaN(runMin) && runMin >= minDurMinutes
        : !Number.isNaN(runKm) && runKm > 0 && !Number.isNaN(runMin) && runMin > 0);

  const workoutMinParsed = parseInt(workoutDuration.trim(), 10);
  const workoutOk =
    !showWorkoutEntry ||
    (!Number.isNaN(workoutMinParsed) &&
      workoutMinParsed >= 1 &&
      (minDurMinutes === 0 || workoutMinParsed >= minDurMinutes));

  const isPureManual =
    (taskTypeRaw === "manual" || taskTypeRaw === "simple") &&
    !config.require_photo &&
    !config.require_heart_rate &&
    !config.require_location;

  // Counter / water / reading — extract goal from config (with sensible fallbacks).
  const isCounterFamily = taskTypeRaw === "counter" || taskTypeRaw === "water" || taskTypeRaw === "reading";
  const counterGoal = useMemo<number>(() => {
    const c = config as Partial<{ daily_target: number; goal: number; cup_count: number; pages: number }>;
    if (typeof c.daily_target === "number" && c.daily_target > 0) return c.daily_target;
    if (typeof c.goal === "number" && c.goal > 0) return c.goal;
    if (taskTypeRaw === "water" && typeof c.cup_count === "number" && c.cup_count > 0) return c.cup_count;
    if (taskTypeRaw === "reading" && typeof c.pages === "number" && c.pages > 0) return c.pages;
    return taskTypeRaw === "water" ? 8 : taskTypeRaw === "reading" ? 10 : 1;
  }, [config, taskTypeRaw]);
  const counterOk = !isCounterFamily || counterValue >= counterGoal;

  const canSubmit = useMemo(() => {
    if (isHardVerificationTask && (!hardGatesPassed || timeWindowFailed)) return false;
    if (taskTypeRaw === "journal" && !journalOk) return false;
    if (showWorkoutTimer && requiredSeconds > 0) {
      if (!timerOk) return false;
      if (isHardMode && !hardModeOk) return false;
    }
    if (needsPhotoProof && !photoOk) return false;
    if (config.require_heart_rate && !heartRateOk) return false;
    if (config.require_location && !locationOk) return false;
    if (showRunEntry && !runFormOk) return false;
    if (showWorkoutEntry && !workoutOk) return false;
    if (isCounterFamily && !counterOk) return false;
    return true;
  }, [
    isHardVerificationTask,
    hardGatesPassed,
    timeWindowFailed,
    taskTypeRaw,
    journalOk,
    showWorkoutTimer,
    requiredSeconds,
    timerOk,
    hardModeOk,
    isHardMode,
    photoOk,
    heartRateOk,
    locationOk,
    needsPhotoProof,
    config.require_heart_rate,
    config.require_location,
    runFormOk,
    showRunEntry,
    showWorkoutEntry,
    workoutOk,
    isCounterFamily,
    counterOk,
  ]);

  // Full arm handler: requests permissions relevant to the task type, then sets isArmed.
  const handleArm = useCallback(async () => {
    // Camera permission — photo tasks and any task that requires photo proof.
    if (
      taskTypeRaw === "photo" ||
      (config.require_photo && taskTypeRaw !== "checkin")
    ) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showError("Allow camera access to take proof photos.");
        // Still arm — the shutter tap will prompt again if denied.
      }
    }

    // Location permission — checkin and location-gated tasks.
    // Note: checkin is currently gated off (FLAGS.LOCATION_CHECKIN_ENABLED = false).
    // setUserLocation is still in the suppression block (see BLOCKERS.md B-01).
    if (config.require_location || taskTypeRaw === "checkin") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showError("Allow location access to verify your position.");
      } else {
        // Kick off a location read so the gate has a reading by the time the user submits.
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
          (loc) => {
            // setUserLocation is suppressed (BLOCKERS.md B-01); log for now.
            void loc;
          }
        ).catch((err) => {
          captureError(err, "TaskCompleteArmLocation");
        });
      }
    }

    setIsArmed(true);
  }, [taskTypeRaw, config.require_photo, config.require_location, showError]);

  const handleSubmit = useCallback(async (taskMode: "full" | "minimum" = "full") => {
    if (!activeChallengeId || !taskId) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }
    if (taskMode === "minimum" && isChallengeHardMode) {
      showError("Hard mode challenges require full completion.");
      return;
    }
    if (taskMode === "full" && !canSubmit) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }
    // Record start time for the Verifying overlay 600 ms legibility floor.
    verifyStartMsRef.current = Date.now();
    const nowLabel = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setSubmitTimeLabel(nowLabel);
    setIsSubmitting(true);
    try {
      let noteTextOut: string | undefined;
      if (showWorkoutEntry) {
        const wm = parseInt(workoutDuration.trim(), 10);
        const parts = [`Workout: ${wm} min`];
        if (workoutKind) parts.push(workoutKind);
        if (workoutNotes.trim()) parts.push(workoutNotes.trim());
        noteTextOut = parts.join(" · ");
      } else if (taskTypeRaw === "run" && showRunEntry) {
        noteTextOut = `Run: ${runDistance.trim()} km in ${runDuration.trim()} min`;
      } else if (taskTypeRaw === "journal") {
        noteTextOut = journalText.trim();
      } else if (taskTypeRaw === "photo" && photoCaption.trim()) {
        noteTextOut = photoCaption.trim();
      }
      let valueOut: number | undefined;
      if (showWorkoutEntry) {
        valueOut = parseInt(workoutDuration.trim(), 10);
      } else if (taskTypeRaw === "timer" || (taskTypeRaw === "workout" && showWorkoutTimer)) {
        valueOut = Math.floor(timerSeconds / 60);
      } else if (taskTypeRaw === "run") {
        valueOut = isRunTimed && isHardMode ? Math.floor(timerSeconds / 60) : runMin;
      } else if (isCounterFamily) {
        valueOut = counterValue;
      } else {
        valueOut = undefined;
      }
      const timeLabel = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      const completionResult = await completeTask({
        activeChallengeId,
        taskId,
        noteText: noteTextOut,
        value: valueOut,
        proofUrl: photoUrl ?? undefined,
        photo_url: photoUrl ?? undefined,
        heart_rate_avg: heartRateData?.avg,
        heart_rate_peak: heartRateData?.peak,
        location_latitude: gatesLocation?.lat ?? userLocation?.lat,
        location_longitude: gatesLocation?.lng ?? userLocation?.lng,
        timer_seconds_on_screen: isHardMode ? onScreenSecondsRef.current : undefined,
        clocked_in_at: isHardVerificationTask ? (clockedInAtRef.current ?? new Date().toISOString()) : undefined,
        task_mode: taskMode,
      });
      setCompletionMeta({ taskId, details: noteTextOut?.trim() ?? "", timeLabel });
      // Capture server-returned streak count for the Secured screen chip.
      const resultStreakCount = (completionResult as { newStreakCount?: number } | null)?.newStreakCount;
      if (typeof resultStreakCount === "number") {
        setCompletedStreakCount(resultStreakCount);
      }
      setCompletionIdForShare(
        completionResult && typeof completionResult === "object" && "completionId" in completionResult
          ? (completionResult as { completionId?: string }).completionId
          : undefined
      );

      // Same progress source as AppContext canSecureDay: required tasks + completed check-ins.
      // Include this taskId so the condition reflects post-completion state (closure todayCheckins is pre-submit).
      const requiredTasks =
        (challenge?.challenge_tasks as { id: string; config?: { required?: boolean } }[] | undefined)?.filter(
          (t) => (t.config?.required ?? true) === true
        ) || [];
      const completedTaskIds = new Set(
        todayCheckins
          .filter((c) => c.status === "completed")
          .map((c) => c.task_id)
          .filter((id): id is string => typeof id === "string")
      );
      completedTaskIds.add(taskId);
      const verifiedCount = requiredTasks.filter((t) => completedTaskIds.has(t.id)).length;
      const totalRequired = requiredTasks.length;
      const progress = totalRequired > 0 ? (verifiedCount / totalRequired) * 100 : 0;
      const dayNowSecured = progress === 100 && totalRequired > 0;
      if (dayNowSecured) {
        try {
          const secureResult = await secureDayRef.current();
          const securedStreak = secureResult?.newStreakCount;
          if (typeof securedStreak === "number") {
            setCompletedStreakCount(securedStreak);
          }
        } catch (secureErr: unknown) {
          // Non-fatal: completion UI must still reach the Secured screen.
          captureError(secureErr, "TaskCompleteSecureDay");
        }
      }
      // Enforce 600 ms minimum for Verifying overlay legibility.
      const elapsed = Date.now() - verifyStartMsRef.current;
      const MIN_VERIFY_MS = 600;
      if (elapsed < MIN_VERIFY_MS) {
        await new Promise<void>((res) => setTimeout(res, MIN_VERIFY_MS - elapsed));
      }
      setSubmitted(true);
      try {
        trackEvent("proof_posted", {
          challenge_id: challengeIdForFeed || undefined,
          task_type: taskTypeRaw,
          has_photo: !!(photoUrl ?? photoUri),
        });
      } catch {
        /* non-fatal */
      }
      if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void clearActiveTaskNotification();
      clearActiveSession();

      const celebTitle = taskMode === "minimum" ? "Minimum day secured." : isHardMode ? "Hard mode earned." : "Secured.";
      showCelebration({
        title: celebTitle,
        subtitle: FLAGS.COMPLETION_REWARDS
          ? `+${taskMode === "minimum" ? 0 : isHardMode ? 8 : 5} points`
          : "",
        type: "goal",
      });

      if (FLAGS.COMPLETION_REWARDS && Math.random() < 0.3) {
        const rewards = [
          { label: "2x BONUS — double points!", color: DS_COLORS_V2.semantic.warning, bg: DS_COLORS_V2.semantic.warningSoft },
          { label: "Streak shield earned", color: DS_COLORS_V2.semantic.success, bg: DS_COLORS_V2.semantic.successSoft },
          { label: "Discipline badge progress +1", color: DS_COLORS_V2.difficulty.hard.fg, bg: DS_COLORS_V2.difficulty.hard.bg },
          { label: "Bonus: +3 extra points", color: DS_COLORS_V2.semantic.warning, bg: DS_COLORS_V2.semantic.warningSoft },
        ];
        setVariableReward(rewards[Math.floor(Math.random() * rewards.length)] ?? null);
      } else {
        setVariableReward(null);
      }
    } catch (err: unknown) {
      captureError(err, "TaskCompleteCompleteTask");
      showError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeChallengeId,
    taskId,
    canSubmit,
    completeTask,
    challenge,
    todayCheckins,
    taskTypeRaw,
    journalText,
    timerSeconds,
    photoUrl,
    heartRateData,
    userLocation,
    gatesLocation,
    isHardMode,
    isHardVerificationTask,
    showError,
    runDistance,
    runDuration,
    runMin,
    isRunTimed,
    showCelebration,
    showWorkoutEntry,
    showRunEntry,
    showWorkoutTimer,
    workoutDuration,
    workoutKind,
    workoutNotes,
    photoCaption,
    onScreenSecondsRef,
    clearActiveSession,
    isChallengeHardMode,
    isCounterFamily,
    counterValue,
  ]);

  const runManualComplete = useCallback(() => {
    if (manualSubmitScheduled.current || isSubmitting) return;
    manualSubmitScheduled.current = true;
    Animated.sequence([
      Animated.timing(manualScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(manualScale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => {
      void handleSubmit();
      manualSubmitScheduled.current = false;
    }, 300);
  }, [handleSubmit, isSubmitting, manualScale]);

  const handleMinimumDayConfirm = useCallback(() => {
    setMinimumConfirmVisible(false);
    void handleSubmit("minimum");
  }, [handleSubmit]);

  const challengeIdForFeed =
    (activeChallenge as { challenge_id?: string } | null)?.challenge_id ??
    (challenge as { id?: string } | null)?.id ??
    "";

  const handleShareToFeed = useCallback(async () => {
    setShareFeedErr("");
    if (!challengeIdForFeed) {
      setShareFeedErr("Could not link this completion to a challenge. Use Done to go home.");
      return;
    }
    setShareBusy(true);
    try {
      const proofForFeed =
        photoUrl && /^https?:\/\//i.test(photoUrl)
          ? photoUrl
          : photoUri && /^https?:\/\//i.test(photoUri)
            ? photoUri
            : undefined;
      await trpcMutate(TRPC.feed.shareCompletion, {
        challengeId: challengeIdForFeed,
        caption: postCaption.trim() || undefined,
        proofPhotoUrl: proofForFeed,
      });
      try {
        trackEvent("feed_posted", {
          challenge_id: challengeIdForFeed,
          has_photo: !!(proofForFeed ?? photoUri ?? photoUrl),
        });
      } catch {
        /* non-fatal */
      }
      setPostedInline(true);
      void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    } catch (e) {
      captureError(e, "TaskCompleteShareFeed");
      setShareFeedErr(e instanceof Error ? e.message : "Could not post to feed.");
    } finally {
      setShareBusy(false);
    }
  }, [challengeIdForFeed, postCaption, photoUrl, photoUri, queryClient]);

  const {
    isAllDayComplete,
    isChallengeCompleteShare,
    hasPhotoForShare,
    statementShareProps,
    transparentShareProps,
    proofShareProps,
    recapShareProps,
    completeShareProps,
    minimalShareProps,
  } = useTaskCompleteShareCardProps({
    submitted,
    computeProgress,
    stats,
    headerCurrentDay,
    headerDurationDays,
    challenge,
    activeChallenge,
    todayCheckins,
    activeChallengeId,
    taskId,
    completionMeta,
    headerChallengeName,
    taskName,
    photoUri,
    photoUrl,
    isHardMode,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // V2 body switch + TaskShell composition.
  //
  // The hook continues to own state (timer, photo, journal, run, workout,
  // counter, location). Each body component is purely controlled.
  // ─────────────────────────────────────────────────────────────────────────
  const counterVariant: CounterVariant = useMemo(() => {
    if (taskTypeRaw === "water") return "water";
    if (taskTypeRaw === "reading") return "reading";
    return "counter";
  }, [taskTypeRaw]);

  const counterUnits = useMemo(() => {
    if (counterVariant === "water") return { singular: "cup", plural: "cups" };
    if (counterVariant === "reading") return { singular: "page", plural: "pages" };
    return { singular: "unit", plural: "units" };
  }, [counterVariant]);

  const renderBody = useCallback(() => {
    // Ready state: show TaskReadyCard until the user taps Start.
    if (FLAGS.TASK_START_ARMING && !isArmed) {
      return (
        <TaskReadyCard
          taskTypeRaw={taskTypeRaw}
          config={config}
          counterGoal={isCounterFamily ? counterGoal : undefined}
          minWords={taskTypeRaw === "journal" ? minWords : undefined}
        />
      );
    }
    switch (taskTypeRaw) {
      case "photo":
        return (
          <TaskPhotoBody
            value={{ caption: photoCaption }}
            onChangeCaption={setPhotoCaption}
            photoUri={photoUri}
            photoUploading={photoUploading}
            capturedAt={photoCapturedAt ?? undefined}
            onTakePhoto={() => {
              void handleTakePhoto();
            }}
            onClearPhoto={clearPhoto}
            cameraOnly={config.require_camera_only === true}
          />
        );
      case "timer":
        return (
          <TaskTimerBody
            value={{ sound: timerSound }}
            onChangeSound={setTimerSound}
            timerDisplay={timerDisplay}
            progressFrac={progressFrac}
            totalLabel={
              requiredSeconds > 0
                ? `of ${Math.floor(requiredSeconds / 60)}:${String(requiredSeconds % 60).padStart(2, "0")}`
                : "open-ended"
            }
            isRunning={isTimerRunning}
            isComplete={timerOk}
            onTogglePlay={toggleTimer}
            onReset={resetTimer}
          />
        );
      case "run":
        return (
          <TaskRunBody
            value={{
              distanceKm: parseFloat(runDistance.replace(",", ".")) || 0,
              elapsedSeconds: timerSeconds,
            }}
            goalKm={
              typeof (config as { goal_km?: number }).goal_km === "number"
                ? (config as { goal_km?: number }).goal_km
                : undefined
            }
            goalMinutes={minDurMinutes > 0 ? minDurMinutes : undefined}
            isRunning={isTimerRunning}
            hasGps={false}
            onTogglePlay={isRunTimed ? toggleTimer : undefined}
            manualInput={{
              distance: runDistance,
              onChangeDistance: setRunDistance,
              duration: runDuration,
              onChangeDuration: setRunDuration,
            }}
          />
        );
      case "workout":
        return (
          <TaskWorkoutBody
            mode="simple"
            kind={workoutKind}
            onChangeKind={setWorkoutKind}
            durationMinutes={workoutDuration}
            onChangeDurationMinutes={setWorkoutDuration}
            notes={workoutNotes}
            onChangeNotes={setWorkoutNotes}
            kinds={WORKOUT_KINDS}
            minMinutes={minDurMinutes}
          />
        );
      case "journal":
        return (
          <TaskJournalBody
            value={{ text: journalText }}
            onChangeText={handleJournalChange}
            prompt={journalPrompt}
            wordCount={wordCount}
            minWords={minWords}
            showTagChips={FLAGS.JOURNAL_TAGS}
          />
        );
      case "counter":
      case "water":
      case "reading":
        return (
          <TaskCounterBody
            variant={counterVariant}
            value={{
              count: counterValue,
              bookTitle,
              remindersEnabled,
            }}
            onChangeCount={setCounterValue}
            onChangeBookTitle={setBookTitle}
            onToggleReminders={setRemindersEnabled}
            onAddPagePhoto={
              counterVariant === "reading"
                ? () => {
                    void handleTakePhoto();
                  }
                : undefined
            }
            goal={counterGoal}
            unitSingular={counterUnits.singular}
            unitPlural={counterUnits.plural}
          />
        );
      case "checkin":
        return (
          <TaskCheckinBody
            value={{ inRange: locationOk }}
            locationName={config.location_name ?? "Saved location"}
            distanceMeters={distance ?? undefined}
            requiredStayMinutes={(config as { required_stay_minutes?: number }).required_stay_minutes ?? 0}
            hasGps={!!userLocation}
          />
        );
      case "manual":
      case "simple":
      default:
        return <TaskSimpleBody value={{ done: false }} taskName={taskName} />;
    }
  }, [
    isArmed,
    taskTypeRaw,
    config,
    isCounterFamily,
    counterGoal,
    minWords,
    photoCaption,
    photoUri,
    photoUploading,
    photoCapturedAt,
    handleTakePhoto,
    clearPhoto,
    config,
    timerSound,
    timerDisplay,
    progressFrac,
    requiredSeconds,
    isTimerRunning,
    timerOk,
    toggleTimer,
    resetTimer,
    runDistance,
    runDuration,
    setRunDistance,
    setRunDuration,
    isRunTimed,
    toggleTimer,
    timerSeconds,
    minDurMinutes,
    workoutKind,
    workoutDuration,
    workoutNotes,
    journalText,
    handleJournalChange,
    journalPrompt,
    wordCount,
    minWords,
    counterVariant,
    counterValue,
    counterGoal,
    counterUnits,
    bookTitle,
    remindersEnabled,
    locationOk,
    distance,
    userLocation,
    taskName,
  ]);

  // Verification gates payload for TaskShell.
  const shellGates: TaskShellGates | undefined = useMemo(() => {
    if (!isHardVerificationTask) return undefined;
    const detail = (() => {
      const start = config.schedule_window_start;
      const end = config.schedule_window_end;
      if (start && end) return `Open ${start} – ${end}`;
      return "Active now";
    })();
    return {
      timeWindow: {
        status: timeWindowFailed ? "fail" : hardGatesPassed ? "pass" : "pending",
        detail,
      },
      cameraOnly: config.require_camera_only === true,
      requireLocation: config.require_location === true,
    };
  }, [
    isHardVerificationTask,
    config.schedule_window_start,
    config.schedule_window_end,
    config.require_camera_only,
    config.require_location,
    timeWindowFailed,
    hardGatesPassed,
  ]);

  // Verifying overlay rows (honest-cut: only gates evaluated for this task type).
  const verifyingRows = useMemo(
    () =>
      buildVerifyingRows({
        hasTimeWindow: !!(config.schedule_window_start && config.schedule_window_end),
        submitTimeLabel,
        hasCameraOnly: !!config.require_camera_only,
        hasLocation: !!config.require_location,
      }),
    [
      config.schedule_window_start,
      config.schedule_window_end,
      config.require_camera_only,
      config.require_location,
      submitTimeLabel,
    ]
  );
  const typeSuccessLine = getTypeSuccessLine(taskTypeRaw);
  // active challenge, excluding the missed task itself.
  const otherTasksToday = useMemo(() => {
    const tasks =
      ((challenge as { challenge_tasks?: { id: string; title?: string | null; type?: string; require_photo_proof?: boolean }[] } | null)?.challenge_tasks ?? []);
    const checkinsArr = todayCheckins as { task_id?: string }[] | undefined;
    return tasks
      .filter((t) => t.id !== taskId)
      .filter((t) => !(checkinsArr ?? []).some((c) => c.task_id === t.id))
      .map((t) => ({
        id: t.id,
        name: t.title ?? "Untitled task",
        proofType: t.require_photo_proof ? "Photo proof" : "Self-report",
        remainingHint: "until midnight",
        onPress: () => {
          if (!activeChallengeId) return;
          router.push(ROUTES.CHALLENGE_ACTIVE(activeChallengeId) as never);
        },
      }));
  }, [challenge, todayCheckins, taskId, activeChallengeId, router]);

  const handleSetAlarm = useCallback(async () => {
    try {
      const perm = await Notifications.getPermissionsAsync();
      if (perm.status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== "granted") {
          showError("Allow notifications to set tomorrow's alarm.");
          return;
        }
      }
      const winStart = config.schedule_window_start;
      const trigger = new Date();
      trigger.setDate(trigger.getDate() + 1);
      if (winStart && /^\d{1,2}:\d{2}$/.test(winStart)) {
        const [hRaw, mRaw] = winStart.split(":");
        const h = parseInt(hRaw ?? "0", 10);
        const m = parseInt(mRaw ?? "0", 10);
        trigger.setHours(h, m, 0, 0);
      } else {
        trigger.setHours(7, 0, 0, 0);
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${taskName} — window opens soon`,
          body: `Tap to start before ${config.schedule_window_end ?? "the deadline"}.`,
          data: { type: "task_window_alarm", taskId, activeChallengeId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      });
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      captureError(e, "TaskCompleteSetAlarm");
      showError("Could not schedule alarm. Try again.");
    }
  }, [
    config.schedule_window_start,
    config.schedule_window_end,
    taskName,
    taskId,
    activeChallengeId,
    showError,
  ]);

  // Missed-task state — fires when hard-mode time window failed.
  const shellMissedState: TaskShellMissedState | undefined = useMemo(() => {
    if (!timeWindowFailed) return undefined;
    return {
      reason: "time_window",
      detail:
        config.schedule_window_end
          ? `Window closed at ${config.schedule_window_end}`
          : "Window closed",
      currentStreak:
        ((stats as { currentStreak?: number; current_streak?: number } | null)?.currentStreak ??
          (stats as { current_streak?: number } | null)?.current_streak ??
          0),
      otherTasks: otherTasksToday,
      nextWindow: config.schedule_window_start ? `Tomorrow at ${config.schedule_window_start}` : undefined,
      onSetAlarm: () => {
        void handleSetAlarm();
      },
      onPressDoOtherTasks: () => {
        if (activeChallengeId) {
          router.push(ROUTES.CHALLENGE_ACTIVE(activeChallengeId) as never);
        } else {
          goBackOrHome(router);
        }
      },
    };
  }, [
    timeWindowFailed,
    config.schedule_window_end,
    config.schedule_window_start,
    stats,
    activeChallengeId,
    router,
    otherTasksToday,
    handleSetAlarm,
  ]);

  // Primary CTA state-driven label.
  const primaryCta = useMemo(() => {
    // ── Ready state: shown before user taps Start ───────────────────────────
    if (FLAGS.TASK_START_ARMING && !isArmed) {
      let readyLabel = "Start";
      if (taskTypeRaw === "journal") readyLabel = "Start writing";
      else if (taskTypeRaw === "timer") readyLabel = "Start now";
      return {
        label: readyLabel,
        onPress: () => void handleArm(),
        disabled: false,
        disabledReason: undefined,
        loading: false,
      };
    }

    // ── Do-state: storyboard CTA label table ─────────────────────────────────
    let label = "Mark complete";
    let disabledReason: string | undefined;
    if (taskTypeRaw === "manual" || taskTypeRaw === "simple") {
      label = "Mark done";
    } else if (taskTypeRaw === "photo") {
      label = "Submit proof";
      if (!photoOk) disabledReason = "Take photo to submit";
    } else if (taskTypeRaw === "timer") {
      if (timerOk && needsPhotoProof && !photoOk) {
        label = "I'm done — capture";
        disabledReason = "Take photo to complete";
      } else if (timerOk) {
        label = "Complete";
      } else {
        label = "Finish early";
        if (isHardMode) disabledReason = "Stay on screen until done";
      }
    } else if (taskTypeRaw === "run") {
      label = "Continue";
      if (!runFormOk) disabledReason = "Add distance & time";
    } else if (taskTypeRaw === "workout") {
      label = "Finish session";
      if (!workoutOk) disabledReason = `Need at least ${Math.max(1, minDurMinutes)} min`;
    } else if (taskTypeRaw === "journal") {
      // "Start writing" is the only CTA — arms when unarmed (handled above); saves when gate met.
      label = "Start writing";
      if (!journalOk) {
        const gap = Math.max(0, minWords - wordCount);
        if (gap > 0) disabledReason = `${gap} more word${gap === 1 ? "" : "s"} to go`;
      }
    } else if (isCounterFamily) {
      label = "Mark today complete";
      if (!counterOk) disabledReason = `${Math.max(0, counterGoal - counterValue)} more to go`;
    } else if (taskTypeRaw === "checkin") {
      label = "Confirm check-in";
      if (!locationOk) {
        const meters = distance != null ? `${Math.round(distance)} m away` : "Locating…";
        disabledReason = `Get closer to check in (${meters})`;
      }
    }
    return {
      label,
      onPress: () => void handleSubmit(),
      disabled: !canSubmit,
      disabledReason,
      loading: isSubmitting,
    };
  }, [
    isArmed,
    handleArm,
    taskTypeRaw,
    needsPhotoProof,
    photoOk,
    timerOk,
    isHardMode,
    runFormOk,
    workoutOk,
    minDurMinutes,
    journalOk,
    minWords,
    wordCount,
    isCounterFamily,
    counterOk,
    counterGoal,
    counterValue,
    locationOk,
    distance,
    canSubmit,
    isSubmitting,
    handleSubmit,
  ]);

  // Suppress unused warnings for legacy state retained for future migration.
  void error;
  void clearError;
  void hardVerificationConfig;
  void onHardGatesResolved;
  void onHardTimeWindowFailed;
  void runManualComplete;
  void manualScale;
  void runDistanceKm;
  void runDurationMin;
  void runKm;
  void heartRateData;
  void setHeartRateData;
  void heartRateManual;
  void setHeartRateManual;
  void threshold;
  void heartRateOk;
  void setUserLocation;
  void radius;
  void handleCheckLocation;
  void handlePickImage;
  void isPureManual;
  void isChallengeHardMode;
  void setMinimumConfirmVisible;

  if (!taskId.trim() || !activeChallengeId.trim()) {
    if (!paramsReady) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS_V2.surface.canvas }]} edges={["bottom"]}>
          <Stack.Screen options={{ title: "Loading…", headerBackVisible: true }} />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={GRIIT_COLORS.primary} accessibilityLabel="Loading task" />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS_V2.surface.canvas }]} edges={["bottom"]}>
        <Stack.Screen options={{ title: "Task", headerBackVisible: true }} />
        <View style={{ padding: DS_SPACING.xl }}>
          <Text style={styles.screenTitle}>Couldn&apos;t open this task</Text>
          <Text style={styles.muted}>Go back and tap Start again from Home.</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: DS_SPACING.lg }]}
            onPress={() => goBackOrHome(router)}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.primaryBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <TaskCompleteCelebration
        taskName={taskName}
        taskTypeRaw={taskTypeRaw}
        streakCount={completedStreakCount}
        isHardMode={isHardMode}
        variableReward={variableReward}
        postedInline={postedInline}
        postCaption={postCaption}
        setPostCaption={setPostCaption}
        shareFeedErr={shareFeedErr}
        photoUrl={photoUrl}
        photoUri={photoUri}
        photoUploading={photoUploading}
        handleTakePhoto={handleTakePhoto}
        handlePickImage={handlePickImage}
        clearPhoto={clearPhoto}
        handleShareToFeed={handleShareToFeed}
        shareBusy={shareBusy}
        showShareSheet={showShareSheet}
        setShowShareSheet={setShowShareSheet}
        onDone={() => goBackOrHome(router)}
        shareRef={shareRef}
        transparentCardRef={transparentCardRef}
        proofCardRef={proofCardRef}
        recapCardRef={recapCardRef}
        completeCardRef={completeCardRef}
        minimalStreakCardRef={minimalStreakCardRef}
        completionIdForShare={completionIdForShare}
        hasPhotoForShare={hasPhotoForShare}
        isAllDayComplete={isAllDayComplete}
        isChallengeCompleteShare={isChallengeCompleteShare}
        statementShareProps={statementShareProps}
        transparentShareProps={transparentShareProps}
        proofShareProps={proofShareProps}
        recapShareProps={recapShareProps}
        completeShareProps={completeShareProps}
        minimalShareProps={minimalShareProps}
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TaskShell
        challengeName={headerChallengeName}
        dayNumber={headerCurrentDay}
        taskName={taskName}
        hardMode={isHardVerificationTask}
        verificationGates={shellGates}
        onBack={() => goBackOrHome(router)}
        primaryCta={primaryCta}
        secondaryCta={
          (taskTypeRaw === "simple" || taskTypeRaw === "manual") && isArmed
            ? {
                label: "Not yet",
                onPress: () => goBackOrHome(router),
              }
            : undefined
        }
        missedState={shellMissedState}
        inlineError={error || null}
        onDismissInlineError={clearError}
      >
        {renderBody()}
      </TaskShell>
      <VerifyingOverlay
        visible={isSubmitting}
        rows={verifyingRows}
        typeSuccessLine={typeSuccessLine}
      />
      <ConfirmDialog
        visible={minimumConfirmVisible}
        title="Mark minimum day?"
        message="Can't do the full task today? This keeps your streak alive, but does not grant full-task rewards."
        confirmLabel="Mark minimum day"
        onCancel={() => setMinimumConfirmVisible(false)}
        onConfirm={handleMinimumDayConfirm}
      />
    </>
  );
}
