import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { cropRectTo45 } from "@/lib/crop-to-45";
import { createCameraCaptureMeta } from "@/lib/photo-capture-meta";

function stampNow(): string {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function TaskCapture({
  gateLine,
  onCaptured,
}: {
  gateLine: string;
  onCaptured: (uri: string, capturedAt: string) => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [stamp] = useState(stampNow);

  if (!permission) {
    return <View style={styles.finder} />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.finder}>
        <Pressable
          onPress={() => void requestPermission()}
          accessibilityRole="button"
          accessibilityLabel="Allow camera"
          style={styles.perm}
        >
          <Text style={styles.permText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

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

  return (
    <View style={styles.wrap}>
      <View style={styles.finder}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.stamp}>
          <Text style={styles.stampText}>{stamp}</Text>
        </View>
      </View>
      <View style={styles.deck}>
        <Text style={styles.gate}>{gateLine}</Text>
        <Pressable
          onPress={() => void shutter()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Shutter"
          style={({ pressed }) => [styles.shutter, pressed && { transform: [{ scale: 0.92 }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: DS_COLORS_V2.surface.camera },
  finder: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: DS_COLORS_V2.surface.camera,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  stamp: {
    position: "absolute",
    left: 16,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  stampText: { color: "#FFFFFF", fontSize: 12, fontWeight: "400" },
  deck: { flex: 1, alignItems: "center", paddingTop: 18 },
  gate: { fontSize: 13, color: "rgba(255,255,255,0.62)", marginBottom: 26 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.35)",
  },
  perm: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: "#FFFFFF" },
  permText: { color: DS_COLORS_V2.text.primary, fontWeight: "500" },
});
