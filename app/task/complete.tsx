/**
 * Unified task completion screen — one primary interaction per task type,
 * verification add-ons, and a clear success state.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  AppState,
  AppStateStatus,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { useCelebrationStore } from "@/store/celebrationStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Camera, Lock, CheckCircle, XCircle, MapPin, Check, Image as GalleryIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { haversineDistance } from "@/lib/geo";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import {
  DS_COLORS,
  DS_SPACING,
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_SHADOWS,
  DS_MEASURES,
  GRIIT_COLORS,
} from "@/lib/design-system";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useQueryClient } from "@tanstack/react-query";
import { shareToInstagramStory } from "@/lib/share";
import { trackEvent } from "@/lib/analytics";
import { VerificationGates } from "@/components/task/VerificationGates";
import type { TaskHardVerificationConfig } from "@/lib/task-hard-verification";

const JOURNAL_PROMPTS = [
  "What did you learn about yourself today?",
  "What was the hardest part of today and how did you push through?",
  "Write about one win and one loss from today.",
  "How did your body feel today? Energy, soreness, recovery.",
  "Describe your emotions before vs after completing this.",
  "What would you tell yourself from 30 days ago?",
  "What's one thing you're grateful for right now?",
  "What distraction did you resist today?",
  "How did discipline show up in your life today?",
  "Write a letter to your future self about this moment.",
  "What habit is getting easier? What's still hard?",
  "Who did you impact today and how?",
  "What would you do differently if you could redo today?",
  "Describe a moment today when you chose the hard thing.",
  "What's one truth you've been avoiding?",
];

function getDailyPrompt(taskId: string, journalPrompt?: string): string {
  if (journalPrompt && journalPrompt.trim()) return journalPrompt;
  const dateKey = new Date().toISOString().slice(0, 10);
  const seed = (dateKey + taskId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = seed % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[idx] ?? JOURNAL_PROMPTS[0] ?? "";
}

export type TaskCompleteConfig = {
  require_photo?: boolean;
  min_duration_minutes?: number;
  min_words?: number;
  timer_direction?: "countdown" | "countup";
  timer_hard_mode?: boolean;
  require_heart_rate?: boolean;
  heart_rate_threshold?: number;
  require_location?: boolean;
  location_name?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_radius_meters?: number;
  journal_prompt?: string;
  hard_mode?: boolean;
  schedule_window_start?: string;
  schedule_window_end?: string;
  schedule_timezone?: string;
  require_camera_only?: boolean;
  require_strava?: boolean;
};

function parseConfig(taskConfigStr: string | undefined): TaskCompleteConfig {
  if (!taskConfigStr?.trim()) return {};
  try {
    const o = JSON.parse(taskConfigStr) as TaskCompleteConfig;
    return typeof o === "object" && o !== null ? o : {};
  } catch (e) {
    captureError(e, "TaskCompleteParseConfig");
    return {};
  }
}

function firstString(v: string | string[] | undefined): string {
  if (v == null) return "";
  return typeof v === "string" ? v : v[0] ?? "";
}

/** Disambiguate run vs workout when routing or seed data conflates the two. */
function inferRunOrWorkout(taskType: string, taskName: string): "run" | "workout" {
  const n = taskName.toLowerCase();
  const looksRun = /\b(run|jog|running|5k|10k|mile|sprint)\b/.test(n);
  const looksWorkout = /\b(workout|gym|lift|hiit|yoga|strength|exercise|training|calisthenics)\b/.test(n);
  if (taskType === "run") {
    if (looksWorkout && !looksRun) return "workout";
    return "run";
  }
  if (taskType === "workout") {
    if (looksRun && !looksWorkout) return "run";
    return "workout";
  }
  return "workout";
}

const WORKOUT_KINDS = ["Gym", "HIIT", "Yoga", "Calisthenics", "Other"] as const;

function goBackOrHome(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
  } else {
    router.replace(ROUTES.TABS_HOME as never);
  }
}

function TaskCompleteScreenInner() {
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
  const { activeChallenge, completeTask, challenge } = useApp();
  const showCelebration = useCelebrationStore((s) => s.show);
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

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const lastJournalLenRef = useRef(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const onScreenSecondsRef = useRef(0);
  const [heartRateData, setHeartRateData] = useState<{ avg: number; peak: number } | null>(null);
  const [heartRateManual, setHeartRateManual] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { error, showError, clearError } = useInlineError();
  const [paramsReady, setParamsReady] = useState(false);
  const manualScale = useRef(new Animated.Value(1)).current;
  const runDistanceKm = useRef("");
  const runDurationMin = useRef("");
  const [runDistance, setRunDistance] = useState("");
  const [runDuration, setRunDuration] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutKind, setWorkoutKind] = useState<string>(WORKOUT_KINDS[0] ?? "Gym");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [shareBusy, setShareBusy] = useState(false);
  const [postedInline, setPostedInline] = useState(false);
  const manualSubmitScheduled = useRef(false);
  const clockedInAtRef = useRef<string | null>(null);
  const [hardGatesPassed, setHardGatesPassed] = useState(true);
  const [timeWindowFailed, setTimeWindowFailed] = useState(false);
  const [gatesLocation, setGatesLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setParamsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isHardVerificationTask = config.hard_mode === true;
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
    if (isHardVerificationTask) {
      clockedInAtRef.current = new Date().toISOString();
    } else {
      clockedInAtRef.current = null;
    }
  }, [taskId, isHardVerificationTask, params.taskConfig]);

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
        if (isHardMode) onScreenSecondsRef.current += 1;
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isHardMode]);

  useEffect(() => {
    if (!isHardMode) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state !== "active") setIsTimerRunning(false);
    });
    return () => sub.remove();
  }, [isHardMode]);

  /** Timer auto-starts when opening a timer task or a hard-mode timed run/workout. */
  useEffect(() => {
    if (
      showWorkoutTimer &&
      requiredSeconds > 0 &&
      !isTimerRunning &&
      timerSeconds === 0
    ) {
      setIsTimerRunning(true);
      if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-style start; avoid re-firing on pause
  }, [showWorkoutTimer, requiredSeconds]);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError("Allow camera access to submit photo proof.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setPhotoUploading(true);
    try {
      const contentType = asset.uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
      const upload = await uploadProofImageFromBase64(asset.base64 ?? "", contentType);
      if ("error" in upload) {
        showError(upload.error);
        setPhotoUri(null);
      } else {
        setPhotoUrl(upload.url);
      }
    } catch (err) {
      captureError(err, "TaskCompleteCameraUpload");
      showError("Upload failed. Please try again.");
      setPhotoUri(null);
    } finally {
      setPhotoUploading(false);
    }
  }, [showError]);

  const handlePickImage = useCallback(async () => {
    if (config.require_camera_only === true) {
      showError("This task requires a live camera photo. Use Take photo.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Allow gallery access to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: false,
      base64: true,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setPhotoUploading(true);
    try {
      const contentType = asset.uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
      const upload = await uploadProofImageFromBase64(asset.base64 ?? "", contentType);
      if ("error" in upload) {
        showError(upload.error);
        setPhotoUri(null);
      } else {
        setPhotoUrl(upload.url);
      }
    } catch (err) {
      captureError(err, "TaskCompleteGalleryUpload");
      showError("Upload failed. Please try again.");
      setPhotoUri(null);
    } finally {
      setPhotoUploading(false);
    }
  }, [showError, config.require_camera_only]);

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

  const handleJournalChange = useCallback(
    (text: string) => {
      if (text.length - lastJournalLenRef.current > 5 && lastJournalLenRef.current > 0) {
        showError("Write your own thoughts — pasting is not allowed.");
        return;
      }
      lastJournalLenRef.current = text.length;
      setJournalText(text);
    },
    [showError]
  );

  const wordCount = useMemo(() => journalText.trim().split(/\s+/).filter(Boolean).length, [journalText]);
  const minWords = config.min_words ?? 0;
  const journalPrompt = useMemo(
    () => getDailyPrompt(taskId, (config as TaskCompleteConfig).journal_prompt),
    [taskId, config]
  );
  const journalOk = minWords === 0 || wordCount >= minWords;
  const timerOk = requiredSeconds === 0 || timerSeconds >= requiredSeconds;
  const hardModeOk = !isHardMode || requiredSeconds === 0 || onScreenSecondsRef.current >= requiredSeconds;
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
    timerSeconds,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!activeChallengeId || !taskId || !canSubmit) return;
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
      } else {
        valueOut = undefined;
      }
      await completeTask({
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
      });
      setSubmitted(true);
      if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const celebTitle = isHardMode ? "Hard mode earned." : "Secured.";
      const celebPoints = isHardMode ? 8 : 5;
      showCelebration({
        title: celebTitle,
        subtitle: `+${celebPoints} points`,
        type: "goal",
      });

      if (Math.random() < 0.3) {
        const rewards = [
          { label: "2x BONUS — double points!", color: DS_COLORS.CELEB_BONUS_AMBER, bg: DS_COLORS.CELEB_BONUS_AMBER_BG },
          { label: "Streak shield earned", color: DS_COLORS.CELEB_BONUS_GREEN, bg: DS_COLORS.CELEB_BONUS_GREEN_BG },
          { label: "Discipline badge progress +1", color: DS_COLORS.CELEB_BONUS_PURPLE, bg: DS_COLORS.CELEB_BONUS_PURPLE_BG },
          { label: "Bonus: +3 extra points", color: DS_COLORS.CELEB_BONUS_AMBER, bg: DS_COLORS.CELEB_BONUS_AMBER_BG },
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

  const timerDisplay =
    isCountdown && requiredSeconds > 0
      ? `${String(Math.floor(Math.max(0, requiredSeconds - timerSeconds) / 60)).padStart(2, "0")}:${String(Math.max(0, requiredSeconds - timerSeconds) % 60).padStart(2, "0")}`
      : `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;

  const progressFrac = requiredSeconds > 0 ? Math.min(1, timerSeconds / requiredSeconds) : 0;

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

  if (!taskId.trim() || !activeChallengeId.trim()) {
    if (!paramsReady) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
          <Stack.Screen options={{ title: "Loading…", headerBackVisible: true }} />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={GRIIT_COLORS.primary} accessibilityLabel="Loading task" />
          </View>
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
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
    const celebPoints = isHardMode ? 8 : 5;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.CELEB_BG }]} edges={["bottom"]}>
        <Stack.Screen
          options={{
            title: taskName,
            headerBackVisible: true,
            headerStyle: { backgroundColor: DS_COLORS.CELEB_BG },
            headerTintColor: DS_COLORS.WHITE,
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={celebStyles.wrap}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={celebStyles.fireEmoji}>🔥</Text>
            <Text style={celebStyles.title}>Secured.</Text>
            <Text style={celebStyles.subtitle}>
              +{celebPoints} points · {taskName}
            </Text>

            {variableReward ? (
              <View style={[celebStyles.rewardPill, { backgroundColor: variableReward.bg }]}>
                <Text style={[celebStyles.rewardText, { color: variableReward.color }]}>{variableReward.label}</Text>
              </View>
            ) : null}

            {!postedInline && (
              <View style={celebStyles.photoSection}>
                {photoUrl ? (
                  <View style={celebStyles.photoPreview}>
                    <Image
                      source={{ uri: photoUri || photoUrl }}
                      style={celebStyles.photoImage}
                      contentFit="contain"
                      accessibilityLabel="Proof photo"
                    />
                    <TouchableOpacity
                      style={celebStyles.photoChangeBadge}
                      onPress={() => {
                        setPhotoUrl(null);
                        setPhotoUri(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Remove photo"
                    >
                      <Text style={celebStyles.photoChangeBadgeText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={celebStyles.photoPickerRow}>
                    <TouchableOpacity
                      style={celebStyles.photoPickerBtn}
                      onPress={handleTakePhoto}
                      disabled={photoUploading}
                      accessibilityRole="button"
                      accessibilityLabel="Take a photo"
                    >
                      <Camera size={20} color={DS_COLORS.TEXT_ON_DARK_60} />
                      <Text style={celebStyles.photoPickerText}>Take photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={celebStyles.photoPickerBtn}
                      onPress={handlePickImage}
                      disabled={photoUploading}
                      accessibilityRole="button"
                      accessibilityLabel="Choose from gallery"
                    >
                      <GalleryIcon size={20} color={DS_COLORS.TEXT_ON_DARK_60} />
                      <Text style={celebStyles.photoPickerText}>Choose photo</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {photoUploading ? (
                  <ActivityIndicator size="small" color={DS_COLORS.WHITE} style={{ marginTop: 8 }} />
                ) : null}
              </View>
            )}

            <Text style={celebStyles.captionLabel}>Add a caption (optional)</Text>
            <TextInput
              style={celebStyles.captionInput}
              placeholder="Just finished my workout 💪"
              placeholderTextColor={DS_COLORS.DISCOVER_HERO_AVATAR_RING}
              value={postCaption}
              onChangeText={setPostCaption}
              maxLength={500}
              editable={!postedInline}
            />

            {postedInline ? <Text style={celebStyles.postedOk}>Posted!</Text> : null}
            {shareFeedErr ? <Text style={celebStyles.postedErr}>{shareFeedErr}</Text> : null}

            <TouchableOpacity
              style={[celebStyles.shareToFeedBtn, postedInline && { opacity: 0.85 }]}
              onPress={() => void handleShareToFeed()}
              disabled={shareBusy || postedInline}
              accessibilityRole="button"
              accessibilityLabel="Share to GRIIT feed"
            >
              {shareBusy ? (
                <ActivityIndicator color={DS_COLORS.WHITE} />
              ) : (
                <Text style={celebStyles.shareToFeedText}>Post to GRIIT</Text>
              )}
            </TouchableOpacity>

            {(photoUrl || photoUri) ? (
              <TouchableOpacity
                style={celebStyles.shareStoriesBtn}
                onPress={async () => {
                  if (!photoUrl && !photoUri) return;
                  const imageUri = photoUri || photoUrl || "";
                  try {
                    await shareToInstagramStory(imageUri);
                    trackEvent("share_completed", { content_type: "instagram_story_celebration" });
                  } catch (e) {
                    captureError(e, "CelebrationShareStory");
                  }
                }}
                disabled={!photoUrl && !photoUri}
                accessibilityRole="button"
                accessibilityLabel="Share proof to Instagram Stories"
              >
                <Text style={celebStyles.shareStoriesBtnText}>Share to Stories</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={celebStyles.doneBtn}
              onPress={() => goBackOrHome(router)}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={celebStyles.doneBtnText}>Skip — go home</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
      <Stack.Screen options={{ title: taskName, headerBackVisible: true }} />
      <FlatList
        data={[{ key: "task-complete-root" }]}
        keyExtractor={(item) => item.key}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        renderItem={() => (
          <View>
        <InlineError message={error} onDismiss={clearError} />

        {isHardVerificationTask ? (
          <VerificationGates
            config={hardVerificationConfig}
            photoSatisfied={
              config.require_camera_only !== true || !needsPhotoProof || !!photoUrl
            }
            onGatesResolved={onHardGatesResolved}
            onTimeWindowFailed={onHardTimeWindowFailed}
          />
        ) : null}

        {isHardVerificationTask && timeWindowFailed ? (
          <View style={styles.missedWindowCard} accessibilityLabel="Time window closed, task missed">
            <XCircle size={40} color={DS_COLORS.BADGE_HARD_RED} accessibilityLabel="Window closed icon" />
            <Text style={styles.missedWindowTitle}>This task counts as missed today</Text>
            <Text style={styles.missedWindowSub}>
              The schedule window has closed. Try again inside the allowed time tomorrow.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => goBackOrHome(router)}
              accessibilityRole="button"
              accessibilityLabel="Go back after missed task window"
            >
              <Text style={styles.primaryBtnText}>Go back</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!(isHardVerificationTask && timeWindowFailed) ? (
          <>
        <View
          pointerEvents={isHardVerificationTask && !hardGatesPassed ? "none" : "auto"}
          style={isHardVerificationTask && !hardGatesPassed ? styles.hardGatesDimmed : undefined}
        >
        <Text style={styles.screenTitle}>{taskName}</Text>
        <Text style={styles.headerSubtitle}>
          {headerChallengeName} · Day {headerCurrentDay} of {headerDurationDays}
        </Text>
        {firstString(params.taskDescription) ? <Text style={styles.muted}>{firstString(params.taskDescription)}</Text> : null}

        {/* Manual / simple — honor tap */}
        {(taskTypeRaw === "manual" || taskTypeRaw === "simple") && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Complete: {taskName}</Text>
            <Pressable
              onPress={() => {
                if (!isPureManual || !canSubmit) return;
                runManualComplete();
              }}
              disabled={!isPureManual || !canSubmit || isSubmitting}
              style={styles.manualPress}
              accessibilityRole="button"
              accessibilityLabel={
                isHardVerificationTask && !hardGatesPassed
                  ? "Verification gates must pass first"
                  : "Mark task complete"
              }
              accessibilityState={{ disabled: !isPureManual || !canSubmit || isSubmitting }}
            >
              <Animated.View style={[styles.manualCircle, { transform: [{ scale: manualScale }] }]}>
                <Check
                  size={56}
                  color={DS_COLORS.DISCOVER_GREEN}
                  strokeWidth={2.5}
                  style={{ opacity: isSubmitting ? 0.4 : 1 }}
                />
              </Animated.View>
              <Text style={styles.manualHint}>Tap to mark complete</Text>
              <Text style={styles.hintSmall}>Your word is your proof.</Text>
            </Pressable>
          </View>
        )}

        {/* Journal */}
        {taskTypeRaw === "journal" && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Journal entry</Text>
            <Text style={styles.journalPromptText}>{journalPrompt}</Text>
            <TextInput
              style={styles.journalInput}
              placeholder="Start writing..."
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              value={journalText}
              onChangeText={handleJournalChange}
              multiline
              numberOfLines={10}
              contextMenuHidden
              autoCorrect
              spellCheck
            />
            {minWords > 0 && (
              <View style={styles.wordCountRow}>
                <View style={styles.wordRing}>
                  <View
                    style={[
                      styles.wordRingFill,
                      {
                        width: `${Math.min(100, (wordCount / minWords) * 100)}%`,
                        backgroundColor: wordCount >= minWords ? DS_COLORS.GREEN : GRIIT_COLORS.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.wordCountText, wordCount >= minWords && { color: DS_COLORS.GREEN }]}>
                  {wordCount} / {minWords} words
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Timer (timer tasks, or timed run/workout with strict on-screen mode) */}
        {showWorkoutTimer && requiredSeconds > 0 && (
          <View style={styles.card}>
            {taskTypeRaw === "workout" && (
              <Text style={styles.sectionLabel}>
                {config.require_heart_rate ? "Workout — heart rate verified" : "Workout — timed"}
              </Text>
            )}
            {isHardMode && (
              <View style={styles.hardModeBadge}>
                <Lock size={14} color={GRIIT_COLORS.primary} />
                <Text style={styles.hardModeText}>Hard mode — stay on this screen</Text>
              </View>
            )}
            <Text style={styles.timerDisplay}>{timerDisplay}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressFrac * 100}%`,
                    backgroundColor: timerSeconds >= requiredSeconds ? DS_COLORS.GREEN : GRIIT_COLORS.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.hintSmall}>
              {isCountdown ? "Counting down" : "Counting up"} · {config.min_duration_minutes ?? 0} min required
            </Text>
            <View style={styles.timerRow}>
              <TouchableOpacity
                style={styles.secondaryBtnSmall}
                onPress={() => {
                  setIsTimerRunning((r) => !r);
                  if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                accessibilityRole="button"
                accessibilityLabel={isTimerRunning ? "Pause timer" : "Resume timer"}
              >
                <Text style={styles.secondaryBtnText}>{isTimerRunning ? "Pause" : "Resume"}</Text>
              </TouchableOpacity>
            </View>
            {isHardMode && isTimerRunning && (
              <Text style={styles.warnSmall}>Leaving this screen will pause your timer.</Text>
            )}
          </View>
        )}

        {/* Workout — duration + kind (no distance) */}
        {showWorkoutEntry && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Log your workout</Text>
            <Text style={styles.hintSmall}>Duration required. Add type and notes if you want.</Text>
            <TextInput
              style={styles.textField}
              placeholder="Duration (minutes)"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              keyboardType="number-pad"
              value={workoutDuration}
              onChangeText={setWorkoutDuration}
            />
            <Text style={[styles.hintSmall, { marginBottom: 8 }]}>Type of workout</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {WORKOUT_KINDS.map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[
                    styles.kindChip,
                    workoutKind === k && styles.kindChipOn,
                  ]}
                  onPress={() => setWorkoutKind(k)}
                  accessibilityRole="button"
                  accessibilityLabel={k}
                >
                  <Text style={[styles.kindChipText, workoutKind === k && styles.kindChipTextOn]}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.textField, { minHeight: 72 }]}
              placeholder="Notes (optional)"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              multiline
            />
          </View>
        )}

        {/* Run — manual entry + Strava placeholder */}
        {showRunEntry && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Log your run</Text>
            <Text style={styles.hintSmall}>
              {isRunTimed && isHardMode
                ? "Optional: add distance below. Duration is tracked by the timer above."
                : isRunTimed && !isHardMode
                  ? `Log at least ${minDurMinutes} minutes (duration required). Distance optional unless your challenge expects it.`
                  : "Distance and duration are required. Photo proof if your challenge requires it."}
            </Text>
            <TextInput
              style={styles.textField}
              placeholder="Distance (km)"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              keyboardType="decimal-pad"
              value={runDistance}
              onChangeText={(t) => {
                setRunDistance(t);
                runDistanceKm.current = t;
              }}
            />
            <TextInput
              style={styles.textField}
              placeholder="Duration (minutes)"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              keyboardType="number-pad"
              value={runDuration}
              onChangeText={(t) => {
                setRunDuration(t);
                runDurationMin.current = t;
              }}
            />
            {!Number.isNaN(runKm) && runKm > 0 && !Number.isNaN(runMin) && runMin > 0 ? (
              <Text style={styles.paceHint}>
                Pace: {(runMin / runKm).toFixed(2)} min/km
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.stravaBtn}
              onPress={() => router.push(ROUTES.SETTINGS as never)}
              accessibilityRole="button"
              accessibilityLabel="Open settings for integrations"
            >
              <Text style={styles.stravaBtnText}>Connect Strava (Settings)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Heart rate */}
        {config.require_heart_rate && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Heart rate</Text>
            <Text style={styles.hintSmall}>Minimum {threshold} BPM average</Text>
            {heartRateData ? (
              <View style={styles.hrBox}>
                <View style={styles.hrRow}>
                  <View>
                    <Text style={[styles.hrValue, { color: heartRateData.avg >= threshold ? DS_COLORS.GREEN : DS_COLORS.danger }]}>
                      {heartRateData.avg}
                    </Text>
                    <Text style={styles.hintSmall}>avg BPM</Text>
                  </View>
                  <View>
                    <Text style={[styles.hrValue, { color: GRIIT_COLORS.primary }]}>{heartRateData.peak}</Text>
                    <Text style={styles.hintSmall}>peak BPM</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setHeartRateData(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Change heart rate"
                >
                  <Text style={styles.link}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.textField}
                  placeholder="Average BPM (e.g. 120)"
                  placeholderTextColor={DS_COLORS.inputPlaceholder}
                  value={heartRateManual}
                  onChangeText={setHeartRateManual}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    const avg = parseInt(heartRateManual.trim(), 10);
                    if (Number.isNaN(avg) || avg < 0) {
                      showError("Enter a valid heart rate.");
                      return;
                    }
                    setHeartRateData({ avg, peak: avg + Math.floor(avg * 0.1) });
                    setHeartRateManual("");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Save heart rate"
                >
                  <Text style={styles.primaryBtnText}>Save heart rate</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Location */}
        {config.require_location && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={styles.hintSmall}>Must be at: {config.location_name ?? "the pinned location"}</Text>
            {userLocation ? (
              <View style={styles.locBox}>
                {distance !== null && distance <= radius ? (
                  <>
                    <CheckCircle size={28} color={DS_COLORS.GREEN} />
                    <Text style={[styles.locStatus, { color: DS_COLORS.GREEN }]}>Verified</Text>
                  </>
                ) : (
                  <>
                    <XCircle size={28} color={DS_COLORS.danger} />
                    <Text style={[styles.locStatus, { color: DS_COLORS.danger }]}>
                      Too far ({distance != null ? Math.round(distance) : "?"}m / {radius}m)
                    </Text>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => setUserLocation(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Verify location again"
                >
                  <Text style={styles.link}>Check again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.locCta}
                onPress={handleCheckLocation}
                accessibilityRole="button"
                accessibilityLabel="Verify my location"
              >
                <MapPin size={24} color={GRIIT_COLORS.primary} />
                <Text style={styles.locCtaText}>Verify my location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Photo proof (required add-on or photo task) */}
        {needsPhotoProof && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>{taskTypeRaw === "photo" ? "Submit proof" : "Photo proof"}</Text>
            {photoUri ? (
              <View>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreview}
                  cachePolicy="memory-disk"
                  accessibilityLabel="Photo proof preview"
                />
                <TouchableOpacity
                  onPress={() => {
                    setPhotoUri(null);
                    setPhotoUrl(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Retake photo"
                >
                  <Text style={styles.link}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.photoBig}
                  onPress={handleTakePhoto}
                  disabled={photoUploading}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  accessibilityState={{ disabled: photoUploading }}
                >
                  {photoUploading ? (
                    <ActivityIndicator color={GRIIT_COLORS.primary} />
                  ) : (
                    <>
                      <Camera size={40} color={DS_COLORS.TEXT_MUTED} />
                      <Text style={styles.photoBigText}>Take photo</Text>
                    </>
                  )}
                </TouchableOpacity>
                {config.require_camera_only !== true ? (
                  <TouchableOpacity
                    style={styles.galleryLink}
                    onPress={handlePickImage}
                    disabled={photoUploading}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from gallery"
                    accessibilityState={{ disabled: photoUploading }}
                  >
                    <Text style={styles.link}>Choose from gallery</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.hintSmall}>Camera only — gallery uploads are disabled for this task.</Text>
                )}
              </View>
            )}
            {photoUrl ? <Text style={styles.hintSmall}>Uploaded ✓</Text> : null}
            {taskTypeRaw === "photo" ? (
              <TextInput
                style={[styles.textField, { marginTop: 12 }]}
                placeholder="Caption (optional)"
                placeholderTextColor={DS_COLORS.inputPlaceholder}
                value={photoCaption}
                onChangeText={setPhotoCaption}
                maxLength={200}
              />
            ) : null}
          </View>
        )}
        </View>

        {/* Submit — hidden for pure manual/simple when ready (circle tap submits) */}
        {!(isPureManual && canSubmit) && (
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[styles.primaryBtn, (!canSubmit || isSubmitting) && styles.primaryBtnDisabled]}
              onPress={() => void handleSubmit()}
              disabled={!canSubmit || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={
                isHardVerificationTask && !hardGatesPassed
                  ? "Verification gates must pass first"
                  : "Complete task"
              }
              accessibilityState={{ disabled: !canSubmit || isSubmitting }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isHardVerificationTask && !hardGatesPassed ? "Gates must pass" : "Complete task"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
          </>
        ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function TaskCompleteScreen() {
  return (
    <ErrorBoundary>
      <TaskCompleteScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: DS_SPACING.cardPadding, paddingBottom: DS_SPACING.section },
  screenTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: DS_SPACING.xs,
  },
  headerSubtitle: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED, marginBottom: DS_SPACING.md },
  muted: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED, marginBottom: DS_SPACING.md },
  mutedCenter: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED, textAlign: "center", marginTop: DS_SPACING.sm },
  card: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.lg,
    marginTop: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.BORDER,
  },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginBottom: DS_SPACING.sm },
  journalPromptText: {
    fontSize: 15,
    fontWeight: "500",
    fontStyle: "italic",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
    lineHeight: 22,
  },
  hintSmall: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginBottom: DS_SPACING.md },
  warnSmall: { fontSize: 12, color: DS_COLORS.danger, textAlign: "center", marginTop: DS_SPACING.sm },
  manualPress: { alignItems: "center", paddingVertical: DS_SPACING.xl },
  manualCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: DS_COLORS.DISCOVER_GREEN,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.GREEN_BG,
  },
  manualHint: { marginTop: DS_SPACING.lg, fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  journalInput: {
    backgroundColor: DS_COLORS.WHITE,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 14,
    padding: 16,
    paddingTop: 14,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
    minHeight: 200,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  wordCountRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  wordRing: { flex: 1, height: 4, backgroundColor: DS_COLORS.chipFill, borderRadius: 2, overflow: "hidden" },
  wordRingFill: { height: "100%", borderRadius: 2 },
  wordCountText: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, minWidth: 80, textAlign: "right" },
  wordCount: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, marginTop: DS_SPACING.sm },
  hardModeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: 8,
    borderRadius: DS_RADIUS.input / 2,
    marginBottom: DS_SPACING.md,
  },
  hardModeText: { fontSize: 12, color: GRIIT_COLORS.primary, fontWeight: "600" },
  timerDisplay: {
    fontSize: 56,
    fontWeight: "800",
    color: DS_COLORS.TEXT_PRIMARY,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  progressBar: {
    height: DS_MEASURES.progressBarHeight,
    backgroundColor: DS_COLORS.BORDER,
    borderRadius: 3,
    marginTop: DS_SPACING.lg,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  timerRow: { flexDirection: "row", justifyContent: "center", marginTop: DS_SPACING.lg },
  secondaryBtnSmall: {
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.xxl,
    borderRadius: 28,
    backgroundColor: DS_COLORS.chipFill,
  },
  stravaBtn: {
    marginTop: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    alignItems: "center",
  },
  stravaBtnText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "600", color: DS_COLORS.TEXT_MUTED },
  hrBox: { alignItems: "center", gap: DS_SPACING.sm },
  hrRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  hrValue: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  locBox: { alignItems: "center", gap: DS_SPACING.sm },
  locStatus: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "600" },
  locCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.card,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  locCtaText: { fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  photoPreview: { width: "100%", height: 200, borderRadius: DS_RADIUS.card, backgroundColor: DS_COLORS.BG_CARD_TINTED },
  photoBig: {
    minHeight: 160,
    borderRadius: DS_RADIUS.card,
    borderWidth: 2,
    borderColor: DS_COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  photoBigText: { marginTop: DS_SPACING.sm, fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },
  galleryLink: { marginTop: DS_SPACING.md, alignItems: "center" },
  link: { fontSize: DS_TYPOGRAPHY.SIZE_SM, fontWeight: "600", color: GRIIT_COLORS.primary, marginTop: DS_SPACING.sm },
  textField: {
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.BORDER,
    borderRadius: DS_RADIUS.input,
    padding: DS_SPACING.md,
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: DS_SPACING.sm,
  },
  hardGatesDimmed: { opacity: 0.45 },
  missedWindowCard: {
    backgroundColor: DS_COLORS.BADGE_HARD_BG,
    borderRadius: 16,
    padding: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
    borderWidth: 1,
    borderColor: DS_COLORS.BADGE_HARD_RED,
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  missedWindowTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.BADGE_HARD_RED,
    textAlign: "center",
  },
  missedWindowSub: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: DS_SPACING.sm,
  },
  submitSection: { marginTop: DS_SPACING.xxl, paddingBottom: DS_SPACING.xxl },
  primaryBtn: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    ...DS_SHADOWS.button,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: DS_COLORS.WHITE, fontSize: 16, fontWeight: "500" },
  paceHint: { fontSize: 13, color: DS_COLORS.TEXT_SECONDARY, marginBottom: DS_SPACING.sm },
  kindChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.WHITE,
  },
  kindChipOn: { borderColor: DS_COLORS.DISCOVER_CORAL, backgroundColor: DS_COLORS.ACCENT_TINT },
  kindChipText: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_SECONDARY },
  kindChipTextOn: { color: DS_COLORS.DISCOVER_CORAL },
  secondaryBtn: {
    backgroundColor: DS_COLORS.BORDER,
    borderRadius: 28,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
  },
  secondaryBtnText: { color: DS_COLORS.TEXT_PRIMARY, fontSize: DS_TYPOGRAPHY.SIZE_MD, fontWeight: "600" },
  successWrap: { flex: 1, padding: DS_SPACING.xl, justifyContent: "center", alignItems: "center" },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DS_COLORS.GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.xl,
  },
  successTitle: { fontSize: 20, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
});

const celebStyles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  fireEmoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: DS_COLORS.WHITE },
  subtitle: { fontSize: 14, color: DS_COLORS.TEXT_ON_DARK_50, marginTop: 6 },
  rewardPill: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rewardText: { fontSize: 13, fontWeight: "700" },
  ctaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  shareCta: {
    backgroundColor: GRIIT_COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  shareCtaText: { fontSize: 15, fontWeight: "700", color: DS_COLORS.WHITE },
  nextCta: {
    backgroundColor: DS_COLORS.OVERLAY_WHITE_8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
  },
  nextCtaText: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_ON_DARK_60 },
  doneBtn: { marginTop: 20 },
  doneBtnText: {
    fontSize: 14,
    color: DS_COLORS.TEXT_ON_DARK_50,
    fontWeight: "500",
    paddingVertical: 8,
  },
  photoSection: {
    alignSelf: "stretch",
    marginTop: 20,
    marginBottom: 4,
  },
  photoPreview: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: DS_COLORS.OVERLAY_BLACK_30,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoChangeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: DS_COLORS.FEED_GRADIENT_END,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoChangeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
  },
  photoPickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoPickerBtn: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DS_COLORS.OVERLAY_WHITE_15,
    borderStyle: "dashed",
    backgroundColor: DS_COLORS.OVERLAY_WHITE_4,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  photoPickerText: {
    fontSize: 11,
    color: DS_COLORS.TEXT_ON_DARK_45,
    fontWeight: "500",
  },
  captionLabel: {
    alignSelf: "stretch",
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.TEXT_ON_DARK_45,
    marginTop: 20,
    marginBottom: 8,
  },
  captionInput: {
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: DS_COLORS.OVERLAY_WHITE_22,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: DS_COLORS.WHITE,
    backgroundColor: DS_COLORS.OVERLAY_WHITE_6,
    marginBottom: 12,
  },
  postedOk: { fontSize: 14, fontWeight: "600", color: DS_COLORS.GREEN, marginBottom: 8 },
  postedErr: { fontSize: 13, color: DS_COLORS.ERROR_RED, marginBottom: 8, textAlign: "center" },
  shareToFeedBtn: {
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  shareToFeedText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.WHITE },
  shareStoriesBtn: {
    marginTop: 10,
    alignSelf: "stretch",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: DS_COLORS.OVERLAY_WHITE_15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  shareStoriesBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.TEXT_ON_DARK_60,
  },
});
