import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Check, MoreHorizontal } from "lucide-react-native";
import { DS_DAYLIGHT } from "@/lib/design-system";
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
              <Check size={8} color={DS_DAYLIGHT.color.white} strokeWidth={3} />
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
        <MoreHorizontal size={20} color={DS_DAYLIGHT.color.iconMuted} />
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
    paddingHorizontal: DS_DAYLIGHT.space.cardPad,
  },
  avatarWrap: { position: "relative" },
  badgeOuter: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DS_DAYLIGHT.color.card,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DS_DAYLIGHT.color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreak: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DS_DAYLIGHT.color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreakText: {
    fontSize: 9,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  headerMid: { flex: 1, marginLeft: 11, minWidth: 0 },
  username: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  usernameTime: {
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  menuBtn: { padding: 4, alignSelf: "flex-start", marginTop: 2 },
});
