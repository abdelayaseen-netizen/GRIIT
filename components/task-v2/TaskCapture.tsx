/**
 * Capture — frame 63. Live 4:5 crop. Shutter is a textPrimary ring and fill.
 */
import React, { useRef, useState } from "react";
import { Linking, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { SwitchCamera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { cropRectTo45 } from "@/lib/crop-to-45";
import { createCameraCaptureMeta } from "@/lib/photo-capture-meta";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";

const ICON = DS_V3.space.xs * 6;
const SHUTTER = 78;
const RING = 4;
const GAP = 5;
const FILL = SHUTTER - RING * 2 - GAP * 2;
export const CAPTURE_LIBRARY_CAPTION = "Taken in the app. The library is not an option.";

export function TaskCapture({
  challenge,
  task,
  windowLabel,
  timerLabel,
  onCancel,
  onCaptured,
}: {
  challenge: string;
  task: string;
  windowLabel?: string;
  timerLabel?: string;
  onCancel: () => void;
  onCaptured: (uri: string, capturedAt: string) => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const pill = [task, windowLabel].filter(Boolean).join(" · ");

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
      <SafeAreaView style={[styles.root, styles.permission]}>
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
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bar}>
        <View style={styles.scrim}>
          <Button label="Cancel" variant="tertiary" ink onPress={onCancel} />
        </View>
        {pill ? (
          <View style={[styles.scrim, styles.mid]}>
            <Text style={styles.pill} numberOfLines={1}>
              {pill}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          accessibilityRole="button"
          accessibilityLabel="Flip camera"
          style={[styles.flip, styles.scrim]}
        >
          <SwitchCamera size={ICON} color={DS_V3.color.textPrimary} />
        </Pressable>
      </View>
      <View style={styles.meta}>
        <Text style={styles.challenge}>{challenge}</Text>
        {timerLabel ? <Text style={styles.timer}>{timerLabel}</Text> : null}
      </View>
      <View style={styles.finderWrap}>
        <View style={styles.finder}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        </View>
      </View>
      <Text style={styles.caption}>{CAPTURE_LIBRARY_CAPTION}</Text>
      <View style={styles.shutterRow}>
        <Pressable
          onPress={() => void shutter()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Take proof photo"
          style={styles.shutter}
        >
          <View style={styles.shutterFill} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  permission: {
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
  bar: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: DS_V3.space.sm,
  },
  scrim: {
    backgroundColor: "rgba(15,15,15,0.55)",
    borderRadius: DS_V3.radius.pill,
    overflow: "hidden",
  },
  mid: {
    flex: 1,
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.md,
    justifyContent: "center",
  },
  pill: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
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
  caption: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  shutterRow: {
    paddingHorizontal: DS_V3.space.gutter,
    alignItems: "center",
  },
  shutter: {
    width: SHUTTER,
    height: SHUTTER,
    borderRadius: DS_V3.radius.pill,
    borderWidth: RING,
    borderColor: DS_V3.color.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterFill: {
    width: FILL,
    height: FILL,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.textPrimary,
  },
});
