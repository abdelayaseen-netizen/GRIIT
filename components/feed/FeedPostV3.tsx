/**
 * FeedPostV3 — 01_components.md FeedPost. Screen component, ds primitives only.
 */
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, MessageCircle, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { feedFinishedCopy, feedNoPhotoCopy } from "@/lib/feed-copy";
import { hasCameraProof } from "@/lib/active-challenge-ui";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { respectHeart } from "@/lib/feed-respect";
import { feedAvatarUri, liveFeedProofUrl } from "@/lib/live-feed-list";

const ICON = DS_V3.space.xs * 6;

export type FeedPostV3Props = {
  post: LiveFeedPost;
  /** Viewer's target_streak — applied only for own finished/day copy. */
  viewerTargetStreak?: number | null;
  viewerUserId?: string | null;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onProfilePress?: () => void;
};

function variantOf(post: LiveFeedPost): "photo" | "noPhoto" | "finished" {
  if (post.isCompleted) return "finished";
  if (post.hasProof && (post.proofPhotoUrl || post.photoUrl)) return "photo";
  return "noPhoto";
}

export default function FeedPostV3({
  post,
  viewerTargetStreak,
  viewerUserId,
  onLike,
  onComment,
  onShare,
  onProfilePress,
}: FeedPostV3Props) {
  const variant = variantOf(post);
  const name = post.displayName || post.username;
  const when = formatTimeAgoCompact(post.createdAt);
  const photo = liveFeedProofUrl(post);
  const avatarUri = feedAvatarUri(post.avatarUrl, photo);
  const ownTarget = viewerUserId && post.userId === viewerUserId ? viewerTargetStreak : null;
  const cameraProof = hasCameraProof({
    proof_photo_url: post.proofPhotoUrl || (post.hasProof ? post.photoUrl : null) || null,
  });

  if (variant === "noPhoto") {
    return (
      <Card>
        <View style={styles.line}>
          <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
            <Avatar size={40} uri={avatarUri} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>{feedNoPhotoCopy(post)}</Text>
            <Text style={styles.meta}>
              {when} · {post.challengeName}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  if (variant === "finished") {
    return (
      <Card tint>
        <View style={styles.header}>
          <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
            <Avatar size={40} uri={avatarUri} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>
              {when} · {post.challengeName}
            </Text>
          </View>
        </View>
        <Text style={styles.summary}>
          {feedFinishedCopy({ ...post, targetStreak: ownTarget })}
        </Text>
        <ActionRow
          liked={post.reactedByMe}
          respectCount={post.respectCount}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
        />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
          <Avatar size={40} uri={avatarUri} displayName={name} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {when} · Day{" "}
            <DisplayNumber
              value={post.currentDay}
              size="inline"
            />{" "}
            · {post.challengeName}
          </Text>
        </View>
      </View>
      <ProofImage
        uri={photo}
        size="feed"
        title={post.challengeName}
        caption={post.caption ?? undefined}
        scrim
        stamp={cameraProof ? "Verified" : undefined}
        recyclingKey={post.id}
      />
      <ActionRow
        liked={post.reactedByMe}
        respectCount={post.respectCount}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
      />
    </Card>
  );
}

function ActionRow({
  liked,
  respectCount,
  onLike,
  onComment,
  onShare,
}: {
  liked: boolean;
  respectCount: number;
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
              Animated.spring(bounce, {
                toValue: 1.3,
                friction: 3,
                tension: 300,
                useNativeDriver: true,
              }),
              Animated.spring(bounce, {
                toValue: 1,
                friction: 4,
                tension: 200,
                useNativeDriver: true,
              }),
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
          <Text style={[styles.count, { color: heart.countColor }]}>{respectCount}</Text>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Comment" onPress={onComment} style={styles.hit}>
        <MessageCircle size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={onShare} style={styles.hit}>
        <Share2 size={ICON} color={DS_V3.color.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    marginBottom: DS_V3.space.md,
  },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  flex: { flex: 1 },
  name: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  meta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  summary: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    marginBottom: DS_V3.space.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.md,
  },
  respect: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
  },
  hit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
});
