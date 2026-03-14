import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, Check, ImagePlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS } from "@/lib/design-system";
import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";

const PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  quality: 0.8,
  base64: true as const,
};

export default function PhotoTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { activeChallenge, completeTask, computeProgress } = useApp();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is required to take photos");
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
      Alert.alert("Permission Required", "Gallery access is required to upload a photo");
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
      Alert.alert("Error", "Please take or upload a photo first");
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

    setLoading(true);
    setUploading(true);
    try {
      let proofUrl: string;
      if (photoBase64) {
        const contentType = photoUri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
        const result = await uploadProofImageFromBase64(photoBase64, contentType);
        if ("error" in result) {
          Alert.alert("Upload failed", result.error);
          return;
        }
        proofUrl = result.url;
      } else {
        const { uploadProofImageFromUri } = await import("@/lib/uploadProofImage");
        const result = await uploadProofImageFromUri(photoUri);
        if ("error" in result) {
          Alert.alert("Upload failed", result.error);
          return;
        }
        proofUrl = result.url;
      }
      setUploading(false);

      const result = await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        proofUrl,
      });
      if (result?.firstTaskOfDay && computeProgress.totalRequired > 1) {
        Alert.alert("Great start!", `${computeProgress.totalRequired - 1} more to secure today.`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Success!", "Photo proof submitted", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
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
            >
              <Camera size={24} color={DS_COLORS.white} />
              <Text style={styles.captureButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
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
