/**
 * FeedPostV3 — Chunk U card family (frame 93). One card, five variants.
 */
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUpRight, ChevronRight, Heart, MessageCircle } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Card from "@/components/ds/Card";
import ProofImage from "@/components/ds/ProofImage";
import { InlineComments } from "@/components/feed/InlineComments";
import type { FeedCommentPreview, LiveFeedPost } from "@/components/feed/feedTypes";
import { hasCameraProof } from "@/lib/active-challenge-ui";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { respectHeart } from "@/lib/feed-respect";
import { feedAvatarUri, liveFeedProofUrl } from "@/lib/live-feed-list";
import {
  SEE_THE_DAY,
  feedCardEyebrow,
  feedCardMeta,
  feedCardShowsVerified,
  feedCardSubject,
  feedCardVariant,
} from "@/lib/feed-card-family";

const ICON = DS_V3.space.xs * 6;
const CARD_R = 14;

export type FeedPostV3Props = {
  post: LiveFeedPost;
  viewerTargetStreak?: number | null;
  viewerUserId?: string | null;
  comments?: FeedCommentPreview[];
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfilePress?: () => void;
  onSeeDay?: () => void;
};

export default function FeedPostV3({
  post,
  viewerUserId,
  comments = [],
  onLike,
  onComment,
  onShare,
  onProfilePress,
  onSeeDay,
}: FeedPostV3Props) {
  const photo = liveFeedProofUrl(post);
  const cameraProof = hasCameraProof({
    proof_photo_url: post.proofPhotoUrl || (post.hasProof ? post.photoUrl : null) || null,
  });
  const variant = feedCardVariant({
    eventType: post.eventType,
    isCompleted: post.isCompleted,
    hasProof: post.hasProof || Boolean(photo),
    challengeName: post.challengeName,
    taskName: post.taskName,
    currentDay: post.currentDay,
    totalDays: post.totalDays,
    cameraGate: cameraProof || post.eventType === "task_completed",
    photo: Boolean(photo),
  });
  const name = post.displayName || post.username;
  const when = formatTimeAgoCompact(post.createdAt);
  const avatarUri = feedAvatarUri(post.avatarUrl, photo);
  const eyebrow = feedCardEyebrow(
    { ...post, challengeName: post.challengeName, currentDay: post.currentDay, totalDays: post.totalDays, eventType: post.eventType, isCompleted: post.isCompleted, hasProof: post.hasProof },
    variant,
  );
  const subject = feedCardSubject(
    { ...post, challengeName: post.challengeName, currentDay: post.currentDay, totalDays: post.totalDays, eventType: post.eventType, isCompleted: post.isCompleted, hasProof: post.hasProof },
    variant,
  );
  const meta = feedCardMeta(
    { ...post, challengeName: post.challengeName, currentDay: post.currentDay, totalDays: post.totalDays, eventType: post.eventType, isCompleted: post.isCompleted, hasProof: post.hasProof, cameraGate: cameraProof, photo: Boolean(photo) },
    variant,
  );
  const stamp = feedCardShowsVerified(variant, cameraProof || variant === "task_camera", Boolean(photo));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
          <Avatar size={40} uri={avatarUri} displayName={name} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.name}>{name}</Text>
        </View>
        <Text style={styles.when}>{when}</Text>
      </View>
      {variant === "task_camera" && photo ? (
        <ProofImage
          uri={photo}
          size="feed"
          title={post.challengeName}
          caption={post.caption ?? undefined}
          scrim
          stamp={stamp ? "Verified" : undefined}
          recyclingKey={post.id}
        />
      ) : null}
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {subject ? <Text style={styles.subject}>{subject}</Text> : null}
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {variant === "day_secured" && onSeeDay ? (
        <Pressable onPress={onSeeDay} accessibilityRole="button" accessibilityLabel={SEE_THE_DAY} style={styles.seeDay}>
          <Text style={styles.seeDayTxt}>{SEE_THE_DAY}</Text>
          <ChevronRight size={14} color={DS_V3.color.brandText} />
        </Pressable>
      ) : null}
      <ActionRow
        liked={post.reactedByMe}
        respectCount={post.respectCount}
        commentCount={post.commentCount}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
      />
      <InlineComments
        comments={comments}
        total={post.commentCount}
        viewerUserId={viewerUserId}
        onOpen={onComment}
      />
    </Card>
  );
}

function ActionRow({
  liked,
  respectCount,
  commentCount,
  onLike,
  onComment,
  onShare,
}: {
  liked: boolean;
  respectCount: number;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const bounce = React.useRef(new Animated.Value(1)).current;
  const heart = respectHeart(liked);
  return (
    <View style={styles.actions}>
      <View style={styles.respect}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? "Remove respect" : "Give respect"}
          accessibilityState={{ selected: liked }}
          onPress={() => {
            bounce.setValue(1);
            Animated.sequence([
              Animated.spring(bounce, { toValue: 1.3, friction: 3, tension: 300, useNativeDriver: true }),
              Animated.spring(bounce, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
            ]).start();
            onLike();
          }}
          style={styles.hit}
        >
          <Animated.View style={{ transform: [{ scale: bounce }] }}>
            <Heart size={ICON} color={heart.color} fill={heart.fill} />
          </Animated.View>
        </Pressable>
        {respectCount > 0 ? <Text style={[styles.count, { color: heart.countColor }]}>{respectCount}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Comment" onPress={onComment} style={styles.hit}>
        <MessageCircle size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
      {commentCount > 0 ? <Text style={styles.count}>{commentCount}</Text> : null}
      <View style={styles.flex} />
      <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={onShare} style={styles.hit}>
        <ArrowUpRight size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: CARD_R, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.md, marginBottom: DS_V3.space.sm },
  flex: { flex: 1 },
  name: { fontSize: 14, lineHeight: 19, fontWeight: "500", color: DS_V3.color.textPrimary },
  when: { ...DS_V3.type.label, color: DS_V3.color.textSecondary, letterSpacing: 0, textTransform: "none" },
  eyebrow: { ...DS_V3.type.label, color: DS_V3.color.textSecondary, marginTop: DS_V3.space.sm },
  subject: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary, marginTop: 2 },
  meta: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, marginTop: 2 },
  seeDay: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: DS_V3.space.sm },
  seeDayTxt: { ...DS_V3.type.caption, fontWeight: "500", color: DS_V3.color.brandText },
  actions: { flexDirection: "row", alignItems: "center", marginTop: DS_V3.space.md },
  respect: { flexDirection: "row", alignItems: "center" },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  hit: { width: DS_V3.size.tap, height: DS_V3.size.tap, alignItems: "center", justifyContent: "center" },
});
