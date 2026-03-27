import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";
import {
  ProfileHeader,
  DisciplineScoreCard,
  TierProgressBar,
  LifetimeStatsCard,
  DisciplineCalendar,
  DisciplineGrowthCard,
  AchievementsSection,
} from "@/components/profile";
import type { AchievementItem } from "@/components/profile";
import { formatMonthYearLong } from "@/lib/date-format";

type PublicProfile = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  total_days_secured: number;
  tier: string;
  active_streak: number;
  bio: string | null;
  created_at: string | null;
  profile_visibility: string;
};

/**
 * Deep link: /profile/[username]
 * Shows public profile for the given username.
 */
export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { colors } = useTheme();

  const decoded = useMemo(() => {
    const raw = typeof username === "string" ? username : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [username]);

  const profileQuery = useQuery({
    queryKey: ["publicProfile", decoded],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getPublicByUsername, { username: decoded }) as Promise<PublicProfile | null>,
    enabled: !!decoded,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const profile = profileQuery.data ?? null;
  const isLoading = profileQuery.isPending;
  const isError = profileQuery.isError;

  const followCountsQuery = useQuery({
    queryKey: ["publicProfile", profile?.user_id ?? "", "followCounts"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts, { userId: profile!.user_id }) as Promise<{
        followers: number;
        following: number;
      }>,
    enabled: !!profile?.user_id && !!user?.id,
    staleTime: 60 * 1000,
  });

  const isFollowingQuery = useQuery({
    queryKey: ["isFollowing", profile?.user_id ?? ""],
    queryFn: () =>
      trpcQuery(TRPC.profiles.isFollowing, { userId: profile!.user_id }) as Promise<{ isFollowing: boolean }>,
    enabled: !!profile?.user_id && !!user?.id,
    staleTime: 60 * 1000,
  });

  const [followLoading, setFollowLoading] = useState(false);
  const isFollowing = isFollowingQuery.data?.isFollowing ?? false;

  const handleFollow = useCallback(async () => {
    if (!profile?.user_id || followLoading) return;
    if (!user?.id) {
      router.push(ROUTES.AUTH_LOGIN as never);
      return;
    }
    setFollowLoading(true);
    try {
      await trpcMutate(TRPC.profiles.followUser, { userId: profile.user_id });
      await queryClient.invalidateQueries({ queryKey: ["isFollowing", profile.user_id] });
      await queryClient.invalidateQueries({ queryKey: ["publicProfile", profile.user_id, "followCounts"] });
      await queryClient.invalidateQueries({ queryKey: ["publicProfile", decoded] });
    } catch (err) {
      console.error("[PublicProfile] Follow failed:", err);
    } finally {
      setFollowLoading(false);
    }
  }, [profile?.user_id, followLoading, queryClient, decoded, user?.id, router]);

  if (!decoded) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              style={styles.backBtn}
              hitSlop={12}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={[styles.centered, { flex: 1 }]}>
            <Text style={[styles.text, { color: colors.text.secondary }]}>Invalid profile link</Text>
          </View>
        </View>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            Couldn&apos;t load this profile. Check your connection, confirm the username, and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => void profileQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              style={styles.backBtn}
              hitSlop={12}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={[styles.centered, { flex: 1 }]}>
            <Text style={[styles.text, { color: colors.text.secondary }]}>@{decoded} not found</Text>
          </View>
        </View>
      </>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;
  if (isOwnProfile) {
    router.replace(ROUTES.TABS_PROFILE as never);
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isPrivate = profile.profile_visibility === "private";
  const showPrivateGate = isPrivate && !isFollowing;

  const displayName = profile.display_name || profile.username || "User";
  const joinedDate = profile.created_at ? formatMonthYearLong(profile.created_at) : undefined;
  const disciplineScore = Math.max(0, profile.total_days_secured ?? 0);
  const achievements: AchievementItem[] = [
    { id: "7_streak", title: "7-Day Streak", description: "7-day streak", category: "consistency", unlocked: (profile.active_streak ?? 0) >= 7, unlockDate: null },
    { id: "14_streak", title: "14-Day Streak", description: "14-day streak", category: "consistency", unlocked: (profile.active_streak ?? 0) >= 14, unlockDate: null },
    { id: "30_streak", title: "30-Day Streak", description: "30-day streak", category: "consistency", unlocked: (profile.active_streak ?? 0) >= 30, unlockDate: null },
    { id: "75_legend", title: "75-Day Legend", description: "75-day streak", category: "consistency", unlocked: (profile.active_streak ?? 0) >= 75, unlockDate: null },
    { id: "consistent", title: "Consistent", description: "Keep showing up", category: "consistency", unlocked: profile.total_days_secured >= 7, unlockDate: null },
    { id: "elite", title: "Elite", description: "90+ days secured", category: "discipline", unlocked: profile.total_days_secured >= 90, unlockDate: null },
    { id: "challenge_done", title: "Challenge Done", description: "Complete a challenge", category: "challenge", unlocked: false, unlockDate: null },
  ];

  const followButton = (
    <View style={styles.followRow}>
      {!isFollowing ? (
        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: DS_COLORS.ACCENT }]}
          onPress={() => void handleFollow()}
          disabled={followLoading}
          accessibilityRole="button"
          accessibilityLabel={`Follow ${displayName}`}
        >
          {followLoading ? (
            <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
          ) : (
            <Text style={styles.followButtonText}>{user?.id ? "Follow" : "Sign in to follow"}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={[styles.followingButton, { borderColor: colors.border }]}>
          <Text style={[styles.followingButtonText, { color: colors.text.primary }]}>Following</Text>
        </View>
      )}
    </View>
  );

  if (showPrivateGate) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              style={styles.backBtn}
              hitSlop={12}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>@{profile.username}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.privateContainer}>
            <View style={styles.privateAvatar}>
              <Avatar
                url={profile.avatar_url}
                name={profile.display_name || profile.username}
                userId={profile.user_id}
                size={80}
              />
            </View>
            <Text style={[styles.privateName, { color: colors.text.primary }]}>{displayName}</Text>
            <Text style={[styles.privateUsername, { color: colors.text.secondary }]}>@{profile.username}</Text>
            {profile.bio ? (
              <Text style={[styles.privateBio, { color: colors.text.secondary }]}>{profile.bio}</Text>
            ) : null}
            <View style={styles.privateLockSection}>
              <Lock size={20} color={colors.text.secondary} />
              <Text style={[styles.privateLockText, { color: colors.text.secondary }]}>This account is private</Text>
            </View>
            <TouchableOpacity
              style={[styles.followButton, { backgroundColor: DS_COLORS.ACCENT }]}
              onPress={() => void handleFollow()}
              disabled={followLoading}
              accessibilityRole="button"
              accessibilityLabel={`Follow ${displayName}`}
            >
              {followLoading ? (
                <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
              ) : (
                <Text style={styles.followButtonText}>{user?.id ? "Follow" : "Sign in to follow"}</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.privateHint, { color: colors.text.muted }]}>
              Follow this account to see their activity
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            userId={profile.user_id}
            avatarUrl={profile.avatar_url ?? undefined}
            fullName={displayName}
            username={profile.username ?? ""}
            currentTier={profile.tier ?? "Starter"}
            joinDate={joinedDate}
            bio={profile.bio ?? undefined}
            showEditButton={false}
            followerCount={followCountsQuery.isSuccess ? followCountsQuery.data.followers : undefined}
            followingCount={followCountsQuery.isSuccess ? followCountsQuery.data.following : undefined}
          />
          {followButton}
          <DisciplineScoreCard
            disciplineScore={disciplineScore}
            tier={profile.tier ?? "Starter"}
            daysSecured={profile.total_days_secured}
          />
          <TierProgressBar
            currentPoints={profile.total_days_secured}
            pointsRequiredForNextTier={0}
            currentTier={profile.tier ?? "Starter"}
            nextTier={null}
          />
          <LifetimeStatsCard
            currentStreak={profile.active_streak ?? 0}
            longestStreak={profile.active_streak ?? 0}
            daysSecured={profile.total_days_secured}
            challengesCompleted={0}
          />
          <DisciplineCalendar securedDateKeys={[]} currentStreak={profile.active_streak ?? 0} longestStreak={profile.active_streak ?? 0} />
          <DisciplineGrowthCard
            pastValue={0}
            currentValue={disciplineScore}
            delta={disciplineScore}
            periodLabel="30 days"
          />
          <AchievementsSection achievements={achievements} loading={false} />
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  bottomSpacer: { height: 24 },
  text: { fontSize: 16, textAlign: "center" },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.white },
  followRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: "stretch",
  },
  privateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  privateAvatar: {
    marginBottom: 16,
  },
  privateName: {
    fontSize: 22,
    fontWeight: "700",
  },
  privateUsername: {
    fontSize: 15,
    marginTop: 4,
  },
  privateBio: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  privateLockSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 20,
  },
  privateLockText: {
    fontSize: 15,
    fontWeight: "500",
  },
  followButton: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 28,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  followButtonText: {
    color: DS_COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },
  followingButton: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 28,
    borderWidth: 1.5,
    minWidth: 200,
    alignItems: "center",
  },
  followingButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  privateHint: {
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
});
