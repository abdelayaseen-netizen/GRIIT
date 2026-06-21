import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Heart, MessageCircle, ArrowUpRight } from "lucide-react-native";
import { DS_DAYLIGHT } from "@/lib/design-system";

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
      <View style={styles.item}>
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
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={reactedByMe ? "Remove respect" : "Give respect"}
          accessibilityState={{ selected: reactedByMe }}
        >
          <Animated.View style={{ transform: [{ scale: heartBounce }] }}>
            <Heart
              size={23}
              color={DS_DAYLIGHT.color.accent}
              fill={reactedByMe ? DS_DAYLIGHT.color.accent : "none"}
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
            <Text style={styles.count}>{respectCount}</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={onComment} style={styles.item} hitSlop={8} accessibilityRole="button" accessibilityLabel="Comments">
        <MessageCircle size={22} color={DS_DAYLIGHT.color.iconInk} strokeWidth={2} />
        {commentCount > 0 ? <Text style={styles.count}>{commentCount}</Text> : null}
      </Pressable>

      <Pressable onPress={onShare} style={styles.item} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share">
        <ArrowUpRight size={22} color={DS_DAYLIGHT.color.iconInk} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

export const FeedEngagementRow = React.memo(FeedEngagementRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 13,
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
    gap: 22,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  count: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
});
