/**
 * Frame 147 FeedEvent — single or grouped started / secured / finished.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import type { FeedEventGroup } from "@/lib/feed-join";
import { eventLine } from "@/lib/feed-join";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";

export default function FeedEvent({
  group,
}: {
  group: FeedEventGroup;
}) {
  const faces = group.avatars.slice(0, 3);
  const stacked = faces.length > 1;
  const size = stacked ? 28 : 32;
  return (
    <View style={styles.row} accessibilityLabel={eventLine(group)}>
      <View style={styles.stack}>
        {faces.map((a, i) => (
          <View key={a.userId || `${a.username}-${i}`} style={i > 0 ? styles.shift : undefined}>
            <Avatar
              size={size}
              userId={a.userId}
              uri={a.avatarUrl}
              displayName={a.displayName}
              username={a.username}
            />
          </View>
        ))}
      </View>
      <Text style={styles.text} numberOfLines={3}>
        {eventLine(group)}
      </Text>
      <Text style={styles.time}>{formatTimeAgoCompact(group.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: 0,
    paddingVertical: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  stack: {
    flexDirection: "row",
    alignItems: "center",
  },
  shift: {
    marginLeft: -8,
  },
  text: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  time: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});
