import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
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
  Flag,
  Heart,
  TrendingUp,
  Shield,
  Crown,
  Zap,
  Globe,
  ThumbsUp,
  Send,
  AlertTriangle,
  HandMetal,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuthGate } from "@/contexts/AuthGateContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { formatTimeAgoCompact } from "@/lib/formatTimeAgo";
import { track } from "@/lib/analytics";
import Colors from "@/constants/colors";

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

interface MilestoneItem {
  id: string;
  icon: "flame" | "trophy" | "flag";
  actorUsername: string;
  actorDisplayName: string;
  actorId: string;
  text: string;
  badge: string;
  dayNumber?: number;
  createdAt: string;
}

type FeedFilter = "global" | "friends" | "team";

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

function DailyStatsCard({ securedToday }: { securedToday: number }) {
  return (
    <View style={styles.dailyStatsCard}>
      <View style={styles.dailyStatRow}>
        <Shield size={18} color={Colors.streak.shield} />
        <Text style={styles.dailyStatValue}>{securedToday}</Text>
        <Text style={styles.dailyStatLabel}>secured today</Text>
      </View>
    </View>
  );
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  Elite: { bg: "rgba(212,160,23,0.2)", text: "#B8860B" },
  Relentless: { bg: "rgba(232,125,79,0.2)", text: Colors.accent },
  Builder: { bg: "rgba(46,125,74,0.15)", text: Colors.streak.shield },
  Initiate: { bg: "rgba(107,114,128,0.2)", text: Colors.text.tertiary },
};

function TopThisWeekRow({ entries }: { entries: LeaderboardEntry[] }) {
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
            <Zap size={12} color={Colors.accent} />
            <Text style={styles.topThisWeekScore}>+{entry.score}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function LeaderboardSection({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const rankCircleColor = (rank: number) => (rank === 1 ? "#D4A017" : rank === 2 ? "#9CA3AF" : Colors.accent);

  return (
    <View style={styles.leaderboardSection}>
      <View style={styles.weeklyLeaderboardHeader}>
        <View style={styles.sectionHeaderRow}>
          <Trophy size={16} color="#D4A017" />
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
              <View style={[styles.topThreeBadge, { backgroundColor: BADGE_STYLES[entry.badge]?.bg || Colors.pill }]}>
                {entry.rank === 1 && <Crown size={10} color="#B8860B" />}
                <Text style={[styles.topThreeBadgeText, { color: BADGE_STYLES[entry.badge]?.text || Colors.text.secondary }]}>{entry.badge}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      {rest.map((entry) => (
        <View key={entry.id} style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRankNum}>#{entry.rank}</Text>
          <Image source={{ uri: entry.avatar || `https://i.pravatar.cc/150?u=${entry.userId}` }} style={styles.leaderboardAvatar} contentFit="cover" />
          <View style={styles.leaderboardInfo}>
            <View style={styles.leaderboardNameRow}>
              <Text style={styles.leaderboardName} numberOfLines={1}>{entry.displayName || entry.username}</Text>
              {entry.secured && <Shield size={12} color={Colors.streak.shield} style={{ marginLeft: 4 }} />}
            </View>
            <View style={styles.leaderboardMeta}>
              <Flame size={11} color={Colors.accent} />
              <Text style={styles.leaderboardStreak}>{entry.streak}d</Text>
            </View>
          </View>
          <Text style={styles.leaderboardScoreRight}>+{entry.score}</Text>
        </View>
      ))}
    </View>
  );
}

function MilestoneSection({ items }: { items: MilestoneItem[] }) {
  const scaleAnims = useRef(items.map(() => new Animated.Value(1))).current;

  const handlePress = useCallback((index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (scaleAnims[index]) {
      Animated.sequence([
        Animated.timing(scaleAnims[index], { toValue: 1.02, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [scaleAnims]);

  if (items.length === 0) return null;

  const getIcon = (type: MilestoneItem["icon"]) => {
    switch (type) {
      case "flame": return <Flame size={16} color={Colors.streak.fire} fill={Colors.streak.fire} />;
      case "trophy": return <Trophy size={16} color={Colors.milestone.gold} />;
      case "flag": return <Flag size={16} color={Colors.streak.shield} />;
    }
  };

  const getUserAvatar = (actorId: string) => `https://i.pravatar.cc/150?u=${actorId}`;

  return (
    <View style={styles.milestoneSection}>
      <View style={styles.sectionHeaderRow}>
        <Zap size={15} color={Colors.accent} />
        <Text style={styles.sectionTitle}>Milestones</Text>
      </View>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          onPress={() => handlePress(index)}
        >
          <Animated.View style={[styles.milestoneCard, { transform: [{ scale: scaleAnims[index] }] }]}>
            <View style={styles.milestoneLeft}>
              <Image
                source={{ uri: getUserAvatar(item.actorId) }}
                style={styles.milestoneAvatar}
                contentFit="cover"
              />
              <View style={styles.milestoneIconBadge}>
                {getIcon(item.icon)}
              </View>
            </View>
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneText}>
                <Text style={styles.milestoneName}>{item.actorDisplayName}</Text>
                {" "}{item.text}
              </Text>
              <View style={[styles.milestoneBadge, { backgroundColor: item.badge === "STREAK" ? Colors.streak.shield + "14" : Colors.accent + "14" }]}>
                <Text style={[styles.milestoneBadgeText, { color: item.badge === "STREAK" ? Colors.streak.shield : Colors.accent }]}>
                  {item.badge}
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      ))}
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
}: {
  entries: LeaderboardEntry[];
  currentUserId: string | null;
  onGiveRespect: (userId: string) => Promise<void>;
  givingRespectId: string | null;
  onGiveNudge: (userId: string) => void;
  givingNudgeId: string | null;
}) {
  return (
    <View style={styles.movementFeedSection}>
      <Text style={styles.movementFeedSectionTitle}>THIS WEEK</Text>
      {entries.length === 0 ? (
        <Text style={styles.onlyDisciplineShows}>Be the first this week.</Text>
      ) : (
        <>
          {entries.map((entry) => {
            const badge = entry.badge && BADGE_STYLES[entry.badge];
            const isSelf = currentUserId != null && entry.userId === currentUserId;
            return (
              <View key={entry.id} style={styles.movementFeedItem}>
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
                    <Flame size={11} color={Colors.accent} />
                    <Text style={styles.movementFeedTime}>#{entry.rank}</Text>
                  </View>
                </View>
                <View style={styles.movementFeedActions}>
                  <TouchableOpacity
                    style={styles.movementFeedRespect}
                    onPress={() => onGiveRespect(entry.userId)}
                    disabled={givingRespectId === entry.userId}
                    activeOpacity={0.7}
                  >
                    <ThumbsUp size={14} color={Colors.text.tertiary} />
                    <Text style={styles.movementFeedRespectCount}>{entry.respectCount}</Text>
                  </TouchableOpacity>
                  {!isSelf && (
                    <TouchableOpacity
                      style={styles.movementFeedNudge}
                      onPress={() => onGiveNudge(entry.userId)}
                      disabled={givingNudgeId === entry.userId}
                      activeOpacity={0.7}
                    >
                      <HandMetal size={14} color={Colors.text.tertiary} />
                      <Text style={styles.movementFeedNudgeText}>Nudge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          <Text style={styles.onlyDisciplineShows}>Only discipline shows here.</Text>
        </>
      )}
    </View>
  );
}

function RecentActivitySection({ items }: { items: ActivityItem[] }) {
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
      case "follow": return <UserPlus size={12} color={Colors.text.tertiary} />;
      case "challenge_joined": return <Users size={12} color={Colors.text.tertiary} />;
      case "respect": return <Star size={12} color={Colors.accent} fill={Colors.accent} />;
      case "day_secured": return <Shield size={12} color={Colors.streak.shield} />;
      case "streak_milestone": return <Flame size={12} color={Colors.streak.fire} />;
      case "nudge": return <HandMetal size={12} color={Colors.accent} />;
      default: return null;
    }
  };

  const getUserAvatar = (userId: string) => `https://i.pravatar.cc/150?u=${userId}`;

  if (items.length === 0) return null;

  return (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeaderRow}>
        <TrendingUp size={15} color={Colors.text.secondary} />
        <Text style={styles.sectionTitle}>Recent</Text>
      </View>
      {visibleItems.map((activity) => (
        <View
          key={activity.id}
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
      ))}
      {items.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronUp size={14} color={Colors.text.secondary} />
          ) : (
            <ChevronDown size={14} color={Colors.text.secondary} />
          )}
          <Text style={styles.showMoreText}>
            {expanded ? "Show less" : `Show ${items.length - 3} more`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function mapApiEntryToLeaderboardEntry(e: any): LeaderboardEntry {
  return {
    id: e.userId,
    userId: e.userId,
    username: e.username,
    displayName: e.displayName || e.username,
    avatar: e.avatarUrl || "",
    streak: e.currentStreak ?? 0,
    rank: e.rank ?? 0,
    secured: (e.securedDaysThisWeek ?? 0) > 0,
    score: e.securedDaysThisWeek ?? 0,
    respectCount: e.respectCount ?? 0,
  };
}

export default function ActivityScreen() {
  const { refetchAll, currentUser } = useApp();
  const currentUserId = currentUser?.id ?? null;
  const [refreshing, setRefreshing] = useState(false);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("global");
  const [leaderboard, setLeaderboard] = useState<{ entries: LeaderboardEntry[]; totalSecuredToday: number }>({ entries: [], totalSecuredToday: 0 });
  const [givingRespectId, setGivingRespectId] = useState<string | null>(null);
  const [givingNudgeId, setGivingNudgeId] = useState<string | null>(null);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await trpcQuery("leaderboard.getWeekly") as any;
      const entries = (data?.entries ?? []).map(mapApiEntryToLeaderboardEntry);
      setLeaderboard({
        entries,
        totalSecuredToday: data?.totalSecuredToday ?? 0,
      });
    } catch {
      setLeaderboard({ entries: [], totalSecuredToday: 0 });
    }
  }, []);

  const fetchActivityFeed = useCallback(async () => {
    if (!currentUserId) {
      setActivityItems([]);
      return;
    }
    try {
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
      const merged = [...respectItems, ...nudgeItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivityItems(merged);
    } catch {
      setActivityItems([]);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchActivityFeed();
  }, [fetchActivityFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    await fetchLeaderboard();
    await fetchActivityFeed();
    setRefreshing(false);
  }, [refetchAll, fetchLeaderboard, fetchActivityFeed]);

  const handleGiveRespect = useCallback(
    (recipientId: string) => {
      requireAuth("respect", async () => {
        setGivingRespectId(recipientId);
        try {
          await trpcMutate("respects.give", { recipientId });
          track({ name: "respect_sent", toUserId: recipientId });
          await fetchLeaderboard();
        } catch (e: any) {
          Alert.alert("Error", e?.message ?? "Could not send respect.");
        } finally {
          setGivingRespectId(null);
        }
      });
    },
    [requireAuth, fetchLeaderboard]
  );

  const { requireAuth } = useAuthGate();
  const handleGiveNudge = useCallback(
    (toUserId: string) => {
      requireAuth("nudge", () => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setGivingNudgeId(toUserId);
        trpcMutate("nudges.send", { toUserId })
          .then(() => {
            track({ name: "nudge_sent", toUserId });
            Alert.alert("Nudged!", "");
            return fetchActivityFeed();
          })
          .catch((e: any) => {
            const code = e?.data?.code ?? e?.code;
            const msg = e?.message ?? "";
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
    [requireAuth, fetchActivityFeed]
  );

  const handleTeamsPress = useCallback(() => {
    requireAuth("team", () => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Teams", "Teams and accountability groups are coming soon.");
    });
  }, [requireAuth]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Movement</Text>
          <Text style={styles.subtitle}>Proof of discipline</Text>
        </View>
        <TouchableOpacity style={styles.teamsButton} onPress={handleTeamsPress} activeOpacity={0.8}>
          <Users size={16} color={Colors.text.secondary} />
          <Text style={styles.teamsButtonText}>Teams</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, feedFilter === "global" && styles.filterPillActive]}
          onPress={() => setFeedFilter("global")}
          activeOpacity={0.8}
        >
          <Globe size={14} color={feedFilter === "global" ? "#fff" : Colors.text.secondary} />
          <Text style={[styles.filterPillText, feedFilter === "global" && styles.filterPillTextActive]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, feedFilter === "friends" && styles.filterPillActive]}
          onPress={() => setFeedFilter("friends")}
          activeOpacity={0.8}
        >
          <Users size={14} color={feedFilter === "friends" ? "#fff" : Colors.text.secondary} />
          <Text style={[styles.filterPillText, feedFilter === "friends" && styles.filterPillTextActive]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, feedFilter === "team" && styles.filterPillActive]}
          onPress={() => setFeedFilter("team")}
          activeOpacity={0.8}
        >
          <Users size={14} color={feedFilter === "team" ? "#fff" : Colors.text.secondary} />
          <Text style={[styles.filterPillText, feedFilter === "team" && styles.filterPillTextActive]}>Team</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        <View style={styles.dailyStatsWrap}>
          <DailyStatsCard securedToday={leaderboard.totalSecuredToday} />
        </View>
        <View style={styles.topThisWeekSection}>
          <View style={styles.sectionHeaderRow}>
            <TrendingUp size={16} color={Colors.accent} />
            <Text style={styles.weeklyLeaderboardTitle}>Top This Week</Text>
          </View>
          {leaderboard.entries.length === 0 ? (
            <Text style={styles.emptyLeaderboardText}>Be the first this week.</Text>
          ) : (
            <TopThisWeekRow entries={leaderboard.entries} />
          )}
        </View>
        {leaderboard.entries.length === 0 ? (
          <View style={styles.leaderboardSection}>
            <View style={styles.weeklyLeaderboardHeader}>
              <View style={styles.sectionHeaderRow}>
                <Trophy size={16} color="#D4A017" />
                <Text style={styles.weeklyLeaderboardTitle}>Weekly Leaderboard</Text>
              </View>
              <Text style={styles.resetsSunday}>Resets Sunday</Text>
            </View>
            <Text style={styles.emptyLeaderboardText}>Be the first this week.</Text>
          </View>
        ) : (
          <LeaderboardSection entries={leaderboard.entries} />
        )}
        <MovementFeedSection
          entries={leaderboard.entries}
          currentUserId={currentUserId}
          onGiveRespect={handleGiveRespect}
          givingRespectId={givingRespectId}
          onGiveNudge={handleGiveNudge}
          givingNudgeId={givingNudgeId}
        />
        <RecentActivitySection items={activityItems} />
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  teamsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.pill,
    marginLeft: "auto",
  },
  teamsButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.pill,
  },
  filterPillActive: {
    backgroundColor: Colors.text.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  filterPillTextActive: {
    color: "#fff",
  },
  dailyStatsWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dailyStatsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dailyStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyStatValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  dailyStatLabel: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: Colors.text.primary,
  },
  topThisWeekSection: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  topThisWeekScroll: {
    paddingHorizontal: 0,
    gap: 14,
    paddingBottom: 8,
  },
  topThisWeekItem: {
    alignItems: "center",
    width: 80,
  },
  topThisWeekAvatarWrap: {
    position: "relative",
    marginBottom: 6,
  },
  topThisWeekAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  topThisWeekRankBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.text.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  topThisWeekRankBadgeGold: {
    backgroundColor: "#D4A853",
  },
  topThisWeekRankText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: "#fff",
  },
  topThisWeekName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  topThisWeekScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topThisWeekScore: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  weeklyLeaderboardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  weeklyLeaderboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resetsSunday: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.text.tertiary,
  },
  topThreeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  topThreeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topThreeCardFirst: {
    backgroundColor: "#FDF8E8",
    borderColor: "#E8D9A0",
  },
  topThreeRankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  topThreeRankText: {
    fontSize: 14,
    fontWeight: "800" as const,
  },
  topThreeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 6,
  },
  topThreeName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  topThreeScore: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  topThreeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topThreeBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  leaderboardRankNum: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    width: 28,
  },
  leaderboardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leaderboardScoreRight: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  movementFeedSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  movementFeedSectionTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  movementFeedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  movementFeedAvatarWrap: {
    marginRight: 12,
  },
  movementFeedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.streak.shield,
  },
  movementFeedBody: {
    flex: 1,
  },
  movementFeedNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  movementFeedName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  movementFeedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  movementFeedBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  movementFeedDesc: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  movementFeedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  movementFeedTime: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.text.tertiary,
  },
  movementFeedActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 10,
  },
  movementFeedRespect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  movementFeedRespectCount: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
  },
  movementFeedNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  movementFeedNudgeText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
  },
  emptyLeaderboardText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  onlyDisciplineShows: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: Colors.text.tertiary,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },

  consistencyCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  consistencyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  consistencyLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  consistencyScore: {
    fontSize: 36,
    fontWeight: "900" as const,
    letterSpacing: -1,
  },
  consistencyMini: {
    gap: 8,
    alignItems: "flex-end",
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  consistencyBarTrack: {
    height: 5,
    backgroundColor: Colors.pill,
    borderRadius: 3,
    overflow: "hidden",
  },
  consistencyBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  leaderboardSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardRowYou: {
    borderColor: Colors.accent + "40",
    backgroundColor: Colors.accentTint,
  },
  rankColumn: {
    width: 28,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text.tertiary,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  leaderboardNameYou: {
    fontWeight: "800" as const,
    color: Colors.accent,
  },
  leaderboardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  leaderboardStreak: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
  },
  securedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.streak.shield + "14",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  securedPillText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.streak.shield,
  },
  pendingPill: {
    backgroundColor: Colors.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.text.muted,
  },

  milestoneSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  milestoneLeft: {
    position: "relative",
    marginRight: 12,
  },
  milestoneAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  milestoneIconBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 6,
  },
  milestoneName: {
    fontWeight: "700" as const,
  },
  milestoneBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  milestoneBadgeText: {
    fontSize: 9,
    fontWeight: "800" as const,
    letterSpacing: 0.8,
  },

  recentSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  recentItemUnread: {
    backgroundColor: Colors.accentTint,
  },
  recentIconWrap: {
    width: 22,
    alignItems: "center",
    marginRight: 6,
  },
  recentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  recentText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  recentName: {
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  recentTime: {
    fontSize: 11,
    color: Colors.text.muted,
    marginLeft: 6,
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
