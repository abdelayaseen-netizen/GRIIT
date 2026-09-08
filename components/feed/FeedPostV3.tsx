/**
 * FeedPostV3 — 01_components.md FeedPost. Screen component, ds primitives only.
 */
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { MessageCircle, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ChallengeNameLink from "@/components/ds/ChallengeNameLink";
import LikeHeart from "@/components/ds/LikeHeart";
import ProofImage from "@/components/ds/ProofImage";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { shouldLikeOnDoubleTap } from "@/lib/feed-interaction";
import { feedNoPhotoCopy } from "@/lib/feed-copy";
import { dayWord } from "@/lib/format-days";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";

const ICON = DS_V3.space.xs * 6;

export type FeedPostV3Props = {
  post: LiveFeedPost;
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
  onLike,
  onComment,
  onShare,
  onProfilePress,
}: FeedPostV3Props) {
  const variant = variantOf(post);
  const name = post.displayName || post.username;
  const when = formatTimeAgoCompact(post.createdAt);
  const photo = post.proofPhotoUrl ?? post.photoUrl;
  const [pulseToken, setPulseToken] = useState(0);

  const onDoubleTap = useCallback(() => {
    if (!shouldLikeOnDoubleTap(post.reactedByMe)) return;
    onLike();
    setPulseToken((n) => n + 1);
  }, [onLike, post.reactedByMe]);

  const imageGesture = useDoubleTap({ onDoubleTap });

  if (variant === "noPhoto") {
    return (
      <Card>
        <View style={styles.line}>
          <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
            <Avatar size={40} uri={post.avatarUrl ?? undefined} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>{feedNoPhotoCopy(post)}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{when} · </Text>
              <ChallengeNameLink
                challengeId={post.challengeId ?? ""}
                name={post.challengeName}
                style={styles.meta}
              />
            </View>
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
            <Avatar size={40} uri={post.avatarUrl ?? undefined} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{when} · </Text>
              <ChallengeNameLink
                challengeId={post.challengeId ?? ""}
                name={post.challengeName}
                style={styles.meta}
              />
            </View>
          </View>
        </View>
        <Text style={styles.summary}>
          Finished. {post.currentDay} of {post.totalDays}{" "}
          {dayWord(post.totalDays)} verified.
        </Text>
        <ActionRow
          liked={post.reactedByMe}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          pulseToken={pulseToken}
        />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
          <Avatar size={40} uri={post.avatarUrl ?? undefined} displayName={name} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{when} · Day </Text>
            <DisplayNumber value={post.currentDay} size="inline" />
            <Text style={styles.meta}> · </Text>
            <ChallengeNameLink
              challengeId={post.challengeId ?? ""}
              name={post.challengeName}
              style={styles.meta}
            />
          </View>
        </View>
      </View>
      <GestureDetector gesture={imageGesture}>
        <View>
          <ProofImage
            uri={photo}
            size="feed"
            title={post.challengeName}
            titleNode={
              <ChallengeNameLink
                challengeId={post.challengeId ?? ""}
                name={post.challengeName}
                numberOfLines={2}
                style={styles.proofTitle}
              />
            }
            caption={post.caption ?? undefined}
            scrim
            stamp={post.verified ? "Verified" : undefined}
          />
        </View>
      </GestureDetector>
      <ActionRow
        liked={post.reactedByMe}
        onLike={onLike}
        onComment={onComment}
        onShare={onShare}
        pulseToken={pulseToken}
      />
    </Card>
  );
}

function ActionRow({
  liked,
  onLike,
  onComment,
  onShare,
  pulseToken,
}: {
  liked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  pulseToken: number;
}) {
  return (
    <View style={styles.actions}>
      <View style={styles.hit}>
        <LikeHeart
          liked={liked}
          color={DS_V3.color.brandText}
          mutedColor={DS_V3.color.textPrimary}
          size={ICON}
          onPress={onLike}
          pulseToken={pulseToken}
        />
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  proofTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
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
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.md,
  },
  hit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
});
