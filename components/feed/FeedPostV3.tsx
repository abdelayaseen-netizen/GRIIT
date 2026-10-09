/**
 * FeedPostV3 — Chunk U card family (frame 93). One card, five variants.
 */
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Heart, MessageCircle, MoreHorizontal, Share } from "lucide-react-native";
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
import { FEED_TAP_HIT_SLOP } from "@/lib/feed-tap-targets";

const ICON = 24;
const PHOTO_INSET = 16;
const PHOTO_RADIUS = 20;

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
  onMenu?: () => void;
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
  onMenu,
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
    const started = post.startedLabel ?? "";
    const dayWord = days === 1 ? "day" : "days";
    return (
      <View style={styles.card}>
        <PostHeader
          name={name}
          subject={`Finished ${post.challengeName}`}
          when={when}
          userId={post.userId}
          username={post.username}
          avatarUri={avatarUri}
          onProfilePress={onProfilePress}
          onMenu={onMenu}
        />
        <DoubleTapRespect respected={post.reactedByMe} onRespect={onLike} onOpen={open} ownPost={ownPost}>
          <View>
            <View style={styles.finishCard}>
              <View style={styles.finishTop}>
                <View style={styles.finishCover}>
                  <LinearGradient
                    colors={["#4A3A6B", "#151414"]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.finishCoverNum}>{days}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.finishKicker}>Challenge complete</Text>
                  <Text style={styles.finishName} numberOfLines={1}>{post.challengeName}</Text>
                </View>
              </View>
              <View style={styles.finishCountRow}>
                <Text style={styles.finishCount}>{secured}</Text>
                <Text style={styles.finishOf}>{`of ${days} ${dayWord} secured`}</Text>
              </View>
              <View style={styles.finishRule} />
              <View style={styles.finishStats}>
                <FinishStat value={String(post.longestStreak ?? 0)} label="Longest streak" />
                <FinishStat value={String(post.heldDays ?? 0)} label="Held" />
                <FinishStat value={started || "—"} label="Started" />
              </View>
            </View>
            {post.caption ? <Text style={styles.finishCaption}>{post.caption}</Text> : null}
          </View>
        </DoubleTapRespect>
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
          onAuthorPress={onCommentAuthorPress}
        />
      </View>
    );
  }

  const proofPost = variant === "task_self" || (variant === "task_camera" && Boolean(photo));
  const daySubject = feedProofSubject(post.currentDay, post.totalDays, post.challengeName);

  if (!proofPost) {
    return (
      <FeedCompactRow
        userId={post.userId}
        displayName={name}
        username={post.username}
        avatarUrl={avatarUri}
        ago={when}
        task={subject || ""}
        dayN={post.currentDay}
        dayOf={post.totalDays}
        challenge={post.challengeName}
        gateLine={meta || "Self-reported"}
        respects={post.respectCount}
        respected={post.reactedByMe}
        comments={post.commentCount}
        onProfile={onProfilePress ?? (() => undefined)}
        onChallenge={onChallengePress ?? (() => undefined)}
        onOpen={open}
        onRespect={ownPost ? () => undefined : onLike}
        onComments={onComment}
      />
    );
  }

  return (
    <>
    <View style={styles.card}>
      <PostHeader
        name={name}
        subject={daySubject}
        when={when}
        userId={post.userId}
        username={post.username}
        avatarUri={avatarUri}
        onProfilePress={onProfilePress}
        onMenu={onMenu}
      />
      {variant === "task_camera" ? (
        <DoubleTapRespect respected={post.reactedByMe} onRespect={onLike} onOpen={onOpenPhoto ?? open} ownPost={ownPost}>
        <View style={styles.photoFrame}>
          {photo ? (
            <Pressable
              accessibilityRole="image"
              accessibilityLabel={post.caption ? `${post.caption}. Open photo` : "Open photo"}
              onPress={onOpenPhoto ?? open}
            >
              <ProofImage uri={photo} size="feed" recyclingKey={post.id} />
              {post.caption ? (
                <LinearGradient
                  colors={["transparent", "rgba(15,15,15,0.72)", "rgba(15,15,15,0.9)"]}
                  locations={[0, 0.45, 1]}
                  style={styles.scrim}
                  pointerEvents="none"
                >
                  <Text style={styles.photoTitle}>{post.caption}</Text>
                </LinearGradient>
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
        </DoubleTapRespect>
      ) : (
        <DoubleTapRespect respected={post.reactedByMe} onRespect={onLike} onOpen={open} ownPost={ownPost}>
        <View style={styles.selfPanel}>
          <View style={styles.selfTop}>
            <View style={styles.checkDisc}>
              <Check size={22} color={DS_V3.color.brandText} />
            </View>
            <Text style={styles.gate}>{meta || "Self-reported"}</Text>
          </View>
          <Text style={styles.taskTitle}>{subject}</Text>
        </View>
        </DoubleTapRespect>
      )}
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
        onAuthorPress={onCommentAuthorPress}
      />
    </View>
    <SealSheet visible={sealOpen} onDismiss={() => setSealOpen(false)} gates={{}} />
    </>
  );
}

function PostHeader({
  name,
  subject,
  when,
  userId,
  username,
  avatarUri,
  onProfilePress,
  onMenu,
}: {
  name: string;
  subject: string;
  when: string;
  userId: string;
  username: string;
  avatarUri: string | null | undefined;
  onProfilePress?: () => void;
  onMenu?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={`${name} profile`}
        hitSlop={FEED_TAP_HIT_SLOP}
      >
        <Avatar size={32} userId={userId} uri={avatarUri} displayName={name} username={username} />
      </Pressable>
      <Pressable
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={`${name} profile`}
        hitSlop={FEED_TAP_HIT_SLOP}
        style={styles.flex}
      >
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.subject} numberOfLines={1}>{subject}</Text>
      </Pressable>
      <Text style={styles.when}>{when}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More"
        onPress={onMenu}
        style={styles.hit}
      >
        <MoreHorizontal size={20} color={DS_V3.color.textSecondary} />
      </Pressable>
    </View>
  );
}

function FinishStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.finishStat}>
      <Text style={styles.finishStatValue}>{value}</Text>
      <Text style={styles.finishStatLabel}>{label}</Text>
    </View>
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
          testID="feed-respect"
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
        {respectCount > 0 ? (
          <Text
            testID="feed-respect-count"
            accessibilityLabel={`${respectCount} respects`}
            style={[styles.count, { color: heart.countColor }]}
          >
            {respectCount}
          </Text>
        ) : null}
      </View>
      <View style={styles.respect}>
        <Pressable accessibilityRole="button" accessibilityLabel="Comment" onPress={onComment} style={styles.hit}>
          <MessageCircle size={ICON} color={DS_V3.color.textPrimary} />
        </Pressable>
        {commentCount > 0 ? <Text style={styles.count}>{commentCount}</Text> : null}
      </View>
      <View style={styles.flex} />
      <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={onShare} style={styles.hit}>
        <Share size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: DS_V3.color.canvas },
  photoFrame: {
    overflow: "hidden",
    aspectRatio: 4 / 5,
    backgroundColor: DS_V3.color.surface,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  photoTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
    color: DS_V3.color.textPrimary,
  },
  finishCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: DS_V3.color.surface,
    padding: 16,
    gap: 10,
  },
  finishTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  finishCover: {
    width: 48,
    height: 60,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  finishCoverNum: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  finishKicker: { ...DS_V3.type.label, color: DS_V3.color.textSecondary },
  finishName: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  finishCountRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  finishCount: {
    fontSize: 40,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  finishOf: { fontSize: 15, lineHeight: 20, fontWeight: "400", color: DS_V3.color.textSecondary },
  finishRule: { height: 1, backgroundColor: DS_V3.color.raised },
  finishStats: { flexDirection: "row", gap: 24 },
  finishStat: { gap: 0 },
  finishStatValue: { fontSize: 15, lineHeight: 20, fontWeight: "600", color: DS_V3.color.textPrimary },
  finishStatLabel: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  finishCaption: {
    paddingTop: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
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
  seal: { position: "absolute", top: 12, left: 12, zIndex: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 6,
  },
  flex: { flex: 1 },
  name: { fontSize: 15, lineHeight: 20, fontWeight: "600", color: DS_V3.color.textPrimary },
  when: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  subject: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  respect: { flexDirection: "row", alignItems: "center", gap: 5 },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  hit: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
