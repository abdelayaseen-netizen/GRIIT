// LEGACY: consider migrating to task/complete.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  AppState,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  Navigation, 
  Camera,
  AlertTriangle,
  Check,
  ChevronRight,
} from "lucide-react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { formatSecondsToMMSS } from "@/lib/formatTime";
import { DS_COLORS } from "@/lib/design-system";
import { RunMode } from "@/types";
import { styles } from "./run-styles";
import Celebration from "@/components/Celebration";
import { useCelebration } from "@/hooks/useCelebration";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ROUTES } from "@/lib/routes";
import {
  startActiveTaskNotification,
  updateActiveTaskNotification,
  clearActiveTaskNotification,
} from "@/lib/active-task-timer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useActiveSessionStore } from "@/store/activeSessionStore";

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

type TreadmillStep = "timer" | "proof" | "distance";

export default function RunTaskScreen() {
  const router = useRouter();
  const safeBack = React.useCallback(() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never)), [router]);
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { currentChallenge, verifyTask, getTaskStateForTemplate, profile, activeChallenge } = useApp();
  const setActiveSession = useActiveSessionStore((s) => s.setActiveSession);
  const clearActiveSession = useActiveSessionStore((s) => s.clearActiveSession);
  const updateTimerRunning = useActiveSessionStore((s) => s.updateTimerRunning);
  const activeChallengeId = activeChallenge?.id ?? "";
  const challengeName =
    (activeChallenge?.challenges as { title?: string } | undefined)?.title ?? "Challenge";
  const profileTz = (profile as { timezone?: string | null })?.timezone;
  const { showCelebration, triggerCelebration, onCelebrationComplete } = useCelebration(profileTz);
  const { error, showError, clearError } = useInlineError();
  
  const task = currentChallenge?.tasks.find((t: { id: string }) => t.id === taskId);
  const taskState = taskId ? getTaskStateForTemplate(taskId) : null;
  
  const taskRules = task?.rules as { minDistanceMiles?: number } | undefined;
  const minDistanceMiles = taskRules?.minDistanceMiles ?? 1.0;
  const minTimerSeconds = 600;
  
  const [runMode, setRunMode] = useState<RunMode>("outdoor_gps");
  const [pendingRunMode, setPendingRunMode] = useState<RunMode | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceMiles, setDistanceMiles] = useState<number>(0);
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  
  const [treadmillStep, setTreadmillStep] = useState<TreadmillStep>("timer");
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(null);
  const [backgroundViolation, setBackgroundViolation] = useState<boolean>(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [distanceInput, setDistanceInput] = useState<string>("");
  const [durationInput, setDurationInput] = useState<string>("");
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const isGpsComplete = distanceMiles >= minDistanceMiles;
  const isTreadmillTimerComplete = timerSeconds >= minTimerSeconds;
  const parsedDistance = parseFloat(distanceInput) || 0;
  const isTreadmillDistanceValid = parsedDistance >= minDistanceMiles;
  
  const canVerifyGps = isGpsComplete && !isTracking && (taskState as { status?: string } | null)?.status !== "verified";
  const canVerifyTreadmill = 
    treadmillStep === "distance" && 
    isTreadmillTimerComplete && 
    !backgroundViolation && 
    proofUri && 
    isTreadmillDistanceValid &&
    (taskState as { status?: string } | null)?.status !== "verified";

  const checkPermissions = React.useCallback(async () => {
    if (Platform.OS === "web") {
      setHasPermission(true);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasPermission(status === "granted");

    if (status !== "granted") {
      showError("GPS tracking requires location permission to verify your run.");
    }
  }, [showError]);

  useEffect(() => {
    if (runMode === "outdoor_gps") {
      void checkPermissions();
    }
    
    const handleAppState = (nextAppState: typeof AppState.currentState) => {
      if (timerRunning && appStateRef.current === "active" && nextAppState.match(/inactive|background/)) {
        setBackgroundViolation(true);
        setTimerRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError("You left the app during the timer session. This counts as a violation.");
      }
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener("change", handleAppState);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (locationSubscription.current) locationSubscription.current.remove();
      if (notifUpdateRef.current) clearInterval(notifUpdateRef.current);
      clearActiveTaskNotification();
      clearActiveSession();
      subscription.remove();
    };
  }, [runMode, timerRunning, showError, checkPermissions, clearActiveSession]);

  useEffect(() => {
    if (runMode === "outdoor_gps") {
      updateTimerRunning(isTracking);
    } else if (runMode === "treadmill_proof" && treadmillStep === "timer") {
      updateTimerRunning(timerRunning);
    } else {
      updateTimerRunning(false);
    }
  }, [runMode, treadmillStep, isTracking, timerRunning, updateTimerRunning]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleModeChange = (mode: RunMode) => {
    if (isTracking || timerRunning) {
      setPendingRunMode(mode);
    } else {
      resetAll();
      setRunMode(mode);
    }
  };

  const resetAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationSubscription.current) locationSubscription.current.remove();
    
    setIsTracking(false);
    setElapsedSeconds(0);
    setDistanceMiles(0);
    setGpsPoints([]);
    setStartedAt(null);
    
    setTreadmillStep("timer");
    setTimerRunning(false);
    setTimerSeconds(0);
    setTimerStartedAt(null);
    setBackgroundViolation(false);
    setProofUri(null);
    setDistanceInput("");
    setDurationInput("");
  };

  const confirmModeSwitch = () => {
    if (pendingRunMode == null) return;
    const next = pendingRunMode;
    setPendingRunMode(null);
    resetAll();
    setRunMode(next);
  };

  const startGpsTracking = async () => {
    if (Platform.OS === "web") {
      setIsTracking(true);
      setStartedAt(new Date().toISOString());
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setDistanceMiles((prev) => prev + 0.01);
      }, 1000);

      setActiveSession({
        taskId: task?.id ?? "",
        taskName: task?.title ?? "Run",
        taskType: "run",
        activeChallengeId,
        challengeName,
        startedAtMs: Date.now(),
        isTimerRunning: true,
      });
      // Lock screen notification — GPS run count-up
      const gpsNotifPayload = {
        taskId: task?.id ?? "",
        taskTitle: task?.title ?? "Run",
        timerType: "run_gps" as const,
        startedAtMs: Date.now(),
        route: `${ROUTES.TASK_RUN}?taskId=${task?.id ?? ""}`,
      };
      startActiveTaskNotification(gpsNotifPayload);
      notifUpdateRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          updateActiveTaskNotification(gpsNotifPayload, prev);
          return prev;
        });
      }, 30000);
      return;
    }

    if (!hasPermission) {
      await checkPermissions();
      if (!hasPermission) return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTracking(true);
    setStartedAt(new Date().toISOString());
    setGpsPoints([]);
    setDistanceMiles(0);
    setElapsedSeconds(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    setActiveSession({
      taskId: task?.id ?? "",
      taskName: task?.title ?? "Run",
      taskType: "run",
      activeChallengeId,
      challengeName,
      startedAtMs: Date.now(),
      isTimerRunning: true,
    });
    // Lock screen notification — GPS run count-up
    const gpsNotifPayload = {
      taskId: task?.id ?? "",
      taskTitle: task?.title ?? "Run",
      timerType: "run_gps" as const,
      startedAtMs: Date.now(),
      route: `${ROUTES.TASK_RUN}?taskId=${task?.id ?? ""}`,
    };
    startActiveTaskNotification(gpsNotifPayload);
    notifUpdateRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        updateActiveTaskNotification(gpsNotifPayload, prev);
        return prev;
      });
    }, 30000);

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        const newPoint: GpsPoint = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: Date.now(),
        };

        setGpsPoints((prev) => {
          const updated = [...prev, newPoint];
          
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            if (lastPoint) {
              const segmentDistance = calculateDistance(
                lastPoint.lat, lastPoint.lng,
                newPoint.lat, newPoint.lng
              );

              if (segmentDistance < 0.1) {
                setDistanceMiles((d) => d + segmentDistance);
              }
            }
          }
          
          return updated;
        });
      }
    );
  };

  const stopGpsTracking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsTracking(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (notifUpdateRef.current) {
      clearInterval(notifUpdateRef.current);
      notifUpdateRef.current = null;
    }
    clearActiveTaskNotification();
    clearActiveSession();

    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const startTreadmillTimer = () => {
    if (backgroundViolation) {
      showError("You already violated the timer session by leaving the app. Reset to try again.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerRunning(true);
    setTimerStartedAt(new Date().toISOString());
    
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    setActiveSession({
      taskId: task?.id ?? "",
      taskName: task?.title ?? "Timer",
      taskType: "run",
      activeChallengeId,
      challengeName,
      startedAtMs: Date.now(),
      targetSeconds: minTimerSeconds,
      isTimerRunning: true,
    });
    // Lock screen notification — treadmill countdown
    const treadmillNotifPayload = {
      taskId: task?.id ?? "",
      taskTitle: task?.title ?? "Timer",
      timerType: "run_treadmill" as const,
      startedAtMs: Date.now(),
      targetSeconds: minTimerSeconds,
      route: `${ROUTES.TASK_RUN}?taskId=${task?.id ?? ""}`,
    };
    startActiveTaskNotification(treadmillNotifPayload);
    notifUpdateRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        updateActiveTaskNotification(treadmillNotifPayload, prev);
        return prev;
      });
    }, 30000);
  };

  const stopTreadmillTimer = () => {
    setTimerRunning(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (notifUpdateRef.current) {
      clearInterval(notifUpdateRef.current);
      notifUpdateRef.current = null;
    }
    clearActiveTaskNotification();
    clearActiveSession();
  };

  const finishTreadmillTimer = () => {
    stopTreadmillTimer();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (timerSeconds >= minTimerSeconds && !backgroundViolation) {
      setTreadmillStep("proof");
    } else if (backgroundViolation) {
      showError("Session was interrupted. Reset to try again.");
    } else {
      showError(
        `You need at least ${Math.floor(minTimerSeconds / 60)} minutes. You completed ${Math.floor(timerSeconds / 60)} minutes.`
      );
    }
  };

  const captureProof = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      showError("Camera permission is needed to capture proof.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setProofUri(result.assets[0].uri);
      setTreadmillStep("distance");
    }
  };

  const handleVerifyGps = async () => {
    if (!isGpsComplete) {
      const remaining = (minDistanceMiles - distanceMiles).toFixed(2);
      showError(`Complete ${remaining} more miles to verify.`);
      return;
    }

    if (isTracking) {
      showError("Stop tracking before verifying.");
      return;
    }

    if (task) {
      const result = verifyTask(task.id, {
        runMode: "outdoor_gps",
        gpsPoints: gpsPoints.length > 0 ? gpsPoints : undefined,
        distanceMiles,
        durationSeconds: elapsedSeconds,
        startedAt: startedAt || new Date().toISOString(),
        endedAt: new Date().toISOString(),
      }, task);

      if (result.success) {
        await triggerCelebration(task.id);
        setTimeout(() => {
          safeBack();
        }, 1000);
      } else {
        showError(result.failureReason || "Verification failed.");
      }
    }
  };

  const handleVerifyTreadmill = async () => {
    if (!isTreadmillTimerComplete) {
      showError("Complete the timer session first.");
      return;
    }

    if (backgroundViolation) {
      showError("Timer was interrupted. Reset to try again.");
      return;
    }

    if (!proofUri) {
      showError("Capture photo proof of your treadmill screen.");
      return;
    }

    if (!isTreadmillDistanceValid) {
      showError(`Enter at least ${minDistanceMiles} mile${minDistanceMiles !== 1 ? "s" : ""}.`);
      return;
    }

    if (task) {
      const result = verifyTask(task.id, {
        runMode: "treadmill_proof",
        timerActiveSeconds: timerSeconds,
        timerBackgroundViolation: backgroundViolation,
        proofUrl: proofUri,
        proofType: "photo",
        proofSource: "camera",
        proofCapturedAt: new Date().toISOString(),
        proofDateLocal: new Date().toISOString().split("T")[0],
        distanceMilesShown: parsedDistance,
        durationShown: durationInput || undefined,
        startedAt: timerStartedAt || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: timerSeconds,
      }, task);

      if (result.success) {
        await triggerCelebration(task.id);
        setTimeout(() => {
          safeBack();
        }, 1000);
      } else {
        showError(result.failureReason || "Verification failed.");
      }
    }
  };

  const formatPace = () => {
    if (distanceMiles === 0 || elapsedSeconds === 0) return "--:--";
    const paceSeconds = elapsedSeconds / distanceMiles;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if ((taskState as { status?: string } | null)?.status === "verified") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedBadge}>
            <Navigation size={32} color={DS_COLORS.success} />
          </View>
          <Text style={styles.verifiedTitle}>Run Verified</Text>
          <Text style={styles.verifiedSubtitle}>Your run has been verified.</Text>
          <TouchableOpacity style={styles.backButton} onPress={safeBack} accessibilityLabel="Back to Tasks" accessibilityRole="button">
            <Text style={styles.backButtonText}>Back to Tasks</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Celebration visible={showCelebration} onComplete={onCelebrationComplete} />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <InlineError message={error} onDismiss={clearError} />
          <Text style={styles.title}>{task?.title || "Run"}</Text>
          <Text style={styles.subtitle}>
            {runMode === "outdoor_gps" ? "GPS tracked distance" : "Timer + photo proof"}
          </Text>

          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, runMode === "outdoor_gps" && styles.modeButtonActive]}
              onPress={() => handleModeChange("outdoor_gps")}
              accessibilityRole="tab"
              accessibilityLabel="Outdoor run — GPS tracking"
              accessibilityState={{ selected: runMode === "outdoor_gps" }}
            >
              <MapPin size={18} color={runMode === "outdoor_gps" ? DS_COLORS.white : DS_COLORS.textSecondary} />
              <Text style={[styles.modeButtonText, runMode === "outdoor_gps" && styles.modeButtonTextActive]}>
                Outdoor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, runMode === "treadmill_proof" && styles.modeButtonActive]}
              onPress={() => handleModeChange("treadmill_proof")}
              accessibilityLabel="Treadmill run — timer based"
              accessibilityRole="tab"
              accessibilityState={{ selected: runMode === "treadmill_proof" }}
            >
              <Clock size={18} color={runMode === "treadmill_proof" ? DS_COLORS.white : DS_COLORS.textSecondary} />
              <Text style={[styles.modeButtonText, runMode === "treadmill_proof" && styles.modeButtonTextActive]}>
                Treadmill
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requirementCard}>
            {runMode === "outdoor_gps" ? (
              <>
                <MapPin size={16} color={DS_COLORS.white} />
                <Text style={styles.requirementText}>
                  {minDistanceMiles} mile{minDistanceMiles !== 1 ? "s" : ""} minimum · GPS verified
                </Text>
              </>
            ) : (
              <>
                <Camera size={16} color={DS_COLORS.white} />
                <Text style={styles.requirementText}>
                  {minDistanceMiles} mile{minDistanceMiles !== 1 ? "s" : ""} minimum · Proof + Timer required
                </Text>
              </>
            )}
          </View>

          {runMode === "treadmill_proof" && (
            <View style={styles.warningBanner}>
              <AlertTriangle size={16} color={DS_COLORS.warning} />
              <Text style={styles.warningText}>
                Treadmill runs require proof. No proof = not verified.
              </Text>
            </View>
          )}

          {runMode === "outdoor_gps" ? (
            <View style={styles.statsContainer}>
              <View style={styles.mainStat}>
                <Text style={[styles.distanceValue, isGpsComplete && styles.distanceComplete]}>
                  {distanceMiles.toFixed(2)}
                </Text>
                <Text style={styles.distanceLabel}>/ {minDistanceMiles} miles</Text>
              </View>

              <View style={styles.secondaryStats}>
                <View style={styles.statItem}>
                  <Clock size={18} color={DS_COLORS.textSecondary} />
                  <Text style={styles.statValue}>{formatSecondsToMMSS(elapsedSeconds)}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Navigation size={18} color={DS_COLORS.textSecondary} />
                  <Text style={styles.statValue}>{formatPace()}</Text>
                  <Text style={styles.statLabel}>Pace /mi</Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill, 
                    { width: `${Math.min(1, distanceMiles / minDistanceMiles) * 100}%` },
                    isGpsComplete && styles.progressFillComplete
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {isGpsComplete 
                    ? "Distance complete ✓" 
                    : `${(minDistanceMiles - distanceMiles).toFixed(2)} miles remaining`}
                </Text>
              </View>

              <View style={styles.controlsContainer}>
                {!isTracking ? (
                  <TouchableOpacity 
                    style={[styles.startButton, isGpsComplete && styles.startButtonComplete]}
                    onPress={startGpsTracking}
                    disabled={isGpsComplete}
                    accessibilityLabel={isGpsComplete ? "Run complete" : "Start run"}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isGpsComplete }}
                  >
                    <Play size={32} color={DS_COLORS.white} fill={DS_COLORS.white} />
                    <Text style={styles.startButtonText}>
                      {isGpsComplete ? "Run Complete" : "Start Run"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.stopButton} onPress={stopGpsTracking} accessibilityRole="button" accessibilityLabel="Stop run">
                    <Square size={28} color={DS_COLORS.white} fill={DS_COLORS.white} />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                )}

                {isTracking && (
                  <View style={styles.trackingIndicator}>
                    <View style={styles.trackingDot} />
                    <Text style={styles.trackingText}>GPS tracking active</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.treadmillContainer}>
              <View style={styles.stepsIndicator}>
                <View style={[styles.stepDot, treadmillStep === "timer" && styles.stepDotActive, (treadmillStep === "proof" || treadmillStep === "distance") && styles.stepDotComplete]} />
                <View style={[styles.stepLine, (treadmillStep === "proof" || treadmillStep === "distance") && styles.stepLineComplete]} />
                <View style={[styles.stepDot, treadmillStep === "proof" && styles.stepDotActive, treadmillStep === "distance" && styles.stepDotComplete]} />
                <View style={[styles.stepLine, treadmillStep === "distance" && styles.stepLineComplete]} />
                <View style={[styles.stepDot, treadmillStep === "distance" && styles.stepDotActive]} />
              </View>
              <View style={styles.stepsLabels}>
                <Text style={[styles.stepLabel, treadmillStep === "timer" && styles.stepLabelActive]}>Timer</Text>
                <Text style={[styles.stepLabel, treadmillStep === "proof" && styles.stepLabelActive]}>Proof</Text>
                <Text style={[styles.stepLabel, treadmillStep === "distance" && styles.stepLabelActive]}>Distance</Text>
              </View>

              {treadmillStep === "timer" && (
                <View style={styles.timerSection}>
                  <View style={styles.mainStat}>
                    <Text style={[styles.distanceValue, isTreadmillTimerComplete && styles.distanceComplete]}>
                      {formatSecondsToMMSS(timerSeconds)}
                    </Text>
                    <Text style={styles.distanceLabel}>
                      / {Math.floor(minTimerSeconds / 60)}:00 min
                    </Text>
                  </View>

                  {backgroundViolation && (
                    <View style={styles.violationBanner}>
                      <AlertTriangle size={18} color={DS_COLORS.dangerMid} />
                      <Text style={styles.violationText}>
                        Timer failed - you left the app
                      </Text>
                    </View>
                  )}

                  {timerRunning && (
                    <View style={styles.lockNotice}>
                      <AlertTriangle size={14} color={DS_COLORS.warning} />
                      <Text style={styles.lockNoticeText}>Leaving this screen fails the timer</Text>
                    </View>
                  )}

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill, 
                        { width: `${Math.min(1, timerSeconds / minTimerSeconds) * 100}%` },
                        isTreadmillTimerComplete && styles.progressFillComplete,
                        backgroundViolation && styles.progressFillError
                      ]} />
                    </View>
                  </View>

                  <View style={styles.controlsContainer}>
                    {!timerRunning ? (
                      <>
                        <TouchableOpacity 
                          style={[
                            styles.startButton, 
                            isTreadmillTimerComplete && styles.startButtonComplete,
                            backgroundViolation && styles.startButtonError
                          ]}
                          onPress={isTreadmillTimerComplete ? finishTreadmillTimer : startTreadmillTimer}
                          disabled={backgroundViolation}
                          accessibilityLabel={isTreadmillTimerComplete ? "Continue" : timerSeconds > 0 ? "Resume timer" : "Start timer"}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: backgroundViolation }}
                        >
                          {isTreadmillTimerComplete ? (
                            <>
                              <ChevronRight size={28} color={DS_COLORS.white} />
                              <Text style={styles.startButtonText}>Continue</Text>
                            </>
                          ) : (
                            <>
                              <Play size={32} color={DS_COLORS.white} fill={DS_COLORS.white} />
                              <Text style={styles.startButtonText}>
                                {timerSeconds > 0 ? "Resume Timer" : "Start Timer"}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        {backgroundViolation && (
                          <TouchableOpacity style={styles.resetButton} onPress={resetAll} accessibilityLabel="Reset and try again" accessibilityRole="button">
                            <Text style={styles.resetButtonText}>Reset & Try Again</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.stopButton}
                        onPress={finishTreadmillTimer}
                        accessibilityRole="button"
                        accessibilityLabel="Finish timer and complete task"
                      >
                        <Square size={28} color={DS_COLORS.white} fill={DS_COLORS.white} />
                        <Text style={styles.stopButtonText}>Finish Timer</Text>
                      </TouchableOpacity>
                    )}

                    {timerRunning && (
                      <View style={styles.trackingIndicator}>
                        <View style={[styles.trackingDot, styles.trackingDotTimer]} />
                        <Text style={[styles.trackingText, styles.trackingTextTimer]}>Timer active - do not leave!</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {treadmillStep === "proof" && (
                <View style={styles.proofSection}>
                  <Text style={styles.proofTitle}>Capture Proof</Text>
                  <Text style={styles.proofSubtitle}>
                    Take a photo of your treadmill screen showing distance and time
                  </Text>

                  {proofUri ? (
                    <View style={styles.proofPreview}>
                      <Image
                        source={{ uri: proofUri }}
                        style={styles.proofImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        accessibilityLabel="Treadmill proof photo"
                      />
                      <TouchableOpacity 
                        style={styles.retakeButton}
                        onPress={captureProof}
                        accessibilityLabel="Retake proof photo"
                        accessibilityRole="button"
                      >
                        <Camera size={18} color={DS_COLORS.textPrimary} />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.captureButton} onPress={captureProof} accessibilityLabel="Open camera to capture proof" accessibilityRole="button">
                      <Camera size={32} color={DS_COLORS.white} />
                      <Text style={styles.captureButtonText}>Open Camera</Text>
                    </TouchableOpacity>
                  )}

                  {proofUri && (
                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={() => setTreadmillStep("distance")}
                      accessibilityLabel="Continue to distance"
                      accessibilityRole="button"
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <ChevronRight size={20} color={DS_COLORS.white} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {treadmillStep === "distance" && (
                <View style={styles.distanceSection}>
                  <Text style={styles.proofTitle}>Enter Run Details</Text>
                  <Text style={styles.proofSubtitle}>
                    Enter the distance and duration shown on your treadmill
                  </Text>

                  {proofUri && (
                    <View style={styles.proofThumbnail}>
                      <Image
                        source={{ uri: proofUri }}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        accessibilityLabel="Treadmill proof thumbnail"
                      />
                      <View style={styles.proofCheck}>
                        <Check size={14} color={DS_COLORS.white} />
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Distance (miles) *</Text>
                    <TextInput
                      style={[styles.input, !isTreadmillDistanceValid && distanceInput.length > 0 && styles.inputError]}
                      value={distanceInput}
                      onChangeText={setDistanceInput}
                      placeholder="e.g. 1.5"
                      placeholderTextColor={DS_COLORS.textMuted}
                      keyboardType="decimal-pad"
                    />
                    {!isTreadmillDistanceValid && distanceInput.length > 0 && (
                      <Text style={styles.inputErrorText}>
                        Minimum {minDistanceMiles} mile{minDistanceMiles !== 1 ? "s" : ""} required
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Duration (optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={durationInput}
                      onChangeText={setDurationInput}
                      placeholder="e.g. 15:30"
                      placeholderTextColor={DS_COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Verification Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Timer</Text>
                      <View style={styles.summaryValue}>
                        <Check size={14} color={DS_COLORS.success} />
                        <Text style={styles.summaryValueText}>{formatSecondsToMMSS(timerSeconds)}</Text>
                      </View>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Photo proof</Text>
                      <View style={styles.summaryValue}>
                        <Check size={14} color={DS_COLORS.success} />
                        <Text style={styles.summaryValueText}>Captured</Text>
                      </View>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Distance</Text>
                      <View style={styles.summaryValue}>
                        {isTreadmillDistanceValid ? (
                          <Check size={14} color={DS_COLORS.success} />
                        ) : (
                          <AlertTriangle size={14} color={DS_COLORS.warning} />
                        )}
                        <Text style={styles.summaryValueText}>
                          {distanceInput || "Not entered"} mi
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.verifyButton, 
              !(runMode === "outdoor_gps" ? canVerifyGps : canVerifyTreadmill) && styles.verifyButtonDisabled
            ]}
            onPress={runMode === "outdoor_gps" ? handleVerifyGps : handleVerifyTreadmill}
            activeOpacity={0.7}
            disabled={!(runMode === "outdoor_gps" ? canVerifyGps : canVerifyTreadmill)}
            accessibilityRole="button"
            accessibilityLabel="Verify and submit your run"
            accessibilityState={{ disabled: !(runMode === "outdoor_gps" ? canVerifyGps : canVerifyTreadmill) }}
          >
            <Text style={[
              styles.verifyButtonText, 
              !(runMode === "outdoor_gps" ? canVerifyGps : canVerifyTreadmill) && styles.verifyButtonTextDisabled
            ]}>
              VERIFY RUN
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={pendingRunMode !== null}
        title="Switch Mode"
        message="Switching modes will reset your current progress. Continue?"
        confirmLabel="Switch"
        onCancel={() => setPendingRunMode(null)}
        onConfirm={confirmModeSwitch}
      />
    </SafeAreaView>
    </ErrorBoundary>
  );
}

