import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  AppState,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  MapPin,
  Clock,
  Play,
  Check,
  AlertTriangle,
  Navigation,
  Shield,
} from "lucide-react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { AllowedLocation } from "@/types";
import { checkinStyles as styles } from "@/styles/checkin-styles";
import Celebration from "@/components/Celebration";
import { useCelebration } from "@/hooks/useCelebration";

type LocationStatus = "checking" | "inside" | "outside" | "error" | "no_permission";
type TimeStatus = "too_early" | "window_open" | "too_late";

interface CurrentLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export default function CheckinTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { currentChallenge, verifyTask, getTaskStateForTemplate } = useApp();
  const { showCelebration, triggerCelebration, onCelebrationComplete } = useCelebration();

  const task = currentChallenge?.tasks.find((t: any) => t.id === taskId);
  const taskState = taskId ? getTaskStateForTemplate(taskId) : null;

  const locationPolicy = task?.rules.locationPolicy;
  const timeWindowPolicy = task?.rules.timeWindowPolicy;
  const sessionPolicy = task?.rules.sessionPolicy;

  const allowedLocations = locationPolicy?.allowedLocations || [];
  const minSessionSeconds = sessionPolicy?.minSessionSeconds || 900;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("checking");
  const [timeStatus, setTimeStatus] = useState<TimeStatus>("too_early");
  const [matchedLocation, setMatchedLocation] = useState<AllowedLocation | null>(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [backgroundSeconds, setBackgroundSeconds] = useState(0);
  const [backgroundViolation, setBackgroundViolation] = useState(false);
  const [outsideRadiusSeconds, setOutsideRadiusSeconds] = useState(0);

  const [startLocation, setStartLocation] = useState<CurrentLocation | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const backgroundStartRef = useRef<number | null>(null);

  const canStartCheckin = locationStatus === "inside" && timeStatus === "window_open" && !sessionActive;
  const canFinish = sessionActive && elapsedSeconds >= minSessionSeconds && !backgroundViolation;

  useEffect(() => {
    checkPermissions();
    const interval = setInterval(updateTimeStatus, 1000);

    const handleAppState = (nextAppState: typeof AppState.currentState) => {
      if (sessionActive) {
        if (appStateRef.current === "active" && nextAppState.match(/inactive|background/)) {
          backgroundStartRef.current = Date.now();
        } else if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
          if (backgroundStartRef.current) {
            const bgTime = Math.floor((Date.now() - backgroundStartRef.current) / 1000);
            const maxBg = sessionPolicy?.allowBackgroundSeconds || 0;
            
            setBackgroundSeconds((prev) => {
              const newTotal = prev + bgTime;
              if (newTotal > maxBg) {
                setBackgroundViolation(true);
                stopSession();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                  "Check-in Failed",
                  "You left the app for too long during your session.",
                  [{ text: "OK" }]
                );
              }
              return newTotal;
            });
            backgroundStartRef.current = null;
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (locationSubscription.current) locationSubscription.current.remove();
      clearInterval(interval);
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup; checkPermissions/updateTimeStatus would cause unnecessary re-runs if in deps
  }, [sessionActive]);

  useEffect(() => {
    if (hasPermission && !sessionActive) {
      startLocationTracking();
    }
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startLocationTracking is stable; sessionActive intentionally excluded to avoid toggling subscription on session change
  }, [hasPermission]);

  const checkPermissions = async () => {
    if (Platform.OS === "web") {
      setHasPermission(true);
      setLocationStatus("inside");
      if (allowedLocations.length > 0) {
        setMatchedLocation(allowedLocations[0]);
      }
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);

    if (!granted) {
      setLocationStatus("no_permission");
      Alert.alert(
        "Location Required",
        "Location permission is required to verify your check-in."
      );
    }
  };

  const startLocationTracking = async () => {
    if (Platform.OS === "web") return;

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const newLocation: CurrentLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || 50,
            timestamp: Date.now(),
          };
          setCurrentLocation(newLocation);
          checkGeofence(newLocation);
        }
      );
    } catch {
      setLocationStatus("error");
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkGeofence = (location: CurrentLocation) => {
    if (location.accuracy > 100) {
      setLocationStatus("error");
      return;
    }

    let foundMatch: AllowedLocation | null = null;
    let minDistance = Infinity;

    for (const allowed of allowedLocations) {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        allowed.lat,
        allowed.lng
      );
      if (distance <= allowed.radiusMeters && distance < minDistance) {
        minDistance = distance;
        foundMatch = allowed;
      }
    }

    if (foundMatch) {
      setLocationStatus("inside");
      setMatchedLocation(foundMatch);
    } else {
      setLocationStatus("outside");
      setMatchedLocation(null);
      
      if (sessionActive && locationPolicy?.requireContinuousPresence) {
        setOutsideRadiusSeconds((prev) => {
          const newVal = prev + 5;
          const maxOutside = locationPolicy?.maxOutsideRadiusSeconds || 60;
          if (newVal >= maxOutside) {
            setBackgroundViolation(true);
            stopSession();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              "Check-in Failed",
              "You left the required location during your session.",
              [{ text: "OK" }]
            );
          }
          return newVal;
        });
      }
    }
  };

  const updateTimeStatus = () => {
    if (!timeWindowPolicy?.enabled) {
      setTimeStatus("window_open");
      return;
    }

    const now = new Date();
    const [hours, minutes] = timeWindowPolicy.startTimeLocal.split(":").map(Number);
    const graceSeconds = timeWindowPolicy.allowGraceSeconds || 30;
    const windowMinutes = timeWindowPolicy.startWindowMinutes || 10;

    const windowStart = new Date(now);
    windowStart.setHours(hours, minutes, 0, 0);
    windowStart.setSeconds(windowStart.getSeconds() - graceSeconds);

    const windowEnd = new Date(now);
    windowEnd.setHours(hours, minutes + windowMinutes, 0, 0);
    windowEnd.setSeconds(windowEnd.getSeconds() + graceSeconds);

    if (now < windowStart) {
      setTimeStatus("too_early");
    } else if (now > windowEnd) {
      setTimeStatus("too_late");
    } else {
      setTimeStatus("window_open");
    }
  };

  const startSession = () => {
    if (!canStartCheckin) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSessionActive(true);
    setSessionStartedAt(new Date().toISOString());
    setElapsedSeconds(0);
    setBackgroundSeconds(0);
    setOutsideRadiusSeconds(0);
    setBackgroundViolation(false);
    setStartLocation(currentLocation);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopSession = () => {
    setSessionActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFinish = async () => {
    if (!canFinish) {
      if (elapsedSeconds < minSessionSeconds) {
        const remaining = minSessionSeconds - elapsedSeconds;
        Alert.alert(
          "Session Too Short",
          `Complete ${Math.ceil(remaining / 60)} more minute(s) to verify.`
        );
      }
      return;
    }

    stopSession();

    if (task && currentLocation && startLocation) {
      const result = verifyTask(
        task.id,
        {
          geoTimeCheckin: {
            type: "geo_time_checkin",
            locationMatched: matchedLocation ? {
              locationId: matchedLocation.id,
              name: matchedLocation.name,
              radiusMeters: matchedLocation.radiusMeters,
            } : undefined,
            start: {
              startedAtLocal: sessionStartedAt || new Date().toISOString(),
              lat: startLocation.lat,
              lng: startLocation.lng,
              accuracyMeters: startLocation.accuracy,
              insideGeofence: true,
              timeWindowOpen: true,
            },
            end: {
              endedAtLocal: new Date().toISOString(),
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              accuracyMeters: currentLocation.accuracy,
              insideGeofence: locationStatus === "inside",
            },
            session: {
              elapsedSeconds,
              backgroundSeconds,
              continuousPresenceEnabled: locationPolicy?.requireContinuousPresence || false,
              outsideRadiusSeconds,
            },
            antiCheat: {
              mockLocationDetected: false,
              accuracyTooLow: false,
            },
          },
          durationSeconds: elapsedSeconds,
          startedAt: sessionStartedAt || new Date().toISOString(),
          endedAt: new Date().toISOString(),
        },
        task
      );

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

  const getTimeWindowDisplay = () => {
    if (!timeWindowPolicy?.enabled) return "Anytime";
    const [hours, minutes] = timeWindowPolicy.startTimeLocal.split(":").map(Number);
    const endMinutes = minutes + (timeWindowPolicy.startWindowMinutes || 10);
    const endHours = hours + Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    const formatHour = (h: number, m: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 || 12;
      return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
    };
    
    return `${formatHour(hours, minutes)} - ${formatHour(endHours, endMins)}`;
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case "inside": return Colors.success;
      case "outside": return "#F59E0B";
      case "checking": return Colors.text.tertiary;
      default: return "#DC2626";
    }
  };

  const getTimeStatusColor = () => {
    switch (timeStatus) {
      case "window_open": return Colors.success;
      case "too_early": return "#F59E0B";
      default: return "#DC2626";
    }
  };

  if (taskState?.status === "verified") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedBadge}>
            <Check size={32} color={Colors.success} />
          </View>
          <Text style={styles.verifiedTitle}>Check-in Verified</Text>
          <Text style={styles.verifiedSubtitle}>You showed up at the right place and time.</Text>
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{task?.title || "Check-in"}</Text>
        <Text style={styles.subtitle}>Location + time verified</Text>

        <View style={styles.requirementBanner}>
          <Shield size={18} color="#FFFFFF" />
          <Text style={styles.requirementText}>
            Must start at {getTimeWindowDisplay()} at your location
          </Text>
        </View>

        <View style={styles.statusCards}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: `${getLocationStatusColor()}15` }]}>
              <MapPin size={20} color={getLocationStatusColor()} />
            </View>
            <Text style={styles.statusLabel}>Location</Text>
            <View style={[styles.statusChip, { backgroundColor: `${getLocationStatusColor()}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: getLocationStatusColor() }]} />
              <Text style={[styles.statusChipText, { color: getLocationStatusColor() }]}>
                {locationStatus === "checking" && "Checking..."}
                {locationStatus === "inside" && (matchedLocation?.name || "At location")}
                {locationStatus === "outside" && "Not at location"}
                {locationStatus === "error" && "Low accuracy"}
                {locationStatus === "no_permission" && "No permission"}
              </Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: `${getTimeStatusColor()}15` }]}>
              <Clock size={20} color={getTimeStatusColor()} />
            </View>
            <Text style={styles.statusLabel}>Time Window</Text>
            <View style={[styles.statusChip, { backgroundColor: `${getTimeStatusColor()}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: getTimeStatusColor() }]} />
              <Text style={[styles.statusChipText, { color: getTimeStatusColor() }]}>
                {timeStatus === "too_early" && "Too early"}
                {timeStatus === "window_open" && "Window open"}
                {timeStatus === "too_late" && "Too late"}
              </Text>
            </View>
          </View>
        </View>

        {backgroundViolation && (
          <View style={styles.violationBanner}>
            <AlertTriangle size={18} color="#DC2626" />
            <Text style={styles.violationText}>
              Check-in failed - session interrupted
            </Text>
          </View>
        )}

        {sessionActive && (
          <View style={styles.sessionContainer}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionLive}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Session active</Text>
              </View>
              {sessionPolicy?.lockScreenDuringSession && (
                <Text style={styles.lockWarning}>Do not leave this screen</Text>
              )}
            </View>

            <View style={styles.timerDisplay}>
              <Text style={[styles.timerValue, elapsedSeconds >= minSessionSeconds && styles.timerComplete]}>
                {formatTime(elapsedSeconds)}
              </Text>
              <Text style={styles.timerLabel}>
                / {Math.floor(minSessionSeconds / 60)}:00 required
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(1, elapsedSeconds / minSessionSeconds) * 100}%` },
                    elapsedSeconds >= minSessionSeconds && styles.progressFillComplete,
                  ]}
                />
              </View>
            </View>

            {locationPolicy?.requireContinuousPresence && (
              <View style={styles.continuousNote}>
                <Navigation size={14} color={Colors.text.tertiary} />
                <Text style={styles.continuousNoteText}>
                  Stay at location during session
                </Text>
              </View>
            )}
          </View>
        )}

        {!sessionActive && !backgroundViolation && (
          <View style={styles.startContainer}>
            <TouchableOpacity
              style={[styles.startButton, !canStartCheckin && styles.startButtonDisabled]}
              onPress={startSession}
              disabled={!canStartCheckin}
            >
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startButtonText}>START CHECK-IN</Text>
            </TouchableOpacity>

            {!canStartCheckin && (
              <Text style={styles.startHint}>
                {locationStatus !== "inside" && "Get to your location to start"}
                {locationStatus === "inside" && timeStatus === "too_early" && "Wait for the time window to open"}
                {locationStatus === "inside" && timeStatus === "too_late" && "Time window has closed"}
              </Text>
            )}
          </View>
        )}

        {backgroundViolation && (
          <View style={styles.resetContainer}>
            <Text style={styles.resetText}>Your session was interrupted. Try again tomorrow.</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoNumber}><Text style={styles.infoNumberText}>1</Text></View>
            <Text style={styles.infoText}>Be at the location during the time window</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoNumber}><Text style={styles.infoNumberText}>2</Text></View>
            <Text style={styles.infoText}>Start check-in and stay for {Math.floor(minSessionSeconds / 60)} minutes</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoNumber}><Text style={styles.infoNumberText}>3</Text></View>
            <Text style={styles.infoText}>Finish to verify your check-in</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.verifyButton, !canFinish && styles.verifyButtonDisabled]}
          onPress={handleFinish}
          disabled={!canFinish}
        >
          <Text style={[styles.verifyButtonText, !canFinish && styles.verifyButtonTextDisabled]}>
            {sessionActive ? "FINISH CHECK-IN" : "START SESSION FIRST"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

