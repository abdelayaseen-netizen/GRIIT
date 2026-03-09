import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  RefreshControl,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  Shield,
  ChevronRight,
  Lock,
  Globe,
  Activity,
  Link2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/lib/theme-palettes";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/colors";
import { Skeleton } from "@/components/SkeletonLoader";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  ProfileHeader,
  DisciplineScoreCard,
  TierProgressBar,
  LifetimeStatsCard,
  DisciplineCalendar,
  AchievementsSection,
  CompletedChallengesSection,
  SocialStatsCard,
  ProfileCompletionCard,
  ShareDisciplineCard,
} from "@/components/profile";
import type { AchievementItem } from "@/components/profile";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const LOADING_TIMEOUT_MS = 4000;

type StravaActivity = {
  id: number;
  type: string;
  sport_type?: string;
  name: string;
  distance: number;
  moving_time: number;
  start_date: string;
};

type ProfileStyles = ReturnType<typeof createProfileStyles>;

function IntegrationsSection({ styles }: { styles: ProfileStyles }) {
  const { colors } = useTheme();
  const [stravaEnabled, setStravaEnabled] = useState<boolean | null>(null);
  const [stravaConnection, setStravaConnection] = useState<{
    id: string;
    provider: string;
    providerUserId: string;
    createdAt: string;
  } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [recentActivities, setRecentActivities] = useState<StravaActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const loadIntegrations = useCallback(async () => {
    try {
      const [enabled, conn] = await Promise.all([
        trpcQuery(TRPC.integrations.isStravaEnabled) as Promise<boolean>,
        trpcQuery(TRPC.integrations.getStravaConnection) as Promise<{
          id: string;
          provider: string;
          providerUserId: string;
          createdAt: string;
        } | null>,
      ]);
      setStravaEnabled(enabled);
      setStravaConnection(conn);
    } catch {
      setStravaEnabled(false);
      setStravaConnection(null);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  useFocusEffect(
    useCallback(() => {
      loadIntegrations();
    }, [loadIntegrations])
  );

  const fetchRecentActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const after = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
      const result = await trpcQuery(TRPC.integrations.getStravaActivities, {
        after,
        perPage: 5,
      }) as StravaActivity[];
      setRecentActivities(Array.isArray(result) ? result : []);
    } catch {
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const handleConnectStrava = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const { url } = await trpcQuery(TRPC.integrations.getStravaAuthUrl) as { url: string };
      await Linking.openURL(url);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not start Strava connection");
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  const handleDisconnectStrava = useCallback(() => {
    Alert.alert(
      "Disconnect Strava",
      "Are you sure? You will need to reconnect to verify runs with Strava.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            setDisconnecting(true);
            try {
              await trpcMutate(TRPC.integrations.disconnectStrava);
              setStravaConnection(null);
            } catch {
              Alert.alert("Error", "Failed to disconnect");
            } finally {
              setDisconnecting(false);
            }
          },
        },
      ]
    );
  }, []);

  if (stravaEnabled === null || stravaEnabled === false) return null;

  return (
    <View style={styles.integrationsSection}>
      <Text style={styles.integrationsTitle}>Integrations</Text>
      <View style={styles.integrationsCard}>
        <View style={styles.integrationsRow}>
          <View style={styles.integrationsIconWrap}>
            <Activity size={22} color="#FC4C02" />
          </View>
          <View style={styles.integrationsTextWrap}>
            <Text style={styles.integrationsName}>Strava</Text>
            <Text style={styles.integrationsSub}>
              {stravaConnection ? "Connected — verify runs with activities" : "Connect to verify runs and rides"}
            </Text>
          </View>
          {stravaConnection ? (
            <TouchableOpacity
              style={styles.integrationsDisconnectBtn}
              onPress={handleDisconnectStrava}
              disabled={disconnecting}
              activeOpacity={0.7}
            >
              <Text style={styles.integrationsDisconnectText}>{disconnecting ? "…" : "Disconnect"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.integrationsConnectBtn, loadingAuth && styles.integrationsConnectBtnDisabled]}
              onPress={handleConnectStrava}
              disabled={loadingAuth}
              activeOpacity={0.7}
            >
              <Link2 size={16} color="#fff" />
              <Text style={styles.integrationsConnectText}>{loadingAuth ? "Opening…" : "Connect Strava"}</Text>
            </TouchableOpacity>
          )}
        </View>
        {stravaConnection && (
          <>
            <TouchableOpacity
              style={styles.integrationsActivitiesToggle}
              onPress={() => {
                setActivitiesExpanded((e) => !e);
                if (!activitiesExpanded && recentActivities.length === 0) fetchRecentActivities();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.integrationsActivitiesToggleText}>
                {activitiesExpanded ? "Hide recent activities" : "View recent activities"}
              </Text>
              <ChevronRight size={16} color={colors.text.muted} style={{ transform: [{ rotate: activitiesExpanded ? "90deg" : "0deg" }] }} />
            </TouchableOpacity>
            {activitiesExpanded && (
              <View style={styles.integrationsActivitiesList}>
                {activitiesLoading ? (
                  <Text style={styles.integrationsActivitiesEmpty}>Loading…</Text>
                ) : recentActivities.length === 0 ? (
                  <Text style={styles.integrationsActivitiesEmpty}>No recent activities</Text>
                ) : (
                  recentActivities.map((a) => (
                    <View key={a.id} style={styles.integrationsActivityRow}>
                      <Text style={styles.integrationsActivityName} numberOfLines={1}>{a.name || a.type}</Text>
                      <Text style={styles.integrationsActivityMeta}>
                        {(a.distance / 1000).toFixed(1)} km · {(a.moving_time / 60).toFixed(0)} min
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const isGuest = useIsGuest();
  const { showGate } = useAuthGate();
  const { colors } = useTheme();
  const {
    profile,
    profileLoading,
    profileMissing,
    autoCreateError,
    stats,
    isError,
    refetchAll,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [completedChallengesList, setCompletedChallengesList] = useState<{ id: string; challengeId: string; challengeName: string; completedAt: string }[]>([]);
  const [securedDateKeys, setSecuredDateKeys] = useState<string[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [accountabilityCount, setAccountabilityCount] = useState(0);
  const [dashboardDataLoading, setDashboardDataLoading] = useState(true);
  const [dashboardDataError, setDashboardDataError] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createProfileStyles(colors), [colors]);

  const fetchDashboardData = useCallback(async () => {
    setDashboardDataError(false);
    setDashboardDataLoading(true);
    try {
      const [completed, dates, lb, acc] = await Promise.all([
        trpcQuery(TRPC.profiles.getCompletedChallenges) as Promise<{ id: string; challengeId: string; challengeName: string; completedAt: string }[]>,
        trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
        trpcQuery(TRPC.leaderboard.getWeekly) as Promise<{ currentUserRank?: number | null }>,
        trpcQuery(TRPC.accountability.listMine) as Promise<{ accepted: unknown[] }>,
      ]);
      setCompletedChallengesList(Array.isArray(completed) ? completed : []);
      setSecuredDateKeys(Array.isArray(dates) ? dates : []);
      setLeaderboardRank(lb?.currentUserRank ?? null);
      setAccountabilityCount(Array.isArray(acc?.accepted) ? acc.accepted.length : 0);
    } catch {
      setDashboardDataError(true);
      setCompletedChallengesList([]);
      setSecuredDateKeys([]);
      setLeaderboardRank(null);
      setAccountabilityCount(0);
    } finally {
      setDashboardDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isGuest) return;
    fetchDashboardData();
  }, [isGuest, fetchDashboardData]);

  const stillLoading = (profileLoading && !profile) || (!profile && !isError && !loadingTimedOut);

  useEffect(() => {
    if (stillLoading) {
      timeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);
    } else {
      setLoadingTimedOut(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stillLoading]);

  useEffect(() => {
    if (profile) {
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [profile, headerFade]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadingTimedOut(false);
    try {
      await refetchAll();
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll, fetchDashboardData]);

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }, []);

  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
  const activeChallenges = stats?.activeChallenges || 0;
  const completedChallengesCount = stats?.completedChallenges || 0;
  const totalDaysSecured = (stats as any)?.totalDaysSecured ?? 0;
  const tierName = (stats as any)?.tier ?? "Starter";

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const { shareProfile } = await import("@/lib/share");
      await shareProfile({
        username: profile?.username ?? "user",
        streak: currentStreak,
        totalDaysSecured,
        tier: tierName,
      });
    } catch {
      // Share cancelled or failed — no user feedback needed
    }
  }, [profile?.username, currentStreak, totalDaysSecured, tierName]);
  const ptsToNext = (stats as any)?.pointsToNextTier ?? 0;
  const nextTierName = (stats as any)?.nextTierName ?? null;

  const joinedDate = useMemo(() => {
    if (!profile?.created_at) return "";
    const d = new Date(profile.created_at);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [profile?.created_at]);

  const achievements: AchievementItem[] = useMemo(() => {
    const list: AchievementItem[] = [
      { id: "first_streak", title: "First Streak", description: "Secure 1 day in a row", category: "consistency", unlocked: bestStreak > 0, unlockDate: bestStreak > 0 ? new Date().toISOString() : null },
      { id: "week_consistent", title: "7-Day Consistent", description: "7-day streak", category: "consistency", unlocked: bestStreak >= 7, unlockDate: null },
      { id: "month_strong", title: "30-Day Strong", description: "30-day streak", category: "consistency", unlocked: bestStreak >= 30, unlockDate: null },
      { id: "75_legend", title: "75-Day Legend", description: "75-day streak", category: "consistency", unlocked: bestStreak >= 75, unlockDate: null },
      { id: "challenge_done", title: "Challenge Done", description: "Complete a challenge", category: "challenge", unlocked: completedChallengesCount > 0, unlockDate: null },
      { id: "multi_challenge", title: "Multi-Challenge", description: "Complete 3 challenges", category: "challenge", unlocked: completedChallengesCount >= 3, unlockDate: null },
      { id: "starter_tier", title: "Starter", description: "Begin your journey", category: "discipline", unlocked: totalDaysSecured >= 0, unlockDate: null },
      { id: "builder_tier", title: "Builder", description: "7+ days secured", category: "discipline", unlocked: totalDaysSecured >= 7, unlockDate: null },
      { id: "elite_tier", title: "Elite", description: "90+ days secured", category: "discipline", unlocked: totalDaysSecured >= 90, unlockDate: null },
    ];
    return list;
  }, [completedChallengesCount, bestStreak, totalDaysSecured]);

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestIdentityCard}>
            <Lock size={32} color={colors.text.tertiary} style={{ marginBottom: 12 }} />
            <Text style={styles.guestIdentityTitle}>Create your identity</Text>
            <Text style={styles.guestIdentitySub}>Sign up to build your profile, track streaks, and earn ranks.</Text>
            <TouchableOpacity
              style={styles.guestIdentityCta}
              onPress={() => showGate("other")}
              activeOpacity={0.85}
            >
              <Text style={styles.guestIdentityCtaText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stillLoading && !loadingTimedOut) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loadingTimedOut || ((isError || profileMissing) && !profile)) {
    const errorMsg = autoCreateError
      ? `Profile setup failed: ${autoCreateError}`
      : loadingTimedOut
      ? "Server is taking too long to respond. Pull down to retry."
      : "Network error. Can't reach server. Pull down to retry.";

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.errorScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Shield size={28} color={colors.text.muted} strokeWidth={1.5} />
            </View>
            <Text style={styles.errorTitle}>
              {loadingTimedOut
                ? "Taking too long"
                : autoCreateError
                ? "Profile Setup Issue"
                : "Connection Issue"}
            </Text>
            <Text style={styles.errorSubtitle}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onRefresh();
              }}
              activeOpacity={0.7}
              testID="profile-retry-button"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutLink}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleLogout();
              }}
              activeOpacity={0.7}
              testID="profile-signout-button"
            >
              <Text style={styles.signOutLinkText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const bioText = profile.bio || "";

  const disciplineScore = Math.max(0, Number(totalDaysSecured) || 0);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <Animated.View style={{ opacity: headerFade }}>
            <ProfileHeader
            avatarUrl={profile.avatar_url}
            fullName={profile.display_name || profile.username}
            username={profile.username}
            currentTier={tierName}
            joinDate={joinedDate || undefined}
            onShare={handleShare}
          />
        </Animated.View>

        <DisciplineScoreCard
          disciplineScore={disciplineScore}
          tier={tierName}
          friendRank={leaderboardRank}
          zeroStateHint={disciplineScore === 0 ? "Complete today's tasks to start your streak." : undefined}
        />

        <TierProgressBar
          currentPoints={totalDaysSecured}
          pointsRequiredForNextTier={ptsToNext}
          currentTier={tierName}
          nextTier={nextTierName}
        />

        <LifetimeStatsCard
          longestStreak={bestStreak}
          daysSecured={totalDaysSecured}
          challengesCompleted={completedChallengesCount}
          totalDisciplinePoints={totalDaysSecured}
        />

        <DisciplineCalendar
          securedDateKeys={securedDateKeys}
          currentStreak={currentStreak}
          longestStreak={bestStreak}
        />

        <AchievementsSection achievements={achievements} loading={dashboardDataLoading} />

        <CompletedChallengesSection challenges={completedChallengesList} loading={dashboardDataLoading} />

        {dashboardDataError && (
          <View style={[styles.errorCard, { marginHorizontal: 20, marginTop: 16 }]}>
            <Text style={[styles.errorSubtitle, { marginBottom: 12 }]}>Couldn&apos;t load some sections.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboardData()} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <SocialStatsCard
          friendRank={leaderboardRank}
          friendsCount={accountabilityCount}
          sharedChallenges={0}
        />

        <ProfileCompletionCard
          bioAdded={!!bioText}
          joinedChallenge={activeChallenges > 0 || completedChallengesCount > 0}
          secured7Days={totalDaysSecured >= 7}
          invitedFriend={accountabilityCount >= 1}
        />

        <ShareDisciplineCard
          name={profile.display_name || profile.username}
          disciplineScore={disciplineScore}
          currentStreak={currentStreak}
          tier={tierName}
          onShare={handleShare}
        />

        <IntegrationsSection styles={styles} />

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/edit-profile" as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Globe size={18} color={colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Profile: Public</Text>
              <Text style={styles.menuSubtext}>Activity: Public</Text>
            </View>
            <Text style={styles.menuEditLabel}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 10 }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/settings" as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Settings size={18} color={colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuSubtext}>Privacy, notifications, consequences</Text>
            </View>
            <ChevronRight size={18} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>→ Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

function ProfileSkeleton() {
  const { colors } = useTheme();
  return (
    <View>
      <View style={skeletonStyles.header}>
        <Skeleton width={92} height={92} borderRadius={46} />
        <Skeleton width={130} height={20} borderRadius={4} style={{ marginTop: 14 }} />
        <Skeleton width={90} height={14} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width={70} height={11} borderRadius={4} style={{ marginTop: 6 }} />
        <View style={skeletonStyles.buttonRow}>
          <Skeleton width={110} height={36} borderRadius={20} />
          <Skeleton width={90} height={36} borderRadius={20} />
        </View>
      </View>
      <View style={skeletonStyles.bioArea}>
        <Skeleton width={180} height={14} borderRadius={4} />
      </View>
      <View style={skeletonStyles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={[skeletonStyles.statItem, { backgroundColor: colors.card }]}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <Skeleton width={32} height={22} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width={40} height={10} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
      <View style={skeletonStyles.cards}>
        <Skeleton width="48%" height={100} borderRadius={14} />
        <Skeleton width="48%" height={100} borderRadius={14} />
      </View>
      <Skeleton
        width="90%"
        height={50}
        borderRadius={14}
        style={{ marginTop: 16, alignSelf: "center" as const }}
      />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  bioArea: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  statItem: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    justifyContent: "space-between",
  },
});

function createProfileStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    guestIdentityCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 28,
      marginHorizontal: 20,
      marginTop: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    guestIdentityTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: c.text.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    guestIdentitySub: {
      fontSize: 14,
      color: c.text.secondary,
      textAlign: "center",
      marginBottom: 20,
    },
    guestIdentityCta: {
      backgroundColor: c.accent,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    guestIdentityCtaText: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
    errorScrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 60,
    },
    errorCard: {
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: 20,
      paddingVertical: 36,
      paddingHorizontal: 28,
      borderWidth: 1,
      borderColor: c.border,
    },
    errorIconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: c.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    errorTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: c.text.primary,
      textAlign: "center" as const,
      marginBottom: 6,
    },
    errorSubtitle: {
      fontSize: 14,
      color: c.text.secondary,
      textAlign: "center" as const,
      marginBottom: 24,
      lineHeight: 20,
    },
    retryButton: {
      backgroundColor: c.accent,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    retryButtonText: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
    signOutLink: { paddingVertical: 8 },
    signOutLinkText: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: c.text.tertiary,
      textDecorationLine: "underline" as const,
    },
    menuEditLabel: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: c.text.secondary,
    },
    integrationsSection: { paddingHorizontal: 16, paddingTop: 20 },
    integrationsTitle: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: c.text.secondary,
      marginBottom: 8,
      textTransform: "uppercase" as const,
    },
    integrationsCard: {
      backgroundColor: c.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
    },
    integrationsRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
    },
    integrationsIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "rgba(252, 76, 2, 0.12)",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    integrationsTextWrap: { flex: 1 },
    integrationsName: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: c.text.primary,
    },
    integrationsSub: { fontSize: 12, color: c.text.muted, marginTop: 2 },
    integrationsConnectBtn: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
      backgroundColor: "#FC4C02",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    integrationsConnectBtnDisabled: { opacity: 0.7 },
    integrationsConnectText: { fontSize: 13, fontWeight: "600" as const, color: "#fff" },
    integrationsDisconnectBtn: { paddingVertical: 8, paddingHorizontal: 12 },
    integrationsDisconnectText: { fontSize: 13, fontWeight: "600" as const, color: "#B91C1C" },
    integrationsActivitiesToggle: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    integrationsActivitiesToggleText: { fontSize: 13, color: c.text.secondary },
    integrationsActivitiesList: { marginTop: 8, gap: 8 },
    integrationsActivityRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: c.pill,
      borderRadius: 8,
    },
    integrationsActivityName: {
      fontSize: 13,
      color: c.text.primary,
      flex: 1,
    },
    integrationsActivityMeta: { fontSize: 12, color: c.text.muted, marginLeft: 8 },
    integrationsActivitiesEmpty: { fontSize: 13, color: c.text.muted, marginTop: 8 },
    menuSection: { paddingHorizontal: 16, paddingTop: 16 },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 12,
      backgroundColor: c.card,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    menuIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.pill,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    menuTextWrap: { flex: 1 },
    menuText: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: c.text.primary,
    },
    menuSubtext: { fontSize: 11, color: c.text.muted, marginTop: 1 },
    dangerSection: { paddingHorizontal: 16, paddingTop: 28, alignItems: "center" as const },
    signOutButton: { paddingVertical: 10, paddingHorizontal: 20 },
    signOutText: { fontSize: 14, fontWeight: "600" as const, color: "#B91C1C" },
    bottomSpacer: { height: 20 },
  });
}
