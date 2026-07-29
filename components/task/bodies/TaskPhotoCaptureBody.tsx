/**
 * Photo · Capture body — dark viewfinder for task-states-v2.
 * CameraOnlyBanner + corner brackets + white shutter + InWindowStatusPill.
 * No library picker. Caption is Step 10.
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
import {
  CameraOnlyBanner,
  InWindowStatusPill,
} from "@/components/task/CameraOnlyBanner";
import type { TaskCompleteConfig } from "@/lib/task-helpers";

export type TaskPhotoCaptureBodyProps = {
  config: TaskCompleteConfig;
  photoUri: string | null;
  photoUploading: boolean;
  onTakePhoto: () => void;
  onClearPhoto: () => void;
};

function CornerBrackets() {
  const arm = 22;
  const thickness = 2;
  const color = DS_COLORS_V2.text.onDark;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* top-left */}
      <View style={[styles.bracketH, { top: 16, left: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { top: 16, left: 16, height: arm, backgroundColor: color, width: thickness }]} />
      {/* top-right */}
      <View style={[styles.bracketH, { top: 16, right: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { top: 16, right: 16, height: arm, backgroundColor: color, width: thickness }]} />
      {/* bottom-left */}
      <View style={[styles.bracketH, { bottom: 16, left: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { bottom: 16, left: 16, height: arm, backgroundColor: color, width: thickness }]} />
      {/* bottom-right */}
      <View style={[styles.bracketH, { bottom: 16, right: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { bottom: 16, right: 16, height: arm, backgroundColor: color, width: thickness }]} />
    </View>
  );
}

export function TaskPhotoCaptureBody({
  config,
  photoUri,
  photoUploading,
  onTakePhoto,
  onClearPhoto,
}: TaskPhotoCaptureBodyProps) {
  const hasPhoto = !!photoUri;

  return (
    <View style={styles.root}>
      <CameraOnlyBanner variant="camera" />

      <View style={styles.viewfinder}>
        {hasPhoto ? (
          <Image
            source={{ uri: photoUri ?? undefined }}
            style={styles.photo}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <View style={styles.viewfinderEmpty} />
        )}

        <CornerBrackets />

        {photoUploading ? (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={DS_COLORS_V2.text.onDark} />
            <Text style={styles.uploadingText}>Uploading…</Text>
          </View>
        ) : null}

        <View style={styles.bottomBar}>
          <InWindowStatusPill
            scheduleWindowStart={config.schedule_window_start}
            scheduleWindowEnd={config.schedule_window_end}
            scheduleTimezone={config.schedule_timezone}
          />

          {hasPhoto ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              onPress={onClearPhoto}
              style={({ pressed }) => [
                styles.retakeBtn,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          ) : (
            <View style={styles.shutterSpacer} />
          )}
        </View>

        {!hasPhoto ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shutter"
            onPress={onTakePhoto}
            disabled={photoUploading}
            style={({ pressed }) => [
              styles.shutterOuter,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: DS_SPACING_V2.md,
    flex: 1,
  },
  viewfinder: {
    width: "100%",
    aspectRatio: 3 / 4,
    maxHeight: 480,
    backgroundColor: DS_COLORS_V2.surface.canvasDark,
    borderRadius: DS_RADIUS_V2.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: { ...StyleSheet.absoluteFillObject },
  viewfinderEmpty: { ...StyleSheet.absoluteFillObject },
  bracketH: { position: "absolute" },
  bracketV: { position: "absolute" },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DS_COLORS_V2.overlay.photoGradientStrong,
  },
  uploadingText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  bottomBar: {
    position: "absolute",
    left: DS_SPACING_V2.md,
    right: DS_SPACING_V2.md,
    bottom: DS_SPACING_V2.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shutterSpacer: { width: 72 },
  shutterOuter: {
    position: "absolute",
    bottom: 56,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: DS_COLORS_V2.text.onDark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: DS_COLORS_V2.text.onDark,
  },
  retakeBtn: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: 8,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  pressed: { opacity: 0.85 },
});
