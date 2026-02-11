import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  AppState,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
} from "react-native";
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
import Colors from "@/constants/colors";
import { RunMode } from "@/types";
import { styles } from "@/styles/run-styles";
import Celebration from "@/components/Celebration";
import { useCelebration } from "@/hooks/useCelebration";

interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

type TreadmillStep = "timer" | "proof" | "distance";

export default function RunTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { currentChallenge, verifyTask, getTaskStateForTemplate } = useApp();
  const { showCelebration, triggerCelebration, onCelebrationComplete } = useCelebration();
  
  const task = currentChallenge?.tasks.find((t: any) => t.id === taskId);
  const taskState = taskId ? getTaskStateForTemplate(taskId) : null;
  
  const minDistanceMiles = task?.rules.minDistanceMiles || 1.0;
  const minTimerSeconds = 600;
  
  const [runMode, setRunMode] = useState<RunMode>("outdoor_gps");
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  
  const [treadmillStep, setTreadmillStep] = useState<TreadmillStep>("timer");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(null);
  const [backgroundViolation, setBackgroundViolation] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [distanceInput, setDistanceInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const isGpsComplete = distanceMiles >= minDistanceMiles;
  const isTreadmillTimerComplete = timerSeconds >= minTimerSeconds;
  const parsedDistance = parseFloat(distanceInput) || 0;
  const isTreadmillDistanceValid = parsedDistance >= minDistanceMiles;
  
  const canVerifyGps = isGpsComplete && !isTracking && taskState?.status !== "verified";
  const canVerifyTreadmill = 
    treadmillStep === "distance" && 
    isTreadmillTimerComplete && 
    !backgroundViolation && 
    proofUri && 
    isTreadmillDistanceValid &&
    taskState?.status !== "verified";

  useEffect(() => {
    if (runMode === "outdoor_gps") {
      checkPermissions();
    }
    
    const handleAppState = (nextAppState: typeof AppState.currentState) => {
      if (timerRunning && appStateRef.current === "active" && nextAppState.match(/inactive|background/)) {
        console.log("App went to background during timer - violation!");
        setBackgroundViolation(true);
        setTimerRunning(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Timer Failed",
          "You left the app during the timer session. This counts as a violation.",
          [{ text: "OK" }]
        );
      }
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener("change", handleAppState);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (locationSubscription.current) locationSubscription.current.remove();
      subscription.remove();
    };
  }, [runMode, timerRunning]);

  const checkPermissions = async () => {
    if (Platform.OS === "web") {
      setHasPermission(true);
      return;
    }
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasPermission(status === "granted");
    
    if (status !== "granted") {
      Alert.alert(
        "Location Required",
        "GPS tracking requires location permission to verify your run."
      );
    }
  };

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
      Alert.alert(
        "Switch Mode",
        "Switching modes will reset your current progress. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Switch",
            onPress: () => {
              resetAll();
              setRunMode(mode);
            }
          }
        ]
      );
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

  const startGpsTracking = async () => {
    if (Platform.OS === "web") {
      setIsTracking(true);
      setStartedAt(new Date().toISOString());
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setDistanceMiles((prev) => prev + 0.01);
      }, 1000);
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
            const segmentDistance = calculateDistance(
              lastPoint.lat, lastPoint.lng,
              newPoint.lat, newPoint.lng
            );
            
            if (segmentDistance < 0.1) {
              setDistanceMiles((d) => d + segmentDistance);
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
    
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const startTreadmillTimer = () => {
    if (backgroundViolation) {
      Alert.alert(
        "Session Failed",
        "You already violated the timer session by leaving the app. Reset to try again."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerRunning(true);
    setTimerStartedAt(new Date().toISOString());
    
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTreadmillTimer = () => {
    setTimerRunning(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const finishTreadmillTimer = () => {
    stopTreadmillTimer();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (timerSeconds >= minTimerSeconds && !backgroundViolation) {
      setTreadmillStep("proof");
    } else if (backgroundViolation) {
      Alert.alert("Timer Failed", "Session was interrupted. Reset to try again.");
    } else {
      Alert.alert(
        "Timer Too Short",
        `You need at least ${Math.floor(minTimerSeconds / 60)} minutes. You completed ${Math.floor(timerSeconds / 60)} minutes.`
      );
    }
  };

  const captureProof = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is needed to capture proof.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
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
      Alert.alert("Distance Not Met", `Complete ${remaining} more miles to verify.`);
      return;
    }

    if (isTracking) {
      Alert.alert("Stop Tracking", "Stop tracking before verifying.");
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
          router.back();
        }, 1000);
      } else {
        Alert.alert("Verification Failed", result.failureReason || "Unknown error");
      }
    }
  };

  const handleVerifyTreadmill = async () => {
    if (!isTreadmillTimerComplete) {
      Alert.alert("Timer Incomplete", "Complete the timer session first.");
      return;
    }

    if (backgroundViolation) {
      Alert.alert("Session Invalid", "Timer was interrupted. Reset to try again.");
      return;
    }

    if (!proofUri) {
      Alert.alert("Proof Required", "Capture photo proof of your treadmill screen.");
      return;
    }

    if (!isTreadmillDistanceValid) {
      Alert.alert(
        "Distance Not Met",
        `Enter at least ${minDistanceMiles} mile${minDistanceMiles !== 1 ? "s" : ""}.`
      );
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
          router.back();
        }, 1000);
      } else {
        Alert.alert("Verification Failed", result.failureReason || "Unknown error");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPace = () => {
    if (distanceMiles === 0 || elapsedSeconds === 0) return "--:--";
    const paceSeconds = elapsedSeconds / distanceMiles;
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (taskState?.status === "verified") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedBadge}>
            <Navigation size={32} color={Colors.success} />
          </View>
          <Text style={styles.verifiedTitle}>Run Verified</Text>
          <Text style={styles.verifiedSubtitle}>Your run has been verified.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Tasks</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Celebration visible={showCelebration} onComplete={onCelebrationComplete} />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{task?.title || "Run"}</Text>
          <Text style={styles.subtitle}>
            {runMode === "outdoor_gps" ? "GPS tracked distance" : "Timer + photo proof"}
          </Text>

          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, runMode === "outdoor_gps" && styles.modeButtonActive]}
              onPress={() => handleModeChange("outdoor_gps")}
            >
              <MapPin size={18} color={runMode === "outdoor_gps" ? "#FFFFFF" : Colors.text.secondary} />
              <Text style={[styles.modeButtonText, runMode === "outdoor_gps" && styles.modeButtonTextActive]}>
                Outdoor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, runMode === "treadmill_proof" && styles.modeButtonActive]}
              onPress={() => handleModeChange("treadmill_proof")}
            >
              <Clock size={18} color={runMode === "treadmill_proof" ? "#FFFFFF" : Colors.text.secondary} />
              <Text style={[styles.modeButtonText, runMode === "treadmill_proof" && styles.modeButtonTextActive]}>
                Treadmill
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.requirementCard}>
            {runMode === "outdoor_gps" ? (
              <>
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.requirementText}>
                  {minDistanceMiles} mile{minDistanceMiles !== 1 ? "s" : ""} minimum · GPS verified
                </Text>
              </>
            ) : (
              <>
                <Camera size={16} color="#FFFFFF" />
                <Text style={styles.requirementText}>
                  {minDistanceMiles} mile{minDistanceMiles !== 1 ? "s" : ""} minimum · Proof + Timer required
                </Text>
              </>
            )}
          </View>

          {runMode === "treadmill_proof" && (
            <View style={styles.warningBanner}>
              <AlertTriangle size={16} color="#F59E0B" />
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
                  <Clock size={18} color={Colors.text.secondary} />
                  <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Navigation size={18} color={Colors.text.secondary} />
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
                  >
                    <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.startButtonText}>
                      {isGpsComplete ? "Run Complete" : "Start Run"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.stopButton} onPress={stopGpsTracking}>
                    <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
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
                      {formatTime(timerSeconds)}
                    </Text>
                    <Text style={styles.distanceLabel}>
                      / {Math.floor(minTimerSeconds / 60)}:00 min
                    </Text>
                  </View>

                  {backgroundViolation && (
                    <View style={styles.violationBanner}>
                      <AlertTriangle size={18} color="#DC2626" />
                      <Text style={styles.violationText}>
                        Timer failed - you left the app
                      </Text>
                    </View>
                  )}

                  {timerRunning && (
                    <View style={styles.lockNotice}>
                      <Text style={styles.lockNoticeText}>
                        ⚠️ Leaving this screen fails the timer
                      </Text>
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
                        >
                          {isTreadmillTimerComplete ? (
                            <>
                              <ChevronRight size={28} color="#FFFFFF" />
                              <Text style={styles.startButtonText}>Continue</Text>
                            </>
                          ) : (
                            <>
                              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                              <Text style={styles.startButtonText}>
                                {timerSeconds > 0 ? "Resume Timer" : "Start Timer"}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        {backgroundViolation && (
                          <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
                            <Text style={styles.resetButtonText}>Reset & Try Again</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <TouchableOpacity style={styles.stopButton} onPress={finishTreadmillTimer}>
                        <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
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
                      <Image source={{ uri: proofUri }} style={styles.proofImage} />
                      <TouchableOpacity 
                        style={styles.retakeButton}
                        onPress={captureProof}
                      >
                        <Camera size={18} color={Colors.text.primary} />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.captureButton} onPress={captureProof}>
                      <Camera size={32} color="#FFFFFF" />
                      <Text style={styles.captureButtonText}>Open Camera</Text>
                    </TouchableOpacity>
                  )}

                  {proofUri && (
                    <TouchableOpacity 
                      style={styles.continueButton}
                      onPress={() => setTreadmillStep("distance")}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <ChevronRight size={20} color="#FFFFFF" />
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
                      <Image source={{ uri: proofUri }} style={styles.thumbnailImage} />
                      <View style={styles.proofCheck}>
                        <Check size={14} color="#FFFFFF" />
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
                      placeholderTextColor={Colors.text.tertiary}
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
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Verification Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Timer</Text>
                      <View style={styles.summaryValue}>
                        <Check size={14} color={Colors.success} />
                        <Text style={styles.summaryValueText}>{formatTime(timerSeconds)}</Text>
                      </View>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Photo proof</Text>
                      <View style={styles.summaryValue}>
                        <Check size={14} color={Colors.success} />
                        <Text style={styles.summaryValueText}>Captured</Text>
                      </View>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Distance</Text>
                      <View style={styles.summaryValue}>
                        {isTreadmillDistanceValid ? (
                          <Check size={14} color={Colors.success} />
                        ) : (
                          <AlertTriangle size={14} color="#F59E0B" />
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
    </SafeAreaView>
  );
}

