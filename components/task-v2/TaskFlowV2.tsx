import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { firstString, parseConfig } from "@/lib/task-helpers";
import { evaluateScheduleWindow } from "@/lib/schedule-window";
import { haversineDistance } from "@/lib/geo";
import { resolveCheckinRadiusMeters } from "@/lib/checkin-ready-gates";
import { resolveConfigCounterTarget } from "@/lib/real-verification-gates";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { getTodayDateKey } from "@/lib/date-utils";
import {
  assembleSubmitResult,
  type SubmitResult,
  type VerificationKind,
} from "@/lib/task-completion-result";
import { failedUploadCopy, verificationLine } from "@/lib/task-completion-copy";
import { formatDistance, parseDistanceUnit, toKilometers, type DistanceUnit } from "@/lib/distance-unit";
import { type KeypadMask } from "@/lib/keypad-masks";
import {
  clearLocalTimerSession,
  loadLocalTimerSession,
  saveLocalTimerSession,
} from "@/lib/task-session-store";
import { cancelTimerDoneNotification, scheduleTimerDoneNotification } from "@/lib/timer-done-notification";
import { startLiveActivity, endLiveActivity } from "@/lib/live-activity";
import { TaskChrome } from "./TaskChrome";
import { TaskCapture } from "./TaskCapture";
import { TaskConfirmation } from "./TaskConfirmation";
import { TaskKeypad } from "./TaskKeypad";
import { TaskVerifying } from "./TaskVerifying";

type Step =
  | "entry"
  | "log"
  | "session"
  | "capture"
  | "review"
  | "running"
  | "write"
  | "count"
  | "ask"
  | "verifying"
  | "confirmation"
  | "blocked"
  | "failed";

function chromeTitle(type: string): string {
  if (type === "photo") return "Photo proof";
  if (type === "water") return "Water";
  if (type === "reading") return "Pages";
  if (type === "simple" || type === "manual") return "Self-report";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function initialStep(type: string): Step {
  if (type === "photo") return "capture";
  if (type === "timer" || type === "checkin") return "entry";
  if (type === "run" || type === "workout") return "log";
  if (type === "journal") return "write";
  if (type === "counter" || type === "water") return "count";
  return "ask";
}

function fmtMmSs(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function clockLabel(isoOrMs: string | number): string {
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function isHonest(type: string, hasPhoto: boolean): boolean {
  if (type === "manual" || type === "simple" || type === "counter" || type === "water") return false;
  if (type === "reading") return hasPhoto;
  return true;
}

function verificationKindFor(type: string, hasPhoto: boolean): VerificationKind {
  if (type === "photo" || (type === "reading" && hasPhoto) || type === "run" || type === "workout") return "live_photo";
  if (type === "timer") return "timer";
  if (type === "checkin") return "gps";
  if (type === "journal") return "word_count";
  return "self_report";
}

export function TaskFlowV2() {
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
  const counterUnit = config.unit_label || (taskType === "water" ? "glasses" : "count");
  const radius = resolveCheckinRadiusMeters(config.location_radius_meters);
  const place = config.location_name || "the saved location";

  const [step, setStep] = useState<Step>(() => initialStep(taskType));
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
  const [failNote, setFailNote] = useState("");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdOpenedKeypad = useRef(false);

  const windowEval = evaluateScheduleWindow({
    start: config.schedule_window_start,
    end: config.schedule_window_end,
    timeZone: config.schedule_timezone ?? profile?.timezone,
  });

  useEffect(() => {
    if (windowEval.status === "out_of_window" && (taskType === "photo" || step === "capture")) {
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
      setStep(remaining <= 0 ? "verifying" : "running");
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
    if (m > radius) setStep("blocked");
    else if (taskType === "checkin") setStep("entry");
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

  const persistUnit = useCallback(
    (next: DistanceUnit) => {
      setUnit(next);
      void trpcMutate(TRPC.profiles.update, { distance_unit: next }).catch(() => {});
    },
    []
  );

  const goBack = useCallback(() => {
    if (step === "review") {
      if (caption.trim()) {
        setDiscardAsk(true);
        return;
      }
      setPhotoUri(null);
      setStep(taskType === "run" || taskType === "workout" ? "log" : "capture");
      return;
    }
    if (step === "running") return;
    if (step === "session") {
      setStep("log");
      return;
    }
    if (step === "capture" && (taskType === "run" || taskType === "workout")) {
      setStep("log");
      return;
    }
    exit();
  }, [step, caption, taskType, exit]);

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoUri) return null;
    const b64 = await FileSystem.readAsStringAsync(photoUri, { encoding: "base64" as never });
    const uploaded = await uploadProofImageFromBase64(b64, "image/jpeg");
    if ("error" in uploaded) {
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
      if (!complete) {
        setFailNote("Couldn't save. Try again.");
        setStep("failed");
        return;
      }
      let secure: { success?: boolean; alreadySecured?: boolean; newStreakCount?: number } | null = null;
      if ((complete.requiredRemaining ?? 1) === 0 && !complete.dayAlreadySecured) {
        try {
          secure = (await secureDay()) ?? null;
        } catch {
          secure = null;
        }
      } else if (complete.dayAlreadySecured) {
        secure = { success: true, alreadySecured: true, newStreakCount: complete.streakDays };
      }
      const assembled = assembleSubmitResult({
        verificationKind: complete.verificationKind ?? kind,
        requiredRemaining: complete.requiredRemaining ?? 0,
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
            }
          : null,
      });
      setResult(assembled);
      if (userId && taskId) await clearLocalTimerSession(userId, taskId, dateKey);
      void endLiveActivity();
      setStep("confirmation");
    } catch (err) {
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
      },
      verificationKindFor(taskType, true)
    );
  };

  const submitTimer = async () => {
    await finishSubmit({ value: Math.floor(requiredSeconds / 60) }, "timer");
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
      setFailNote(err instanceof Error ? err.message : "Couldn't start the timer.");
      setStep("failed");
      return;
    }
    if (!started?.started_at) {
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

  const cancelTimer = async () => {
    if (userId) await clearLocalTimerSession(userId, taskId, dateKey);
    await cancelTimerDoneNotification(taskId);
    void endLiveActivity();
    exit();
  };

  useEffect(() => {
    if (step === "running" && startedAtIso && remainingSec <= 0) {
      void submitTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, remainingSec, startedAtIso]);

  const dark = step === "capture" || step === "review";
  const hideChrome = step === "confirmation" || step === "verifying";
  const fail = failedUploadCopy();

  return (
    <View style={[styles.root, dark && { backgroundColor: DS_COLORS_V2.surface.camera }]}>
      {!hideChrome ? (
        <TaskChrome
          title={`Day ${currentDay} · ${chromeTitle(taskType)}`}
          dark={dark}
          onBack={goBack}
        />
      ) : null}

      {step === "blocked" ? (
        <View style={styles.body}>
          <Text style={styles.eyebrowInk}>
            {windowEval.status === "out_of_window" ? "NOT OPEN YET" : "OUT OF RANGE"}
          </Text>
          <Text style={styles.title}>
            {windowEval.status === "out_of_window"
              ? `Opens at ${config.schedule_window_start ?? ""}`
              : `You're not at ${place}`}
          </Text>
          <Text style={styles.bodyText}>
            {windowEval.status === "out_of_window"
              ? `This task only counts inside its window: ${config.schedule_window_start} to ${config.schedule_window_end}. You can shoot the photo then. Nothing is logged before it opens.`
              : `You need to be within ${radius} m of the saved location. Right now you're ${gps ? `${(gps.m / 1000).toFixed(1)} km` : "away"}. Nothing is logged until you're inside the radius.`}
          </Text>
          {windowEval.status === "out_of_window" && config.schedule_window_start ? (
            <Pressable
              onPress={() => {
                const [h, m] = config.schedule_window_start!.split(":").map(Number);
                const at = new Date();
                at.setHours(h ?? 0, m ?? 0, 0, 0);
                if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
                void Notifications.scheduleNotificationAsync({
                  content: {
                    title: "Window open",
                    body: `You can shoot the photo now — opens at ${config.schedule_window_start}.`,
                  },
                  trigger: { type: "date", date: at } as Notifications.NotificationTriggerInput,
                }).catch(() => {});
                exit();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Remind me at ${config.schedule_window_start}`}
              style={styles.inkBtn}
            >
              <Text style={styles.inkBtnText}>Remind me at {config.schedule_window_start}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => void refreshGps()} accessibilityRole="button" accessibilityLabel="Check again" style={styles.inkBtn}>
              <Text style={styles.inkBtnText}>Check again</Text>
            </Pressable>
          )}
          <Pressable onPress={exit} accessibilityRole="button" accessibilityLabel="Back to today" style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Back to today</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "entry" && taskType === "timer" ? (
        <View style={styles.body}>
          <Text style={styles.title}>{taskName}</Text>
          <Text style={styles.gate}>{fmtMmSs(requiredSeconds)} timer</Text>
          <Text style={styles.gate}>Runs on the clock — lock your phone if you want</Text>
          <View style={styles.switchCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Sound when it ends</Text>
              <Text style={styles.switchSub}>A notification arrives either way</Text>
            </View>
            <Switch
              value={soundOn}
              onValueChange={setSoundOn}
              accessibilityLabel="Sound when it ends"
            />
          </View>
          <Pressable onPress={() => void startTimer()} accessibilityRole="button" accessibilityLabel={`Start ${fmtMmSs(requiredSeconds)}`} style={styles.orangeBtn}>
            <Text style={styles.btnText}>Start {fmtMmSs(requiredSeconds)}</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "entry" && taskType === "checkin" ? (
        <View style={styles.body}>
          <Text style={styles.title}>{taskName}</Text>
          <Text style={styles.gate}>{`Be within ${radius} m of ${place}`}</Text>
          <View style={styles.card}>
            <Text style={styles.statLabel}>DISTANCE TO {place.toUpperCase()}</Text>
            <Text style={styles.bigNum}>{gps?.m ?? "—"} <Text style={styles.unit}>m away</Text></Text>
            {gps ? (
              <Text style={styles.switchSub}>
                {gps.m <= radius ? `Inside the ${radius} m radius` : `Outside the ${radius} m radius`}
                {` · GPS accuracy ±${gps.acc} m`}
              </Text>
            ) : (
              <Text style={styles.switchSub}>Checking location…</Text>
            )}
          </View>
          <Pressable
            disabled={!gps || gps.m > radius}
            onPress={() =>
              void finishSubmit(
                {
                  location_latitude: config.location_latitude,
                  location_longitude: config.location_longitude,
                },
                "gps"
              )
            }
            accessibilityRole="button"
            accessibilityLabel="I'm here"
            style={[styles.orangeBtn, (!gps || gps.m > radius) && styles.disabledBtn]}
          >
            <Text style={styles.btnText}>I&apos;m here</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "log" ? (
        <View style={styles.body}>
          <Text style={styles.title}>{taskType === "run" ? "Log the run" : "Log the session"}</Text>
          <Text style={styles.switchSub}>
            {taskType === "run"
              ? "Then one photo to prove you were out there."
              : "Then one photo to prove you were there."}
          </Text>
          {keypad ? (
            <TaskKeypad
              label={keypad.field === "distance" ? "Distance" : keypad.field === "duration" ? "Duration" : "Minutes"}
              mask={keypad.field === "distance" ? "distance" : keypad.field === "duration" ? "duration" : "minutes"}
              buffer={buffer}
              onBuffer={setBuffer}
              onDone={(v) => {
                if (keypad.field === "distance") setDistance(v);
                if (keypad.field === "duration") setDurationSec(v);
                if (keypad.field === "minutes") setWorkoutMin(v);
                setKeypad(null);
                setBuffer("");
              }}
            />
          ) : (
            <>
              {taskType === "run" ? (
                <Pressable
                  onPress={() => {
                    setKeypad({ field: "distance" });
                    setBuffer("");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Distance"
                  style={styles.card}
                >
                  <View style={styles.row}>
                    <Text style={styles.statLabel}>DISTANCE</Text>
                    <Pressable
                      onPress={() => persistUnit(unit === "km" ? "mi" : "km")}
                      accessibilityRole="button"
                      accessibilityLabel="Toggle distance unit"
                      style={styles.unitBtn}
                    >
                      <Text style={styles.unitBtnText}>{unit}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.bigNum}>{distance == null ? "—" : distance.toFixed(2)}</Text>
                  <Text style={styles.switchSub}>Tap to type</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => {
                  setKeypad({ field: taskType === "run" ? "duration" : "minutes" });
                  setBuffer("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Duration"
                style={styles.card}
              >
                <Text style={styles.statLabel}>DURATION</Text>
                <Text style={styles.bigNum}>
                  {taskType === "run"
                    ? durationSec == null
                      ? "—"
                      : fmtMmSs(durationSec)
                    : workoutMin == null
                      ? "—"
                      : `${workoutMin}`}
                </Text>
                <Text style={styles.switchSub}>Tap to type</Text>
              </Pressable>
              {taskType === "workout" ? (
                <View style={styles.rowWrap}>
                  {["Lift", "Push", "Pull", "Conditioning"].map((k) => (
                    <Pressable
                      key={k}
                      onPress={() => setKind(k)}
                      accessibilityRole="button"
                      accessibilityLabel={k}
                      style={[styles.chip, kind === k && styles.chipOn]}
                    >
                      <Text style={styles.chipText}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <Pressable
                onPress={() => {
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
                }}
                accessibilityRole="button"
                accessibilityLabel="Use the timer instead"
                style={styles.dashBtn}
              >
                <Text style={styles.dashText}>Use the timer instead</Text>
              </Pressable>
              <Text style={styles.disclosure}>
                {taskType === "run"
                  ? "Distance and duration are self-entered. Only the photo is verified."
                  : "Duration is self-entered unless the in-app timer ran. Only the photo is verified."}
              </Text>
              <Pressable
                disabled={
                  taskType === "run"
                    ? distance == null || durationSec == null
                    : workoutMin == null || workoutMin < (config.min_duration_minutes ?? 0)
                }
                onPress={() => setStep("capture")}
                accessibilityRole="button"
                accessibilityLabel="Next: photo proof"
                style={styles.orangeBtn}
              >
                <Text style={styles.btnText}>Next: photo proof</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      {step === "session" ? (
        <View style={styles.body}>
          <Text style={styles.statLabel}>SESSION TIMER</Text>
          <Text style={styles.huge}>{fmtMmSs(sessionUp)}</Text>
          <Text style={styles.disclosure}>
            Counting up. Stopping fills the duration field for you — the photo is still what gets verified.
          </Text>
          <Pressable
            onPress={() => {
              void endLiveActivity();
              setUsedSessionTimer(true);
              if (taskType === "run") setDurationSec(Math.max(1, sessionUp));
              else setWorkoutMin(Math.max(1, Math.round(sessionUp / 60)));
              setStep("log");
            }}
            accessibilityRole="button"
            accessibilityLabel={taskType === "run" ? "Stop and use duration" : "Stop and use minutes"}
            style={styles.inkBtn}
          >
            <Text style={styles.inkBtnText}>
              {taskType === "run"
                ? `Stop and use ${fmtMmSs(sessionUp)}`
                : `Stop and use ${Math.max(1, Math.round(sessionUp / 60))} min`}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void endLiveActivity();
              setStep("log");
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel, I'll type it"
            style={styles.textBtn}
          >
            <Text style={styles.shareText}>Cancel, I&apos;ll type it</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "capture" ? (
        <TaskCapture
          gateLine="Camera only · live capture"
          onCaptured={(uri, at) => {
            setPhotoUri(uri);
            setCapturedAt(at);
            setStep("review");
          }}
        />
      ) : null}

      {step === "review" && photoUri ? (
        <View style={{ flex: 1 }}>
          <View style={styles.finder}>
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <Pressable
              onPress={() => {
                setPhotoUri(null);
                setStep("capture");
              }}
              accessibilityRole="button"
              accessibilityLabel="Retake"
              style={styles.retake}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
            <LinearGradient colors={["transparent", "rgba(10,10,10,0.82)"]} style={styles.capOverlay}>
              <Text style={styles.cap70} numberOfLines={1}>
                {challengeName}
              </Text>
              <Text style={styles.cap92} numberOfLines={1}>
                Day {currentDay} · {chromeTitle(taskType)}
              </Text>
              {caption ? (
                <Text style={styles.cap100} numberOfLines={1}>
                  {caption}
                </Text>
              ) : null}
            </LinearGradient>
          </View>
          <View style={styles.reviewDeck}>
            <View style={styles.capRow}>
              <TextInput
                value={caption}
                onChangeText={(t) => setCaption(t.slice(0, 120))}
                placeholder="Add a caption"
                placeholderTextColor={DS_COLORS_V2.text.mutedDark}
                style={styles.capInput}
                maxLength={120}
              />
              <Text style={styles.counter}>{caption.length} / 120</Text>
            </View>
            <Pressable
              onPress={() =>
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
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Post proof"
              style={styles.orangeBtn}
            >
              <Text style={styles.btnText}>Post proof</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === "running" ? (
        <View style={styles.body}>
          <Text style={styles.huge}>{fmtMmSs(remainingSec)}</Text>
          <Text style={styles.switchSub}>{taskName}</Text>
          <Text style={styles.pill}>
            Started {startedAtIso ? clockLabel(startedAtIso) : ""} · ends{" "}
            {startedAtIso ? clockLabel(Date.parse(startedAtIso) + requiredSeconds * 1000) : ""}
          </Text>
          <Text style={styles.disclosure}>
            Runs on the clock. Lock your phone, put it down — we&apos;ll tell you when it&apos;s done.
          </Text>
          <Pressable onPress={() => void cancelTimer()} accessibilityRole="button" accessibilityLabel="Cancel the timer" style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Cancel the timer</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "write" ? (
        <View style={styles.body}>
          <Text style={styles.switchSub}>
            {wordCount(text)} / {minWords} words{wordCount(text) >= minWords ? " · minimum met" : ""}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            style={styles.editor}
            placeholder="Write here"
            placeholderTextColor={DS_COLORS_V2.text.mutedDark}
          />
          <Pressable
            disabled={wordCount(text) < minWords}
            onPress={() => void finishSubmit({ noteText: text }, "word_count")}
            accessibilityRole="button"
            accessibilityLabel={wordCount(text) < minWords ? `Write ${minWords - wordCount(text)} more words` : "Post"}
            style={[styles.orangeBtn, wordCount(text) < minWords && styles.disabledBtn]}
          >
            <Text style={styles.btnText}>
              {wordCount(text) < minWords ? `Write ${minWords - wordCount(text)} more words` : "Post"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {step === "count" ? (
        <View style={styles.body}>
          <Text style={styles.huge}>
            {count} <Text style={styles.unit}>/ {counterGoal} {counterUnit}</Text>
          </Text>
          {keypad?.field === "count" ? (
            <TaskKeypad
              label="Count"
              mask={"count" as KeypadMask}
              buffer={buffer}
              onBuffer={setBuffer}
              onDone={(v) => {
                setCount(Math.min(counterGoal, Math.max(0, v ?? 0)));
                setKeypad(null);
                setBuffer("");
              }}
            />
          ) : (
            <>
              <Pressable
                onPress={() => {
                  if (holdOpenedKeypad.current) return;
                  setCount((c) => Math.min(counterGoal, c + 1));
                }}
                onPressIn={() => {
                  holdOpenedKeypad.current = false;
                  holdTimer.current = setTimeout(() => {
                    holdOpenedKeypad.current = true;
                    setKeypad({ field: "count" });
                    setBuffer("");
                  }, 450);
                }}
                onPressOut={() => {
                  if (holdTimer.current) clearTimeout(holdTimer.current);
                }}
                accessibilityRole="button"
                accessibilityLabel="Add one"
                style={styles.addOne}
              >
                <Text style={styles.addOneText}>Add one</Text>
              </Pressable>
              <View style={styles.row}>
                <Pressable
                  onPress={() => setCount((c) => Math.max(0, c - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Remove one"
                  style={styles.textBtn}
                >
                  <Text style={styles.shareText}>Remove one</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setKeypad({ field: "count" });
                    setBuffer("");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Type the number"
                  style={styles.textBtn}
                >
                  <Text style={styles.shareText}>Type the number</Text>
                </Pressable>
              </View>
              <Text style={styles.tiny}>Press and hold &quot;Add one&quot; to type it instead</Text>
              <Text style={styles.disclosure}>Self-entered count · nothing is checked.</Text>
              {taskType === "reading" ? (
                <Pressable onPress={() => setStep("capture")} accessibilityRole="button" accessibilityLabel="Attach a page photo" style={styles.textBtn}>
                  <Text style={styles.shareText}>Attach a page photo</Text>
                </Pressable>
              ) : null}
              <Pressable
                disabled={count < counterGoal}
                onPress={() => void finishSubmit({ value: count }, "self_report")}
                accessibilityRole="button"
                accessibilityLabel={count < counterGoal ? `${count} of ${counterGoal} logged` : "Submit"}
                style={[styles.inkBtn, count < counterGoal && styles.disabledBtn]}
              >
                <Text style={styles.inkBtnText}>
                  {count < counterGoal ? `${count} of ${counterGoal} logged` : "Submit"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      {step === "ask" ? (
        <View style={styles.body}>
          <Text style={styles.title}>Did you do it today?</Text>
          <Text style={{ fontSize: 16, color: DS_COLORS_V2.text.muted }}>{taskName}</Text>
          <Text style={styles.switchSub}>Self-reported. Nothing is checked.</Text>
          <Pressable
            onPress={() => void finishSubmit({}, "self_report")}
            accessibilityRole="button"
            accessibilityLabel="I did it"
            style={styles.inkBtn}
          >
            <Text style={styles.inkBtnText}>I did it</Text>
          </Pressable>
          <Pressable onPress={exit} accessibilityRole="button" accessibilityLabel="Not yet" style={styles.outlineBtn}>
            <Text style={styles.outlineText}>Not yet</Text>
          </Pressable>
        </View>
      ) : null}

      {step === "verifying" ? (
        <TaskVerifying
          line={
            taskType === "timer"
              ? "Recording the session…"
              : taskType === "manual" || taskType === "simple" || taskType === "counter" || taskType === "water"
                ? "Saving…"
                : "Posting your proof…"
          }
        />
      ) : null}

      {step === "confirmation" && result ? (
        <TaskConfirmation
          result={result}
          taskName={taskName}
          honest={isHonest(taskType, !!photoUri)}
          optional={!taskRequired}
          verifyLine={verificationLine({
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
          })}
          onDone={exit}
          onShare={() => {
            void Share.share({ message: `${taskName} — Day ${result.challengeDay} on GRIIT.` });
          }}
        />
      ) : null}

      {step === "failed" ? (
        <View style={styles.body}>
          <Text style={[styles.eyebrowInk, { color: DS_COLORS_V2.semantic.dangerInk }]}>{fail.eyebrow}</Text>
          <Text style={styles.title}>{fail.headline}</Text>
          <Text style={styles.bodyText}>{fail.body}</Text>
          {failNote ? <Text style={styles.disclosure}>{failNote}</Text> : null}
          <Text style={styles.disclosure}>{fail.retryNote}</Text>
          <Pressable
            onPress={() => {
              if (photoUri) void submitPhoto();
              else setFailNote("");
            }}
            accessibilityRole="button"
            accessibilityLabel="Retry now"
            style={styles.orangeBtn}
          >
            <Text style={styles.btnText}>Retry now</Text>
          </Pressable>
          <Pressable onPress={exit} accessibilityRole="button" accessibilityLabel="Keep it for later" style={styles.textBtn}>
            <Text style={styles.shareText}>Keep it for later</Text>
          </Pressable>
        </View>
      ) : null}

      {discardAsk ? (
        <View style={styles.modal}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Discard photo?</Text>
            <Pressable
              onPress={() => {
                setDiscardAsk(false);
                setCaption("");
                setPhotoUri(null);
                setStep(taskType === "run" || taskType === "workout" ? "log" : "capture");
              }}
              accessibilityRole="button"
              accessibilityLabel="Discard"
              style={styles.inkBtn}
            >
              <Text style={styles.inkBtnText}>Discard</Text>
            </Pressable>
            <Pressable onPress={() => setDiscardAsk(false)} accessibilityRole="button" accessibilityLabel="Keep" style={styles.textBtn}>
              <Text style={styles.shareText}>Keep</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 34, gap: 12 },
  title: { fontSize: 28, fontWeight: "500", color: DS_COLORS_V2.text.primary, letterSpacing: -0.8 },
  bodyText: { fontSize: 15, color: DS_COLORS_V2.text.body, lineHeight: 22 },
  gate: { fontSize: 15, color: DS_COLORS_V2.text.body },
  eyebrowInk: { fontSize: 11, letterSpacing: 1.6, color: DS_COLORS_V2.text.mutedWarm },
  switchCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchLabel: { fontSize: 15, color: DS_COLORS_V2.text.primary },
  switchSub: { fontSize: 12, color: DS_COLORS_V2.text.mutedWarm },
  card: { backgroundColor: DS_COLORS_V2.surface.card, borderRadius: 18, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bigNum: { fontSize: 32, fontWeight: "500", letterSpacing: -1.3, color: DS_COLORS_V2.text.primary, fontVariant: ["tabular-nums"] },
  huge: { fontSize: 84, fontWeight: "500", letterSpacing: -3.5, color: DS_COLORS_V2.text.primary, fontVariant: ["tabular-nums"] },
  unit: { fontSize: 20, color: DS_COLORS_V2.text.muted, fontWeight: "400" },
  statLabel: { fontSize: 11, letterSpacing: 0.8, color: DS_COLORS_V2.text.mutedWarm },
  unitBtn: { minWidth: 52, height: 44, borderRadius: 12, backgroundColor: DS_COLORS_V2.surface.sunken, alignItems: "center", justifyContent: "center" },
  unitBtnText: { fontSize: 13, color: DS_COLORS_V2.text.primary },
  chip: { paddingHorizontal: 12, minHeight: 44, borderRadius: 12, backgroundColor: DS_COLORS_V2.surface.sunken, justifyContent: "center" },
  chipOn: { backgroundColor: DS_COLORS_V2.brand.primarySoft },
  chipText: { fontSize: 13, color: DS_COLORS_V2.text.primary },
  dashBtn: { height: 48, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", borderColor: DS_COLORS_V2.surface.borderDashed, alignItems: "center", justifyContent: "center" },
  dashText: { fontSize: 14, color: DS_COLORS_V2.text.body },
  disclosure: { fontSize: 13, color: DS_COLORS_V2.text.mutedDark },
  tiny: { fontSize: 11, color: DS_COLORS_V2.text.mutedDark },
  orangeBtn: { height: 56, borderRadius: 16, backgroundColor: DS_COLORS_V2.brand.primary, alignItems: "center", justifyContent: "center" },
  inkBtn: { height: 56, borderRadius: 16, backgroundColor: DS_COLORS_V2.text.primary, alignItems: "center", justifyContent: "center" },
  disabledBtn: { backgroundColor: DS_COLORS_V2.surface.track },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  inkBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  outlineBtn: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: DS_COLORS_V2.surface.borderStrong, alignItems: "center", justifyContent: "center" },
  outlineText: { fontSize: 15, color: DS_COLORS_V2.text.primary },
  textBtn: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  shareText: { fontSize: 15, color: DS_COLORS_V2.text.body },
  pill: { alignSelf: "flex-start", backgroundColor: DS_COLORS_V2.surface.sunken, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, fontSize: 13, color: DS_COLORS_V2.text.body },
  editor: { flex: 1, fontSize: 17, lineHeight: 25.5, color: DS_COLORS_V2.text.primary, textAlignVertical: "top" },
  addOne: { width: 132, height: 132, borderRadius: 66, backgroundColor: DS_COLORS_V2.text.primary, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  addOneText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  finder: { width: "100%", aspectRatio: 4 / 5, backgroundColor: DS_COLORS_V2.surface.camera, overflow: "hidden" },
  retake: { position: "absolute", top: 14, right: 14, minHeight: 44, paddingHorizontal: 16, borderRadius: 18, backgroundColor: "rgba(10,10,10,0.6)", justifyContent: "center" },
  retakeText: { color: "#FFFFFF", fontSize: 13 },
  capOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 44, paddingBottom: 16 },
  cap70: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  cap92: { color: "rgba(255,255,255,0.92)", fontSize: 15, marginTop: 2 },
  cap100: { color: "#FFFFFF", fontSize: 15, marginTop: 2 },
  reviewDeck: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34, justifyContent: "space-between" },
  capRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: DS_COLORS_V2.surface.borderStrong, height: 44 },
  capInput: { flex: 1, fontSize: 15, color: DS_COLORS_V2.text.primary },
  counter: { fontSize: 12, color: DS_COLORS_V2.text.mutedDark },
  modal: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,10,10,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", backgroundColor: DS_COLORS_V2.surface.card, borderRadius: 22, padding: 24, gap: 12 },
});
