import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, CircleCheck } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";

function placeholderBg(challengeName: string): string {
  const s = challengeName.toLowerCase();
  if (s.includes("water") || s.includes("gallon") || s.includes("hydrat")) return DS_COLORS.FEED_PLACEHOLDER_WATER;
  if (s.includes("cold") || s.includes("ice") || s.includes("shower")) return DS_COLORS.FEED_PLACEHOLDER_COLD;
  return DS_COLORS.FEED_PLACEHOLDER_GENERAL;
}

type Props = {
  post: LiveFeedPost;
  onProfilePress: () => void;
  onRespect: () => void;
  onComment: () => void;
  onShare: () => void;
  onMenuPress?: () => void;
  previewComment?: FeedCommentPreview | null;
};

function FeedPostCardInner({
  post,
  onProfilePress,
  onRespect,
  onComment,
  onShare,
  onMenuPress,
  previewComment,
}: Props) {
  const pct = Math.min(100, Math.max(0, (post.currentDay / Math.max(1, post.totalDays)) * 100));
  const showPhotoBlock = post.hasProof || Boolean(post.photoUrl);

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      {showPhotoBlock ? (
        <View style={styles.photoOuter}>
          {post.photoUrl ? (
            <Image source={{ uri: post.photoUrl }} style={styles.photo} contentFit="cover" accessibilityRole="image" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: placeholderBg(post.challengeName) }]}>
              <Camera size={56} color={DS_COLORS.TEXT_PRIMARY} style={{ opacity: 0.35 }} />
            </View>
          )}
          <LinearGradient colors={[DS_COLORS.TRANSPARENT, DS_COLORS.FEED_GRADIENT_END]} style={styles.gradient}>
            {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
            <View style={[styles.taskTagRow, !post.caption && { marginTop: 0 }]}>
              <CircleCheck size={12} color={DS_COLORS.FEED_CAPTION_TAG} />
              <Text style={styles.taskTag}>
                {post.challengeName} · Task {post.currentDay} of {post.totalDays}
              </Text>
            </View>
          </LinearGradient>
        </View>
      ) : null}

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
      />

      {previewComment ? (
        <View style={styles.commentPreview}>
          <Avatar
            url={previewComment.avatarUrl}
            name={previewComment.displayName || previewComment.username || "?"}
            userId={previewComment.userId}
            size={24}
          />
          <View style={styles.commentBody}>
            <Text style={styles.commentLine} numberOfLines={2}>
              <Text style={styles.commentUser}>{previewComment.displayName || previewComment.username}</Text>
              <Text style={styles.commentText}> {previewComment.text}</Text>
            </Text>
            <Text style={styles.commentTime}>{relativeTime(previewComment.createdAt)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export const FeedPostCard = React.memo(FeedPostCardInner);

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 20,
    overflow: "hidden",
  },
  photoOuter: {
    width: "100%",
    aspectRatio: 4 / 5,
    maxHeight: 360,
    position: "relative",
    backgroundColor: DS_COLORS.FEED_PROGRESS_TRACK,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  caption: {
    fontSize: 14,
    color: DS_COLORS.TEXT_ON_DARK,
    lineHeight: 20,
  },
  taskTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  taskTag: {
    fontSize: 11,
    color: DS_COLORS.FEED_CAPTION_TAG,
    flex: 1,
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
  commentPreview: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.FEED_COMMENT_BORDER,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  commentBody: { flex: 1 },
  commentLine: { fontSize: 12 },
  commentUser: {
    fontWeight: "500",
    color: DS_COLORS.FEED_USERNAME,
  },
  commentText: {
    fontWeight: "400",
    color: DS_COLORS.FEED_COMMENT_BODY,
  },
  commentTime: {
    marginTop: 2,
    fontSize: 11,
    color: DS_COLORS.FEED_META_MUTED,
  },
});
