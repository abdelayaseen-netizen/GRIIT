import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Check, MoreHorizontal } from "lucide-react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { Avatar } from "@/components/Avatar";
import { relativeTime } from "@/lib/utils/relativeTime";
import type { LiveFeedPost } from "./feedTypes";

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
  const displayUser = post.displayName || post.username || "Member";
  const challengeTask = post.taskName
    ? `${post.challengeName} · ${post.taskName}`
    : post.challengeName;
  const timeAgo = relativeTime(post.createdAt);

  const completedToday =
    isSameDay(post.createdAt) &&
    (post.eventType === "task_completed" ||
      post.eventType === "secured_day" ||
      post.verified);

  const showStreakBadge = !completedToday && post.streakCount >= 7;

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
          size={40}
        />
        {completedToday ? (
          <View style={styles.badgeOuter}>
            <View style={styles.badgeGreen}>
              <Check size={8} color={DS_COLORS.TEXT_ON_DARK} strokeWidth={3} />
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

      <Pressable
        onPress={onProfilePress}
        style={styles.headerMid}
        accessibilityRole="button"
        accessibilityLabel={`View profile for ${displayUser}`}
      >
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            {displayUser}
          </Text>
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>Day {post.currentDay}</Text>
          </View>
        </View>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle} numberOfLines={1}>
            {challengeTask}
          </Text>
          <Text style={styles.subtitleTime}>
            {timeAgo}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onMenuPress}
        hitSlop={12}
        disabled={!onMenuPress}
        style={styles.menuBtn}
        accessibilityRole="button"
        accessibilityLabel="Post options"
      >
        <MoreHorizontal size={20} color={DS_COLORS.FEED_MENU_DOTS} />
      </Pressable>
    </View>
  );
}

export const FeedCardHeader = React.memo(FeedCardHeaderInner);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  avatarWrap: { position: "relative" },
  badgeOuter: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.FEED_AVATAR_RING,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeGreen: {
    width: 12,
    height: 12,
    borderRadius: DS_RADIUS.featuredBadge,
    backgroundColor: DS_COLORS.FEED_BADGE_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreak: {
    width: 12,
    height: 12,
    borderRadius: DS_RADIUS.featuredBadge,
    backgroundColor: DS_COLORS.FEED_STREAK_BADGE,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeStreakText: {
    fontSize: 9,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
  headerMid: { flex: 1, marginLeft: 10, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  username: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.FEED_USERNAME,
    flexShrink: 1,
  },
  dayPill: {
    backgroundColor: DS_COLORS.FEED_DAY_PILL_BG,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: DS_RADIUS.featuredBadge,
  },
  dayPillText: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS.FEED_DAY_PILL_TEXT,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: DS_COLORS.FEED_META_MUTED,
    flex: 1,
  },
  subtitleTime: {
    fontSize: 11,
    color: DS_COLORS.FEED_META_MUTED,
    flexShrink: 0,
  },
  menuBtn: { padding: 4, marginTop: -4 },
});
