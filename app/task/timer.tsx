import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, AppState, AppStateStatus, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Play, Pause, Check, Camera, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS } from "@/lib/design-system";
import type { ChallengeTaskFromApi } from "@/types";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { formatSecondsToMMSS } from "@/lib/formatTime";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";

/** Active challenge as returned by getActive (nested challenges.challenge_tasks in API shape). */
interface ActiveChallengeWithTasks {
  challenges?: { challenge_tasks?: ChallengeTaskFromApi[] } | null;
}

const PICKER_OPTIONS = { allowsEditing: true, aspect: [4, 3] as [number, number], quality: 0.8, base64: true as const };

export default function TimerTaskScreen() {
  const router = useRouter();
  const { taskId, requirePhotoProof: requirePhotoProofParam } = useLocalSearchParams<{ taskId: string; requirePhotoProof?: string }>();
  const { activeChallenge, completeTask } = useApp();
  const requirePhotoProof = requirePhotoProofParam === "true";
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [, setIntervalId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [strictResetMessage, setStrictResetMessage] = useState<string | null>(null);
  const resetInProgressRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { error, showError, clearError } = useInlineError();

  const ac = activeChallenge as ActiveChallengeWithTasks | null | undefined;
  const tasks: ChallengeTaskFromApi[] = ac?.challenges?.challenge_tasks ?? [];
  const task = taskId ? tasks.find((t) => t.id === taskId) ?? null : null;
  const strictTimerMode = task?.strict_timer_mode === true;

  const resetTimer = useCallback(() => {
    if (resetInProgressRef.current) return;
    resetInProgressRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIntervalId(null);
    setSeconds(0);
    setIsRunning(false);
    setStrictResetMessage("Timer reset: Strict Mode requires staying on this screen.");
    resetInProgressRef.current = false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (strictTimerMode && isRunning) {
          resetTimer();
        }
      };
    }, [strictTimerMode, isRunning, resetTimer])
  );

  useEffect(() => {
    if (!strictTimerMode) return;
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        if (isRunning) resetTimer();
      }
    });
    return () => sub.remove();
  }, [strictTimerMode, isRunning, resetTimer]);

  const startTimer = useCallback(() => {
    const id = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    intervalRef.current = id;
    setIntervalId(id);
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleStartPause = () => {
    setStrictResetMessage(null);
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
      setIsRunning(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (strictTimerMode) {
        Alert.alert(
          "Focus lock on",
          "You must stay on this screen while the timer runs. Leaving the app or navigating away will reset the timer.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "I understand, start", onPress: startTimer },
          ],
          { cancelable: true }
        );
      } else {
        startTimer();
      }
    }
  };

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError("Camera permission is required for photo proof");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [showError]);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Gallery access is required for photo proof");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ ...PICKER_OPTIONS, mediaTypes: ["images"] });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [showError]);

  const handleSubmit = async () => {
    if (seconds < 60) {
      showError("Please run the timer for at least 1 minute");
      return;
    }
    if (requirePhotoProof && !photoUri) {
      showError("This task requires photo proof. Take or upload a photo before completing.");
      return;
    }

    if (!activeChallenge) {
      showError("No active challenge found");
      return;
    }
    if (!taskId) {
      showError("Task not found");
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    setLoading(true);
    try {
      let proofUrl: string | undefined;
      if (requirePhotoProof && (photoUri || photoBase64)) {
        setUploading(true);
        if (photoBase64) {
          const contentType = photoUri?.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
          const result = await uploadProofImageFromBase64(photoBase64, contentType);
          if ("error" in result) {
            showError(result.error);
            return;
          }
          proofUrl = result.url;
        } else if (photoUri) {
          const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
          const res = await uploadProofImageFromUri(photoUri);
          if ("error" in res) {
            showError(res.error);
            return;
          }
          proofUrl = res.url;
        }
        setUploading(false);
      }

      await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        value: Math.floor(seconds / 60),
        proofUrl,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <InlineError message={error} onDismiss={clearError} />
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatSecondsToMMSS(seconds)}</Text>
          <Text style={styles.timerLabel}>{isRunning ? 'Running...' : 'Paused'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, isRunning && styles.pauseButton]}
          onPress={handleStartPause}
          activeOpacity={0.8}
          accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
          accessibilityRole="button"
        >
          {isRunning ? (
            <>
              <Pause size={24} color={DS_COLORS.white} />
              <Text style={styles.controlButtonText}>Pause</Text>
            </>
          ) : (
            <>
              <Play size={24} color={DS_COLORS.white} />
              <Text style={styles.controlButtonText}>Start Timer</Text>
            </>
          )}
        </TouchableOpacity>

        {strictTimerMode && strictResetMessage ? (
          <View style={styles.strictBanner}>
            <Text style={styles.strictBannerText}>{strictResetMessage}</Text>
          </View>
        ) : null}
        {requirePhotoProof && seconds >= 60 && (
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Photo proof (required)</Text>
            {photoUri ? (
              <View style={styles.photoRow}>
                <Image source={{ uri: photoUri }} style={styles.photoThumb} />
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.8} accessibilityLabel="Take photo" accessibilityRole="button">
                    <Camera size={18} color={DS_COLORS.textPrimary} />
                    <Text style={styles.photoBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={handlePickFromGallery} activeOpacity={0.8} accessibilityLabel="Change photo from gallery" accessibilityRole="button">
                    <ImagePlus size={18} color={DS_COLORS.textPrimary} />
                    <Text style={styles.photoBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoEmpty}>
                <TouchableOpacity style={styles.photoPrimaryBtn} onPress={handleTakePhoto} activeOpacity={0.8} accessibilityLabel="Take photo" accessibilityRole="button">
                  <Camera size={20} color={DS_COLORS.white} />
                  <Text style={styles.photoPrimaryBtnText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoSecondaryBtn} onPress={handlePickFromGallery} activeOpacity={0.8} accessibilityLabel="Pick from gallery" accessibilityRole="button">
                  <ImagePlus size={18} color={DS_COLORS.textSecondary} />
                  <Text style={styles.photoSecondaryBtnText}>Upload from gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {seconds >= 60 && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || (requirePhotoProof && !photoUri)) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || (requirePhotoProof && !photoUri)}
            activeOpacity={0.8}
            accessibilityLabel="Submit timer"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || (requirePhotoProof && !photoUri) }}
          >
            {loading ? (
              <>
                <ActivityIndicator color={DS_COLORS.white} size="small" />
                <Text style={styles.submitButtonText}>{uploading ? "Uploading…" : "Submitting…"}</Text>
              </>
            ) : (
              <>
                <Check size={20} color={DS_COLORS.white} />
                <Text style={styles.submitButtonText}>Complete Task</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: DS_COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 18,
    color: DS_COLORS.textSecondary,
    marginTop: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: DS_COLORS.taskEmerald,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  pauseButton: {
    backgroundColor: DS_COLORS.taskAmber,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DS_COLORS.white,
  },
  photoSection: { marginBottom: 20 },
  photoLabel: { fontSize: 13, fontWeight: "600", color: DS_COLORS.textSecondary, marginBottom: 10 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  photoThumb: { width: 80, height: 60, borderRadius: 8, backgroundColor: DS_COLORS.photoThumbBg },
  photoActions: { flexDirection: "row", gap: 10 },
  photoBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: DS_COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: DS_COLORS.border },
  photoBtnText: { fontSize: 13, fontWeight: "600", color: DS_COLORS.textPrimary },
  photoEmpty: { gap: 10 },
  photoPrimaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: DS_COLORS.taskIndigo, borderRadius: 12, paddingVertical: 12 },
  photoPrimaryBtnText: { fontSize: 14, fontWeight: "600", color: DS_COLORS.white },
  photoSecondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: DS_COLORS.border, backgroundColor: DS_COLORS.white },
  photoSecondaryBtnText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.textSecondary },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DS_COLORS.black,
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: DS_COLORS.white,
  },
  strictBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  strictBannerText: {
    fontSize: 14,
    color: DS_COLORS.dangerMid,
    textAlign: 'center',
  },
});
