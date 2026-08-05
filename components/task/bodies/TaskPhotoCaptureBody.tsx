/**
 * Photo · Capture body — live CameraView viewfinder for task-states-v2.
 * CameraOnlyBanner + corner brackets + white shutter + InWindowStatusPill.
 * No library picker. Caption is a separate body.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X } from "lucide-react-native";
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
import type { PhotoCaptureAsset } from "@/lib/photo-capture-meta";
import { captureError } from "@/lib/sentry";

export type TaskPhotoCaptureBodyProps = {
  config: TaskCompleteConfig;
  photoUri: string | null;
  photoUploading: boolean;
  /** Ingest via usePhotoCapture.acceptInAppCameraCapture — same contract as picker. */
  onCaptureAsset: (asset: PhotoCaptureAsset) => void;
  onClearPhoto: () => void;
  /** Dismiss with no frame — exit capture. */
  onDismiss: () => void;
};

function CornerBrackets() {
  const arm = 22;
  const thickness = 2;
  const color = DS_COLORS_V2.text.onDark;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.bracketH, { top: 16, left: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { top: 16, left: 16, height: arm, backgroundColor: color, width: thickness }]} />
      <View style={[styles.bracketH, { top: 16, right: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { top: 16, right: 16, height: arm, backgroundColor: color, width: thickness }]} />
      <View style={[styles.bracketH, { bottom: 16, left: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { bottom: 16, left: 16, height: arm, backgroundColor: color, width: thickness }]} />
      <View style={[styles.bracketH, { bottom: 16, right: 16, width: arm, backgroundColor: color, height: thickness }]} />
      <View style={[styles.bracketV, { bottom: 16, right: 16, height: arm, backgroundColor: color, width: thickness }]} />
    </View>
  );
}

export function TaskPhotoCaptureBody({
  config,
  photoUri,
  photoUploading,
  onCaptureAsset,
  onClearPhoto,
  onDismiss,
}: TaskPhotoCaptureBodyProps) {
  const hasPhoto = !!photoUri;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [shutterBusy, setShutterBusy] = useState(false);
  /** Last CameraView frame size — reported for Phase 4 dependency; no crop changes here. */
  const [lastCaptureSize, setLastCaptureSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleShutter = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || shutterBusy || photoUploading) return;
    setShutterBusy(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      if (!picture?.uri || !picture.base64) {
        return;
      }
      setLastCaptureSize({ width: picture.width, height: picture.height });
      if (__DEV__) {
        // Device verification data for caption 4:5 work — do not change crop here.
        console.log("[TaskPhotoCaptureBody] CameraView capture size", {
          width: picture.width,
          height: picture.height,
          aspect: picture.height > 0 ? picture.width / picture.height : null,
        });
      }
      onCaptureAsset({ uri: picture.uri, base64: picture.base64 });
    } catch (err) {
      captureError(err, "TaskPhotoCaptureBodyShutter");
    } finally {
      setShutterBusy(false);
    }
  }, [cameraReady, shutterBusy, photoUploading, onCaptureAsset]);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const permissionDenied =
    permission != null && !permission.granted && !permission.canAskAgain;
  const permissionUndetermined =
    permission == null ||
    (!permission.granted && permission.canAskAgain);

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          onPress={onDismiss}
          style={({ pressed }) => [styles.dismissBtn, pressed ? styles.pressed : null]}
        >
          <X size={20} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
        </Pressable>
        <CameraOnlyBanner variant="camera" />
        <View style={styles.dismissBtnSpacer} />
      </View>

      <View style={styles.viewfinder}>
        {hasPhoto ? (
          <Image
            source={{ uri: photoUri ?? undefined }}
            style={styles.photo}
            contentFit="cover"
            transition={120}
          />
        ) : permissionDenied ? (
          <View style={styles.permissionPane}>
            <Text style={styles.permissionTitle}>Camera access needed</Text>
            <Text style={styles.permissionBody}>
              Photo proof requires the camera. Enable access in Settings to continue.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Settings"
              onPress={openSettings}
              style={({ pressed }) => [
                styles.settingsBtn,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.settingsBtnText}>Open Settings</Text>
            </Pressable>
          </View>
        ) : permissionUndetermined && !permission?.granted ? (
          <View style={styles.permissionPane}>
            <Text style={styles.permissionTitle}>Allow camera access</Text>
            <Text style={styles.permissionBody}>
              We need the camera to take proof photos in-app.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Allow camera"
              onPress={() => void requestPermission()}
              style={({ pressed }) => [
                styles.settingsBtn,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.settingsBtnText}>Allow camera</Text>
            </Pressable>
          </View>
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.photo}
            facing="back"
            mode="picture"
            onCameraReady={() => setCameraReady(true)}
            onMountError={(e) => {
              captureError(
                new Error(e.message ?? "Camera mount failed"),
                "TaskPhotoCaptureBodyMount"
              );
            }}
          />
        )}

        <CornerBrackets />

        {photoUploading || shutterBusy ? (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={DS_COLORS_V2.text.onDark} />
            <Text style={styles.uploadingText}>
              {shutterBusy ? "Capturing…" : "Uploading…"}
            </Text>
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

        {!hasPhoto && permission?.granted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shutter"
            onPress={() => void handleShutter()}
            disabled={photoUploading || shutterBusy || !cameraReady}
            style={({ pressed }) => [
              styles.shutterOuter,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        ) : null}
      </View>

      {__DEV__ && lastCaptureSize ? (
        <Text style={styles.devSize}>
          Capture {lastCaptureSize.width}×{lastCaptureSize.height}
          {lastCaptureSize.height > 0
            ? ` · ${(lastCaptureSize.width / lastCaptureSize.height).toFixed(3)}`
            : ""}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: DS_SPACING_V2.md,
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dismissBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  dismissBtnSpacer: { width: 40, height: 40 },
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
  permissionPane: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_SPACING_V2.lg,
    gap: DS_SPACING_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.canvasDark,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    textAlign: "center",
  },
  permissionBody: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.onDark,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 20,
  },
  settingsBtn: {
    marginTop: DS_SPACING_V2.sm,
    paddingHorizontal: DS_SPACING_V2.md,
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  settingsBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  devSize: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS_V2.text.onDark,
    opacity: 0.7,
    textAlign: "center",
  },
  pressed: { opacity: 0.85 },
});
