import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Heart, MessageCircle, ArrowUpRight } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type Props = {
  respectCount: number;
  reactedByMe: boolean;
  commentCount: number;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
};

function FeedEngagementRowInner({ respectCount, reactedByMe, commentCount, onRespect, onComment, onShare }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onRespect}
        style={[styles.pill, reactedByMe && styles.pillActive]}
        accessibilityRole="button"
        accessibilityLabel={reactedByMe ? "Remove respect" : "Give respect"}
        accessibilityState={{ selected: reactedByMe }}
      >
        <Heart
          size={16}
          color={reactedByMe ? DS_COLORS.FEED_RESPECT_ICON_FILL : DS_COLORS.FEED_ENGAGEMENT_MUTED}
          fill={reactedByMe ? DS_COLORS.FEED_RESPECT_ICON_FILL : "none"}
        />
        {respectCount > 0 ? (
          <Text style={[styles.count, reactedByMe && styles.countActive]}>{respectCount}</Text>
        ) : null}
      </Pressable>

      <Pressable onPress={onComment} style={styles.pill} accessibilityRole="button" accessibilityLabel="Comments">
        <MessageCircle size={16} color={DS_COLORS.FEED_ENGAGEMENT_MUTED} />
        {commentCount > 0 ? <Text style={styles.count}>{commentCount}</Text> : null}
      </Pressable>

      <View style={styles.spacer} />

      <Pressable onPress={onShare} style={styles.pill} accessibilityRole="button" accessibilityLabel="Share">
        <ArrowUpRight size={16} color={DS_COLORS.FEED_ENGAGEMENT_MUTED} />
        <Text style={styles.shareLabel}>Share</Text>
      </Pressable>
    </View>
  );
}

export const FeedEngagementRow = React.memo(FeedEngagementRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: DS_COLORS.TRANSPARENT,
  },
  pillActive: {
    backgroundColor: DS_COLORS.FEED_RESPECT_ACTIVE_BG,
  },
  count: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS.FEED_ENGAGEMENT_MUTED,
  },
  countActive: {
    color: DS_COLORS.FEED_RESPECT_ACTIVE_TEXT,
  },
  shareLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS.FEED_ENGAGEMENT_MUTED,
  },
  spacer: { flex: 1 },
});
