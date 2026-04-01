import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Camera, CircleCheck, Heart } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedEngagementRow } from "./FeedEngagementRow";
import { WhoRespectedSheet } from "./WhoRespectedSheet";
import type { FeedCommentPreview, LiveFeedPost } from "./feedTypes";
import { Avatar } from "@/components/Avatar";

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
  const proofUri = post.proofPhotoUrl || post.photoUrl;
  const showProof = post.hasProof || Boolean(proofUri);

  const [showWhoRespected, setShowWhoRespected] = React.useState(false);

  const lastTapRef = React.useRef<number>(0);
  const heartScale = React.useRef(new Animated.Value(0)).current;
  const heartOpacity = React.useRef(new Animated.Value(0)).current;

  const handleDoubleTap = React.useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.reactedByMe) {
        onRespect();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    lastTapRef.current = now;
  }, [post.reactedByMe, onRespect, heartScale, heartOpacity]);

  return (
    <View style={styles.card}>
      <FeedCardHeader post={post} onProfilePress={onProfilePress} onMenuPress={onMenuPress} />

      {post.caption ? (
        <Text style={styles.captionBody} accessibilityRole="text">
          {post.caption}
        </Text>
      ) : null}

      {showProof ? (
        <View style={styles.proofWrap}>
          <Pressable onPress={handleDoubleTap} accessibilityRole="button" accessibilityLabel="Double tap to respect">
            {proofUri ? (
              <Image
                source={{ uri: proofUri }}
                style={styles.proofImage}
                contentFit="cover"
                accessibilityRole="image"
              />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: placeholderBg(post.challengeName) }]}>
                <Camera size={40} color={DS_COLORS.TEXT_PRIMARY} style={{ opacity: 0.35 }} />
              </View>
            )}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.heartOverlay,
                {
                  opacity: heartOpacity,
                  transform: [{ scale: heartScale }],
                },
              ]}
            >
              <Heart size={80} color={DS_COLORS.FEED_RESPECT_ICON_FILL} fill={DS_COLORS.FEED_RESPECT_ICON_FILL} />
            </Animated.View>
          </Pressable>
          <View style={styles.proofMeta}>
            <CircleCheck size={12} color={DS_COLORS.ACCENT} />
            <Text style={styles.taskTag}>
              {post.challengeName}
              {post.taskName ? ` · ${post.taskName}` : ` · Task ${post.currentDay} of ${post.totalDays}`}
            </Text>
          </View>
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
        onRespectCountPress={() => setShowWhoRespected(true)}
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

      <WhoRespectedSheet visible={showWhoRespected} eventId={post.id} onClose={() => setShowWhoRespected(false)} />
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
  captionBody: {
    fontSize: 12,
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  proofWrap: {
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: DS_COLORS.FEED_PROGRESS_TRACK,
  },
  proofImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  heartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  proofMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  taskTag: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
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
    backgroundColor: DS_COLORS.ACCENT,
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
