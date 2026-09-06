/**
 * FeedPostV3 — 01_components.md FeedPost. Screen component, ds primitives only.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, MessageCircle, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
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

  if (variant === "noPhoto") {
    return (
      <Card>
        <View style={styles.line}>
          <Pressable onPress={onProfilePress} accessibilityRole="button" accessibilityLabel={name}>
            <Avatar size={40} uri={post.avatarUrl ?? undefined} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>
              {name} secured day <DisplayNumber value={post.currentDay} size="inline" />
            </Text>
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
            <Avatar size={40} uri={post.avatarUrl ?? undefined} displayName={name} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>
              {when} · {post.challengeName}
            </Text>
          </View>
        </View>
        <Text style={styles.summary}>
          Finished. {post.currentDay} of {post.totalDays} days verified.
        </Text>
        <ActionRow liked={post.reactedByMe} onLike={onLike} onComment={onComment} onShare={onShare} />
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
          <Text style={styles.meta}>
            {when} · Day <DisplayNumber value={post.currentDay} size="inline" /> · {post.challengeName}
          </Text>
        </View>
      </View>
      <ProofImage
        uri={photo}
        size="feed"
        title={post.challengeName}
        caption={post.caption ?? undefined}
        scrim
        stamp={post.verified ? "Verified" : undefined}
      />
      <ActionRow liked={post.reactedByMe} onLike={onLike} onComment={onComment} onShare={onShare} />
    </Card>
  );
}

function ActionRow({
  liked,
  onLike,
  onComment,
  onShare,
}: {
  liked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  return (
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Like" onPress={onLike} style={styles.hit}>
        <Heart size={ICON} color={liked ? DS_V3.color.brandText : DS_V3.color.textPrimary} />
      </Pressable>
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
