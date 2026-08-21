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
import { challengeDayNumber } from "@/lib/challenge-day";
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
import { useCounterProgress } from "@/hooks/useCounterProgress";
import { useTaskCompleteShareCardProps } from "@/hooks/useTaskCompleteShareCardProps";
import { TaskCompleteCelebration } from "@/components/task/TaskCompleteCelebration";
import { SecuredScreen } from "@/components/task/SecuredScreen";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TaskShell, type TaskShellGates, type TaskShellMissedState } from "@/components/task/TaskShell";
import { TaskSimpleBody } from "@/components/task/bodies/TaskSimpleBody";
import { TaskTimerBody, type TimerSound } from "@/components/task/bodies/TaskTimerBody";
import { TaskJournalBody } from "@/components/task/bodies/TaskJournalBody";
import { TaskCounterBody, type CounterVariant } from "@/components/task/bodies/TaskCounterBody";
import { TaskCheckinBody } from "@/components/task/bodies/TaskCheckinBody";
import { TaskReadyCard } from "@/components/task/bodies/TaskReadyCard";
import { TaskPhotoReadyBody } from "@/components/task/bodies/TaskPhotoReadyBody";
import { TaskPhotoCaptureBody } from "@/components/task/bodies/TaskPhotoCaptureBody";
import { TaskPhotoCaptionBody } from "@/components/task/bodies/TaskPhotoCaptionBody";
import { TaskRunReadyBody } from "@/components/task/bodies/TaskRunReadyBody";
import { TaskRunLogBody } from "@/components/task/bodies/TaskRunLogBody";
import { TaskRunCaptureBody } from "@/components/task/bodies/TaskRunCaptureBody";
import { TaskWorkoutReadyBody } from "@/components/task/bodies/TaskWorkoutReadyBody";
import { TaskWorkoutSessionBody } from "@/components/task/bodies/TaskWorkoutSessionBody";
import { TaskWorkoutCaptureBody } from "@/components/task/bodies/TaskWorkoutCaptureBody";
import { TaskJournalReadyBody } from "@/components/task/bodies/TaskJournalReadyBody";
import { TaskCounterReadyBody } from "@/components/task/bodies/TaskCounterReadyBody";
import { TaskCheckinReadyBody } from "@/components/task/bodies/TaskCheckinReadyBody";
import { PHOTO_READY_SUBTYPE } from "@/lib/photo-ready-gates";
import { resolveRunReadySubtype } from "@/lib/run-ready-gates";
import { resolveWorkoutReadySubtype } from "@/lib/workout-ready-gates";
import { resolveJournalReadySubtype } from "@/lib/journal-ready-gates";
import { resolveCounterReadySubtype } from "@/lib/counter-ready-gates";
import { resolveCheckinReadySubtype, resolveCheckinRadiusMeters } from "@/lib/checkin-ready-gates";
import { clampPhotoCaption } from "@/lib/photo-caption";
import { evaluateScheduleWindow } from "@/lib/schedule-window";
import {
  resolveConfigCounterTarget,
  taskHasRealVerificationGates,
} from "@/lib/real-verification-gates";
import { decideReadyStart } from "@/lib/ready-start";
import { formatRunSecuredMeta } from "@/lib/run-log";
import { formatWorkoutSecuredMeta } from "@/lib/workout-log";
import { formatJournalSecuredMeta } from "@/lib/journal-log";
import { formatCounterSecuredMeta } from "@/lib/counter-log";
import { formatCheckinSecuredMeta } from "@/lib/checkin-log";
import {
  formatSimpleSecuredMeta,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_NOT_YET,
  SIMPLE_READY_SUBTYPE,
} from "@/lib/simple-log";
import {
  buildIncompleteRequired,
  isNotAllRequiredError,
  type DaySecureUi,
} from "@/lib/day-secure-ui";
import { useScheduleWindowNow } from "@/hooks/useScheduleWindowNow";
import {
  VerifyingProof,
  type VerifyingProofRow,
} from "@/components/task/VerifyingProof";
import * as ImagePicker from "expo-image-picker";
import { FLAGS } from "@/lib/feature-flags";
import {
  firstString,
  parseConfig,
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
  const {
    activeChallenge,
    completeTask,
    secureDay,
    challenge,
    stats,
    computeProgress,
    todayCheckins,
    profile,
  } = useApp();
  const profileTimezone =
    (profile as { timezone?: string | null } | null)?.timezone ?? null;
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
  const [locationAccuracyM, setLocationAccuracyM] = useState<number | undefined>(undefined);
  /** Check-in permission deny — quiet CTA + helper; no Alert. */
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  /** At most one misconfig warn per taskId (avoid Sentry spam). */
  const locationConfigWarnTaskIdRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Photo/Run/Workout/Journal/Counter/Check-in · Verifying — server rows only. */
  const [showPhotoVerifying, setShowPhotoVerifying] = useState(false);
  const [photoVerifyRows, setPhotoVerifyRows] = useState<VerifyingProofRow[]>([]);
  const [photoVerifyError, setPhotoVerifyError] = useState<string | null>(null);
  const [minimumConfirmVisible, setMinimumConfirmVisible] = useState(false);
  const [paramsReady, setParamsReady] = useState(false);
  const manualScale = useRef(new Animated.Value(1)).current;
  const runDistanceKm = useRef("0.0");
  const runDurationMin = useRef("0");
  const [runDistance, setRunDistance] = useState("");
  const [runDuration, setRunDuration] = useState("");
  /** Run log entry path — "timer" once in-app timer is used; else "hand". */
  const [runEntryMode, setRunEntryMode] = useState<"hand" | "timer">("hand");
  /** Run middle phase after Start: Log → optional Capture. */
  const [runPhase, setRunPhase] = useState<"log" | "capture">("log");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutKind, setWorkoutKind] = useState<string>(WORKOUT_KINDS[0] ?? "Strength");
  const [workoutNotes, setWorkoutNotes] = useState("");
  /** Workout middle phase: Session → optional Capture. */
  const [workoutPhase, setWorkoutPhase] = useState<"session" | "capture">("session");
  /** Floored workouts use timer; no-floor uses typed duration. */
  const [workoutEntryMode, setWorkoutEntryMode] = useState<"hand" | "timer">("hand");
  const [photoCaption, setPhotoCaption] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [postedInline, setPostedInline] = useState(false);
  const manualSubmitScheduled = useRef(false);
  const clockedInAtRef = useRef<string | null>(null);
  /** Timestamp (ms) when the submit mutation started — used for settle floors. */
  const verifyStartMsRef = useRef<number>(0);
  /** Streak count for legacy TaskCompleteCelebration only — set only when day secure succeeds. */
  const [completedStreakCount, setCompletedStreakCount] = useState<number | undefined>(undefined);
  /** Day-secure outcome for SecuredScreen — never invent a streak on failure. */
  const [daySecureUi, setDaySecureUi] = useState<DaySecureUi>({ kind: "not_attempted" });
  const [secureDayRetrying, setSecureDayRetrying] = useState(false);
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
  // V2 body-component local state (timer sound; counter count via useCounterProgress)
  const [timerSound, setTimerSound] = useState<TimerSound>("silent");
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

  // Photo task type is always camera-only in this flow (library unreachable).
  const photoCapture = usePhotoCapture({
    requireCameraOnly: config.require_camera_only === true || taskTypeRaw === "photo",
    onError: showError,
  });
  const { photoUri, photoUrl, photoUploading, captureMeta } = photoCapture;
  const handleTakePhoto = useCallback(async () => {
    await photoCapture.handleTakePhoto();
  }, [photoCapture]);
  const handlePickImage = useCallback(async () => {
    await photoCapture.handlePickImage();
  }, [photoCapture]);
  const clearPhoto = useCallback(() => {
    photoCapture.clearPhoto();
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
    // Build payload — deep-link back to this task via the active-challenge screen.
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

  const minWords = config.min_words ?? 0;
  const {
    journalText,
    handleJournalChange,
    wordCount,
    journalOk,
    clearDraft: clearJournalDraft,
  } = useJournalInput({
    minWords,
    onError: showError,
    draftScope:
      taskTypeRaw === "journal" && activeChallengeId && taskId
        ? {
            activeChallengeId,
            taskId,
            scheduleTimezone: config.schedule_timezone,
            profileTimezone,
          }
        : null,
  });

  const handleCheckLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationPermissionDenied(true);
      if (taskTypeRaw !== "checkin") {
        showError("Allow location access to verify you are at the required location.");
      }
      return;
    }
    setLocationPermissionDenied(false);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      if (typeof loc.coords.accuracy === "number") {
        setLocationAccuracyM(loc.coords.accuracy);
      }
    } catch (err) {
      captureError(err, "TaskCompleteGetCurrentPosition");
      showError("Could not get your location. Please try again.");
    }
  }, [showError, taskTypeRaw]);

  // Real config only — never fabricate a daily prompt for the Write card.
  const journalPrompt =
    typeof (config as TaskCompleteConfig).journal_prompt === "string"
      ? (config as TaskCompleteConfig).journal_prompt!.trim()
      : "";
  const needsPhotoProof = config.require_photo === true || taskTypeRaw === "photo";
  /** Submit only after upload returns a URL (not just local uri). */
  const photoOk = !needsPhotoProof || !!photoUrl;
  const threshold = config.heart_rate_threshold ?? 100;
  const heartRateOk = !config.require_heart_rate || (heartRateData !== null && heartRateData.avg >= threshold);
  /** Location gate only when a verifiable target exists (both coords numeric). */
  const hasLocationTarget =
    typeof config.location_latitude === "number" &&
    typeof config.location_longitude === "number";
  const needsLocation = hasLocationTarget;
  // Misconfigured: flag set without coords — warn once per taskId, do not block.
  useEffect(() => {
    if (config.require_location === true && !hasLocationTarget) {
      if (locationConfigWarnTaskIdRef.current === taskId) return;
      locationConfigWarnTaskIdRef.current = taskId;
      captureError(
        new Error("require_location true without location_latitude/longitude"),
        { context: "TaskCompleteLocationConfig", taskId }
      );
    }
  }, [config.require_location, hasLocationTarget, taskId]);
  const distance = useMemo(() => {
    if (!userLocation || config.location_latitude == null || config.location_longitude == null) return null;
    return haversineDistance(config.location_latitude, config.location_longitude, userLocation.lat, userLocation.lng);
  }, [userLocation, config.location_latitude, config.location_longitude]);
  const radius = resolveCheckinRadiusMeters(config.location_radius_meters);
  const locationOk = !needsLocation || (distance !== null && distance <= radius);

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
  /** Simple/manual self-report Ask — no Ready arming, no verifying fiction. */
  const isSimpleAsk = isPureManual;

  // Counter / water / reading — extract goal from config (with sensible fallbacks).
  const isCounterFamily = taskTypeRaw === "counter" || taskTypeRaw === "water" || taskTypeRaw === "reading";
  /** Overlay only when this instance has a real check — not by task type. */
  const hasRealVerificationGates = taskHasRealVerificationGates({
    schedule_window_start: config.schedule_window_start,
    schedule_window_end: config.schedule_window_end,
    require_camera_only: config.require_camera_only,
    location_latitude: config.location_latitude,
    location_longitude: config.location_longitude,
    min_words: minWords,
    counter_target: isCounterFamily ? resolveConfigCounterTarget(config) : 0,
  });
  const counterGoal = useMemo<number>(() => {
    const c = config;
    const candidates = [
      c.daily_target,
      c.goal,
      c.target_value,
      c.target_count,
      c.target_pages,
      c.cup_count,
      c.pages,
    ];
    for (const n of candidates) {
      if (typeof n === "number" && n > 0) return n;
    }
    return taskTypeRaw === "water" ? 8 : taskTypeRaw === "reading" ? 10 : 1;
  }, [config, taskTypeRaw]);
  // Hydration: server pending value wins (file:line cited in consolidated report).
  const counterHydratedValue = useMemo(() => {
    if (!isCounterFamily || !taskId) return 0;
    const row = todayCheckins.find(
      (c) =>
        c.task_id === taskId &&
        (c.status === "pending" || c.status === "completed")
    ) as { value?: number | null; status?: string } | undefined;
    if (!row || typeof row.value !== "number" || !Number.isFinite(row.value)) {
      return 0;
    }
    return Math.max(0, Math.round(row.value));
  }, [isCounterFamily, taskId, todayCheckins]);
  const {
    count: counterValue,
    setCountOptimistic: setCounterValue,
    notSavedYet: counterNotSavedYet,
    flush: flushCounterProgress,
  } = useCounterProgress({
    activeChallengeId,
    taskId,
    enabled: isCounterFamily && !!activeChallengeId && !!taskId,
    initialValue: counterHydratedValue,
  });
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
    if (needsLocation && (!locationOk || locationPermissionDenied)) return false;
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
    needsLocation,
    locationPermissionDenied,
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

    // Location permission — checkin and location-gated tasks (B-01: write GPS into state).
    if (needsLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationPermissionDenied(true);
        // Check-in: quiet CTA + helper only — no Alert / no error banner.
        if (taskTypeRaw !== "checkin") {
          showError("Allow location access to verify your position.");
        }
      } else {
        setLocationPermissionDenied(false);
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
          if (typeof loc.coords.accuracy === "number") {
            setLocationAccuracyM(loc.coords.accuracy);
          }
        } catch (err) {
          captureError(err, "TaskCompleteArmLocation");
        }
      }
    }

    if (taskTypeRaw === "run") setRunPhase("log");
    if (taskTypeRaw === "workout") {
      setWorkoutPhase("session");
      setWorkoutEntryMode(minDurMinutes > 0 ? "timer" : "hand");
    }
    setIsArmed(true);
  }, [
    taskTypeRaw,
    config.require_photo,
    needsLocation,
    showError,
    minDurMinutes,
  ]);

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
    // Record start time for brief submit settle (timer) / verifying settle (gated types).
    verifyStartMsRef.current = Date.now();
    const isPhotoSubmit = taskTypeRaw === "photo";
    const isRunSubmit = taskTypeRaw === "run";
    const isWorkoutSubmit = taskTypeRaw === "workout";
    const isJournalSubmit = taskTypeRaw === "journal";
    const isCounterSubmit = isCounterFamily;
    const isCheckinSubmit = taskTypeRaw === "checkin";
    const isSimpleSubmit = isSimpleAsk;
    const isGatedProofType =
      isPhotoSubmit ||
      isRunSubmit ||
      isWorkoutSubmit ||
      isJournalSubmit ||
      isCounterSubmit ||
      isCheckinSubmit;
    // Instance-based: overlay only when this task has a real gate.
    // Simple: never open VerifyingProof — self-report lands on Secured.
    const usesServerVerifying = isGatedProofType && hasRealVerificationGates;
    if (usesServerVerifying) {
      setShowPhotoVerifying(true);
      setPhotoVerifyRows([]);
      setPhotoVerifyError(null);
    }
    setIsSubmitting(true);
    try {
      if (isCounterFamily) {
        try {
          await flushCounterProgress();
        } catch {
          /* non-fatal — complete still sends absolute value */
        }
      }
      const workoutDurationMin = isWorkoutSubmit
        ? showWorkoutTimer
          ? Math.floor(timerSeconds / 60)
          : parseInt(workoutDuration.trim(), 10)
        : NaN;
      let noteTextOut: string | undefined;
      if (isWorkoutSubmit && Number.isFinite(workoutDurationMin) && workoutDurationMin >= 1) {
        const parts = [`Workout: ${workoutDurationMin} min`];
        if (workoutKind) parts.push(workoutKind);
        if (workoutNotes.trim()) parts.push(workoutNotes.trim());
        noteTextOut = parts.join(" · ");
      } else if (taskTypeRaw === "run") {
        noteTextOut = `Run: ${runDistance.trim()} km in ${runDuration.trim()} min`;
      } else if (taskTypeRaw === "journal") {
        noteTextOut = journalText.trim();
      } else if (taskTypeRaw === "photo" && photoCaption.trim()) {
        noteTextOut = photoCaption.trim();
      }
      let valueOut: number | undefined;
      if (isWorkoutSubmit && Number.isFinite(workoutDurationMin) && workoutDurationMin >= 1) {
        valueOut = workoutDurationMin;
      } else if (taskTypeRaw === "timer") {
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
        proof_payload_json:
          (taskTypeRaw === "photo" ||
            taskTypeRaw === "run" ||
            taskTypeRaw === "workout") &&
          captureMeta
            ? {
                capturedAt: captureMeta.capturedAt,
                captured_in_app: captureMeta.captured_in_app,
              }
            : undefined,
        distance_km:
          isRunSubmit && Number.isFinite(runKm) && runKm > 0 ? runKm : undefined,
        duration_min: isRunSubmit
          ? Number.isFinite(runMin) && runMin > 0
            ? runMin
            : undefined
          : isWorkoutSubmit &&
              Number.isFinite(workoutDurationMin) &&
              workoutDurationMin >= 1
            ? workoutDurationMin
            : undefined,
        entry_mode: isRunSubmit
          ? runEntryMode
          : isWorkoutSubmit
            ? workoutEntryMode
            : undefined,
        workout_kind:
          isWorkoutSubmit && workoutKind.trim() ? workoutKind.trim() : undefined,
        floor_min: isWorkoutSubmit
          ? minDurMinutes > 0
            ? minDurMinutes
            : null
          : isJournalSubmit
            ? minWords > 0
              ? minWords
              : null
            : undefined,
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

      if (usesServerVerifying) {
        const serverRows =
          completionResult &&
          typeof completionResult === "object" &&
          "verification" in completionResult
            ? (completionResult as {
                verification?: { rows: { label: string; verified: boolean }[] };
              }).verification?.rows
            : undefined;
        setPhotoVerifyRows(
          (serverRows ?? []).map((r) => ({
            label: r.label,
            verified: r.verified,
          }))
        );
      }

      // Same progress source as AppContext canSecureDay: required tasks + completed check-ins.
      // Include this taskId so the condition reflects post-completion state (closure todayCheckins is pre-submit).
      const requiredTasks =
        (
          challenge?.challenge_tasks as
            | { id: string; title?: string | null; config?: { required?: boolean } }[]
            | undefined
        )?.filter((t) => (t.config?.required ?? true) === true) || [];
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
        // Capture before secureDay — RPC increments current_day; void
        // fetchActiveChallenge may or may not have landed by render time.
        const dayNumberBeforeSecure = challengeDayNumber(
          (activeChallenge as { current_day?: number } | null)?.current_day ??
            headerCurrentDay
        );
        try {
          const secureResult = await secureDayRef.current();
          const securedStreak = secureResult?.newStreakCount;
          if (typeof securedStreak === "number") {
            setCompletedStreakCount(securedStreak);
            setDaySecureUi({
              kind: "secured",
              streakCount: securedStreak,
              dayNumber: dayNumberBeforeSecure,
            });
          } else {
            // Soft-skip (!canSecureDay) — treat as incomplete, not transport failure.
            setDaySecureUi(
              buildIncompleteRequired({ requiredTasks, completedTaskIds })
            );
          }
        } catch (secureErr: unknown) {
          captureError(secureErr, "TaskCompleteSecureDay");
          if (isNotAllRequiredError(secureErr)) {
            setDaySecureUi(
              buildIncompleteRequired({ requiredTasks, completedTaskIds })
            );
          } else {
            setDaySecureUi({ kind: "secure_failed" });
          }
        }
      } else {
        setDaySecureUi({ kind: "not_attempted" });
      }
      // Gated types with real checks: brief settle so server rows can paint.
      // Zero-gate gated types and Simple: no verifying floor — land on Secured immediately.
      // Timer (legacy): short submit settle without a fake verifying overlay.
      if (usesServerVerifying) {
        setIsSubmitting(false);
        const rowCount =
          completionResult &&
          typeof completionResult === "object" &&
          "verification" in completionResult
            ? (
                completionResult as {
                  verification?: { rows: unknown[] };
                }
              ).verification?.rows?.length ?? 0
            : 0;
        const settleMs = rowCount > 0 ? 280 + (rowCount - 1) * 80 + 80 : 0;
        if (settleMs > 0) {
          await new Promise<void>((res) => setTimeout(res, settleMs));
        }
      } else if (!isSimpleSubmit && !isGatedProofType) {
        const elapsed = Date.now() - verifyStartMsRef.current;
        const MIN_SUBMIT_MS = 400;
        if (elapsed < MIN_SUBMIT_MS) {
          await new Promise<void>((res) => setTimeout(res, MIN_SUBMIT_MS - elapsed));
        }
      }
      setSubmitted(true);
      if (taskTypeRaw === "journal") {
        try {
          await clearJournalDraft();
        } catch {
          /* non-fatal */
        }
      }
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

      // Photo/Run/Workout/Journal/Counter/Check-in/Simple use SecuredScreen — skip celebration overlay + variable-reward chip.
      if (
        !isPhotoSubmit &&
        !isRunSubmit &&
        !isWorkoutSubmit &&
        !isJournalSubmit &&
        !isCounterSubmit &&
        !isCheckinSubmit &&
        !isSimpleSubmit
      ) {
        const celebTitle =
          taskMode === "minimum" ? "Minimum day secured." : isHardMode ? "Hard mode earned." : "Secured.";
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
      }
    } catch (err: unknown) {
      captureError(err, "TaskCompleteCompleteTask");
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      if (usesServerVerifying) {
        const verification = (
          err as {
            data?: { verification?: { rows: { label: string; verified: boolean }[] } };
          }
        )?.data?.verification;
        if (verification?.rows?.length) {
          setPhotoVerifyRows(
            verification.rows.map((r) => ({
              label: r.label,
              verified: r.verified,
            }))
          );
        }
        setPhotoVerifyError(message);
      } else {
        showError(message);
      }
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
    runKm,
    runMin,
    runEntryMode,
    isRunTimed,
    showCelebration,
    showWorkoutEntry,
    showRunEntry,
    showWorkoutTimer,
    workoutDuration,
    workoutKind,
    workoutNotes,
    workoutEntryMode,
    minDurMinutes,
    photoCaption,
    captureMeta,
    onScreenSecondsRef,
    clearActiveSession,
    isChallengeHardMode,
    isCounterFamily,
    hasRealVerificationGates,
    counterValue,
    clearJournalDraft,
    flushCounterProgress,
    isSimpleAsk,
    activeChallenge,
    headerCurrentDay,
  ]);

  const handleRetrySecureDay = useCallback(async () => {
    if (secureDayRetrying) return;
    setSecureDayRetrying(true);
    // Capture before secureDay — same model as primary submit path.
    const dayNumberBeforeSecure = challengeDayNumber(
      (activeChallenge as { current_day?: number } | null)?.current_day ??
        headerCurrentDay
    );
    try {
      const secureResult = await secureDayRef.current();
      const securedStreak = secureResult?.newStreakCount;
      if (typeof securedStreak === "number") {
        setCompletedStreakCount(securedStreak);
        setDaySecureUi({
          kind: "secured",
          streakCount: securedStreak,
          dayNumber: dayNumberBeforeSecure,
        });
        return;
      }
      const requiredTasks =
        (
          challenge?.challenge_tasks as
            | { id: string; title?: string | null; config?: { required?: boolean } }[]
            | undefined
        )?.filter((t) => (t.config?.required ?? true) === true) || [];
      const completedTaskIds = new Set(
        todayCheckins
          .filter((c) => c.status === "completed")
          .map((c) => c.task_id)
          .filter((id): id is string => typeof id === "string")
      );
      completedTaskIds.add(taskId);
      setDaySecureUi(buildIncompleteRequired({ requiredTasks, completedTaskIds }));
    } catch (secureErr: unknown) {
      captureError(secureErr, "TaskCompleteSecureDayRetry");
      if (isNotAllRequiredError(secureErr)) {
        const requiredTasks =
          (
            challenge?.challenge_tasks as
              | { id: string; title?: string | null; config?: { required?: boolean } }[]
              | undefined
          )?.filter((t) => (t.config?.required ?? true) === true) || [];
        const completedTaskIds = new Set(
          todayCheckins
            .filter((c) => c.status === "completed")
            .map((c) => c.task_id)
            .filter((id): id is string => typeof id === "string")
        );
        completedTaskIds.add(taskId);
        setDaySecureUi(buildIncompleteRequired({ requiredTasks, completedTaskIds }));
      } else {
        setDaySecureUi({ kind: "secure_failed" });
      }
    } finally {
      setSecureDayRetrying(false);
    }
  }, [secureDayRetrying, challenge, todayCheckins, taskId, activeChallenge, headerCurrentDay]);

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

  const isPhotoReady =
    FLAGS.TASK_START_ARMING && !isArmed && taskTypeRaw === "photo";
  const isPhotoCapture =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "photo" && !photoUri;
  const isPhotoCaption =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "photo" && !!photoUri;
  const isRunReady =
    FLAGS.TASK_START_ARMING && !isArmed && taskTypeRaw === "run";
  const isRunLog =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "run" && runPhase === "log";
  const isRunCapture =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "run" && runPhase === "capture";
  const isWorkoutReady =
    FLAGS.TASK_START_ARMING && !isArmed && taskTypeRaw === "workout";
  const isWorkoutSession =
    FLAGS.TASK_START_ARMING &&
    isArmed &&
    taskTypeRaw === "workout" &&
    workoutPhase === "session";
  const isWorkoutCapture =
    FLAGS.TASK_START_ARMING &&
    isArmed &&
    taskTypeRaw === "workout" &&
    workoutPhase === "capture";
  const isJournalReady =
    FLAGS.TASK_START_ARMING && !isArmed && taskTypeRaw === "journal";
  const isJournalWrite =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "journal";
  const isCounterReady =
    FLAGS.TASK_START_ARMING && !isArmed && isCounterFamily;
  const isCounterCount =
    FLAGS.TASK_START_ARMING && isArmed && isCounterFamily;
  const isCheckinReady =
    FLAGS.TASK_START_ARMING && !isArmed && taskTypeRaw === "checkin";
  const isCheckinConfirm =
    FLAGS.TASK_START_ARMING && isArmed && taskTypeRaw === "checkin";
  const workoutHasFloor = taskTypeRaw === "workout" && minDurMinutes > 0;
  const workoutSessionOk = workoutHasFloor
    ? timerOk
    : !Number.isNaN(workoutMinParsed) && workoutMinParsed >= 1;
  const workoutRemainingMin = workoutHasFloor
    ? Math.max(0, Math.ceil((requiredSeconds - timerSeconds) / 60))
    : 0;
  const runReadySubtype = resolveRunReadySubtype(config);
  const workoutReadySubtype = resolveWorkoutReadySubtype(config);
  const journalReadySubtype = resolveJournalReadySubtype(config);
  const counterReadySubtype = resolveCounterReadySubtype(
    config,
    taskTypeRaw === "water"
      ? "water"
      : taskTypeRaw === "reading"
        ? "reading"
        : "counter"
  );
  const checkinReadySubtype = resolveCheckinReadySubtype(config);

  const handleRunToggleTimer = useCallback(() => {
    setRunEntryMode("timer");
    toggleTimer();
  }, [toggleTimer]);

  // Keep duration field in sync when logging via in-app timer.
  useEffect(() => {
    if (taskTypeRaw !== "run" || runEntryMode !== "timer") return;
    setRunDuration(String(Math.max(0, Math.floor(timerSeconds / 60))));
  }, [taskTypeRaw, runEntryMode, timerSeconds]);

  // Floored workout: duration tracks the live timer (entry_mode timer).
  useEffect(() => {
    if (taskTypeRaw !== "workout" || !workoutHasFloor) return;
    setWorkoutDuration(String(Math.max(0, Math.floor(timerSeconds / 60))));
  }, [taskTypeRaw, workoutHasFloor, timerSeconds]);

  // One 30s tick shared by GatesCard chip + Start CTA while Ready is mounted.
  const readyScheduleNow = useScheduleWindowNow({
    enabled:
      isPhotoReady ||
      isRunReady ||
      isWorkoutReady ||
      isJournalReady ||
      isCheckinReady,
  });
  const readyStart = useMemo(() => {
    if (
      !isPhotoReady &&
      !isRunReady &&
      !isWorkoutReady &&
      !isJournalReady &&
      !isCheckinReady
    ) {
      return { canStart: true as const };
    }
    const evaluation = evaluateScheduleWindow({
      start: config.schedule_window_start,
      end: config.schedule_window_end,
      timeZone: config.schedule_timezone,
      now: readyScheduleNow,
    });
    return decideReadyStart({
      status: evaluation.status,
      windowStart: config.schedule_window_start,
    });
  }, [
    isPhotoReady,
    isRunReady,
    isWorkoutReady,
    isJournalReady,
    isCheckinReady,
    config.schedule_window_start,
    config.schedule_window_end,
    config.schedule_timezone,
    readyScheduleNow,
  ]);

  const renderBody = useCallback(() => {
    // Ready state: Photo/Run/Workout/Journal use GatesCard; other types keep TaskReadyCard.
    if (FLAGS.TASK_START_ARMING && !isArmed) {
      if (taskTypeRaw === "photo") {
        return (
          <TaskPhotoReadyBody
            config={config}
            taskTitle={taskName}
            scheduleNow={readyScheduleNow}
          />
        );
      }
      if (taskTypeRaw === "run") {
        return (
          <TaskRunReadyBody
            config={config}
            taskTitle={taskName}
            scheduleNow={readyScheduleNow}
          />
        );
      }
      if (taskTypeRaw === "workout") {
        return (
          <TaskWorkoutReadyBody
            config={config}
            taskTitle={taskName}
            floorMinutes={minDurMinutes}
            scheduleNow={readyScheduleNow}
          />
        );
      }
      if (taskTypeRaw === "journal") {
        return (
          <TaskJournalReadyBody
            config={config}
            taskTitle={taskName}
            minWords={minWords}
            scheduleNow={readyScheduleNow}
          />
        );
      }
      if (isCounterFamily) {
        return (
          <TaskCounterReadyBody
            config={config}
            taskTitle={taskName}
            target={counterGoal}
            variant={
              taskTypeRaw === "water"
                ? "water"
                : taskTypeRaw === "reading"
                  ? "reading"
                  : "counter"
            }
          />
        );
      }
      if (taskTypeRaw === "checkin") {
        return (
          <TaskCheckinReadyBody
            config={config}
            taskTitle={taskName}
            scheduleNow={readyScheduleNow}
          />
        );
      }
      return (
        <TaskReadyCard
          taskTypeRaw={taskTypeRaw}
          config={config}
        />
      );
    }
    switch (taskTypeRaw) {
      case "photo":
        if (!photoUri) {
          return (
            <TaskPhotoCaptureBody
              config={config}
              photoUri={photoUri}
              photoUploading={photoUploading}
              onTakePhoto={() => {
                void handleTakePhoto();
              }}
              onClearPhoto={clearPhoto}
            />
          );
        }
        return (
          <TaskPhotoCaptionBody
            photoUri={photoUri}
            caption={photoCaption}
            onChangeCaption={(t) => setPhotoCaption(clampPhotoCaption(t))}
            onRetake={() => {
              clearPhoto();
              setPhotoCaption("");
            }}
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
        if (runPhase === "capture") {
          return (
            <TaskRunCaptureBody
              config={config}
              photoUri={photoUri}
              photoUploading={photoUploading}
              onTakePhoto={() => {
                void handleTakePhoto();
              }}
              onClearPhoto={clearPhoto}
            />
          );
        }
        return (
          <TaskRunLogBody
            distance={runDistance}
            onChangeDistance={(v) => {
              setRunEntryMode((m) => (m === "timer" ? m : "hand"));
              setRunDistance(v);
            }}
            duration={runDuration}
            onChangeDuration={(v) => {
              setRunEntryMode("hand");
              setRunDuration(v);
            }}
            showTimer
            isTimerRunning={isTimerRunning}
            timerDisplay={timerDisplay}
            onToggleTimer={handleRunToggleTimer}
          />
        );
      case "workout":
        if (workoutPhase === "capture") {
          return (
            <TaskWorkoutCaptureBody
              config={config}
              photoUri={photoUri}
              photoUploading={photoUploading}
              onTakePhoto={() => {
                void handleTakePhoto();
              }}
              onClearPhoto={clearPhoto}
            />
          );
        }
        return (
          <TaskWorkoutSessionBody
            kinds={WORKOUT_KINDS}
            kind={workoutKind}
            onChangeKind={setWorkoutKind}
            hasFloor={workoutHasFloor}
            floorMinutes={minDurMinutes}
            timerDisplay={timerDisplay}
            durationMinutes={workoutDuration}
            onChangeDurationMinutes={(v) => {
              setWorkoutEntryMode("hand");
              setWorkoutDuration(v);
            }}
            notes={workoutNotes}
            onChangeNotes={setWorkoutNotes}
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
          />
        );
      case "counter":
      case "water":
      case "reading":
        return (
          <TaskCounterBody
            variant={counterVariant}
            value={{ count: counterValue }}
            onChangeCount={setCounterValue}
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
            notSavedYet={counterNotSavedYet}
            photoUri={photoUri}
          />
        );
      case "checkin":
        return (
          <TaskCheckinBody
            value={{ inRange: locationOk }}
            locationName={config.location_name ?? "Saved location"}
            distanceMeters={distance ?? undefined}
            accuracyMeters={locationAccuracyM}
            hasGps={!!userLocation}
            permissionDenied={locationPermissionDenied}
          />
        );
      case "manual":
      case "simple":
      default:
        return <TaskSimpleBody taskName={taskName} />;
    }
  }, [
    isArmed,
    taskTypeRaw,
    config,
    isCounterFamily,
    counterGoal,
    minWords,
    photoUri,
    photoUploading,
    photoCaption,
    readyScheduleNow,
    handleTakePhoto,
    clearPhoto,
    runPhase,
    minDurMinutes,
    workoutHasFloor,
    workoutPhase,
    workoutKind,
    workoutDuration,
    workoutNotes,
    minWords,
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
    handleRunToggleTimer,
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
    locationOk,
    distance,
    userLocation,
    locationAccuracyM,
    locationPermissionDenied,
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
      currentStreak: (stats as { activeStreak?: number } | null)?.activeStreak ?? 0,
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
      // Photo / Run / Workout / Journal / Check-in: disable Start out of window — CTA shows "Opens at {HH:MM}".
      if (
        taskTypeRaw === "photo" ||
        taskTypeRaw === "run" ||
        taskTypeRaw === "workout" ||
        taskTypeRaw === "journal" ||
        taskTypeRaw === "checkin"
      ) {
        return {
          label: readyLabel,
          onPress: () => void handleArm(),
          disabled: !readyStart.canStart,
          disabledReason: readyStart.disabledReason,
          loading: false,
        };
      }
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
      label = SIMPLE_ASK_CTA;
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
      if (runPhase === "log") {
        return {
          label: "Continue",
          onPress: () => {
            if (runFormOk) setRunPhase("capture");
          },
          disabled: !runFormOk,
          disabledReason: runFormOk ? undefined : "Add distance & time",
          loading: false,
        };
      }
      // Capture (optional): submit with or without photo.
      label = photoUri ? "Submit proof" : "Skip photo";
      if (photoUploading) disabledReason = "Uploading…";
    } else if (taskTypeRaw === "workout") {
      if (workoutPhase === "session") {
        if (workoutHasFloor && !timerOk) {
          return {
            label: "Finish session",
            onPress: () => undefined,
            disabled: true,
            disabledReason: `${workoutRemainingMin} min to go`,
            loading: false,
          };
        }
        if (!workoutHasFloor && !workoutSessionOk) {
          return {
            label: "Finish session",
            onPress: () => undefined,
            disabled: true,
            disabledReason: "Add duration",
            loading: false,
          };
        }
        return {
          label: "Finish session",
          onPress: () => setWorkoutPhase("capture"),
          disabled: false,
          disabledReason: undefined,
          loading: false,
        };
      }
      // Capture (optional): submit with or without photo.
      label = photoUri ? "Submit proof" : "Skip photo";
      if (photoUploading) disabledReason = "Uploading…";
    } else if (taskTypeRaw === "journal") {
      label = "Save entry";
      if (!journalOk) {
        const gap = Math.max(0, minWords - wordCount);
        if (gap > 0) disabledReason = `${gap} more word${gap === 1 ? "" : "s"} to go`;
      }
    } else if (isCounterFamily) {
      label = "Mark today complete";
      if (!counterOk) disabledReason = `${Math.max(0, counterGoal - counterValue)} more to go`;
    } else if (taskTypeRaw === "checkin") {
      label = "Confirm check-in";
      if (locationPermissionDenied) {
        disabledReason = "Allow location to check in";
      } else if (!locationOk) {
        const meters =
          distance != null ? `${Math.round(distance)} m away` : "Locating…";
        disabledReason = `Get closer to check in (${meters})`;
      }
    }
    return {
      label,
      onPress: () => void handleSubmit(),
      disabled:
        taskTypeRaw === "run" && runPhase === "capture"
          ? photoUploading || !runFormOk
          : taskTypeRaw === "workout" && workoutPhase === "capture"
            ? photoUploading || !workoutSessionOk
            : !canSubmit,
      disabledReason,
      loading: isSubmitting,
    };
  }, [
    isArmed,
    handleArm,
    taskTypeRaw,
    readyStart,
    needsPhotoProof,
    photoOk,
    photoUri,
    photoUploading,
    timerOk,
    isHardMode,
    runFormOk,
    runPhase,
    workoutPhase,
    workoutHasFloor,
    workoutSessionOk,
    workoutRemainingMin,
    journalOk,
    minWords,
    wordCount,
    isCounterFamily,
    counterOk,
    counterGoal,
    counterValue,
    locationOk,
    locationPermissionDenied,
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

  if (showPhotoVerifying && !submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: DS_COLORS_V2.surface.heroDark }}>
        <VerifyingProof
          rows={photoVerifyRows}
          error={photoVerifyError}
          loading={isSubmitting}
        />
      </View>
    );
  }

  if (submitted) {
    if (
      taskTypeRaw === "photo" ||
      taskTypeRaw === "run" ||
      taskTypeRaw === "workout" ||
      taskTypeRaw === "journal" ||
      isCounterFamily ||
      taskTypeRaw === "checkin" ||
      isSimpleAsk
    ) {
      const workoutSecuredMin = showWorkoutTimer
        ? Math.floor(timerSeconds / 60)
        : workoutMinParsed;
      const securedMeta =
        taskTypeRaw === "run"
          ? formatRunSecuredMeta(runKm, runMin)
          : taskTypeRaw === "workout"
            ? formatWorkoutSecuredMeta(
                workoutKind,
                Number.isFinite(workoutSecuredMin) ? workoutSecuredMin : 0
              )
            : taskTypeRaw === "journal"
              ? formatJournalSecuredMeta(wordCount)
              : isCounterFamily
                ? formatCounterSecuredMeta(
                    counterValue,
                    counterGoal,
                    counterUnits.plural
                  )
                : taskTypeRaw === "checkin"
                  ? formatCheckinSecuredMeta(hasLocationTarget)
                  : isSimpleAsk
                    ? formatSimpleSecuredMeta()
                    : "Verified in the window";
      const daySecureProp =
        daySecureUi.kind === "secured"
          ? {
              kind: "secured" as const,
              dayNumber: daySecureUi.dayNumber,
              streakCount: daySecureUi.streakCount,
              onDone: () => goBackOrHome(router),
            }
          : daySecureUi.kind === "incomplete_required"
            ? {
                kind: "incomplete_required" as const,
                done: daySecureUi.done,
                total: daySecureUi.total,
                remainingTitles: daySecureUi.remainingTitles,
                onContinue: () => {
                  if (activeChallengeId) {
                    router.replace(ROUTES.CHALLENGE_ACTIVE(activeChallengeId) as never);
                  } else {
                    goBackOrHome(router);
                  }
                },
              }
            : daySecureUi.kind === "secure_failed"
              ? {
                  kind: "secure_failed" as const,
                  onRetry: () => void handleRetrySecureDay(),
                  retrying: secureDayRetrying,
                  onDone: () => goBackOrHome(router),
                }
              : {
                  kind: "not_attempted" as const,
                  onDone: () => goBackOrHome(router),
                };
      return (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView
            style={{ flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas }}
            edges={["top", "bottom"]}
          >
            <SecuredScreen
              title={taskName}
              meta={securedMeta}
              daySecure={daySecureProp}
            />
          </SafeAreaView>
        </>
      );
    }
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
        // Photo Ready/Capture/Caption own chrome — suppress shell hard-mode card.
        verificationGates={
          isPhotoReady ||
          isPhotoCapture ||
          isPhotoCaption ||
          isRunReady ||
          isRunLog ||
          isRunCapture ||
          isWorkoutReady ||
          isWorkoutSession ||
          isWorkoutCapture ||
          isJournalReady ||
          isJournalWrite ||
          isCounterReady ||
          isCounterCount ||
          isCheckinReady ||
          isCheckinConfirm ||
          isSimpleAsk
            ? undefined
            : shellGates
        }
        toplineMeta={
          isPhotoReady || isPhotoCapture || isPhotoCaption
            ? PHOTO_READY_SUBTYPE
            : isRunReady || isRunLog || isRunCapture
              ? runReadySubtype
              : isWorkoutReady || isWorkoutSession || isWorkoutCapture
                ? workoutReadySubtype
                : isJournalReady || isJournalWrite
                  ? journalReadySubtype
                  : isCounterReady || isCounterCount
                    ? counterReadySubtype
                    : isCheckinReady || isCheckinConfirm
                      ? checkinReadySubtype
                      : isSimpleAsk
                        ? SIMPLE_READY_SUBTYPE
                        : undefined
        }
        hideHeaderTaskName={
          isPhotoReady ||
          isPhotoCapture ||
          isPhotoCaption ||
          isRunReady ||
          isRunLog ||
          isRunCapture ||
          isWorkoutReady ||
          isWorkoutSession ||
          isWorkoutCapture ||
          isJournalReady ||
          isJournalWrite ||
          isCounterReady ||
          isCounterCount ||
          isCheckinReady ||
          isCheckinConfirm ||
          isSimpleAsk
        }
        variant={isPhotoCapture ? "dark" : "light"}
        onBack={() => goBackOrHome(router)}
        primaryCta={primaryCta}
        secondaryCta={
          isSimpleAsk
            ? {
                label: SIMPLE_ASK_NOT_YET,
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
