import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
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
  const pct = Math.min(100, Math.max(0, (post.currentDay / Math.max(1, post.totalDays)) * 100));
  const [showWhoRespected, setShowWhoRespected] = React.useState(false);

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      <View style={styles.banner}>
        <View style={styles.iconBox}>
          <Star size={24} color={DS_COLORS.FEED_MILESTONE_STAR} fill={DS_COLORS.FEED_MILESTONE_STAR} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerSub}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>
            Day {post.currentDay} of {post.totalDays}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
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

      <WhoRespectedSheet visible={showWhoRespected} eventId={post.id} onClose={() => setShowWhoRespected(false)} />
    </View>
  );
}

export const MilestonePostCard = React.memo(MilestonePostCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 20,
    overflow: "hidden",
  },
  banner: {
    backgroundColor: DS_COLORS.FEED_MILESTONE_SURFACE,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: DS_COLORS.FEED_MILESTONE_ICON_SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS.FEED_MILESTONE_TITLE,
  },
  bannerSub: {
    marginTop: 3,
    fontSize: 12,
    color: DS_COLORS.FEED_MILESTONE_SUBTITLE,
  },
  progressBlock: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 2,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS.FEED_PROGRESS_LABEL,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS.FEED_PROGRESS_TRACK,
    overflow: "hidden",
  },
  fill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
  },
});
