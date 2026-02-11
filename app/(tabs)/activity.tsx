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
} from "lucide-react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { mockUsers } from "@/mocks/data";

type ActivityType = "respect" | "follow" | "streak_milestone" | "day_secured" | "challenge_joined";

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

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  streak: number;
  rank: number;
  secured: boolean;
}

const WEEK_STATS = {
  consistencyScore: 86,
  respectEarned: 12,
  daysSecured: 6,
  totalDays: 7,
};

const mockLeaderboard: LeaderboardEntry[] = [
  { id: "user3", username: "sam_rivers", displayName: "Sam", avatar: "https://i.pravatar.cc/150?img=3", streak: 60, rank: 1, secured: true },
  { id: "user2", username: "jordan_lee", displayName: "Jordan", avatar: "https://i.pravatar.cc/150?img=2", streak: 45, rank: 2, secured: true },
  { id: "user1", username: "alex_martinez", displayName: "You", avatar: "https://i.pravatar.cc/150?img=1", streak: 14, rank: 3, secured: true },
  { id: "user4", username: "taylor_chen", displayName: "Taylor", avatar: "https://i.pravatar.cc/150?img=4", streak: 12, rank: 4, secured: false },
  { id: "user5", username: "maya_patel", displayName: "Maya", avatar: "https://i.pravatar.cc/150?img=5", streak: 3, rank: 5, secured: true },
];

const mockMilestones: MilestoneItem[] = [
  {
    id: "m1",
    icon: "flame",
    actorUsername: "sam_rivers",
    actorDisplayName: "Sam",
    actorId: "user3",
    text: "locked in Day 60. Respect.",
    badge: "MILESTONE",
    dayNumber: 60,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m2",
    icon: "trophy",
    actorUsername: "jordan_lee",
    actorDisplayName: "Jordan",
    actorId: "user2",
    text: "reached Day 30. Keep going.",
    badge: "MILESTONE",
    dayNumber: 30,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "m3",
    icon: "flag",
    actorUsername: "alex_martinez",
    actorDisplayName: "You",
    actorId: "user1",
    text: "secured 6 days this week.",
    badge: "STREAK",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const mockRecentActivity: ActivityItem[] = [
  { id: "r1", type: "respect", actorId: "user3", actorUsername: "sam_rivers", actorDisplayName: "Sam", targetTitle: "Day 14", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false },
  { id: "r2", type: "day_secured", actorId: "user2", actorUsername: "jordan_lee", actorDisplayName: "Jordan", targetTitle: "Morning Warrior", dayNumber: 45, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false },
  { id: "r3", type: "follow", actorId: "user4", actorUsername: "taylor_chen", actorDisplayName: "Taylor", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), read: true },
  { id: "r4", type: "challenge_joined", actorId: "user5", actorUsername: "maya_patel", actorDisplayName: "Maya", targetTitle: "30 Day Mindful", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), read: true },
  { id: "r5", type: "streak_milestone", actorId: "user3", actorUsername: "sam_rivers", actorDisplayName: "Sam", dayNumber: 60, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
];

function ConsistencyCard({ stats }: { stats: typeof WEEK_STATS }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: stats.consistencyScore / 100,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stats.consistencyScore, progressAnim, fadeAnim]);

  const scoreColor = stats.consistencyScore >= 70 ? Colors.streak.shield : stats.consistencyScore >= 40 ? Colors.accent : "#DC2626";
  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.consistencyCard, { opacity: fadeAnim }]}>
      <View style={styles.consistencyTop}>
        <View>
          <Text style={styles.consistencyLabel}>This week</Text>
          <Text style={[styles.consistencyScore, { color: scoreColor }]}>
            {stats.consistencyScore}%
          </Text>
        </View>
        <View style={styles.consistencyMini}>
          <View style={styles.miniStat}>
            <Shield size={14} color={Colors.streak.shield} />
            <Text style={styles.miniStatValue}>{stats.daysSecured}/{stats.totalDays}</Text>
          </View>
          <View style={styles.miniStat}>
            <Star size={14} color={Colors.accent} />
            <Text style={styles.miniStatValue}>+{stats.respectEarned}</Text>
          </View>
        </View>
      </View>

      <View style={styles.consistencyBarTrack}>
        <Animated.View
          style={[styles.consistencyBarFill, { width: barWidth, backgroundColor: scoreColor }]}
        />
      </View>
    </Animated.View>
  );
}

function LeaderboardSection({ entries }: { entries: LeaderboardEntry[] }) {
  const getRankIcon = useCallback((rank: number) => {
    if (rank === 1) return <Crown size={14} color={Colors.milestone.gold} fill={Colors.milestone.gold} />;
    if (rank === 2) return <Crown size={14} color={Colors.milestone.silver} />;
    if (rank === 3) return <Crown size={14} color={Colors.milestone.bronze} />;
    return null;
  }, []);

  return (
    <View style={styles.leaderboardSection}>
      <View style={styles.sectionHeaderRow}>
        <Trophy size={15} color={Colors.milestone.gold} />
        <Text style={styles.sectionTitle}>Consistency Ranking</Text>
      </View>
      {entries.map((entry, i) => {
        const isYou = entry.displayName === "You";
        return (
          <View key={entry.id} style={[styles.leaderboardRow, isYou && styles.leaderboardRowYou]}>
            <View style={styles.rankColumn}>
              {getRankIcon(entry.rank) || (
                <Text style={styles.rankNumber}>{entry.rank}</Text>
              )}
            </View>
            <Image
              source={{ uri: entry.avatar }}
              style={styles.leaderboardAvatar}
              contentFit="cover"
            />
            <View style={styles.leaderboardInfo}>
              <Text style={[styles.leaderboardName, isYou && styles.leaderboardNameYou]}>
                {entry.displayName}
              </Text>
              <View style={styles.leaderboardMeta}>
                <Flame size={11} color={Colors.streak.fire} />
                <Text style={styles.leaderboardStreak}>{entry.streak}d</Text>
              </View>
            </View>
            {entry.secured ? (
              <View style={styles.securedPill}>
                <Shield size={10} color={Colors.streak.shield} fill={Colors.streak.shield} />
                <Text style={styles.securedPillText}>Secured</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <Text style={styles.pendingPillText}>Pending</Text>
              </View>
            )}
          </View>
        );
      })}
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

  const getUserAvatar = (actorId: string) => {
    const user = mockUsers.find((u) => u.id === actorId);
    return user?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
  };

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

function RecentActivitySection({ items }: { items: ActivityItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, 3);

  const formatTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "follow": return "started following you";
      case "challenge_joined": return `joined ${activity.targetTitle}`;
      case "respect": return `respected your ${activity.targetTitle}`;
      case "day_secured": return `secured Day ${activity.dayNumber}`;
      case "streak_milestone": return `reached Day ${activity.dayNumber} 🔥`;
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
      default: return null;
    }
  };

  const getUserAvatar = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
  };

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
          <Text style={styles.recentTime}>{formatTimeAgo(activity.createdAt)}</Text>
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

export default function ActivityScreen() {
  useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const unreadCount = useMemo(
    () => mockRecentActivity.filter((a) => !a.read).length,
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        <ConsistencyCard stats={WEEK_STATS} />
        <LeaderboardSection entries={mockLeaderboard} />
        <MilestoneSection items={mockMilestones} />
        <RecentActivitySection items={mockRecentActivity} />
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
