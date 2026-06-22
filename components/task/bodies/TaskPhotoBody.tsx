/**
 * Photo proof body — controlled.
 * Tap viewfinder fires `onTakePhoto`. Caption is optional, max 120 chars.
 *
 * Photo URI / URL / upload state is owned by `usePhotoCapture` in the parent
 * hook; we just receive the current photoUri (preview), photoUploading flag,
 * and a callback to launch the camera. The CTA on TaskShell handles submit.
 */
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Camera, Clock, MapPin, Trash2 } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type TaskPhotoValue = { caption: string };

export type TaskPhotoBodyProps = {
  value: TaskPhotoValue;
  onChangeCaption: (next: string) => void;
  photoUri: string | null;
  photoUploading: boolean;
  /** ISO timestamp string for the captured photo. */
  capturedAt?: string;
  /** Optional location pill text — e.g. "Brooklyn, NY". */
  locationLabel?: string;
  onTakePhoto: () => void;
  onClearPhoto: () => void;
  cameraOnly: boolean;
};

const MAX_CAPTION = 120;

function formatTime(iso?: string): string {
  if (!iso) return "Just now";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

export function TaskPhotoBody({
  value,
  onChangeCaption,
  photoUri,
  photoUploading,
  capturedAt,
  locationLabel,
  onTakePhoto,
  onClearPhoto,
  cameraOnly,
}: TaskPhotoBodyProps) {
  const hasPhoto = !!photoUri;
  const captionLeft = MAX_CAPTION - (value.caption?.length ?? 0);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasPhoto ? "Retake photo" : "Open camera"}
        onPress={onTakePhoto}
        style={({ pressed }) => [
          styles.viewfinder,
          pressed ? styles.pressed : null,
        ]}
      >
        {hasPhoto ? (
          <>
            <Image
              source={{ uri: photoUri ?? undefined }}
              style={styles.photo}
              contentFit="cover"
              transition={120}
            />
            <View style={styles.overlayChips}>
              <View style={styles.chip}>
                <Clock size={11} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
                <Text style={styles.chipText} numberOfLines={1}>
                  {formatTime(capturedAt)}
                </Text>
              </View>
              {locationLabel ? (
                <View style={styles.chip}>
                  <MapPin
                    size={11}
                    color={DS_COLORS_V2.text.onDark}
                    strokeWidth={2}
                  />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {locationLabel}
                  </Text>
                </View>
              ) : null}
            </View>
            {photoUploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={DS_COLORS_V2.text.onDark} />
                <Text style={styles.uploadingText}>Uploading…</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.viewfinderEmpty}>
            <View style={styles.cameraRing}>
              <Camera
                size={28}
                color={DS_COLORS_V2.text.onDark}
                strokeWidth={2}
              />
            </View>
            <Text style={styles.viewfinderTitle}>Tap to open camera</Text>
            <Text style={styles.viewfinderSub}>
              {cameraOnly
                ? "Camera only · photo will be timestamped"
                : "Photo will be timestamped"}
            </Text>
          </View>
        )}
      </Pressable>

      {hasPhoto ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove photo"
          onPress={onClearPhoto}
          style={({ pressed }) => [
            styles.removeRow,
            pressed ? styles.pressed : null,
          ]}
        >
          <Trash2 size={13} color={DS_COLORS_V2.semantic.danger} strokeWidth={2} />
          <Text style={styles.removeText}>Remove and retake</Text>
        </Pressable>
      ) : null}

      <View style={styles.captionCard}>
        <Text style={styles.captionLabel}>CAPTION (OPTIONAL)</Text>
        <TextInput
          accessibilityLabel="Photo caption"
          value={value.caption}
          onChangeText={(t) => onChangeCaption(t.slice(0, MAX_CAPTION))}
          placeholder={`Add a quick note... (max ${MAX_CAPTION})`}
          placeholderTextColor={DS_COLORS_V2.text.tertiary}
          multiline
          maxLength={MAX_CAPTION}
          style={styles.captionInput}
        />
        <Text style={styles.captionCounter}>{`${captionLeft} left`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_SPACING_V2.md },
  viewfinder: {
    width: "100%",
    aspectRatio: 1 / 1.3,
    maxHeight: 380,
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.9 },
  photo: { ...StyleSheet.absoluteFillObject },
  overlayChips: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto70,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DS_COLORS_V2.overlay.photoGradientStrong,
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  viewfinderEmpty: { gap: 10, alignItems: "center", paddingHorizontal: 24 },
  cameraRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  viewfinderTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  viewfinderSub: {
    fontSize: 11,
    color: DS_COLORS_V2.text.onDarkSecondary,
    textAlign: "center",
  },

  removeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  removeText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
  },

  captionCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 8,
  },
  captionLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  captionInput: {
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    minHeight: 44,
    paddingTop: 0,
    paddingBottom: 0,
  },
  captionCounter: {
    fontSize: 10,
    color: DS_COLORS_V2.text.tertiary,
    textAlign: "right",
  },
});

