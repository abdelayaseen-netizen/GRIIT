import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { MessageCircle, ArrowUpRight } from "lucide-react-native";
import { DS_DAYLIGHT } from "@/lib/design-system";
import LikeHeart from "@/components/ds/LikeHeart";

type Props = {
  respectCount: number;
  reactedByMe: boolean;
  commentCount: number;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
  onRespectCountPress?: () => void;
  pulseToken?: number;
};

function FeedEngagementRowInner({
  respectCount,
  reactedByMe,
  commentCount,
  onRespect,
  onComment,
  onShare,
  onRespectCountPress,
  pulseToken = 0,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <LikeHeart
          liked={reactedByMe}
          color={DS_DAYLIGHT.color.accent}
          mutedColor={DS_DAYLIGHT.color.iconInk}
          size={23}
          pulseToken={pulseToken}
          accessibilityLabel={reactedByMe ? "Remove respect" : "Give respect"}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRespect();
          }}
        />
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
