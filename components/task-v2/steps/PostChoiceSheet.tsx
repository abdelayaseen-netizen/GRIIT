/**
 * Build 90 04.1: the one post choice after a task. Same frame as ds/Sheet
 * (60% scrim, surface panel, card radius × 1.2, 34pt bottom inset) drawn inline
 * so it can open the moment a ConfirmDialog or the optional-photo sheet closes.
 * Two iOS Modals cannot present in the same frame.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import { SAFE } from "@/lib/safe-area";
import Button from "@/components/ds/Button";
import Chip from "@/components/ds/Chip";
import { audienceLabel, type PostAudience } from "@/lib/post-audience";
import {
  POST_CHOICE_AUDIENCES,
  POST_CHOICE_KEEP,
  POST_CHOICE_LABEL,
  postChoiceLine,
  postChoicePrimary,
} from "@/lib/post-choice";

const SHEET_RADIUS = DS_V3.radius.card * 1.2;

type Props = {
  visible: boolean;
  taskName: string;
  audience: PostAudience;
  onAudience: (audience: PostAudience) => void;
  onPost: () => void;
  onKeep: () => void;
  loading?: boolean;
};

export function PostChoiceSheet({ visible, taskName, audience, onAudience, onPost, onKeep, loading = false }: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} testID="post-choice-sheet">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={POST_CHOICE_KEEP}
        onPress={loading ? undefined : onKeep}
        style={styles.scrim}
      />
      <View style={styles.lift} pointerEvents="box-none">
        <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, SAFE.bottom) }]}>
          <Text style={styles.heading}>{taskName}</Text>
          <Text style={styles.label}>{POST_CHOICE_LABEL}</Text>
          <View style={styles.chips}>
            {POST_CHOICE_AUDIENCES.map((choice) => (
              <Chip
                key={choice}
                label={audienceLabel(choice)}
                selected={choice === audience}
                disabled={loading}
                onPress={() => onAudience(choice)}
              />
            ))}
          </View>
          <Text style={styles.line}>{postChoiceLine(audience)}</Text>
          <View style={styles.footer}>
            <Button
              label={postChoicePrimary(audience)}
              submitting={loading}
              disabled={loading}
              onPress={onPost}
              testID="post-choice-post"
            />
            <Button
              label={POST_CHOICE_KEEP}
              variant="secondary"
              disabled={loading}
              onPress={onKeep}
              testID="post-choice-keep"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.canvas,
    opacity: 0.6,
  },
  lift: {
    flex: 1,
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: DS_V3.color.surface,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    marginBottom: DS_V3.space.xs,
  },
  label: {
    ...DS_V3.type.label,
    color: DS_V3.color.textSecondary,
  },
  chips: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
  },
  line: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
