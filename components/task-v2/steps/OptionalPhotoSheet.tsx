/**
 * Photo optional — a sheet over the task, not a full page.
 * Add a photo → camera. Done without photo → self-reported.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Sheet from "@/components/ds/Sheet";
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
    <Sheet visible heading={taskName} onDismiss={onDoneWithoutPhoto}>
      <View style={styles.body}>
        <Text style={styles.bodyCopy}>{OPTIONAL_PHOTO_BODY}</Text>
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
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: DS_V3.space.sm },
  bodyCopy: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
