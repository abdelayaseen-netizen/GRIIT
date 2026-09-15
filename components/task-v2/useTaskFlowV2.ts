import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { firstString, parseConfig } from "@/lib/task-helpers";
import { counterUnitFromTaskType } from "@/lib/counter-log";
import { evaluateScheduleWindow } from "@/lib/schedule-window";
import { haversineDistance } from "@/lib/geo";
import { resolveCheckinRadiusMeters } from "@/lib/checkin-ready-gates";
import { resolveConfigCounterTarget } from "@/lib/real-verification-gates";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { getTodayDateKey } from "@/lib/date-utils";
import { assembleSubmitResult, type SubmitResult, type VerificationKind } from "@/lib/task-completion-result";
import { attemptSecureDayAfterComplete, pickNextUndoneEnrollmentId } from "@/lib/day-secure-ui";
import { taskSecuredHref } from "@/lib/task-secured-nav";
import { shareProgressImage } from "@/lib/share";
import { failureErrorCode, failureScreenCopy, verificationLine } from "@/lib/task-completion-copy";
import { formatDistance, parseDistanceUnit, toKilometers, type DistanceUnit } from "@/lib/distance-unit";
import {
  clearLocalTimerSession,
  loadLocalTimerSession,
  saveLocalTimerSession,
} from "@/lib/task-session-store";
import { cancelTimerDoneNotification, scheduleTimerDoneNotification } from "@/lib/timer-done-notification";
import { startLiveActivity, endLiveActivity } from "@/lib/live-activity";
import {
  type TaskFlowStep,
  checkinGpsNextStep,
  chromeFlags,
  chromeTitle,
  clockLabel,
  discardPhotoStep,
  finishSubmitOutcome,
  fmtMmSs,
  initialStep,
  isHonest,
  resolveGoBack,
  resolveGoBackFromFailure,
  resolveRetryFailedSubmit,
  shouldBlockOnWindow,
  submitWithoutPhotoNext,
  timerResumeStep,
  timerShouldAutoSubmit,
  verificationKindFor,
  wordCount,
} from "@/lib/task-flow-state";

export function useTaskFlowV2() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId?: string;
    activeChallengeId?: string;
    taskType?: string;
    taskName?: string;
    taskConfig?: string;
    challengeName?: string;
    currentDay?: string;
    durationDays?: string;
  }>();
  const { user } = useAuth();
  const { completeTask, secureDay, profile } = useApp();

  const taskId = firstString(params.taskId);
  const activeChallengeId = firstString(params.activeChallengeId);
  const taskType = (firstString(params.taskType) || "manual").toLowerCase();
  const taskName = firstString(params.taskName) || "Task";
  const config = useMemo(() => parseConfig(firstString(params.taskConfig)), [params.taskConfig]);
  const challengeName = firstString(params.challengeName) || "Challenge";
  const currentDay = Math.max(1, parseInt(firstString(params.currentDay) || "1", 10) || 1);
  const durationDays = Math.max(1, parseInt(firstString(params.durationDays) || "14", 10) || 14);
  const userId = user?.id ?? "";
  const dateKey = getTodayDateKey(profile?.timezone ?? undefined);
  const requiredSeconds = Math.max(1, (config.min_duration_minutes ?? 10) * 60);
  const minWords = config.min_words ?? 150;
  const counterGoal = resolveConfigCounterTarget(config) || 8;
  const taskRequired = config.required !== false;
  const requirePhoto = config.require_photo === true;
  const counterUnit = counterUnitFromTaskType(taskType);
  const radius = resolveCheckinRadiusMeters(config.location_radius_meters);
  const place = config.location_name || "the saved location";

  const [step, setStep] = useState<TaskFlowStep>(() => initialStep(taskType));
  const [caption, setCaption] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [discardAsk, setDiscardAsk] = useState(false);
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [keypad, setKeypad] = useState<{ field: "distance" | "duration" | "minutes" | "count" } | null>(null);
  const [buffer, setBuffer] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [workoutMin, setWorkoutMin] = useState<number | null>(null);
  const [unit, setUnit] = useState<DistanceUnit>(parseDistanceUnit(profile?.distance_unit));
  const [kind, setKind] = useState("Lift");
  const [usedSessionTimer, setUsedSessionTimer] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [startedAtIso, setStartedAtIso] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [sessionUp, setSessionUp] = useState(0);
  const [gps, setGps] = useState<{ m: number; acc: number } | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [challengeDone, setChallengeDone] = useState<{
    challengeTitle: string;
    remainingChallenges: number;
  } | null>(null);
  const [failNote, setFailNote] = useState("");
  const [failCode, setFailCode] = useState<string | undefined>(undefined);

  const windowEval = evaluateScheduleWindow({
    start: config.schedule_window_start,
    end: config.schedule_window_end,
    timeZone: config.schedule_timezone ?? profile?.timezone,
  });

  useEffect(() => {
    if (shouldBlockOnWindow({ windowStatus: windowEval.status, taskType, step })) {
      setStep("blocked");
    }
  }, [windowEval.status, taskType, step]);

  useEffect(() => {
    if (taskType !== "timer" || !userId || !taskId) return;
    void loadLocalTimerSession(userId, taskId, dateKey).then((s) => {
      if (!s) return;
      setStartedAtIso(s.startedAtIso);
      setSoundOn(s.soundOn);
      const remaining = s.requiredSeconds - (Date.now() - Date.parse(s.startedAtIso)) / 1000;
      setStep(timerResumeStep(remaining));
      if (remaining <= 0) void submitTimer();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, taskId, dateKey, taskType]);

  useEffect(() => {
    if (step !== "running" && step !== "session") return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "session") return;
    const id = setInterval(() => setSessionUp((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  const refreshGps = useCallback(async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const lat = config.location_latitude;
    const lng = config.location_longitude;
    if (lat == null || lng == null) return;
    const m = haversineDistance(loc.coords.latitude, loc.coords.longitude, lat, lng);
    setGps({ m: Math.round(m), acc: Math.round(loc.coords.accuracy ?? 0) });
    const next = checkinGpsNextStep(m, radius, taskType);
    if (next) setStep(next);
  }, [config.location_latitude, config.location_longitude, radius, taskType]);

  useEffect(() => {
    if (taskType !== "checkin") return;
    void refreshGps();
  }, [taskType, refreshGps]);

  const remainingSec = startedAtIso
    ? Math.max(0, requiredSeconds - (nowTick - Date.parse(startedAtIso)) / 1000)
    : requiredSeconds;

  const exit = useCallback(() => {
    void endLiveActivity();
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const goNextChallenge = useCallback(async () => {
    if (!activeChallengeId) {
      exit();
      return;
    }
    try {
      const [activeList, checkins] = await Promise.all([
        trpcQuery(TRPC.challenges.listMyActive) as Promise<
          Array<{
            id: string;
            challenges?: { challenge_tasks?: Array<{ id: string; config?: { required?: boolean } }> };
          }>
        >,
        trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<
          Array<{ active_challenge_id?: string; task_id?: string; status?: string }>
        >,
      ]);
      const nextId = pickNextUndoneEnrollmentId({
        currentId: activeChallengeId,
        enrollments: Array.isArray(activeList) ? activeList : [],
        completed: Array.isArray(checkins) ? checkins : [],
      });
      if (nextId) {
        router.replace(ROUTES.CHALLENGE_ACTIVE(nextId) as never);
        return;
      }
    } catch {
      /* fall through to exit */
    }
    exit();
  }, [activeChallengeId, exit, router]);

  const persistUnit = useCallback((next: DistanceUnit) => {
    setUnit(next);
    void trpcMutate(TRPC.profiles.update, { distance_unit: next }).catch(() => {});
  }, []);

  const goBack = useCallback(() => {
    const decision = resolveGoBack({ step, caption, taskType });
    if (decision.action === "discard_ask") {
      setDiscardAsk(true);
      return;
    }
    if (decision.action === "stay") return;
    if (decision.action === "set_step") {
      if (decision.clearPhoto) setPhotoUri(null);
      setStep(decision.step);
      return;
    }
    exit();
  }, [step, caption, taskType, exit]);

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoUri) return null;
    const b64 = await FileSystem.readAsStringAsync(photoUri, { encoding: "base64" as never });
    const uploaded = await uploadProofImageFromBase64(b64, "image/jpeg");
    if ("error" in uploaded) {
      setFailCode(undefined);
      setFailNote(uploaded.error);
      setStep("failed");
      return null;
    }
    return uploaded.url;
  };

  const finishSubmit = async (payload: Record<string, unknown>, kind: VerificationKind) => {
    setStep("verifying");
    try {
      const complete = await completeTask({
        activeChallengeId,
        taskId,
        ...payload,
      });
      if (finishSubmitOutcome({ complete }) === "failed" || !complete) {
        setFailCode(undefined);
        setFailNote("Couldn't save. Try again.");
        setStep("failed");
        return;
      }
      let secure: {
        success?: boolean;
        alreadySecured?: boolean;
        newStreakCount?: number;
        secured?: boolean;
        challenge_done?: boolean;
        remaining_challenges?: number;
      } | null = null;
      const after = await attemptSecureDayAfterComplete({
        requiredRemaining: complete.requiredRemaining,
        activeChallengeId,
        challengeTitle: complete.challengeName ?? challengeName,
        secureDay,
      });
      if (after.ui.kind === "challenge_done") {
        setChallengeDone({
          challengeTitle: after.ui.challengeTitle,
          remainingChallenges: after.ui.remainingChallenges,
        });
        if (userId && taskId) await clearLocalTimerSession(userId, taskId, dateKey);
        void endLiveActivity();
        setStep("challenge_done");
        return;
      }
      if (after.result) {
        const r = after.result as {
          success?: boolean;
          alreadySecured?: boolean;
          newStreakCount?: number;
          secured?: boolean;
          challenge_done?: boolean;
          remaining_challenges?: number;
        };
        secure = {
          success: r.success === true,
          alreadySecured: r.alreadySecured,
          newStreakCount: r.newStreakCount,
          secured: r.secured,
          challenge_done: r.challenge_done,
          remaining_challenges: r.remaining_challenges,
        };
      }
      const assembled = assembleSubmitResult({
        verificationKind: complete.verificationKind ?? kind,
        requiredRemaining: complete.requiredRemaining,
        dayAlreadySecured: complete.dayAlreadySecured ?? false,
        streakDaysBefore: complete.streakDays ?? 0,
        challengeDayBeforeSecure: complete.challengeDay ?? currentDay,
        challengeLength: complete.challengeLength ?? durationDays,
        challengeName: complete.challengeName ?? challengeName,
        secure: secure
          ? {
              success: secure.success === true,
              alreadySecured: secure.alreadySecured,
              newStreakCount: secure.newStreakCount,
              secured: secure.secured,
              challenge_done: secure.challenge_done,
              remaining_challenges: secure.remaining_challenges,
            }
          : null,
      });
      setResult(assembled);
      if (userId && taskId) await clearLocalTimerSession(userId, taskId, dateKey);
      void endLiveActivity();
      // secureDay already awaited invalidate+refetch (useAppChallengeMutations 291–296).
      router.push(taskSecuredHref(assembled, photoUri ?? undefined, taskName) as never);
    } catch (err) {
      setFailCode(failureErrorCode(err));
      setFailNote(err instanceof Error ? err.message : "Couldn't save. Try again.");
      setStep("failed");
    }
  };

  const submitPhoto = async (extra: Record<string, unknown> = {}) => {
    const url = await uploadPhoto();
    if (!url) return;
    await finishSubmit(
      {
        proofUrl: url,
        photo_url: url,
        noteText: caption.trim() || undefined,
        proof_payload_json: capturedAt
          ? { capturedAt, captured_in_app: true }
          : undefined,
        ...extra,
        ...(taskType === "timer" ? { value: Math.floor(requiredSeconds / 60) } : {}),
        ...(taskType === "journal" ? { noteText: text } : {}),
        ...(taskType === "counter" || taskType === "water" || taskType === "reading"
          ? { value: count }
          : {}),
        ...(taskType === "checkin"
          ? {
              location_latitude: config.location_latitude,
              location_longitude: config.location_longitude,
            }
          : {}),
      },
      verificationKindFor(taskType, true)
    );
  };

  const submitWithoutPhoto = async (payload: Record<string, unknown>, kind: VerificationKind) => {
    if (submitWithoutPhotoNext(requirePhoto) === "capture") {
      setStep("capture");
      return;
    }
    await finishSubmit(payload, kind);
  };

  const submitTimer = async () => {
    await submitWithoutPhoto({ value: Math.floor(requiredSeconds / 60) }, "timer");
  };

  const startTimer = async () => {
    let started: { started_at: string; required_seconds: number } | null = null;
    try {
      started = await trpcMutate<{ started_at: string; required_seconds: number }>(TRPC.checkins.startSession, {
        activeChallengeId,
        taskId,
        requiredSeconds,
        kind: "timer",
      });
    } catch (err) {
      setFailCode(failureErrorCode(err));
      setFailNote(err instanceof Error ? err.message : "Couldn't start the timer.");
      setStep("failed");
      return;
    }
    if (!started?.started_at) {
      setFailCode(undefined);
      setFailNote("Couldn't start the timer.");
      setStep("failed");
      return;
    }
    const iso = started.started_at;
    setStartedAtIso(iso);
    if (userId) {
      await saveLocalTimerSession(userId, {
        kind: "timer",
        startedAtIso: iso,
        requiredSeconds,
        activeChallengeId,
        taskId,
        dateKey,
        soundOn,
      });
    }
    const ends = new Date(Date.parse(iso) + requiredSeconds * 1000);
    await scheduleTimerDoneNotification({
      taskId,
      at: ends,
      durationLabel: fmtMmSs(requiredSeconds),
      sound: soundOn,
      route: `${ROUTES.TASK_COMPLETE}?taskId=${encodeURIComponent(taskId)}&activeChallengeId=${encodeURIComponent(activeChallengeId)}&taskType=timer&taskName=${encodeURIComponent(taskName)}&taskConfig=${encodeURIComponent(firstString(params.taskConfig))}&challengeName=${encodeURIComponent(challengeName)}&currentDay=${currentDay}&durationDays=${durationDays}`,
    });
    startLiveActivity({
      taskId,
      taskTitle: taskName,
      challengeName,
      timerType: "checkin",
      startedAtMs: Date.parse(iso),
      targetSeconds: requiredSeconds,
      route: ROUTES.TASK_COMPLETE,
    });
    setStep("running");
  };

  const retryFailedSubmit = () => {
    setFailNote("");
    setFailCode(undefined);
    const decision = resolveRetryFailedSubmit({
      hasPhoto: !!photoUri,
      taskType,
      requirePhoto,
      timerReadyToSubmit: !!(startedAtIso && remainingSec <= 0),
    });
    if (decision === "submit_photo") {
      void submitPhoto();
      return;
    }
    if (decision === "start_timer") {
      void startTimer();
      return;
    }
    if (decision === "capture") {
      setStep("capture");
      return;
    }
    if (decision === "submit_timer") {
      void submitTimer();
      return;
    }
    if (decision === "submit_journal") {
      void finishSubmit({ noteText: text }, "word_count");
      return;
    }
    if (decision === "submit_count") {
      void finishSubmit({ value: count }, "self_report");
      return;
    }
    if (decision === "submit_checkin") {
      void finishSubmit(
        {
          location_latitude: config.location_latitude,
          location_longitude: config.location_longitude,
        },
        "gps"
      );
      return;
    }
    if (decision === "log") {
      setStep("log");
      return;
    }
    void finishSubmit({}, "self_report");
  };

  const goBackFromFailure = () => {
    setFailNote("");
    setFailCode(undefined);
    setStep(resolveGoBackFromFailure({ requirePhoto, hasPhoto: !!photoUri, taskType }));
  };

  const cancelTimer = async () => {
    if (userId) await clearLocalTimerSession(userId, taskId, dateKey);
    await cancelTimerDoneNotification(taskId);
    void endLiveActivity();
    exit();
  };

  useEffect(() => {
    if (timerShouldAutoSubmit(step, remainingSec, !!startedAtIso)) {
      void submitTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, remainingSec, startedAtIso]);

  const { dark, hideChrome } = chromeFlags(step);
  const fail = failureScreenCopy({
    errorCode: failCode,
    message: failNote,
    hasLocalPhoto: !!photoUri,
  });

  const verifyLine = verificationLine({
    kind: (taskType === "simple" ? "manual" : taskType) as Parameters<typeof verificationLine>[0]["kind"],
    timeLabel: capturedAt ? clockLabel(capturedAt) : clockLabel(Date.now()),
    durationLabel:
      taskType === "timer"
        ? fmtMmSs(requiredSeconds)
        : taskType === "run"
          ? durationSec != null
            ? fmtMmSs(durationSec)
            : ""
          : taskType === "workout"
            ? `${workoutMin ?? 0} min`
            : undefined,
    startedAtLabel: startedAtIso ? clockLabel(startedAtIso) : undefined,
    distanceLabel: distance != null ? formatDistance(toKilometers(distance, unit), unit) : undefined,
    words: wordCount(text),
    gpsMeters: gps?.m,
    accuracyM: gps?.acc,
  });

  const onLogKeypadDone = (v: number | null) => {
    if (keypad?.field === "distance") setDistance(v);
    if (keypad?.field === "duration") setDurationSec(v);
    if (keypad?.field === "minutes") setWorkoutMin(v);
    setKeypad(null);
    setBuffer("");
  };

  const onCountKeypadDone = (v: number | null) => {
    setCount(Math.min(counterGoal, Math.max(0, v ?? 0)));
    setKeypad(null);
    setBuffer("");
  };

  const onUseTimer = () => {
    setSessionUp(0);
    setStep("session");
    startLiveActivity({
      taskId,
      taskTitle: taskName,
      challengeName,
      timerType: taskType === "run" ? "run_gps" : "run_treadmill",
      startedAtMs: Date.now(),
      route: ROUTES.TASK_COMPLETE,
    });
  };

  const onSessionStop = () => {
    void endLiveActivity();
    setUsedSessionTimer(true);
    if (taskType === "run") setDurationSec(Math.max(1, sessionUp));
    else setWorkoutMin(Math.max(1, Math.round(sessionUp / 60)));
    setStep("log");
  };

  const onSessionCancel = () => {
    void endLiveActivity();
    setStep("log");
  };

  const onReviewPost = () => {
    void submitPhoto(
      taskType === "run"
        ? {
            distance_km: distance != null ? toKilometers(distance, unit) : undefined,
            duration_min: durationSec != null ? durationSec / 60 : undefined,
            entry_mode: usedSessionTimer ? "timer" : "hand",
          }
        : taskType === "workout"
          ? {
              duration_min: workoutMin ?? undefined,
              workout_kind: kind,
              entry_mode: usedSessionTimer ? "timer" : "hand",
            }
          : taskType === "reading"
            ? { value: count }
            : {}
    );
  };

  const onDiscardPhoto = () => {
    setDiscardAsk(false);
    setCaption("");
    setPhotoUri(null);
    setStep(discardPhotoStep(taskType));
  };

  return {
    step,
    dark,
    hideChrome,
    currentDay,
    taskType,
    taskName,
    challengeName,
    windowEval,
    config,
    place,
    radius,
    gps,
    requiredSeconds,
    soundOn,
    setSoundOn,
    keypad,
    buffer,
    setBuffer,
    unit,
    distance,
    durationSec,
    workoutMin,
    kind,
    setKind,
    sessionUp,
    photoUri,
    caption,
    setCaption,
    remainingSec,
    startedAtIso,
    text,
    setText,
    minWords,
    count,
    counterGoal,
    counterUnit,
    result,
    challengeDone,
    fail,
    discardAsk,
    taskRequired,
    verifyLine,
    chromeTitle: chromeTitle(taskType),
    goBack,
    exit,
    refreshGps,
    startTimer,
    persistUnit,
    onLogKeypadDone,
    onOpenDistance: () => {
      setKeypad({ field: "distance" });
      setBuffer("");
    },
    onOpenDuration: () => {
      setKeypad({ field: taskType === "run" ? "duration" : "minutes" });
      setBuffer("");
    },
    onUseTimer,
    onNextPhoto: () => setStep("capture"),
    onSessionStop,
    onSessionCancel,
    onCaptured: (uri: string, at: string) => {
      setPhotoUri(uri);
      setCapturedAt(at);
      setStep("review");
    },
    onRetake: () => {
      setPhotoUri(null);
      setStep("capture");
    },
    onReviewPost,
    cancelTimer,
    submitWithoutPhoto,
    onAddOne: () => setCount((c) => Math.min(counterGoal, c + 1)),
    onOpenCountKeypad: () => {
      setKeypad({ field: "count" });
      setBuffer("");
    },
    onRemoveOne: () => setCount((c) => Math.max(0, c - 1)),
    onCountKeypadDone,
    onAttachPhoto: () => setStep("capture"),
    onSubmitCount: () => void submitWithoutPhoto({ value: count }, "self_report"),
    onDidIt: () => void submitWithoutPhoto({}, "self_report"),
    onHere: () =>
      void submitWithoutPhoto(
        {
          location_latitude: config.location_latitude,
          location_longitude: config.location_longitude,
        },
        "gps"
      ),
    onJournalPost: () => void submitWithoutPhoto({ noteText: text }, "word_count"),
    goNextChallenge,
    goBackFromFailure,
    retryFailedSubmit,
    onDiscardPhoto,
    onKeepPhoto: () => setDiscardAsk(false),
    onShare: (uri: string) => {
      if (!result) return;
      void shareProgressImage(uri, `${taskName}. Day ${result.challengeDay} on GRIIT.`);
    },
    isHonest: isHonest(taskType, !!photoUri),
  };
}
