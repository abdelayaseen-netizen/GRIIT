/**
 * Photo · Caption body — task-states-v2.
 * "Add a caption", preview, Optional field, live "{n} / 120" hard cap.
 */
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import {
  PHOTO_CAPTION_MAX,
  clampPhotoCaption,
  formatPhotoCaptionCounter,
} from "@/lib/photo-caption";

export type TaskPhotoCaptionBodyProps = {
  photoUri: string | null;
  caption: string;
  onChangeCaption: (next: string) => void;
  onRetake: () => void;
};

export function TaskPhotoCaptionBody({
  photoUri,
  caption,
  onChangeCaption,
  onRetake,
}: TaskPhotoCaptionBodyProps) {
  const counter = formatPhotoCaptionCounter(caption.length);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Add a caption</Text>

      {photoUri ? (
        <View style={styles.previewWrap}>
          <Image
            source={{ uri: photoUri }}
            style={styles.preview}
            contentFit="cover"
            transition={120}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retake photo"
            onPress={onRetake}
            style={({ pressed }) => [
              styles.retakeChip,
              pressed ? { opacity: 0.85 } : null,
            ]}
          >
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>Optional</Text>
        <TextInput
          accessibilityLabel="Photo caption"
          value={caption}
          onChangeText={(t) => onChangeCaption(clampPhotoCaption(t))}
          placeholder="Add a quick note…"
          placeholderTextColor={DS_COLORS_V2.text.tertiary}
          multiline
          maxLength={PHOTO_CAPTION_MAX}
          style={styles.input}
        />
        <Text
          style={styles.counter}
          accessibilityLabel={`${caption.length} of ${PHOTO_CAPTION_MAX} characters`}
        >
          {counter}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
  previewWrap: {
    width: "100%",
    aspectRatio: 4 / 3,
    maxHeight: 280,
    borderRadius: DS_RADIUS_V2.lg,
    overflow: "hidden",
    backgroundColor: DS_COLORS_V2.surface.heroDark,
  },
  preview: { ...StyleSheet.absoluteFillObject },
  retakeChip: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: DS_SPACING_V2.sm,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  fieldCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_COLORS_V2.surface.divider,
    padding: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  input: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.primary,
    minHeight: 72,
    textAlignVertical: "top",
    paddingTop: 0,
    paddingBottom: 0,
  },
  counter: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.tertiary,
    textAlign: "right",
  },
});
