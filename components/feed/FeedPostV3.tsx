/**
 * FeedPostV3 — Chunk U card family (frame 93). One card, five variants.
 */
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import ProofImage from "@/components/ds/ProofImage";
import { ProofFallbackTile } from "@/components/ds/ProofFallbackTile";
import { CameraSeal, SealSheet, showCameraSeal } from "@/components/feed/CameraSeal";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";
import { FeedCompactRow } from "@/components/feed/FeedCompactRow";
import { InlineComments } from "@/components/feed/InlineComments";
import type { FeedCommentPreview, LiveFeedPost } from "@/components/feed/feedTypes";
import { hasCameraProof } from "@/lib/active-challenge-ui";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { respectHeart } from "@/lib/feed-respect";
import { feedAvatarUri, liveFeedProofUrl } from "@/lib/live-feed-list";
import {
  feedCardMeta,
  feedCardSubject,
  feedCardVariant,
  feedProofSubject,
} from "@/lib/feed-card-family";
import { formatOfDays } from "@/lib/format-days";
import { FEED_TAP_HIT_SLOP } from "@/lib/feed-tap-targets";

const HEART = 22;
const COMMENT = 22;
const SEND = 20;
const PHOTO_INSET = 16;
const PHOTO_RADIUS = 20;

function finishStartedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

export type FeedPostV3Props = {
  post: LiveFeedPost;
  viewerTargetStreak?: number | null;
  viewerUserId?: string | null;
  comments?: FeedCommentPreview[];
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfilePress?: () => void;
  onChallengePress?: () => void;
  onCommentAuthorPress?: (comment: FeedCommentPreview) => void;
  onSeeDay?: () => void;
  onOpenPost?: () => void;
  onOpenPhoto?: () => void;
};

export default function FeedPostV3({
  post,
  viewerUserId,
  comments = [],
  onLike,
  onComment,
  onShare,
  onProfilePress,
  onChallengePress,
  onCommentAuthorPress,
  onSeeDay,
  onOpenPost,
  onOpenPhoto,
}: FeedPostV3Props) {
  const [sealOpen, setSealOpen] = React.useState(false);
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
    cameraGate: cameraProof,
    photo: Boolean(photo),
  });
  const name = post.displayName || post.username;
  const when = formatTimeAgoCompact(post.createdAt);
  const avatarUri = feedAvatarUri(post.avatarUrl, photo);
  const subject = feedCardSubject(
    { ...post, challengeName: post.challengeName, currentDay: post.currentDay, totalDays: post.totalDays, eventType: post.eventType, isCompleted: post.isCompleted, hasProof: post.hasProof },
    variant,
  );
  const meta = feedCardMeta(
    { ...post, challengeName: post.challengeName, currentDay: post.currentDay, totalDays: post.totalDays, eventType: post.eventType, isCompleted: post.isCompleted, hasProof: post.hasProof, cameraGate: cameraProof, photo: Boolean(photo), securedDays: post.securedDays },
    variant,
  );
  const ownPost = Boolean(viewerUserId && viewerUserId === post.userId);
  const seal = showCameraSeal(post.proofPhotoUrl ?? null);
  const open = onOpenPost ?? onSeeDay ?? (() => undefined);

  if (variant === "challenge_finished") {
    const secured = post.securedDays ?? 0;
    const days = post.totalDays;
    const started = finishStartedLabel(post.startedOn);
    return (
      <DoubleTapRespect respected={post.reactedByMe} onRespect={onLike} onOpen={open} ownPost={ownPost}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable
              onPress={onProfilePress}
              accessibilityRole="button"
              accessibilityLabel={`${name} profile`}
              hitSlop={FEED_TAP_HIT_SLOP}
            >
              <Avatar size={32} userId={post.userId} uri={avatarUri} displayName={name} username={post.username} />
            </Pressable>
            <View style={styles.flex}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.subject}>Finished {post.challengeName}</Text>
            </View>
            <Text style={styles.when}>{when}</Text>
            <MoreHorizontal size={20} color={DS_V3.color.textSecondary} />
          </View>
          <View style={styles.finishCard}>
            <View style={styles.finishCover} />
            <View style={styles.flex}>
              <Text style={styles.finishKicker}>CHALLENGE COMPLETE</Text>
              <Text style={styles.finishName}>{post.challengeName}</Text>
              <Text style={styles.finishCount}>{formatOfDays(secured, days)} secured</Text>
              <Text style={styles.finishMeta}>
                {`Longest streak ${post.streakCount}${started ? `  ·  Held  ·  Started ${started}` : "  ·  Held"}`}
              </Text>
            </View>
          </View>
          {post.caption ? <Text style={styles.finishCaption}>{post.caption}</Text> : null}
          <ActionRow
            liked={post.reactedByMe}
            respectCount={post.respectCount}
            commentCount={post.commentCount}
            shareCount={post.shareCount ?? 0}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
          />
          <InlineComments
            comments={comments}
            total={post.commentCount}
            viewerUserId={viewerUserId}
            onOpen={onComment}
            onAuthorPress={onCommentAuthorPress}
          />
        </View>
      </DoubleTapRespect>
    );
  }

  const proofPost = variant === "task_self" || (variant === "task_camera" && Boolean(photo));
  const daySubject = feedProofSubject(post.currentDay, post.totalDays, post.challengeName);

  if (!proofPost) {
    return (
      <DoubleTapRespect
        respected={post.reactedByMe}
        onRespect={onLike}
        onOpen={open}
        ownPost={ownPost}
      >
        <FeedCompactRow
          userId={post.userId}
          displayName={name}
          username={post.username}
          avatarUrl={avatarUri}
          ago={when}
          task={subject || "a task"}
          dayN={post.currentDay}
          dayOf={post.totalDays}
          challenge={post.challengeName}
          gateLine={meta || "Self-reported"}
          respects={post.respectCount}
          respected={post.reactedByMe}
          comments={post.commentCount}
          onProfile={onProfilePress ?? (() => undefined)}
          onChallenge={onChallengePress ?? (() => undefined)}
          onRespect={ownPost ? () => undefined : onLike}
          onComments={onComment}
        />
      </DoubleTapRespect>
    );
  }

  return (
    <>
    <DoubleTapRespect respected={post.reactedByMe} onRespect={onLike} onOpen={open} ownPost={ownPost}>
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`${name} profile`}
          hitSlop={FEED_TAP_HIT_SLOP}
        >
          <Avatar size={32} userId={post.userId} uri={avatarUri} displayName={name} username={post.username} />
        </Pressable>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`${name} profile`}
          hitSlop={FEED_TAP_HIT_SLOP}
          style={styles.flex}
        >
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subject} numberOfLines={1}>{daySubject}</Text>
        </Pressable>
        <Text style={styles.when}>{when}</Text>
      </View>
      {variant === "task_camera" ? (
        <View style={styles.photoFrame}>
          {photo ? (
            <Pressable accessibilityRole="image" accessibilityLabel="Open photo" onPress={onOpenPhoto ?? open}>
              <ProofImage uri={photo} size="feed" recyclingKey={post.id} />
              {post.caption ? (
                <View style={styles.scrim} pointerEvents="none">
                  <Text style={styles.photoTitle}>{post.caption}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <ProofFallbackTile taskName={subject} />
          )}
          {photo && seal ? (
            <View style={styles.seal}>
              <CameraSeal onPress={() => setSealOpen(true)} size={28} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.selfPanel}>
          <View style={styles.selfTop}>
            <View style={styles.checkDisc}>
              <Check size={22} color={DS_V3.color.brandText} />
            </View>
            <Text style={styles.gate}>{meta || "Self-reported"}</Text>
          </View>
          <Text style={styles.taskTitle}>{subject}</Text>
        </View>
      )}
      <ActionRow
        liked={post.reactedByMe}
        respectCount={post.respectCount}
        commentCount={post.commentCount}
        shareCount={post.shareCount ?? 0}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
      />
      <InlineComments
        comments={comments}
        total={post.commentCount}
        viewerUserId={viewerUserId}
        onOpen={onComment}
        onAuthorPress={onCommentAuthorPress}
      />
    </View>
    </DoubleTapRespect>
    <SealSheet visible={sealOpen} onDismiss={() => setSealOpen(false)} gates={{}} />
    </>
  );
}

function ActionRow({
  liked,
  respectCount,
  commentCount,
  shareCount,
  onLike,
  onComment,
  onShare,
}: {
  liked: boolean;
  respectCount: number;
  commentCount: number;
  shareCount: number;
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
            <Heart size={HEART} color={heart.color} fill={heart.fill} />
          </Animated.View>
        </Pressable>
        {respectCount > 0 ? <Text style={[styles.count, { color: heart.countColor }]}>{respectCount}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Comment" onPress={onComment} style={styles.hit}>
        <MessageCircle size={COMMENT} color={DS_V3.color.textPrimary} />
      </Pressable>
      {commentCount > 0 ? <Text style={styles.count}>{commentCount}</Text> : null}
      <View style={styles.flex} />
      <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={onShare} style={styles.hit}>
        <Send size={SEND} color={DS_V3.color.textPrimary} />
      </Pressable>
      {shareCount > 0 ? <Text style={styles.count}>{shareCount}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: DS_V3.color.canvas },
  photoFrame: {
    marginHorizontal: PHOTO_INSET,
    borderRadius: PHOTO_RADIUS,
    overflow: "hidden",
    aspectRatio: 4 / 5,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 36,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "rgba(15,15,15,0.72)",
  },
  photoTitle: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  finishCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: DS_V3.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.hairline,
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  finishCover: {
    width: 56,
    height: 72,
    borderRadius: 8,
    backgroundColor: DS_V3.color.raised,
  },
  finishKicker: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    color: DS_V3.color.textSecondary,
  },
  finishName: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  finishCount: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  finishMeta: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: DS_V3.color.textSecondary,
  },
  finishCaption: {
    marginTop: 10,
    marginHorizontal: 16,
    fontSize: 15,
    lineHeight: 20,
    color: DS_V3.color.textPrimary,
  },
  selfPanel: {
    marginHorizontal: PHOTO_INSET,
    borderRadius: PHOTO_RADIUS,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  selfTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS_V3.color.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  gate: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: DS_V3.color.textSecondary,
    textAlign: "right",
  },
  taskTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  seal: { position: "absolute", top: 12, right: 12, zIndex: 2 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  flex: { flex: 1 },
  name: { fontSize: 14, lineHeight: 18, fontWeight: "500", color: DS_V3.color.textPrimary },
  when: { fontSize: 12, lineHeight: 16, color: DS_V3.color.textSecondary, marginTop: 1 },
  subject: { fontSize: 12, lineHeight: 16, color: DS_V3.color.textSecondary },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  respect: { flexDirection: "row", alignItems: "center" },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
