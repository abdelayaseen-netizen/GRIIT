import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, AppState, AppStateStatus, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Play, Pause, Check, Camera, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import type { ChallengeTaskFromApi } from "@/types";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";

/** Active challenge as returned by getActive (nested challenges.challenge_tasks in API shape). */
interface ActiveChallengeWithTasks {
  challenges?: { challenge_tasks?: ChallengeTaskFromApi[] } | null;
}

const PICKER_OPTIONS = { allowsEditing: true, aspect: [4, 3] as [number, number], quality: 0.8, base64: true as const };

export default function TimerTaskScreen() {
  const router = useRouter();
  const { taskId, requirePhotoProof: requirePhotoProofParam } = useLocalSearchParams<{ taskId: string; requirePhotoProof?: string }>();
  const { activeChallenge, completeTask, computeProgress } = useApp();
  const requirePhotoProof = requirePhotoProofParam === "true";
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [, setIntervalId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [strictResetMessage, setStrictResetMessage] = useState<string | null>(null);
  const resetInProgressRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      Alert.alert("Permission Required", "Camera permission is required for photo proof");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handlePickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery access is required for photo proof");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ ...PICKER_OPTIONS, mediaTypes: ["images"] });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setPhotoUri(a.uri);
      setPhotoBase64(a.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleSubmit = async () => {
    if (seconds < 60) {
      Alert.alert("Timer Too Short", "Please run the timer for at least 1 minute");
      return;
    }
    if (requirePhotoProof && !photoUri) {
      Alert.alert("Photo required", "This task requires photo proof. Take or upload a photo before completing.");
      return;
    }

    if (!activeChallenge) {
      Alert.alert("Error", "No active challenge found");
      return;
    }
    if (!taskId) {
      Alert.alert("Error", "Task not found");
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
            Alert.alert("Upload failed", result.error);
            return;
          }
          proofUrl = result.url;
        } else if (photoUri) {
          const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
          const res = await uploadProofImageFromUri(photoUri);
          if ("error" in res) {
            Alert.alert("Upload failed", res.error);
            return;
          }
          proofUrl = res.url;
        }
        setUploading(false);
      }

      const result = await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        value: Math.floor(seconds / 60),
        proofUrl,
      });

      if (result?.firstTaskOfDay && computeProgress.totalRequired > 1) {
        Alert.alert("Great start!", `${computeProgress.totalRequired - 1} more to secure today.`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Success!", `Timer completed: ${Math.floor(seconds / 60)} minutes`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <Text style={styles.timerLabel}>{isRunning ? 'Running...' : 'Paused'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, isRunning && styles.pauseButton]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <>
              <Pause size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Pause</Text>
            </>
          ) : (
            <>
              <Play size={24} color="#fff" />
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
                  <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
                    <Camera size={18} color={Colors.text.primary} />
                    <Text style={styles.photoBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
                    <ImagePlus size={18} color={Colors.text.primary} />
                    <Text style={styles.photoBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoEmpty}>
                <TouchableOpacity style={styles.photoPrimaryBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
                  <Camera size={20} color="#fff" />
                  <Text style={styles.photoPrimaryBtnText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoSecondaryBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
                  <ImagePlus size={18} color={Colors.text.secondary} />
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
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitButtonText}>{uploading ? "Uploading…" : "Submitting…"}</Text>
              </>
            ) : (
              <>
                <Check size={20} color="#fff" />
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
    backgroundColor: Colors.background,
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
    color: Colors.text.primary,
    fontVariant: ['tabular-nums' as any],
  },
  timerLabel: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  photoSection: { marginBottom: 20 },
  photoLabel: { fontSize: 13, fontWeight: "600", color: Colors.text.secondary, marginBottom: 10 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  photoThumb: { width: 80, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  photoActions: { flexDirection: "row", gap: 10 },
  photoBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  photoBtnText: { fontSize: 13, fontWeight: "600", color: Colors.text.primary },
  photoEmpty: { gap: 10 },
  photoPrimaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#6366F1", borderRadius: 12, paddingVertical: 12 },
  photoPrimaryBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  photoSecondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#fff" },
  photoSecondaryBtnText: { fontSize: 13, fontWeight: "500", color: Colors.text.secondary },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strictBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  strictBannerText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});
