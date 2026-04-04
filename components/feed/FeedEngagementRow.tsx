import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Heart, MessageCircle, ArrowUpRight } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"

type Props = {
  respectCount: number;
  reactedByMe: boolean;
  commentCount: number;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
  onRespectCountPress?: () => void;
};

function FeedEngagementRowInner({
  respectCount,
  reactedByMe,
  commentCount,
  onRespect,
  onComment,
  onShare,
  onRespectCountPress,
}: Props) {
  const heartBounce = React.useRef(new Animated.Value(1)).current;

  return (
    <View style={styles.row}>
      <View style={[styles.pill, reactedByMe && styles.pillActive]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            heartBounce.setValue(1);
            Animated.sequence([
              Animated.spring(heartBounce, {
                toValue: 1.3,
                friction: 3,
                tension: 300,
                useNativeDriver: true,
              }),
              Animated.spring(heartBounce, {
                toValue: 1,
                friction: 4,
                tension: 200,
                useNativeDriver: true,
              }),
            ]).start();
            onRespect();
          }}
          accessibilityRole="button"
          accessibilityLabel={reactedByMe ? "Remove respect" : "Give respect"}
          accessibilityState={{ selected: reactedByMe }}
        >
          <Animated.View style={{ transform: [{ scale: heartBounce }] }}>
            <Heart
              size={16}
              color={reactedByMe ? DS_COLORS.FEED_RESPECT_ICON_FILL : DS_COLORS.FEED_ENGAGEMENT_MUTED}
              fill={reactedByMe ? DS_COLORS.FEED_RESPECT_ICON_FILL : "none"}
            />
          </Animated.View>
        </Pressable>
        {respectCount > 0 ? (
          <Pressable
            onPress={onRespectCountPress}
            disabled={!onRespectCountPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See who respected"
          >
            <Text style={[styles.count, reactedByMe && styles.countActive]}>{respectCount}</Text>
          </Pressable>
        ) : null}
      </View>

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
    borderRadius: DS_RADIUS.modal,
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
