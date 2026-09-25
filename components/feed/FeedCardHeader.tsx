import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Check, MoreHorizontal } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";
import { relativeTime } from "@/lib/utils/relativeTime";
import { ROUTES } from "@/lib/routes";
import type { LiveFeedPost } from "./feedTypes";
import { FLAGS } from "@/lib/feature-flags";

function isSameDay(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

type Props = {
  post: LiveFeedPost;
  onProfilePress: () => void;
  onMenuPress?: () => void;
};

function FeedCardHeaderInner({ post, onProfilePress, onMenuPress }: Props) {
  const router = useRouter();
  const displayUser = post.displayName || post.username || "Member";
  const dayLabelPrefix =
    FLAGS.PR3_FEED_DEDUPE && post.currentDay > 0
      ? `${post.currentDay} day${post.currentDay === 1 ? "" : "s"} · `
      : "";
  const challengeTask = FLAGS.PR3_FEED_DEDUPE
    ? `${dayLabelPrefix}${post.challengeName}`
    : post.taskName
      ? `${post.challengeName} · ${post.taskName}`
      : post.challengeName;
  const timeAgo = relativeTime(post.createdAt);
  const challengeId = post.challengeId?.trim() || null;
  const canOpenChallenge = Boolean(challengeId);

  const completedToday =
    isSameDay(post.createdAt) &&
    (post.eventType === "task_completed" ||
      post.eventType === "secured_day" ||
      post.verified);

  const showStreakBadge = !completedToday && post.streakCount >= 7;

  const handleChallengePress = useCallback(() => {
    if (!challengeId) return;
    router.push(ROUTES.CHALLENGE_ID(challengeId) as never);
  }, [challengeId, router]);

  const challengeSubtitle = (
    <Text style={styles.subtitle} numberOfLines={1}>
      {challengeTask}
    </Text>
  );

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onProfilePress}
        style={styles.avatarWrap}
        accessibilityRole="button"
        accessibilityLabel={`${displayUser} profile`}
      >
        <Avatar
          url={post.avatarUrl}
          name={displayUser}
          userId={post.userId}
          size={42}
        />
        {completedToday ? (
          <View style={styles.badgeOuter}>
            <View style={styles.badgeGreen}>
              <Check size={8} color={DS_V3.color.textPrimary} strokeWidth={3} />
            </View>
          </View>
        ) : showStreakBadge ? (
          <View style={styles.badgeOuter}>
            <View style={styles.badgeStreak}>
              <Text style={styles.badgeStreakText} numberOfLines={1}>
                {post.streakCount > 99 ? "99+" : String(post.streakCount)}
              </Text>
            </View>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.headerMid}>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`View profile for ${displayUser}`}
        >
          <Text style={styles.username} numberOfLines={1}>
            {displayUser}
            <Text style={styles.usernameTime}>{`  ·  ${timeAgo}`}</Text>
          </Text>
        </Pressable>
        {canOpenChallenge ? (
          <Pressable
            onPress={handleChallengePress}
            accessibilityRole="button"
            accessibilityLabel={`Open ${post.challengeName} challenge`}
          >
            {challengeSubtitle}
          </Pressable>
        ) : (
          challengeSubtitle
        )}
      </View>

      <Pressable
        onPress={onMenuPress}
        hitSlop={12}
        disabled={!onMenuPress}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Post options"
      >
        <MoreHorizontal size={20} color={DS_V3.color.textSecondary} />
      </Pressable>
    </View>
  );
}

export const FeedCardHeader = React.memo(FeedCardHeaderInner);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingHorizontal: DS_V3.space.gutter,
  },
  avatarWrap: { position: "relative" },
  badgeOuter: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DS_V3.color.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreak: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreakText: {
    fontSize: 9,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  headerMid: { flex: 1, marginLeft: 11, minWidth: 0 },
  username: {
    fontSize: DS_V3.type.body.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  usernameTime: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  menuBtn: { padding: 4, alignSelf: "flex-start", marginTop: 2 },
});
