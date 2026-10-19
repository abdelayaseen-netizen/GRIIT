/**
 * Build 92 02.1 · the post sheet (P1-01 … P1-04). Opens only after Done on a task (after the
 * camera for photo tasks). The only place the audience is asked; Friends is the default and the
 * button names the choice. Closing (X, scrim, swipe) saves privately. Drawn inline on the
 * GlassSheet so it can open the moment another iOS Modal closes.
 */
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Globe, Lock, Users } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, GLASS_STATE } from "@/lib/glass";
import Button from "@/components/ds/Button";
import { GlassSheet } from "@/components/ds/glass/GlassSheet";
import type { PostAudience } from "@/lib/post-audience";
import {
  AUDIENCE_COPY,
  FINISH_COPY,
  POST_SHEET_AUDIENCES,
  audienceLine,
  captionCounterFrom,
  postButton,
  postSheetSubtitle,
} from "@/lib/finish-flow";

type Props = {
  visible: boolean;
  taskName: string;
  challengeName: string;
  currentDay: number;
  durationDays: number;
  /** The proof photo, when the camera came first. */
  photoUri?: string | null;
  caption?: string;
  onCaption?: (text: string) => void;
  audience: PostAudience;
  onAudience: (audience: PostAudience) => void;
  /** Post / Save with the selected audience. */
  onPost: () => void;
  /** Close without choosing: saves privately. */
  onClose: () => void;
  loading?: boolean;
  /** Offline or failed: the offline line shows and the button reads "Try again". */
  error?: string | null;
  friendCount?: number | null;
};

const ICONS = { friends: Users, everyone: Globe, only_me: Lock } as const;

export function PostChoiceSheet({
  visible,
  taskName,
  challengeName,
  currentDay,
  durationDays,
  photoUri,
  caption = "",
  onCaption,
  audience,
  onAudience,
  onPost,
  onClose,
  loading = false,
  error = null,
  friendCount,
}: Props) {
  const close = () => {
    if (!loading) onClose();
  };
  return (
    <GlassSheet
      inline
      visible={visible}
      onClose={close}
      label={FINISH_COPY.postTitle}
      title={FINISH_COPY.postTitle}
      testID="post-choice-sheet"
      closeTestID="post-choice-close"
      avoidKeyboard
    >
      <Text style={styles.sub} numberOfLines={2}>
        {postSheetSubtitle(taskName, challengeName, currentDay, durationDays)}
      </Text>
      {photoUri ? (
        <View style={styles.photoRow}>
          <Image
            source={{ uri: photoUri }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel="Your proof photo"
          />
          <TextInput
            value={caption}
            onChangeText={(t) => onCaption?.(t.slice(0, FINISH_COPY.captionMax))}
            placeholder={FINISH_COPY.captionPlaceholder}
            placeholderTextColor={DS_V3.color.textSecondary}
            selectionColor={DS_V3.color.textPrimary}
            multiline
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            maxLength={FINISH_COPY.captionMax}
            accessibilityLabel="Caption"
            editable={!loading}
            style={styles.caption}
            testID="post-choice-caption"
          />
        </View>
      ) : null}
      {photoUri && caption.length >= captionCounterFrom(FINISH_COPY.captionMax) ? (
        <Text style={styles.count} testID="post-choice-caption-count">
          {`${caption.length} / ${FINISH_COPY.captionMax}`}
        </Text>
      ) : null}
      <Text style={styles.label}>{FINISH_COPY.whoSees}</Text>
      <View style={styles.segments} accessibilityRole="radiogroup" accessibilityLabel={FINISH_COPY.whoSees}>
        {POST_SHEET_AUDIENCES.map((choice) => {
          const on = choice === audience;
          const Icon = ICONS[choice];
          return (
            <Pressable
              key={choice}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, checked: on, disabled: loading }}
              accessibilityLabel={AUDIENCE_COPY[choice].label}
              disabled={loading}
              onPress={() => onAudience(choice)}
              style={({ pressed }) => [
                styles.segment,
                on && styles.segmentOn,
                pressed && { backgroundColor: GLASS_STATE.pressed },
              ]}
              testID={`post-choice-${choice}`}
            >
              <Icon size={16} color={on ? DS_V3.color.textPrimary : DS_V3.color.textSecondary} />
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{AUDIENCE_COPY[choice].label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.line}>{audienceLine(audience, friendCount)}</Text>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert" testID="post-choice-error">
          {error}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Button
          label={postButton({ audience, busy: loading, error: Boolean(error) })}
          submitting={loading}
          disabled={loading}
          onPress={onPost}
          testID="post-choice-post"
        />
      </View>
    </GlassSheet>
  );
}

const styles = StyleSheet.create({
  sub: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    marginBottom: DS_V3.space.sm,
  },
  photoRow: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
    marginBottom: DS_V3.space.sm,
  },
  thumb: {
    width: 84,
    height: 105,
    borderRadius: 12,
    backgroundColor: DS_V3.color.surface,
  },
  caption: {
    flex: 1,
    minHeight: 105,
    paddingHorizontal: DS_V3.space.sm,
    paddingVertical: DS_V3.space.xs + 2,
    borderRadius: GLASS_RADIUS.rowIcon,
    backgroundColor: GLASS_STATE.secondaryFill,
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    textAlignVertical: "top",
  },
  count: {
    alignSelf: "flex-end",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    marginTop: -DS_V3.space.xs,
    marginBottom: DS_V3.space.xs,
  },
  label: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
    marginBottom: DS_V3.space.xs,
  },
  segments: {
    flexDirection: "row",
    gap: DS_V3.space.xs,
  },
  segment: {
    flex: 1,
    minHeight: DS_V3.size.tap,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: GLASS_RADIUS.bar,
    backgroundColor: GLASS_STATE.secondaryFill,
  },
  segmentOn: {
    backgroundColor: GLASS_STATE.selected,
    borderWidth: 1,
    borderColor: DS_V3.color.textSecondary,
  },
  segmentText: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  segmentTextOn: {
    color: DS_V3.color.textPrimary,
    fontWeight: "500",
  },
  line: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.xs,
  },
  error: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textPrimary,
    marginTop: DS_V3.space.xs,
  },
  footer: {
    paddingTop: DS_V3.space.md,
  },
});
