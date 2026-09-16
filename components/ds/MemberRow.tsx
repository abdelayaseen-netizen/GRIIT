/**
 * MemberRow — handoff Chunk L. Avatar 40, name + caption, trailing status caption.
 * Law 23: the trailing slot is a state, not a button.
 * Frame 36: unread = surface + brand dot; read = canvas + chevron. Same height both.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Divider from "@/components/ds/Divider";
import { memberTrailing, type MemberTrailing } from "@/lib/group-ui";

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 6;
const DOT = DS_V3.space.sm;

export type MemberRowProps = {
  displayName: string;
  caption?: string;
  avatarUri?: string | null;
  avatarName?: string | null;
  nameAside?: string;
  trailing?: MemberTrailing;
  full?: boolean;
  dimmed?: boolean;
  divider?: boolean;
  unread?: boolean;
  onPress?: () => void;
};

export default function MemberRow({
  displayName,
  caption,
  avatarUri,
  avatarName,
  nameAside,
  trailing,
  full,
  dimmed,
  divider = true,
  unread,
  onPress,
}: MemberRowProps) {
  const inviteNotif = unread !== undefined;
  const trail = !inviteNotif && trailing ? memberTrailing(trailing, full) : null;
  const trailColor =
    trail?.tone === "brand"
      ? DS_V3.color.brandText
      : trail?.tone === "muted"
        ? DS_V3.color.textSecondary
        : DS_V3.color.textSecondary;

  const body = (
    <>
      <Avatar size={DS_V3.size.avatar.sm} uri={avatarUri} displayName={avatarName ?? displayName} />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              inviteNotif ? styles.inviteLine : null,
              inviteNotif && unread ? styles.inviteUnread : null,
              inviteNotif && !unread ? styles.inviteRead : null,
            ]}
            numberOfLines={2}
          >
            {displayName}
          </Text>
          {nameAside ? <Text style={styles.aside}>{nameAside}</Text> : null}
        </View>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {inviteNotif ? (
        unread ? (
          <View
            style={styles.unreadDot}
            accessibilityLabel="Unread"
          />
        ) : (
          <ChevronRight
            size={ICON}
            color={DS_V3.color.textSecondary}
            accessibilityLabel="Open"
          />
        )
      ) : trail ? (
        <Text
          style={[
            styles.trail,
            { color: trailColor },
            trail.tone === "muted" ? styles.trailMuted : null,
          ]}
        >
          {trail.label}
        </Text>
      ) : null}
    </>
  );

  const rowStyle = [styles.row, inviteNotif && unread ? styles.unreadSurface : null];

  return (
    <View style={dimmed ? styles.dimmed : null}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={displayName}
          onPress={onPress}
          style={({ pressed }) => [rowStyle, pressed ? styles.pressed : null]}
        >
          {body}
        </Pressable>
      ) : (
        <View style={rowStyle}>{body}</View>
      )}
      {divider ? <Divider /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  pressed: {
    opacity: 0.6,
  },
  dimmed: {
    opacity: 0.4,
  },
  copy: {
    flex: 1,
    gap: PT,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  unreadSurface: {
    backgroundColor: DS_V3.color.surface,
  },
  unreadDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: DS_V3.color.brand,
  },
  name: {
    flexShrink: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  inviteLine: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
  },
  inviteUnread: {
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  inviteRead: {
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
  aside: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  trail: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
  },
  trailMuted: {
    opacity: 0.7,
  },
});
