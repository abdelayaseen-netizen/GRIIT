// LEGACY: consider migrating to task/complete.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, Check, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS } from "@/lib/design-system";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
import { useInlineError } from "@/hooks/useInlineError";
import { trackEvent } from "@/lib/analytics";
import { InlineError } from "@/components/InlineError";
import ProofShareCard from "@/components/ProofShareCard";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  quality: 0.8,
  base64: true as const,
};

export default function PhotoTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { activeChallenge, completeTask, profile, stats, challenge } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const { error, showError, clearError } = useInlineError();

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showError("Camera permission is required to take photos");
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showError("Gallery access is required to upload a photo");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      ...PICKER_OPTIONS,
      mediaTypes: ["images"],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      showError("Please take or upload a photo first");
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

    setLoading(true);
    setUploading(true);
    try {
      let proofUrl: string;
      if (photoBase64) {
        const contentType = photoUri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
        const result = await uploadProofImageFromBase64(photoBase64, contentType);
        if ("error" in result) {
          showError(result.error);
          return;
        }
        proofUrl = result.url;
      } else {
        const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
        const result = await uploadProofImageFromUri(photoUri);
        if ("error" in result) {
          showError(result.error);
          return;
        }
        proofUrl = result.url;
      }
      setUploading(false);

      const challengeId = (activeChallenge as { challenge_id?: string }).challenge_id;
      if (challengeId) {
        trackEvent("proof_uploaded", { challenge_id: challengeId });
      }

      await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        proofUrl,
      });
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowShareCard(true);
    } catch (error: unknown) {
      captureError(error, { screen: "task/photo", taskId });
      showError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const challengeTitle =
    (challenge as { title?: string } | null)?.title ?? "Challenge";
  const durationDays =
    (challenge as { duration_days?: number } | null)?.duration_days ?? 75;
  const currentDay = (activeChallenge as { current_day?: number } | null)?.current_day ?? 1;
  const username =
    (profile as { username?: string } | null)?.username?.trim() || "user";
  const streakCount =
    (stats as { activeStreak?: number } | null)?.activeStreak ?? 0;

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {showShareCard ? (
        <ProofShareCard
          userName={username}
          challengeTitle={challengeTitle}
          dayNumber={currentDay}
          totalDays={durationDays}
          streakCount={streakCount}
          proofPhotoUri={photoUri ?? undefined}
          onDismiss={() => {
            setShowShareCard(false);
            router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
          }}
        />
      ) : null}
      <View style={styles.content}>
        <InlineError message={error} onDismiss={clearError} />
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: photoUri }}
              style={styles.preview}
              cachePolicy="memory-disk"
              accessibilityLabel="Photo preview"
            />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Camera size={64} color={DS_COLORS.textMuted} />
            <Text style={styles.placeholderText}>No photo taken yet</Text>
          </View>
        )}

        {!photoUri && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Take proof photo"
            >
              <Camera size={24} color={DS_COLORS.white} />
              <Text style={styles.captureButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Upload from gallery"
            >
              <ImagePlus size={24} color={DS_COLORS.textPrimary} />
              <Text style={styles.galleryButtonText}>Upload from gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {photoUri && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Submit photo"
            accessibilityState={{ disabled: loading }}
          >
            {loading ? (
              <>
                <ActivityIndicator color={DS_COLORS.white} size="small" />
                <Text style={styles.submitButtonText}>
                  {uploading ? "Uploading…" : "Submitting…"}
                </Text>
              </>
            ) : (
              <>
                <Check size={20} color={DS_COLORS.white} />
                <Text style={styles.submitButtonText}>Submit Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 15,
    color: DS_COLORS.textMuted,
    marginTop: 12,
  },
  previewContainer: {
    flex: 1,
    marginBottom: 16,
  },
  preview: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: DS_COLORS.black,
  },
  retakeButton: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  retakeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: DS_COLORS.textPrimary,
  },
  buttonRow: {
    gap: 12,
  },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DS_COLORS.taskEmerald,
    borderRadius: 12,
    padding: 16,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
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
});
