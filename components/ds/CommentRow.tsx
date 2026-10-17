/**
 * CommentRow — Chunk M frame 39.
 * Avatar 32, name + time on one baseline, body wrapping below.
 * Not MemberRow (avatar 40, single-line caption, trailing status) and not ListRow.
 * Build 90 05.1: the avatar and the name open the author when `onPressAuthor` is given.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import { COMMENT_AVATAR_SIZE } from "@/lib/comment-row";

export type CommentRowProps = {
  displayName: string;
  time: string;
  body: string;
  avatarUri?: string | null;
  onPressAuthor?: () => void;
};

export default function CommentRow({
  displayName,
  time,
  body,
  avatarUri,
  onPressAuthor,
}: CommentRowProps) {
  const avatar = (
    <Avatar
      size={COMMENT_AVATAR_SIZE}
      uri={avatarUri}
      displayName={displayName}
    />
  );
  const name = <Text style={styles.name}>{displayName}</Text>;
  return (
    <View style={styles.row}>
      {onPressAuthor ? (
        <Pressable
          onPress={onPressAuthor}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${displayName} profile`}
        >
          {avatar}
        </Pressable>
      ) : (
        avatar
      )}
      <View style={styles.copy}>
        <View style={styles.baseline}>
          {onPressAuthor ? (
            <Pressable
              onPress={onPressAuthor}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${displayName} profile`}
              style={styles.nameHit}
            >
              {name}
            </Pressable>
          ) : (
            name
          )}
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.lg,
  },
  copy: {
    flex: 1,
    gap: DS_V3.space.xs / 4,
  },
  baseline: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  nameHit: {
    flexShrink: 1,
  },
  name: {
    flexShrink: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  time: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  body: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
});
