/**
 * Capture — frame 14. Camera behavior unchanged (live, 4:5 crop).
 * Chrome restyle only. Shutter fill is surface (frame 14:983), not textPrimary.
 */
import React, { useRef, useState } from "react";
import { Linking, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { SwitchCamera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { cropRectTo45 } from "@/lib/crop-to-45";
import { createCameraCaptureMeta } from "@/lib/photo-capture-meta";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";

const ICON = DS_V3.space.xs * 6;

export function TaskCapture({
  challenge,
  task,
  timerLabel,
  onCancel,
  onCaptured,
}: {
  challenge: string;
  task: string;
  timerLabel?: string;
  onCancel: () => void;
  onCaptured: (uri: string, capturedAt: string) => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const shutter = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8, shutterSound: true });
      if (!photo?.uri) return;
      const w = photo.width ?? 0;
      const h = photo.height ?? 0;
      const rect = cropRectTo45(w, h);
      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: rect }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      onCaptured(cropped.uri, createCameraCaptureMeta().capturedAt);
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return <View style={styles.root} />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <EmptyState
          heading="Camera access is off"
          body="Turn it on in Settings to post proof."
          actionLabel="Open Settings"
          onAction={() => {
            void requestPermission();
            void Linking.openSettings();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bar}>
        <Button label="Cancel" variant="tertiary" ink onPress={onCancel} />
        <Pressable
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          accessibilityRole="button"
          accessibilityLabel="Flip camera"
          style={styles.flip}
        >
          <SwitchCamera size={ICON} color={DS_V3.color.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.meta}>
        <Text style={styles.challenge}>{challenge}</Text>
        <Text style={styles.task}>{task}</Text>
        {timerLabel ? <Text style={styles.timer}>{timerLabel}</Text> : null}
      </View>
      <View style={styles.finderWrap}>
        <View style={styles.finder}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        </View>
      </View>
      <View style={styles.shutterRow}>
        <Pressable
          onPress={() => void shutter()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Take proof photo"
          style={styles.shutter}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  bar: {
    height: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flip: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.xs,
  },
  challenge: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  task: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  timer: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  finderWrap: {
    padding: DS_V3.space.gutter,
  },
  finder: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    backgroundColor: DS_V3.color.canvas,
  },
  shutterRow: {
    paddingHorizontal: DS_V3.space.gutter,
    alignItems: "center",
  },
  shutter: {
    width: DS_V3.size.shutter,
    height: DS_V3.size.shutter,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
  },
});
