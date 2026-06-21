import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { DS_DAYLIGHT } from "@/lib/design-system";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { LiveFeedPost } from "./feedTypes";

function milestoneCopy(post: LiveFeedPost): { title: string; subtitle: string } {
  return {
    title: post.challengeName,
    subtitle: `Finished — Day ${post.totalDays} of ${post.totalDays}. Nothing left to prove.`,
  };
}

type Props = {
  post: LiveFeedPost;
  onProfilePress: () => void;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
  onMenuPress?: () => void;
};

function MilestonePostCardInner({
  post,
  onProfilePress,
  onRespect,
  onComment,
  onShare,
  onMenuPress,
}: Props) {
  const { title, subtitle } = milestoneCopy(post);
  const [showWhoRespected, setShowWhoRespected] = React.useState(false);

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      <View style={styles.banner}>
        <View style={styles.iconBox}>
          <Star size={24} color={DS_DAYLIGHT.color.accent} fill={DS_DAYLIGHT.color.accent} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerSub}>{subtitle}</Text>
        </View>
      </View>

      <FeedEngagementRow
        respectCount={post.respectCount}
        reactedByMe={post.reactedByMe}
        commentCount={post.commentCount}
        onRespect={onRespect}
        onComment={onComment}
        onShare={onShare}
        onRespectCountPress={() => setShowWhoRespected(true)}
      />

      <View style={styles.divider} />

      <WhoRespectedSheet visible={showWhoRespected} eventId={post.id} onClose={() => setShowWhoRespected(false)} />
    </View>
  );
}

export const MilestonePostCard = React.memo(MilestonePostCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_DAYLIGHT.color.canvas,
    paddingTop: 6,
  },
  banner: {
    marginHorizontal: DS_DAYLIGHT.space.cardPad,
    marginTop: 13,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    borderRadius: DS_DAYLIGHT.radius.cardMd,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: DS_DAYLIGHT.radius.button,
    backgroundColor: DS_DAYLIGHT.color.card,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  bannerSub: {
    marginTop: 3,
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  divider: {
    height: 1,
    backgroundColor: DS_DAYLIGHT.color.dividerStrong,
    marginTop: 18,
    marginHorizontal: DS_DAYLIGHT.space.screenH,
  },
});
