/**
 * Task completion screen state, handlers, and layout (extracted from app/task/complete.tsx).
 */
import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform, Animated } from "react-native";
import { useCelebrationStore } from "@/store/celebrationStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { haversineDistance } from "@/lib/geo";
import { DS_COLORS, DS_SPACING, GRIIT_COLORS } from "@/lib/design-system";
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
import { useJournalInput } from "@/hooks/useJournalInput";
import { useTaskCompleteShareCardProps } from "@/hooks/useTaskCompleteShareCardProps";
import { TaskCompleteCelebration } from "@/components/task/TaskCompleteCelebration";
import { TaskCompleteForm } from "@/components/task/TaskCompleteForm";
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
  const { activeChallenge, completeTask, challenge, stats, computeProgress, todayCheckins } = useApp();
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

  const { error, showError, clearError } = useInlineError();
  const [heartRateData, setHeartRateData] = useState<{ avg: number; peak: number } | null>(null);
  const [heartRateManual, setHeartRateManual] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [hardGatesPassed, setHardGatesPassed] = useState(true);
  const [timeWindowFailed, setTimeWindowFailed] = useState(false);
  const [gatesLocation, setGatesLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  const { photoUri, photoUrl, photoUploading, handleTakePhoto, handlePickImage, clearPhoto } = usePhotoCapture({
    requireCameraOnly: config.require_camera_only === true,
    onError: showError,
  });

  const { timerSeconds, isTimerRunning, onScreenSecondsRef, timerDisplay, progressFrac, timerOk, hardModeOk, toggleTimer } =
    useTaskTimer({
      requiredSeconds,
      isCountdown,
      isHardMode,
      autoStart: showWorkoutTimer,
    });

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
      });
      setCompletionMeta({ taskId, details: noteTextOut?.trim() ?? "", timeLabel });
      setCompletionIdForShare(
        completionResult && typeof completionResult === "object" && "completionId" in completionResult
          ? (completionResult as { completionId?: string }).completionId
          : undefined
      );
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
    return (
      <TaskCompleteCelebration
        taskName={taskName}
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
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
      <Stack.Screen options={{ title: taskName, headerBackVisible: true }} />
      <FlatList
        data={[{ key: "task-complete-root" }]}
        keyExtractor={(item) => item.key}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        renderItem={() => (
          <TaskCompleteForm
            error={error}
            clearError={clearError}
            isHardVerificationTask={isHardVerificationTask}
            hardVerificationConfig={hardVerificationConfig}
            onHardGatesResolved={onHardGatesResolved}
            onHardTimeWindowFailed={onHardTimeWindowFailed}
            timeWindowFailed={timeWindowFailed}
            hardGatesPassed={hardGatesPassed}
            taskName={taskName}
            headerChallengeName={headerChallengeName}
            headerCurrentDay={headerCurrentDay}
            headerDurationDays={headerDurationDays}
            taskTypeRaw={taskTypeRaw}
            config={config}
            isPureManual={isPureManual}
            canSubmit={canSubmit}
            runManualComplete={runManualComplete}
            isSubmitting={isSubmitting}
            manualScale={manualScale}
            journalPrompt={journalPrompt}
            journalText={journalText}
            handleJournalChange={handleJournalChange}
            minWords={minWords}
            wordCount={wordCount}
            showWorkoutTimer={showWorkoutTimer}
            requiredSeconds={requiredSeconds}
            isHardMode={isHardMode}
            isCountdown={isCountdown}
            timerDisplay={timerDisplay}
            progressFrac={progressFrac}
            timerSeconds={timerSeconds}
            timerOk={timerOk}
            isTimerRunning={isTimerRunning}
            toggleTimer={toggleTimer}
            showWorkoutEntry={showWorkoutEntry}
            workoutDuration={workoutDuration}
            setWorkoutDuration={setWorkoutDuration}
            workoutKind={workoutKind}
            setWorkoutKind={setWorkoutKind}
            workoutNotes={workoutNotes}
            setWorkoutNotes={setWorkoutNotes}
            showRunEntry={showRunEntry}
            isRunTimed={isRunTimed}
            runDistance={runDistance}
            setRunDistance={setRunDistance}
            runDuration={runDuration}
            setRunDuration={setRunDuration}
            runDistanceKm={runDistanceKm}
            runDurationMin={runDurationMin}
            runKm={runKm}
            runMin={runMin}
            minDurMinutes={minDurMinutes}
            needsPhotoProof={needsPhotoProof}
            photoUri={photoUri}
            photoUrl={photoUrl}
            photoUploading={photoUploading}
            handleTakePhoto={handleTakePhoto}
            handlePickImage={handlePickImage}
            clearPhoto={clearPhoto}
            photoCaption={photoCaption}
            setPhotoCaption={setPhotoCaption}
            handleSubmit={handleSubmit}
            heartRateData={heartRateData}
            setHeartRateData={setHeartRateData}
            heartRateManual={heartRateManual}
            setHeartRateManual={setHeartRateManual}
            threshold={threshold}
            showError={showError}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            distance={distance}
            radius={radius}
            handleCheckLocation={handleCheckLocation}
          />
        )}
      />
    </SafeAreaView>
  );
}
