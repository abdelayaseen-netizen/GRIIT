/**
 * Check-in for Photo: Optional (frame 153 / 162).
 * Add a photo → camera seal. Done without photo → self-reported.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import {
  OPTIONAL_PHOTO_ADD,
  OPTIONAL_PHOTO_BODY,
  OPTIONAL_PHOTO_DONE,
} from "@/lib/add-task-draft";
import { SIMPLE_ASK_SAVING } from "@/lib/simple-log";

type Props = {
  taskName: string;
  loading?: boolean;
  onAddPhoto: () => void;
  onDoneWithoutPhoto: () => void;
};

export function OptionalPhotoSheet({
  taskName,
  loading,
  onAddPhoto,
  onDoneWithoutPhoto,
}: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{taskName}</Text>
      <Text style={styles.bodyCopy}>{OPTIONAL_PHOTO_BODY}</Text>
      <View style={styles.footer}>
        <Button
          label={loading ? SIMPLE_ASK_SAVING : OPTIONAL_PHOTO_ADD}
          loading={loading}
          onPress={onAddPhoto}
        />
        <Button
          label={OPTIONAL_PHOTO_DONE}
          variant="secondary"
          disabled={loading}
          onPress={onDoneWithoutPhoto}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  title: {
    marginTop: DS_V3.space.section,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  bodyCopy: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    marginTop: "auto" as const,
    gap: DS_V3.space.sm,
  },
});
