/**
 * Run · Capture body — optional photo proof (task-states-v2).
 * Camera shutter only (no library). Skip is owned by the shell CTA.
 */
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { CameraOnlyBanner } from "@/components/task/CameraOnlyBanner";
import type { TaskCompleteConfig } from "@/lib/task-helpers";

export type TaskRunCaptureBodyProps = {
  config: TaskCompleteConfig;
  photoUri: string | null;
  photoUploading: boolean;
  onTakePhoto: () => void;
  onClearPhoto: () => void;
};

export function TaskRunCaptureBody({
  config,
  photoUri,
  photoUploading,
  onTakePhoto,
  onClearPhoto,
}: TaskRunCaptureBodyProps) {
  const hasPhoto = !!photoUri;
  const cameraOnly = config.require_camera_only === true;

  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Add a photo</Text>
      <Text style={styles.sub}>Optional — skip if you logged without one.</Text>

      {cameraOnly ? <CameraOnlyBanner variant="camera" /> : null}

      <View style={styles.viewfinder}>
        {hasPhoto ? (
          <Image
            source={{ uri: photoUri ?? undefined }}
            style={styles.photo}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <View style={styles.viewfinderEmpty}>
            <Text style={styles.emptyHint}>Tap the shutter to shoot</Text>
          </View>
        )}

        {photoUploading ? (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={DS_COLORS_V2.text.onDark} />
            <Text style={styles.uploadingText}>Uploading…</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {hasPhoto ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retake photo"
            onPress={onClearPhoto}
            style={({ pressed }) => [
              styles.retakeBtn,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shutter"
            onPress={onTakePhoto}
            disabled={photoUploading}
            style={({ pressed }) => [
              styles.shutter,
              pressed ? { opacity: 0.9 } : null,
              photoUploading ? { opacity: 0.5 } : null,
            ]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
  },
  heading: {
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  sub: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 20,
  },
  viewfinder: {
    flex: 1,
    minHeight: 280,
    borderRadius: DS_RADIUS_V2.md,
    overflow: "hidden",
    backgroundColor: DS_COLORS_V2.surface.heroDark,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  viewfinderEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHint: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.tertiary,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.onDark,
  },
  actions: {
    alignItems: "center",
    paddingVertical: DS_SPACING_V2.md,
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS_COLORS_V2.text.onDark,
    borderWidth: 4,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  retakeBtn: {
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingVertical: 12,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  retakeText: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
});
