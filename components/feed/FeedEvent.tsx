/**
 * Frame 147 FeedEvent — single or grouped started / secured / finished.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import type { FeedEventGroup } from "@/lib/feed-join";
import { eventLine } from "@/lib/feed-join";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";

export default function FeedEvent({
  group,
  onPress,
}: {
  group: FeedEventGroup;
  onPress?: () => void;
}) {
  const faces = group.avatars.slice(0, 3);
  const line = eventLine(group);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={line}
      onPress={onPress}
      style={styles.row}
    >
      <View style={styles.stack}>
        {faces.map((a, i) => (
          <View key={a.userId || `${a.username}-${i}`} style={i > 0 ? styles.shift : undefined}>
            <Avatar
              size={20}
              userId={a.userId}
              uri={a.avatarUrl}
              displayName={a.displayName}
              username={a.username}
            />
          </View>
        ))}
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {line}
      </Text>
      <Text style={styles.time}>{formatTimeAgoCompact(group.createdAt)}</Text>
      <ChevronRight size={16} color={DS_V3.color.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.hairline,
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
  time: {
    fontSize: 13,
    lineHeight: 18,
    color: DS_V3.color.textSecondary,
  },
});
