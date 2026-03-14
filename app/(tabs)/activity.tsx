import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  Flame,
  UserPlus,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Shield,
  Crown,
  Zap,
  Globe,
  ThumbsUp,
  HandMetal,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuthGate } from "@/contexts/AuthGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { useRouter } from "expo-router";
import { track } from "@/lib/analytics";
import { ROUTES } from "@/lib/routes";
import { TRPC } from "@/lib/trpc-paths";
import { FLAGS } from "@/lib/feature-flags";
import type { ThemeColors } from "@/lib/theme-palettes";
import { COPY } from "@/lib/constants/copy";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SuggestedFollows } from "@/components/SuggestedFollows";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

function createActivityStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: DS_SPACING.screenHorizontal,
      paddingTop: DS_SPACING.sm,
      paddingBottom: DS_SPACING.lg,
      gap: DS_SPACING.sm,
    },
    title: {
      fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
      fontWeight: DS_TYPOGRAPHY.pageTitle.fontWeight,
      color: c.text.primary,
    },
    subtitle: {
      fontSize: DS_TYPOGRAPHY.secondary.fontSize,
      fontWeight: "400" as const,
      color: c.text.secondary,
      marginTop: 2,
    },
    teamsButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: DS_SPACING.sm,
      paddingHorizontal: DS_SPACING.md,
      paddingVertical: DS_SPACING.sm,
      borderRadius: DS_RADIUS.button,
      backgroundColor: c.pill,
      marginLeft: "auto" as const,
    },
    teamsButtonText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: c.text.secondary },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: DS_SPACING.xxxl },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: DS_SPACING.sm,
      paddingHorizontal: DS_SPACING.screenHorizontal,
      marginBottom: DS_SPACING.lg,
    },
    filterPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: DS_SPACING.sm,
      paddingHorizontal: DS_SPACING.lg,
      paddingVertical: DS_SPACING.md,
      borderRadius: 999,
      backgroundColor: c.pill,
    },
    filterPillActive: { backgroundColor: c.text.primary },
    filterPillText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: c.text.secondary },
    filterPillTextActive: { color: DS_COLORS.white },
    filterPillDisabled: { backgroundColor: c.border, opacity: 0.8 },
    filterPillTextDisabled: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: c.text.muted },
    dailyStatsWrap: { paddingHorizontal: DS_SPACING.screenHorizontal, marginBottom: DS_SPACING.xl },
    dailyStatsCard: {
      backgroundColor: c.card,
      borderRadius: DS_RADIUS.cardAlt,
      padding: DS_SPACING.cardPadding,
      borderWidth: DS_BORDERS.width,
      borderColor: c.border,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dailyStatRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dailyStatValue: { fontSize: 16, fontWeight: "700" as const, color: c.text.primary },
    dailyStatLabel: { fontSize: 14, fontWeight: "400" as const, color: c.text.primary },
    topThisWeekSection: { paddingHorizontal: DS_SPACING.screenHorizontal, marginBottom: DS_SPACING.xs },
    topThisWeekScroll: { paddingHorizontal: 0, gap: 14, paddingBottom: 8 },
    topThisWeekItem: { alignItems: "center", width: 80 },
    topThisWeekAvatarWrap: { position: "relative" as const, marginBottom: 6 },
    topThisWeekAvatar: { width: 52, height: 52, borderRadius: 26 },
    topThisWeekRankBadge: { position: "absolute" as const, top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: c.text.tertiary, alignItems: "center", justifyContent: "center" },
    topThisWeekRankBadgeGold: { backgroundColor: DS_COLORS.rankGoldBg },
    topThisWeekRankText: { fontSize: 11, fontWeight: "800" as const, color: DS_COLORS.white },
    topThisWeekName: { fontSize: 12, fontWeight: "600" as const, color: c.text.primary, marginBottom: 2 },
    topThisWeekScoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    topThisWeekScore: { fontSize: 13, fontWeight: "600" as const, color: c.text.primary },
    weeklyLeaderboardTitle: { fontSize: 14, fontWeight: "600" as const, color: c.text.primary },
    weeklyLeaderboardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    resetsSunday: { fontSize: 12, fontWeight: "400" as const, color: c.text.tertiary },
    topThreeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    topThreeCard: { flex: 1, backgroundColor: c.card, borderRadius: DS_RADIUS.cardAlt, padding: DS_SPACING.md, alignItems: "center", borderWidth: DS_BORDERS.width, borderColor: c.border },
    topThreeCardFirst: { backgroundColor: c.accentLight, borderColor: c.accent + "80" },
    topThreeRankCircle: { width: 28, height: 28, borderRadius: DS_RADIUS.cardAlt / 2, alignItems: "center", justifyContent: "center", marginBottom: DS_SPACING.sm },
    topThreeRankText: { fontSize: 14, fontWeight: "800" as const },
    topThreeAvatar: { width: 44, height: 44, borderRadius: 22, marginBottom: 6 },
    topThreeName: { fontSize: 12, fontWeight: "600" as const, color: c.text.primary, marginBottom: 2 },
    topThreeScore: { fontSize: 14, fontWeight: "700" as const, color: c.text.primary, marginBottom: 6 },
    topThreeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 },
    topThreeBadgeText: { fontSize: 10, fontWeight: "700" as const },
    leaderboardSection: { marginTop: DS_SPACING.xxl, paddingHorizontal: DS_SPACING.screenHorizontal },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: "700" as const, color: c.text.secondary, textTransform: "uppercase" as const, letterSpacing: 0.5 },
    leaderboardRankNum: { fontSize: 14, fontWeight: "600" as const, color: c.text.tertiary, width: 28 },
    leaderboardNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    leaderboardScoreRight: { fontSize: 14, fontWeight: "700" as const, color: c.text.primary },
    leaderboardRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: DS_RADIUS.cardAlt,
      padding: DS_SPACING.cardPadding,
      marginBottom: DS_SPACING.sm,
      borderWidth: DS_BORDERS.width,
      borderColor: c.border,
    },
    leaderboardAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    leaderboardInfo: { flex: 1 },
    leaderboardName: { fontSize: 14, fontWeight: "600" as const, color: c.text.primary },
    leaderboardMeta: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
    leaderboardStreak: { fontSize: 12, fontWeight: "600" as const, color: c.text.tertiary },
    movementFeedSection: { marginTop: DS_SPACING.xxl, paddingHorizontal: DS_SPACING.screenHorizontal },
    movementFeedSectionTitle: {
      fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
      fontWeight: "600" as const,
      color: c.text.tertiary,
      textTransform: "uppercase" as const,
      letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
      marginBottom: DS_SPACING.md,
    },
    movementFeedItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: DS_SPACING.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    movementFeedAvatarWrap: { marginRight: 12 },
    movementFeedAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: c.streak.shield },
    movementFeedBody: { flex: 1 },
    movementFeedNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
    movementFeedName: { fontSize: 14, fontWeight: "700" as const, color: c.text.primary },
    movementFeedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    movementFeedBadgeText: { fontSize: 10, fontWeight: "700" as const },
    movementFeedDesc: { fontSize: 13, fontWeight: "400" as const, color: c.text.primary, marginBottom: 4 },
    movementFeedMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
    movementFeedTime: { fontSize: 12, fontWeight: "400" as const, color: c.text.tertiary },
    movementFeedActions: { flexDirection: "row", alignItems: "center", marginLeft: 8, gap: 10 },
    movementFeedRespect: { flexDirection: "row", alignItems: "center", gap: 4 },
    movementFeedRespectCount: { fontSize: 12, fontWeight: "500" as const, color: c.text.tertiary },
    movementFeedNudge: { flexDirection: "row", alignItems: "center", gap: 4 },
    movementFeedNudgeText: { fontSize: 12, fontWeight: "500" as const, color: c.text.tertiary },
    emptyLeaderboardText: { fontSize: 14, fontWeight: "500" as const, color: c.text.secondary, textAlign: "center", paddingVertical: 20 },
    onlyDisciplineShows: { fontSize: 13, fontWeight: "400" as const, color: c.text.tertiary, textAlign: "center", marginTop: 20, marginBottom: 8 },
    recentSection: { marginTop: DS_SPACING.xxl, paddingHorizontal: DS_SPACING.screenHorizontal },
    recentItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginBottom: 2 },
    recentItemUnread: { backgroundColor: c.accentTint },
    recentIconWrap: { width: 22, alignItems: "center", marginRight: 6 },
    recentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
    recentText: { flex: 1, fontSize: 13, color: c.text.secondary, lineHeight: 18 },
    recentName: { fontWeight: "700" as const, color: c.text.primary },
    recentTime: { fontSize: 11, color: c.text.muted, marginLeft: 6 },
    showMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, gap: 4, marginTop: 4 },
    showMoreText: { fontSize: 13, fontWeight: "500" as const, color: c.text.secondary },
    bottomSpacer: { height: DS_SPACING.section },
  });
}

type ActivityStyles = ReturnType<typeof createActivityStyles>;

type ActivityType = "respect" | "follow" | "streak_milestone" | "day_secured" | "challenge_joined" | "nudge";

interface ActivityItem {
  id: string;
  type: ActivityType;
  actorId: string;
  actorUsername: string;
  actorDisplayName: string;
  targetId?: string;
  targetTitle?: string;
  dayNumber?: number;
  createdAt: string;
  read: boolean;
  /** For type "nudge": the encouragement message. */
  message?: string;
}

type FeedFilter = "global" | "friends" | "team";

export type FeedEventType = "secured_day" | "lost_streak" | "unlocked_achievement" | "completed_challenge" | "joined_challenge" | "last_stand";

interface FeedEventItem {
  id: string;
  user_id: string;
  event_type: FeedEventType;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  streak: number;
  rank: number;
  secured: boolean;
  score: number;
  respectCount: number;
  badge?: "Elite" | "Relentless" | "Builder" | "Starter";
}

function DailyStatsCard({ securedToday, styles }: { securedToday: number; styles: ActivityStyles }) {
  const { colors } = useTheme();
  return (
    <View style={styles.dailyStatsCard}>
      <View style={styles.dailyStatRow}>
        <Shield size={18} color={colors.streak.shield} />
        <Text style={styles.dailyStatValue}>{securedToday}</Text>
        <Text style={styles.dailyStatLabel}>secured today</Text>
      </View>
    </View>
  );
}

function getBadgeStyles(c: ThemeColors): Record<string, { bg: string; text: string }> {
  return {
    Elite: { bg: "rgba(212,160,23,0.2)", text: DS_COLORS.crownGold },
    Relentless: { bg: "rgba(232,125,79,0.2)", text: c.accent },
    Builder: { bg: "rgba(46,125,74,0.15)", text: c.streak.shield },
    Initiate: { bg: "rgba(107,114,128,0.2)", text: c.text.tertiary },
  };
}

function TopThisWeekRow({ entries, styles }: { entries: LeaderboardEntry[]; styles: ActivityStyles }) {
  const { colors } = useTheme();
  const top4 = entries.slice(0, 4);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.topThisWeekScroll}
    >
      {top4.map((entry) => (
        <View key={entry.id} style={styles.topThisWeekItem}>
          <View style={styles.topThisWeekAvatarWrap}>
            <Image source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }} style={styles.topThisWeekAvatar} contentFit="cover" />
            <View style={[styles.topThisWeekRankBadge, entry.rank === 1 && styles.topThisWeekRankBadgeGold]}>
              <Text style={styles.topThisWeekRankText}>{entry.rank}</Text>
            </View>
          </View>
          <Text style={styles.topThisWeekName} numberOfLines={1}>{entry.displayName || entry.username}</Text>
          <View style={styles.topThisWeekScoreRow}>
            <Zap size={12} color={colors.accent} />
            <Text style={styles.topThisWeekScore}>+{entry.score}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function LeaderboardSection({ entries, styles }: { entries: LeaderboardEntry[]; styles: ActivityStyles }) {
  const { colors } = useTheme();
  const badgeStyles = getBadgeStyles(colors);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const rankCircleColor = (rank: number) => (rank === 1 ? DS_COLORS.milestoneGold : rank === 2 ? DS_COLORS.silverRank : colors.accent);

  return (
    <View style={styles.leaderboardSection}>
      <View style={styles.weeklyLeaderboardHeader}>
        <View style={styles.sectionHeaderRow}>
          <Trophy size={16} color={DS_COLORS.milestoneGold} />
          <Text style={styles.weeklyLeaderboardTitle}>Weekly Leaderboard</Text>
        </View>
        <Text style={styles.resetsSunday}>Resets Sunday</Text>
      </View>
      <View style={styles.topThreeRow}>
        {top3.map((entry) => (
          <View key={entry.id} style={[styles.topThreeCard, entry.rank === 1 && styles.topThreeCardFirst]}>
            <View style={[styles.topThreeRankCircle, { backgroundColor: rankCircleColor(entry.rank) + "22" }]}>
              <Text style={[styles.topThreeRankText, { color: rankCircleColor(entry.rank) }]}>{entry.rank}</Text>
            </View>
            <Image source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }} style={styles.topThreeAvatar} contentFit="cover" />
            <Text style={styles.topThreeName} numberOfLines={1}>{entry.displayName || entry.username}</Text>
            <Text style={styles.topThreeScore}>+{entry.score}</Text>
            {entry.badge && (
              <View style={[styles.topThreeBadge, { backgroundColor: badgeStyles[entry.badge]?.bg || colors.pill }]}>
                {entry.rank === 1 && <Crown size={10} color={DS_COLORS.crownGold} />}
                <Text style={[styles.topThreeBadgeText, { color: badgeStyles[entry.badge]?.text || colors.text.secondary }]}>{entry.badge}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item: entry }) => (
          <View style={styles.leaderboardRow}>
            <Text style={styles.leaderboardRankNum}>#{entry.rank}</Text>
            <Image source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }} style={styles.leaderboardAvatar} contentFit="cover" />
            <View style={styles.leaderboardInfo}>
              <View style={styles.leaderboardNameRow}>
                <Text style={styles.leaderboardName} numberOfLines={1}>{entry.displayName || entry.username}</Text>
                {entry.secured && <Shield size={12} color={colors.streak.shield} style={{ marginLeft: 4 }} />}
              </View>
              <View style={styles.leaderboardMeta}>
                <Flame size={11} color={colors.accent} />
                <Text style={styles.leaderboardStreak}>{entry.streak}d</Text>
              </View>
            </View>
            <Text style={styles.leaderboardScoreRight}>+{entry.score}</Text>
          </View>
        )}
      />
    </View>
  );
}

function MovementFeedSection({
  entries,
  currentUserId,
  onGiveRespect,
  givingRespectId,
  onGiveNudge,
  givingNudgeId,
  styles,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  onGiveRespect: (userId: string) => void;
  givingRespectId: string | null;
  onGiveNudge: (userId: string) => void;
  givingNudgeId: string | null;
  styles: ActivityStyles;
}) {
  const { colors } = useTheme();
  const badgeStyles = getBadgeStyles(colors);
  return (
    <View style={styles.movementFeedSection}>
      <Text style={styles.movementFeedSectionTitle}>THIS WEEK</Text>
      {entries.length === 0 ? (
        <Text style={styles.onlyDisciplineShows}>Be the first this week.</Text>
      ) : (
        <>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            renderItem={({ item: entry }) => {
              const badge = entry.badge && badgeStyles[entry.badge];
              const isSelf = currentUserId != null && entry.userId === currentUserId;
              return (
                <View style={styles.movementFeedItem}>
                  <View style={styles.movementFeedAvatarWrap}>
                    <Image source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }} style={styles.movementFeedAvatar} contentFit="cover" />
                  </View>
                  <View style={styles.movementFeedBody}>
                    <View style={styles.movementFeedNameRow}>
                      <Text style={styles.movementFeedName}>{entry.displayName || entry.username}</Text>
                      {badge && (
                        <View style={[styles.movementFeedBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.movementFeedBadgeText, { color: badge.text }]}>{entry.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.movementFeedDesc}>{entry.score} day{entry.score !== 1 ? "s" : ""} secured this week • {entry.streak}d streak</Text>
                    <View style={styles.movementFeedMeta}>
                      <Flame size={11} color={colors.accent} />
                      <Text style={styles.movementFeedTime}>#{entry.rank}</Text>
                    </View>
                  </View>
                  <View style={styles.movementFeedActions}>
                    <TouchableOpacity
                      style={styles.movementFeedRespect}
                      onPress={() => onGiveRespect(entry.userId)}
                      disabled={givingRespectId === entry.userId}
                      activeOpacity={0.7}
                      accessibilityLabel={`Send respect to ${entry.displayName || entry.username || "user"}`}
                      accessibilityRole="button"
                    >
                      <ThumbsUp size={14} color={colors.text.tertiary} />
                      <Text style={styles.movementFeedRespectCount}>{entry.respectCount}</Text>
                    </TouchableOpacity>
                    {!isSelf && (
                      <TouchableOpacity
                        style={styles.movementFeedNudge}
                        onPress={() => onGiveNudge(entry.userId)}
                        disabled={givingNudgeId === entry.userId}
                        activeOpacity={0.7}
                        accessibilityLabel={`Nudge ${entry.displayName || entry.username || "user"}`}
                        accessibilityRole="button"
                      >
                        <HandMetal size={14} color={colors.text.tertiary} />
                        <Text style={styles.movementFeedNudgeText}>Nudge</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
          <Text style={styles.onlyDisciplineShows}>Only discipline shows here.</Text>
        </>
      )}
    </View>
  );
}

function RecentActivitySection({ items, error, styles }: { items: ActivityItem[]; error?: boolean; styles: ActivityStyles }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "follow": return "started following you";
      case "challenge_joined": return `joined ${activity.targetTitle}`;
      case "respect": return activity.targetTitle ? `respected your ${activity.targetTitle}` : "respected you";
      case "day_secured": return `secured Day ${activity.dayNumber}`;
      case "streak_milestone": return `reached Day ${activity.dayNumber} 🔥`;
      case "nudge": return activity.message ? `nudged you: ${activity.message}` : "nudged you";
      default: return "";
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "follow": return <UserPlus size={12} color={colors.text.tertiary} />;
      case "challenge_joined": return <Users size={12} color={colors.text.tertiary} />;
      case "respect": return <Star size={12} color={colors.accent} fill={colors.accent} />;
      case "day_secured": return <Shield size={12} color={colors.streak.shield} />;
      case "streak_milestone": return <Flame size={12} color={colors.streak.fire} />;
      case "nudge": return <HandMetal size={12} color={colors.accent} />;
      default: return null;
    }
  };

  const getUserAvatar = (userId: string) => `https://i.pravatar.cc/150?u=${userId}`;

  if (items.length === 0) {
    return (
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <TrendingUp size={15} color={colors.text.secondary} />
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>
        <Text style={styles.emptyLeaderboardText}>
          {error ? COPY.couldNotLoadActivity : COPY.noActivityYet}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeaderRow}>
        <TrendingUp size={15} color={colors.text.secondary} />
        <Text style={styles.sectionTitle}>Recent</Text>
      </View>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item: activity }) => (
          <View
            style={[styles.recentItem, !activity.read && styles.recentItemUnread]}
          >
            <View style={styles.recentIconWrap}>
              {getActivityIcon(activity.type)}
            </View>
            <Image
              source={{ uri: getUserAvatar(activity.actorId) }}
              style={styles.recentAvatar}
              contentFit="cover"
            />
            <Text style={styles.recentText} numberOfLines={2}>
              <Text style={styles.recentName}>{activity.actorDisplayName}</Text>
              {" "}{getActivityText(activity)}
            </Text>
            <Text style={styles.recentTime}>{formatTimeAgoCompact(activity.createdAt)}</Text>
          </View>
        )}
      />
      {items.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronUp size={14} color={colors.text.secondary} />
          ) : (
            <ChevronDown size={14} color={colors.text.secondary} />
          )}
          <Text style={styles.showMoreText}>
            {expanded ? "Show less" : `Show ${items.length - 3} more`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CommunityActivityFeedSection({
  items,
  isLoading,
  error,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  styles,
}: {
  items: FeedEventItem[];
  isLoading: boolean;
  error: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  styles: ActivityStyles;
}) {
  useTheme();
  const getFeedLine = (e: FeedEventItem) => {
    const name = e.display_name || e.username || "Someone";
    const meta = e.metadata || {};
    switch (e.event_type) {
      case "secured_day":
        return `${name} secured Day ${(meta.day_number as number) ?? "?"}`;
      case "lost_streak":
        return `${name} lost a ${(meta.previous_streak as number) ?? 0}-day streak`;
      case "unlocked_achievement":
        return `${name} unlocked ${(meta.achievement_label as string) ?? "badge"}`;
      case "completed_challenge":
        return `${name} completed ${(meta.challenge_name as string) ?? "challenge"}`;
      case "joined_challenge":
        return `${name} joined ${(meta.challenge_name as string) ?? "challenge"}`;
      case "last_stand":
        return `${name} secured in the final hours 🔥`;
      default:
        return `${name} did something`;
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.movementFeedSection}>
        <Text style={styles.movementFeedSectionTitle}>ACTIVITY</Text>
        <Text style={styles.onlyDisciplineShows}>{COPY.loading}</Text>
      </View>
    );
  }
  if (error && items.length === 0) {
    return (
      <View style={styles.movementFeedSection}>
        <Text style={styles.movementFeedSectionTitle}>ACTIVITY</Text>
        <Text style={styles.emptyLeaderboardText}>{COPY.couldNotLoadActivity}</Text>
      </View>
    );
  }
  if (items.length === 0) {
    return (
      <View style={styles.movementFeedSection}>
        <Text style={styles.movementFeedSectionTitle}>ACTIVITY</Text>
        <Text style={styles.onlyDisciplineShows}>No activity yet. Secure a day to appear here.</Text>
      </View>
    );
  }
  return (
    <View style={styles.movementFeedSection}>
      <Text style={styles.movementFeedSectionTitle}>ACTIVITY</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        renderItem={({ item: e }) => (
          <View style={styles.movementFeedItem}>
            <View style={styles.movementFeedAvatarWrap}>
              <Image
                source={{ uri: e.avatar_url || `https://i.pravatar.cc/150?u=${e.user_id}` }}
                style={styles.movementFeedAvatar}
                contentFit="cover"
              />
            </View>
            <View style={styles.movementFeedBody}>
              <Text style={styles.movementFeedDesc}>{getFeedLine(e)}</Text>
              <Text style={styles.movementFeedTime}>{formatTimeAgoCompact(e.created_at)}</Text>
            </View>
          </View>
        )}
      />
      {hasNextPage && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          activeOpacity={0.7}
        >
          <Text style={styles.showMoreText}>{isFetchingNextPage ? "Loading…" : "Load more"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function mapApiEntryToLeaderboardEntry(e: import("@/types").LeaderboardEntryFromApi): LeaderboardEntry {
  return {
    id: e.userId ?? "",
    userId: e.userId ?? "",
    username: e.username ?? "",
    displayName: e.displayName ?? e.username ?? "",
    avatar: e.avatarUrl ?? "",
    streak: Number(e.currentStreak) || 0,
    rank: Number(e.rank) || 0,
    secured: (Number(e.securedDaysThisWeek) || 0) > 0,
    score: Number(e.securedDaysThisWeek) || 0,
    respectCount: Number(e.respectCount) || 0,
  };
}

export default function ActivityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createActivityStyles(colors), [colors]);
  const { refetchAll, currentUser } = useApp();
  const { requireAuth } = useAuthGate();
  const currentUserId = currentUser?.id ?? null;
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("global");
  const [givingRespectId, setGivingRespectId] = useState<string | null>(null);
  const [givingNudgeId, setGivingNudgeId] = useState<string | null>(null);
  const [optimisticRespectDeltas, setOptimisticRespectDeltas] = useState<Record<string, number>>({});

  const leaderboardQuery = useQuery({
    queryKey: ["movement", "leaderboard", feedFilter],
    queryFn: async () => {
      const data = await trpcQuery("leaderboard.getWeekly") as { entries?: unknown[]; totalSecuredToday?: number };
      const entries = (data?.entries ?? []).map((e: unknown) => mapApiEntryToLeaderboardEntry(e as import("@/types").LeaderboardEntryFromApi));
      return { entries, totalSecuredToday: data?.totalSecuredToday ?? 0 };
    },
    staleTime: 60 * 1000, // 1 min
  });
  const leaderboard = leaderboardQuery.data ?? { entries: [], totalSecuredToday: 0 };
  const leaderboardLoading = leaderboardQuery.isLoading;
  const leaderboardError = leaderboardQuery.isError;

  const communityFeedQuery = useInfiniteQuery({
    queryKey: ["movement", "feed", "list", currentUserId],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const data = await trpcQuery(TRPC.feed.list, { limit: 20, cursor: pageParam }) as { items: FeedEventItem[]; nextCursor: string | null };
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!currentUserId,
    staleTime: 30 * 1000, // 30 sec — activity feed
  });
  const communityFeedItems = useMemo(
    () => (communityFeedQuery.data?.pages ?? []).flatMap((p) => p.items),
    [communityFeedQuery.data?.pages]
  );

  const activityFeedQuery = useQuery({
    queryKey: ["movement", "activityFeed", currentUserId],
    queryFn: async (): Promise<ActivityItem[]> => {
      const [respectsData, nudgesData] = await Promise.all([
        trpcQuery("respects.getForUser") as Promise<{ recent: { id: string; actorId: string; actorDisplayName: string; actorUsername: string; at: string }[] }>,
        trpcQuery("nudges.getForUser") as Promise<{ items: { id: string; fromUserId: string; fromDisplayName: string; message: string; createdAt: string }[] }>,
      ]);
      const respectItems: ActivityItem[] = (respectsData?.recent ?? []).map((r) => ({
        id: r.id,
        type: "respect" as const,
        actorId: r.actorId,
        actorUsername: r.actorUsername ?? "?",
        actorDisplayName: r.actorDisplayName ?? "?",
        createdAt: r.at,
        read: false,
      }));
      const nudgeItems: ActivityItem[] = (nudgesData?.items ?? []).map((n) => ({
        id: n.id,
        type: "nudge" as const,
        actorId: n.fromUserId,
        actorUsername: n.fromDisplayName,
        actorDisplayName: n.fromDisplayName,
        createdAt: n.createdAt,
        read: false,
        message: n.message,
      }));
      return [...respectItems, ...nudgeItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUserId,
  });
  const activityItems = activityFeedQuery.data ?? [];
  const activityFeedError = activityFeedQuery.isError;

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await leaderboardQuery.refetch();
    await activityFeedQuery.refetch();
    await communityFeedQuery.refetch();
  }, [refetchAll, leaderboardQuery, activityFeedQuery, communityFeedQuery]);

  const isRefetching = leaderboardQuery.isRefetching || activityFeedQuery.isRefetching || communityFeedQuery.isRefetching;

  const handleGiveRespect = useCallback(
    (recipientId: string) => {
      requireAuth("respect", async () => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setOptimisticRespectDeltas((prev) => ({ ...prev, [recipientId]: (prev[recipientId] ?? 0) + 1 }));
        setGivingRespectId(recipientId);
        try {
          await trpcMutate("respects.give", { recipientId });
          track({ name: "respect_sent", toUserId: recipientId });
          Alert.alert("Sent!", "");
          await leaderboardQuery.refetch();
          setOptimisticRespectDeltas((prev) => {
            const next = { ...prev };
            delete next[recipientId];
            return next;
          });
        } catch (e: unknown) {
          setOptimisticRespectDeltas((prev) => {
            const next = { ...prev };
            delete next[recipientId];
            return next;
          });
          Alert.alert("Error", e instanceof Error ? e.message : "Could not send respect.");
        } finally {
          setGivingRespectId(null);
        }
      });
    },
    [requireAuth, leaderboardQuery]
  );

  const handleGiveNudge = useCallback(
    (toUserId: string) => {
      requireAuth("nudge", () => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setGivingNudgeId(toUserId);
        void trpcMutate("nudges.send", { toUserId })
          .then(() => {
            track({ name: "nudge_sent", toUserId });
            Alert.alert("Nudged!", "");
            return activityFeedQuery.refetch();
          })
          .catch((e: unknown) => {
            const err = e as { data?: { code?: string }; code?: string; message?: string };
            const code = err?.data?.code ?? err?.code;
            const msg = err?.message ?? "";
            if (code === "TOO_MANY_REQUESTS" || msg.includes("already nudged")) {
              Alert.alert("Limit", "You already nudged them today.");
            } else {
              Alert.alert("Error", msg || "Could not send nudge.");
            }
          })
          .finally(() => {
            setGivingNudgeId(null);
          });
      });
    },
    [requireAuth, activityFeedQuery]
  );

  const router = useRouter();
  const handleTeamsPress = useCallback(() => {
    requireAuth("team", () => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (FLAGS.IS_BETA) {
        Alert.alert("Teams", "Teams and accountability groups are coming soon.");
      } else {
        router.push(ROUTES.TEAMS as never);
      }
    });
  }, [requireAuth, router]);

  const entriesWithOptimisticRespect = useMemo(
    () =>
      leaderboard.entries.map((e) => ({
        ...e,
        respectCount: e.respectCount + (optimisticRespectDeltas[e.userId] ?? 0),
      })),
    [leaderboard.entries, optimisticRespectDeltas]
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Movement</Text>
            <Text style={styles.subtitle}>Proof of discipline</Text>
          </View>
          <TouchableOpacity style={styles.teamsButton} onPress={handleTeamsPress} activeOpacity={0.8} accessibilityLabel="Open teams" accessibilityRole="button">
          <Users size={16} color={colors.text.secondary} />
          <Text style={styles.teamsButtonText}>Teams</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, feedFilter === "global" && styles.filterPillActive]}
          onPress={() => setFeedFilter("global")}
          accessibilityLabel="Show global activity"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Globe size={14} color={feedFilter === "global" ? DS_COLORS.white : colors.text.secondary} />
          <Text style={[styles.filterPillText, feedFilter === "global" && styles.filterPillTextActive]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, feedFilter === "friends" && styles.filterPillActive]}
          onPress={() => setFeedFilter("friends")}
          accessibilityLabel="Show friends activity"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Users size={14} color={feedFilter === "friends" ? DS_COLORS.white : colors.text.secondary} />
          <Text style={[styles.filterPillText, feedFilter === "friends" && styles.filterPillTextActive]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, styles.filterPillDisabled]}
          onPress={() => Alert.alert("Coming in the next update", "Team filter will show your team leaderboard.")}
          accessibilityLabel="Show team activity"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Users size={14} color={colors.text.muted} />
          <Text style={styles.filterPillTextDisabled}>Team</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <View style={styles.dailyStatsWrap}>
          <DailyStatsCard securedToday={leaderboard.totalSecuredToday} styles={styles} />
        </View>
        {feedFilter === "friends" && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <SuggestedFollows
              title="Find people to follow"
              users={leaderboard.entries.map((e) => ({
                userId: e.userId,
                username: e.username,
                displayName: e.displayName,
                avatarUrl: e.avatar || null,
                currentStreak: e.streak,
                securedDaysThisWeek: e.score,
              }))}
              currentUserId={currentUserId}
              onUserPress={(u) => router.push(ROUTES.PROFILE_USERNAME(u.username) as never)}
            />
          </View>
        )}
        <View style={styles.topThisWeekSection}>
          <View style={styles.sectionHeaderRow}>
            <TrendingUp size={16} color={colors.accent} />
            <Text style={styles.weeklyLeaderboardTitle}>Top This Week</Text>
          </View>
          {leaderboardLoading ? (
            <Text style={styles.emptyLeaderboardText}>{COPY.loading}</Text>
          ) : leaderboardError ? (
            <Text style={styles.emptyLeaderboardText}>{COPY.couldNotLoad} {COPY.pullToRetry}</Text>
          ) : leaderboard.entries.length === 0 ? (
            <Text style={styles.emptyLeaderboardText}>{COPY.beFirstThisWeek}</Text>
          ) : (
            <TopThisWeekRow entries={leaderboard.entries} styles={styles} />
          )}
        </View>
        {leaderboardLoading ? (
          <View style={styles.leaderboardSection}>
            <View style={styles.weeklyLeaderboardHeader}>
              <View style={styles.sectionHeaderRow}>
                <Trophy size={16} color={DS_COLORS.milestoneGold} />
                <Text style={styles.weeklyLeaderboardTitle}>Weekly Leaderboard</Text>
              </View>
              <Text style={styles.resetsSunday}>Resets Sunday</Text>
            </View>
            <Text style={styles.emptyLeaderboardText}>{COPY.loading}</Text>
          </View>
        ) : leaderboardError ? (
          <View style={styles.leaderboardSection}>
            <View style={styles.weeklyLeaderboardHeader}>
              <View style={styles.sectionHeaderRow}>
                <Trophy size={16} color={DS_COLORS.milestoneGold} />
                <Text style={styles.weeklyLeaderboardTitle}>Weekly Leaderboard</Text>
              </View>
              <Text style={styles.resetsSunday}>Resets Sunday</Text>
            </View>
            <Text style={styles.emptyLeaderboardText}>{COPY.couldNotLoad} {COPY.pullToRetry}</Text>
          </View>
        ) : leaderboard.entries.length === 0 ? (
          <View style={styles.leaderboardSection}>
            <View style={styles.weeklyLeaderboardHeader}>
              <View style={styles.sectionHeaderRow}>
                <Trophy size={16} color={DS_COLORS.milestoneGold} />
                <Text style={styles.weeklyLeaderboardTitle}>Weekly Leaderboard</Text>
              </View>
              <Text style={styles.resetsSunday}>Resets Sunday</Text>
            </View>
            <Text style={styles.emptyLeaderboardText}>{COPY.beFirstThisWeek}</Text>
          </View>
        ) : (
          <LeaderboardSection entries={leaderboard.entries} styles={styles} />
        )}
        <MovementFeedSection
          entries={entriesWithOptimisticRespect}
          currentUserId={currentUserId}
          onGiveRespect={handleGiveRespect}
          givingRespectId={givingRespectId}
          onGiveNudge={handleGiveNudge}
          givingNudgeId={givingNudgeId}
          styles={styles}
        />
        <CommunityActivityFeedSection
          items={communityFeedItems}
          isLoading={communityFeedQuery.isLoading}
          error={communityFeedQuery.isError}
          hasNextPage={communityFeedQuery.hasNextPage}
          fetchNextPage={communityFeedQuery.fetchNextPage}
          isFetchingNextPage={communityFeedQuery.isFetchingNextPage}
          styles={styles}
        />
        <RecentActivitySection items={activityItems} error={activityFeedError} styles={styles} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
    </ErrorBoundary>
  );
}


