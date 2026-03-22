/**
 * Unified task completion screen. Renders verification UI by task type and config:
 * manual, journal, timer (countdown/countup, hard mode), optional photo, heart rate, location.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  AppState,
  AppStateStatus,
  StyleSheet,
  Platform,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { ProofShareCard } from "@/components/ShareCard";
import { shareCompletion } from "@/lib/share-completion";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Camera, Lock, CheckCircle, XCircle, MapPin } from "lucide-react-native";
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
} from "@/lib/design-system";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";

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
};

function parseConfig(taskConfigStr: string | undefined): TaskCompleteConfig {
  if (!taskConfigStr?.trim()) return {};
  try {
    const o = JSON.parse(taskConfigStr) as TaskCompleteConfig;
    return typeof o === "object" && o !== null ? o : {};
  } catch {
    return {};
  }
}

function firstString(v: string | string[] | undefined): string {
  if (v == null) return "";
  return typeof v === "string" ? v : v[0] ?? "";
}

export default function TaskCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    taskId: string;
    activeChallengeId: string;
    taskType: string;
    taskName?: string;
    taskDescription?: string;
    taskConfig?: string;
  }>();
  const { activeChallenge, completeTask, challenge, profile, stats } = useApp();
  const shareRef = useRef<ViewShot | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);

  const taskId = firstString(params.taskId) || "";
  const activeChallengeId = firstString(params.activeChallengeId) || activeChallenge?.id || "";
  const taskType = (firstString(params.taskType) || "manual") as string;
  const taskName = (firstString(params.taskName) || "Task").trim() || "Task";
  const config = useMemo(() => parseConfig(firstString(params.taskConfig)), [params.taskConfig]);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const onScreenSecondsRef = useRef(0);
  const [heartRateData, setHeartRateData] = useState<{ avg: number; peak: number } | null>(null);
  const [heartRateManual, setHeartRateManual] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { error, showError, clearError } = useInlineError();

  const requiredSeconds = (config.min_duration_minutes ?? 0) * 60;
  const isCountdown = config.timer_direction === "countdown";
  const isHardMode = config.timer_hard_mode === true;

  // Timer tick
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

  // Hard mode: pause when app goes background
  useEffect(() => {
    if (!isHardMode) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state !== "active") setIsTimerRunning(false);
    });
    return () => sub.remove();
  }, [isHardMode]);

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError("Allow camera access to submit photo proof.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
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
      console.error("[TaskComplete] camera upload failed:", err);
      showError("Upload failed. Please try again.");
      setPhotoUri(null);
    } finally {
      setPhotoUploading(false);
    }
  }, [showError]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Allow gallery access to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
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
      console.error("[TaskComplete] gallery upload failed:", err);
      showError("Upload failed. Please try again.");
      setPhotoUri(null);
    } finally {
      setPhotoUploading(false);
    }
  }, [showError]);

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
      console.error("[TaskComplete] getCurrentPosition failed:", err);
      showError("Could not get your location. Please try again.");
    }
  }, [showError]);

  const wordCount = useMemo(() => journalText.trim().split(/\s+/).filter(Boolean).length, [journalText]);
  const minWords = config.min_words ?? 0;
  const journalOk = minWords === 0 || wordCount >= minWords;
  const timerOk = requiredSeconds === 0 || timerSeconds >= requiredSeconds;
  const hardModeOk = !isHardMode || requiredSeconds === 0 || onScreenSecondsRef.current >= requiredSeconds;
  const photoOk = !config.require_photo || !!(photoUrl || photoUri);
  const threshold = config.heart_rate_threshold ?? 100;
  const heartRateOk = !config.require_heart_rate || (heartRateData !== null && heartRateData.avg >= threshold);
  const distance = useMemo(() => {
    if (!userLocation || config.location_latitude == null || config.location_longitude == null) return null;
    return haversineDistance(config.location_latitude, config.location_longitude, userLocation.lat, userLocation.lng);
  }, [userLocation, config.location_latitude, config.location_longitude]);
  const radius = config.location_radius_meters ?? 200;
  const locationOk = !config.require_location || (distance !== null && distance <= radius);

  const canSubmit = useMemo(() => {
    if (taskType === "journal" && !journalOk) return false;
    if (taskType === "timer" && (!timerOk || !hardModeOk)) return false;
    if (config.require_photo && !photoOk) return false;
    if (config.require_heart_rate && !heartRateOk) return false;
    if (config.require_location && !locationOk) return false;
    return true;
  }, [taskType, journalOk, timerOk, hardModeOk, photoOk, heartRateOk, locationOk, config]);

  const handleSubmit = useCallback(async () => {
    if (!activeChallengeId || !taskId || !canSubmit) return;
    setIsSubmitting(true);
    try {
      const result = await completeTask({
        activeChallengeId,
        taskId,
        noteText: taskType === "journal" ? journalText.trim() : undefined,
        value: taskType === "timer" ? Math.floor(timerSeconds / 60) : undefined,
        proofUrl: photoUrl ?? undefined,
        photo_url: photoUrl ?? undefined,
        heart_rate_avg: heartRateData?.avg,
        heart_rate_peak: heartRateData?.peak,
        location_latitude: userLocation?.lat,
        location_longitude: userLocation?.lng,
        timer_seconds_on_screen: isHardMode ? onScreenSecondsRef.current : undefined,
      });
      const id = result && typeof result === "object" && "completionId" in result ? (result as { completionId?: string }).completionId : undefined;
      setCompletionId(id ?? null);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("[TaskComplete] completeTask failed:", err);
      showError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeChallengeId, taskId, canSubmit, completeTask, taskType, journalText, timerSeconds, photoUrl, heartRateData, userLocation, isHardMode, showError]);

  const handleShare = useCallback(async () => {
    setShareLoading(true);
    try {
      const username = (profile as { username?: string })?.username ?? "GRIIT User";
      const challengeName = (challenge as { title?: string })?.title ?? "Challenge";
      const dayNumber = (activeChallenge as { current_day_index?: number })?.current_day_index ?? 1;
      const streakCount = (stats as { activeStreak?: number })?.activeStreak ?? 0;
      const gpsCoords = userLocation
        ? `${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° W`
        : null;
      await shareCompletion({
        ref: shareRef as React.RefObject<{ capture?: () => Promise<string> } | null>,
        completionId: completionId ?? undefined,
        username,
        dayNumber,
        challengeName,
        proofPhotoUri: photoUri ?? photoUrl ?? null,
        streakCount,
        gpsCoords,
        date: new Date().toLocaleDateString(),
      });
      setSharedFeedback(true);
      setTimeout(() => setSharedFeedback(false), 2000);
    } finally {
      setShareLoading(false);
    }
  }, [completionId, profile, challenge, activeChallenge, stats, userLocation, photoUri, photoUrl]);

  if (!taskId.trim() || !activeChallengeId.trim()) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ title: "Task", headerBackVisible: true }} />
        <View style={{ padding: DS_SPACING.xl }}>
          <Text style={styles.title}>Couldn&apos;t open this task</Text>
          <Text style={styles.subtitle}>Go back and tap Start again from Home.</Text>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: DS_COLORS.ACCENT_PRIMARY, marginTop: DS_SPACING.lg }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.submitButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    const username = (profile as { username?: string })?.username ?? "GRIIT User";
    const challengeName = (challenge as { title?: string })?.title ?? "Challenge";
    const dayNumber = (activeChallenge as { current_day_index?: number })?.current_day_index ?? 1;
    const streakCount = (stats as { activeStreak?: number })?.activeStreak ?? 0;
    const gpsCoords = userLocation
      ? `${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° W`
      : null;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ title: taskName, headerBackVisible: true }} />
        <View style={{ opacity: 0, position: "absolute", left: -9999, pointerEvents: "none" }}>
          <ViewShot
            ref={shareRef}
            options={{ format: "png", width: 1080, height: 1080 }}
            style={{ width: 1080, height: 1080 }}
          >
            <ProofShareCard
              username={username}
              dayNumber={dayNumber}
              challengeName={challengeName}
              proofPhotoUri={photoUri ?? photoUrl ?? null}
              streakCount={streakCount}
              gpsCoords={gpsCoords}
              date={new Date().toLocaleDateString()}
            />
          </ViewShot>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Task complete</Text>
          <Text style={styles.subtitle}>Nice work.</Text>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: DS_COLORS.ACCENT_PRIMARY }]}
            onPress={handleShare}
            disabled={shareLoading}
          >
            {shareLoading ? (
              <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
            ) : sharedFeedback ? (
              <Text style={styles.submitButtonText}>Shared! ✓</Text>
            ) : (
              <Text style={styles.submitButtonText}>Share your proof</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.sectionHint, { textAlign: "center", marginTop: 8 }]}>Show the world you showed up</Text>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: DS_COLORS.border, marginTop: 24 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.submitButtonText, { color: DS_COLORS.textPrimary }]}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
      <Stack.Screen options={{ title: taskName, headerBackVisible: true }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <InlineError message={error} onDismiss={clearError} />
        <Text style={styles.title}>{taskName}</Text>
        {firstString(params.taskDescription) ? <Text style={styles.subtitle}>{firstString(params.taskDescription)}</Text> : null}

        {/* Manual: just confirmation */}
        {(taskType === "manual" || taskType === "simple") && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tap Complete when done. Honor-based.</Text>
          </View>
        )}

        {/* Journal */}
        {taskType === "journal" && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Journal entry</Text>
            <TextInput
              style={styles.journalInput}
              placeholder="Write your thoughts..."
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              value={journalText}
              onChangeText={setJournalText}
              multiline
              numberOfLines={6}
            />
            {minWords > 0 && (
              <Text style={[styles.wordCount, wordCount >= minWords && { color: DS_COLORS.success }]}>
                {wordCount} / {minWords} words
              </Text>
            )}
          </View>
        )}

        {/* Timer */}
        {taskType === "timer" && requiredSeconds > 0 && (
          <View style={styles.section}>
            {isHardMode && (
              <View style={styles.hardModeBadge}>
                <Lock size={14} color={DS_COLORS.accent} />
                <Text style={styles.hardModeText}>Hard Mode — stay on this screen</Text>
              </View>
            )}
            <Text style={styles.timerDisplay}>
              {isCountdown
                ? `${String(Math.floor(Math.max(0, requiredSeconds - timerSeconds) / 60)).padStart(2, "0")}:${String(Math.max(0, requiredSeconds - timerSeconds) % 60).padStart(2, "0")}`
                : `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(1, timerSeconds / requiredSeconds) * 100}%`,
                    backgroundColor: timerSeconds >= requiredSeconds ? DS_COLORS.success : DS_COLORS.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.timerHint}>
              {isCountdown ? "counting down" : "counting up"} · {config.min_duration_minutes} min required
            </Text>
            <View style={styles.timerButtons}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  style={[styles.btnPrimary, DS_SHADOWS.button]}
                  onPress={() => {
                    setIsTimerRunning(true);
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Text style={styles.btnPrimaryText}>{timerSeconds > 0 ? "Resume" : "Start"}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => setIsTimerRunning(false)}
                >
                  <Text style={styles.btnSecondaryText}>Pause</Text>
                </TouchableOpacity>
              )}
            </View>
            {isHardMode && isTimerRunning && (
              <Text style={styles.hardModeWarning}>Leaving this screen will pause your timer.</Text>
            )}
          </View>
        )}

        {/* Heart rate (manual entry fallback) */}
        {config.require_heart_rate && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Heart rate verification</Text>
            <Text style={styles.sectionHint}>Minimum {threshold} BPM average required</Text>
            {heartRateData ? (
              <View style={styles.card}>
                <View style={styles.heartRateRow}>
                  <View style={styles.heartRateCol}>
                    <Text style={[styles.heartRateValue, { color: heartRateData.avg >= threshold ? DS_COLORS.success : DS_COLORS.danger }]}>
                      {heartRateData.avg}
                    </Text>
                    <Text style={styles.heartRateLabel}>avg BPM</Text>
                  </View>
                  <View style={styles.heartRateCol}>
                    <Text style={[styles.heartRateValue, { color: DS_COLORS.accent }]}>{heartRateData.peak}</Text>
                    <Text style={styles.heartRateLabel}>peak BPM</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setHeartRateData(null)} style={styles.retakeLink}>
                  <Text style={styles.retakeLinkText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <TextInput
                  style={styles.heartRateInput}
                  placeholder="Enter average BPM (e.g. 120)"
                  placeholderTextColor={DS_COLORS.inputPlaceholder}
                  value={heartRateManual}
                  onChangeText={setHeartRateManual}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => {
                    const avg = parseInt(heartRateManual.trim(), 10);
                    if (Number.isNaN(avg) || avg < 0) {
                      showError("Enter a valid heart rate (e.g. 120)");
                      return;
                    }
                    setHeartRateData({ avg, peak: avg + Math.floor(avg * 0.1) });
                    setHeartRateManual("");
                  }}
                >
                  <Text style={styles.btnPrimaryText}>Use this heart rate</Text>
                </TouchableOpacity>
                <Text style={styles.sectionHint}>From your watch or tracker</Text>
              </View>
            )}
          </View>
        )}

        {/* Location */}
        {config.require_location && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location verification</Text>
            <Text style={styles.sectionHint}>You must be at: {config.location_name ?? "the required location"}</Text>
            {userLocation ? (
              <View style={styles.card}>
                {distance !== null && distance <= radius ? (
                  <>
                    <CheckCircle size={28} color={DS_COLORS.success} />
                    <Text style={[styles.locationStatus, { color: DS_COLORS.success }]}>Location verified</Text>
                  </>
                ) : (
                  <>
                    <XCircle size={28} color={DS_COLORS.danger} />
                    <Text style={[styles.locationStatus, { color: DS_COLORS.danger }]}>
                      Too far away ({distance != null ? Math.round(distance) : "?"}m)
                    </Text>
                    <Text style={styles.sectionHint}>Must be within {radius}m</Text>
                  </>
                )}
                <TouchableOpacity onPress={() => setUserLocation(null)} style={styles.retakeLink}>
                  <Text style={styles.retakeLinkText}>Check again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.card, styles.cardButton]} onPress={handleCheckLocation}>
                <MapPin size={28} color={DS_COLORS.accent} />
                <Text style={styles.cardButtonText}>Verify location</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Photo (on any task when require_photo) */}
        {config.require_photo && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photo proof required</Text>
            {photoUri ? (
              <View>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity onPress={() => { setPhotoUri(null); setPhotoUrl(null); }} style={styles.retakeLink}>
                  <Text style={[styles.retakeLinkText, { color: DS_COLORS.accent }]}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <TouchableOpacity style={styles.photoPlaceholderInner} onPress={handleTakePhoto} disabled={photoUploading}>
                  {photoUploading ? <ActivityIndicator color={DS_COLORS.accent} /> : <Camera size={32} color={DS_COLORS.textMuted} />}
                  <Text style={styles.photoPlaceholderText}>{photoUploading ? "Uploading…" : "Tap to take photo"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryLink} onPress={handlePickImage} disabled={photoUploading}>
                  <Text style={styles.galleryLinkText}>Choose from gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Submit */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              DS_SHADOWS.button,
              (!canSubmit || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={DS_COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting…" : "Complete task"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: DS_SPACING.cardPadding, paddingBottom: DS_SPACING.section },
  title: { fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: DS_SPACING.sm },
  subtitle: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, color: DS_COLORS.textSecondary, marginBottom: DS_SPACING.xl },
  section: { marginTop: DS_SPACING.xxl },
  sectionLabel: { fontSize: DS_TYPOGRAPHY.body.fontSize, fontWeight: "700", color: DS_COLORS.textPrimary, marginBottom: DS_SPACING.xs },
  sectionHint: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textMuted, marginBottom: DS_SPACING.md },
  journalInput: {
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.input,
    padding: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
    minHeight: 160,
    textAlignVertical: "top",
  },
  wordCount: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textMuted, marginTop: DS_SPACING.sm },
  hardModeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: DS_COLORS.accentSoft,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: 6,
    borderRadius: DS_RADIUS.input / 2,
    marginBottom: DS_SPACING.lg,
  },
  hardModeText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.accent, fontWeight: "600" },
  timerDisplay: { fontSize: 56, fontWeight: "800", color: DS_COLORS.textPrimary, fontVariant: ["tabular-nums"] },
  progressBar: { height: DS_MEASURES.progressBarHeight, backgroundColor: DS_COLORS.border, borderRadius: 3, marginTop: DS_SPACING.xl, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  timerHint: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textMuted, marginTop: DS_SPACING.sm },
  timerButtons: { flexDirection: "row", gap: DS_SPACING.lg, marginTop: DS_SPACING.xxl },
  hardModeWarning: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.danger, marginTop: DS_SPACING.md, textAlign: "center" },
  btnPrimary: { backgroundColor: DS_COLORS.accent, borderRadius: DS_RADIUS.buttonPill, paddingVertical: DS_SPACING.lg, paddingHorizontal: DS_SPACING.xxxl, alignItems: "center" },
  btnPrimaryText: { color: DS_COLORS.white, fontSize: DS_TYPOGRAPHY.button.fontSize, fontWeight: "700" },
  btnSecondary: { backgroundColor: DS_COLORS.textMuted, borderRadius: DS_RADIUS.buttonPill, paddingVertical: DS_SPACING.lg, paddingHorizontal: DS_SPACING.xxxl, alignItems: "center" },
  btnSecondaryText: { color: DS_COLORS.white, fontSize: DS_TYPOGRAPHY.button.fontSize, fontWeight: "700" },
  card: { backgroundColor: DS_COLORS.surface, borderRadius: DS_RADIUS.cardAlt, padding: DS_SPACING.cardPadding, ...DS_SHADOWS.card, alignItems: "center", borderWidth: DS_BORDERS.width, borderColor: DS_COLORS.border },
  cardButton: { flexDirection: "column", gap: DS_SPACING.sm },
  cardButtonText: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "600", color: DS_COLORS.textPrimary },
  heartRateRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  heartRateCol: { alignItems: "center" },
  heartRateValue: { fontSize: DS_TYPOGRAPHY.statValue.fontSize, fontWeight: "800" },
  heartRateLabel: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.textMuted },
  heartRateInput: {
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
    borderRadius: DS_RADIUS.input,
    padding: DS_SPACING.lg,
    fontSize: 18,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.md,
    width: "100%",
  },
  retakeLink: { marginTop: DS_SPACING.md },
  retakeLinkText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.accent },
  locationStatus: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "600", marginTop: DS_SPACING.sm },
  photoPreview: { width: "100%", height: 200, borderRadius: DS_RADIUS.cardAlt, backgroundColor: DS_COLORS.surfaceMuted },
  photoPlaceholder: { borderWidth: 2, borderStyle: "dashed", borderColor: DS_COLORS.border, borderRadius: DS_RADIUS.cardAlt, height: 160, alignItems: "center", justifyContent: "center" },
  photoPlaceholderInner: { alignItems: "center" },
  photoPlaceholderText: { color: DS_COLORS.textMuted, fontSize: DS_TYPOGRAPHY.secondary.fontSize, marginTop: DS_SPACING.sm },
  galleryLink: { marginTop: DS_SPACING.md },
  galleryLinkText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.accent },
  submitSection: { marginTop: DS_SPACING.xxxl, paddingBottom: DS_SPACING.xxl },
  submitButton: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: DS_COLORS.white, fontSize: DS_TYPOGRAPHY.button.fontSize, fontWeight: "700" },
});
