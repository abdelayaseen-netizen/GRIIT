import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
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
          <Star size={24} color={DS_V3.color.brand} fill={DS_V3.color.brand} />
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
    backgroundColor: DS_V3.color.canvas,
    paddingTop: 6,
  },
  banner: {
    marginHorizontal: DS_V3.space.gutter,
    marginTop: 13,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: DS_V3.color.brandTint,
    borderRadius: DS_V3.radius.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: DS_V3.type.body.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  bannerSub: {
    marginTop: 3,
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: DS_V3.color.border,
    marginTop: 18,
    marginHorizontal: DS_V3.space.gutter,
  },
});
