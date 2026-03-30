import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Flame, MessageCircle } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";

export type FeedPost = {
  id: string;
  challenge_id: string | null;
  challengeTitle: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  taskName: string;
  caption: string | null;
  imageUrl: string | null;
  reaction_count: number;
  reacted_by_me: boolean;
  comment_count: number;
};

type Props = {
  post: FeedPost;
  onPressRespect: (postId: string, reacted: boolean, currentCount: number) => void;
  onPressComment: (post: FeedPost) => void;
};

export default function PostCard({ post, onPressRespect, onPressComment }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const initial = (post.display_name || post.username || "?").trim().charAt(0).toUpperCase();

  const pulse = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{post.display_name || post.username || "Someone"}</Text>
          <Text style={styles.challenge} numberOfLines={1}>{post.challengeTitle}</Text>
        </View>
        <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
      </View>

      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" /> : null}
      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

      <View style={styles.statsRow}>
        <Text style={styles.statText}>🤜 {post.reaction_count} Respects</Text>
        <Text style={styles.statText}>💬 {post.comment_count} Comments</Text>
      </View>

      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, post.reacted_by_me && styles.actionBtnActive]}
            onPress={() => {
              pulse();
              onPressRespect(post.id, post.reacted_by_me, post.reaction_count);
            }}
            accessibilityRole="button"
            accessibilityLabel="Respect post"
          >
            <Flame size={14} color={post.reacted_by_me ? DS_COLORS.WHITE : DS_COLORS.TEXT_SECONDARY} />
            <Text style={[styles.actionText, post.reacted_by_me && styles.actionTextActive]}>Respect</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onPressComment(post)}
          accessibilityRole="button"
          accessibilityLabel="Comment on post"
        >
          <MessageCircle size={14} color={DS_COLORS.TEXT_SECONDARY} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    marginBottom: DS_SPACING.md,
    padding: DS_SPACING.md,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    ...DS_SHADOWS.card,
  },
  header: { flexDirection: "row", alignItems: "center", gap: DS_SPACING.sm },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: DS_COLORS.ACCENT_PRIMARY, fontWeight: "700" },
  headerText: { flex: 1 },
  name: { ...DS_TYPOGRAPHY.metadata, color: DS_COLORS.TEXT_PRIMARY },
  challenge: { ...DS_TYPOGRAPHY.secondary, color: DS_COLORS.TEXT_SECONDARY },
  time: { ...DS_TYPOGRAPHY.eyebrow, color: DS_COLORS.TEXT_MUTED },
  image: {
    marginTop: DS_SPACING.sm,
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: DS_RADIUS.cardAlt,
    backgroundColor: DS_COLORS.SKELETON_BG,
  },
  caption: { ...DS_TYPOGRAPHY.bodySmall, color: DS_COLORS.TEXT_PRIMARY, marginTop: DS_SPACING.sm },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: DS_SPACING.sm },
  statText: { ...DS_TYPOGRAPHY.secondary, color: DS_COLORS.TEXT_SECONDARY },
  actions: { flexDirection: "row", gap: DS_SPACING.sm, marginTop: DS_SPACING.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: DS_RADIUS.buttonPill,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnActive: {
    borderColor: DS_COLORS.ACCENT_PRIMARY,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
  },
  actionText: { ...DS_TYPOGRAPHY.buttonSmall, color: DS_COLORS.TEXT_SECONDARY },
  actionTextActive: { color: DS_COLORS.WHITE },
});
