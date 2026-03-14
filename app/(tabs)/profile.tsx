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
  Check,
  Crown,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/SkeletonLoader";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  ProfileHeader,
  DisciplineScoreCard,
  TierProgressBar,
  LifetimeStatsCard,
  DisciplineCalendar,
  DisciplineGrowthCard,
  AchievementsSection,
  CompletedChallengesSection,
  SocialStatsCard,
  ProfileCompletionCard,
  ShareDisciplineCard,
} from "@/components/profile";
import type { AchievementItem } from "@/components/profile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { formatMonthYearLong } from "@/lib/date-format";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements";
import { ROUTES } from "@/lib/routes";
import { cancelLapsedUserReminders } from "@/lib/notifications";
import { useTheme } from "@/contexts/ThemeContext";
import type { StatsFromApi } from "@/types";

function openSubscriptionManagement() {
  if (Platform.OS === "ios") {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  } else if (Platform.OS === "android") {
    Linking.openURL("https://play.google.com/store/account/subscriptions");
  }
}
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";


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
            <Activity size={22} color={DS_COLORS.activityOrange} />
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
              accessibilityLabel="Disconnect Strava"
              accessibilityRole="button"
              accessibilityState={{ disabled: disconnecting }}
            >
              <Text style={styles.integrationsDisconnectText}>{disconnecting ? "…" : "Disconnect"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.integrationsConnectBtn, loadingAuth && styles.integrationsConnectBtnDisabled]}
              onPress={handleConnectStrava}
              disabled={loadingAuth}
              activeOpacity={0.7}
              accessibilityLabel="Connect Strava"
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingAuth }}
            >
              <Link2 size={16} color={DS_COLORS.white} />
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
              accessibilityLabel={activitiesExpanded ? "Hide recent activities" : "View recent activities"}
              accessibilityRole="button"
            >
              <Text style={styles.integrationsActivitiesToggleText}>
                {activitiesExpanded ? "Hide recent activities" : "View recent activities"}
              </Text>
              <ChevronRight size={16} color={DS_COLORS.textMuted} style={{ transform: [{ rotate: activitiesExpanded ? "90deg" : "0deg" }] }} />
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const {
    profile,
    profileLoading,
    profileMissing,
    autoCreateError,
    stats,
    isError,
    refetchAll,
    isPremium,
  } = useApp();
  const headerFade = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createProfileStyles(), []);

  const completedQuery = useQuery({
    queryKey: ["profile", user?.id, "completedChallenges"],
    queryFn: () => trpcQuery(TRPC.profiles.getCompletedChallenges) as Promise<{ id: string; challengeId: string; challengeName: string; completedAt: string }[]>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  const securedDatesQuery = useQuery({
    queryKey: ["profile", user?.id, "securedDateKeys"],
    queryFn: () => trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  const leaderboardProfileQuery = useQuery({
    queryKey: ["profile", user?.id, "leaderboard"],
    queryFn: () => trpcQuery(TRPC.leaderboard.getWeekly) as Promise<{ currentUserRank?: number | null }>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  const accountabilityQuery = useQuery({
    queryKey: ["profile", user?.id, "accountability"],
    queryFn: () => trpcQuery(TRPC.accountability.listMine) as Promise<{ accepted: unknown[] }>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });

  const completedChallengesList = Array.isArray(completedQuery.data) ? completedQuery.data : [];
  const securedDateKeys = Array.isArray(securedDatesQuery.data) ? securedDatesQuery.data : [];
  const leaderboardRank = leaderboardProfileQuery.data?.currentUserRank ?? null;
  const accountabilityCount = Array.isArray(accountabilityQuery.data?.accepted) ? accountabilityQuery.data.accepted.length : 0;
  const dashboardDataLoading = completedQuery.isLoading || securedDatesQuery.isLoading || leaderboardProfileQuery.isLoading || accountabilityQuery.isLoading;
  const dashboardDataError = completedQuery.isError || securedDatesQuery.isError || leaderboardProfileQuery.isError || accountabilityQuery.isError;

  const stillLoading = (profileLoading && !profile) || (!profile && !isError);

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
    await refetchAll();
    await queryClient.refetchQueries({ queryKey: ["profile"] });
  }, [refetchAll, queryClient]);

  const isRefetching =
    completedQuery.isRefetching ||
    securedDatesQuery.isRefetching ||
    leaderboardProfileQuery.isRefetching ||
    accountabilityQuery.isRefetching;

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await cancelLapsedUserReminders();
          await supabase.auth.signOut();
          const { clearOnboardingStorage } = await import("@/store/onboardingStore");
          await clearOnboardingStorage();
          router.replace(ROUTES.AUTH as never);
        },
      },
    ]);
  }, [router]);

  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
  const activeChallenges = stats?.activeChallenges || 0;
  const completedChallengesCount = stats?.completedChallenges || 0;
  const totalDaysSecured = (stats as StatsFromApi)?.totalDaysSecured ?? 0;
  const tierName = (stats as StatsFromApi)?.tier ?? "Starter";

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
  const ptsToNext = (stats as StatsFromApi)?.pointsToNextTier ?? 0;
  const nextTierName = (stats as StatsFromApi)?.nextTierName ?? null;

  const joinedDate = useMemo(() => {
    if (!profile?.created_at) return "";
    return formatMonthYearLong(profile.created_at);
  }, [profile?.created_at]);

  const achievementsQuery = useQuery({
    queryKey: ["achievements", "getForUser", user?.id],
    queryFn: () => trpcQuery(TRPC.achievements.getForUser) as Promise<{ achievement_key: string; unlocked_at: string }[]>,
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
  const unlockedMap = useMemo(() => {
    const map = new Map<string, string>();
    (achievementsQuery.data ?? []).forEach((r) => map.set(r.achievement_key, r.unlocked_at));
    return map;
  }, [achievementsQuery.data]);

  const achievements: AchievementItem[] = useMemo(() => {
    const fromApi: AchievementItem[] = ACHIEVEMENT_DEFINITIONS.map((def) => ({
      id: def.key,
      title: def.title,
      description: def.description,
      category: def.category,
      unlocked: unlockedMap.has(def.key),
      unlockDate: unlockedMap.get(def.key) ?? null,
    }));
    const tierBadges: AchievementItem[] = [
      { id: "starter_tier", title: "Starter", description: "Begin your journey", category: "discipline", unlocked: totalDaysSecured >= 0, unlockDate: null },
      { id: "builder_tier", title: "Builder", description: "7+ days secured", category: "discipline", unlocked: totalDaysSecured >= 7, unlockDate: null },
      { id: "elite_tier", title: "Elite", description: "90+ days secured", category: "discipline", unlocked: totalDaysSecured >= 90, unlockDate: null },
    ];
    return [...fromApi, ...tierBadges];
  }, [unlockedMap, totalDaysSecured]);

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestIdentityCard}>
            <Lock size={32} color={DS_COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.guestIdentityTitle} accessibilityRole="header">Sign in to view your profile</Text>
            <Text style={styles.guestIdentitySub}>Sign in to see your stats, streaks, and achievements.</Text>
            <TouchableOpacity
              style={styles.guestIdentityCta}
              onPress={() => router.push(ROUTES.AUTH_LOGIN as never)}
              activeOpacity={0.85}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
            >
              <Text style={styles.guestIdentityCtaText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.guestIdentityCta, { backgroundColor: "transparent", borderWidth: 1, borderColor: DS_COLORS.border, marginTop: 12 }]}
              onPress={() => router.push(ROUTES.AUTH_SIGNUP as never)}
              activeOpacity={0.85}
              accessibilityLabel="Sign up"
              accessibilityRole="button"
            >
              <Text style={[styles.guestIdentityCtaText, { color: DS_COLORS.textPrimary }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (stillLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if ((isError || profileMissing) && !profile) {
    const errorMsg = autoCreateError
      ? `Profile setup failed: ${autoCreateError}`
      : "Network error. Can't reach server. Pull down to retry.";

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.errorScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={DS_COLORS.accent}
            />
          }
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Shield size={28} color={DS_COLORS.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.errorTitle}>
              {autoCreateError ? "Profile Setup Issue" : "Connection Issue"}
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
              accessibilityLabel="Retry loading profile"
              accessibilityRole="button"
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
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Text style={[styles.signOutLinkText, { color: DS_COLORS.accent }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={DS_COLORS.accent}
            />
          }
        >
          <Animated.View style={{ opacity: headerFade }}>
            <ProfileHeader
            avatarUrl={profile.avatar_url ?? undefined}
            fullName={(profile.display_name || profile.username || "").trim() || "User"}
            username={profile.username ?? ""}
            currentTier={tierName ?? "Starter"}
            joinDate={joinedDate || undefined}
            onShare={handleShare}
            bio={bioText || undefined}
          />
        </Animated.View>

        <DisciplineScoreCard
          disciplineScore={disciplineScore}
          tier={tierName}
          daysSecured={totalDaysSecured}
          friendRank={leaderboardRank}
          zeroStateHint={disciplineScore === 0 ? "Complete today's tasks to start your streak." : undefined}
        />

        <View style={[styles.subscriptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isPremium ? (
            <>
              <View style={styles.subscriptionRow}>
                <Crown size={20} color={colors.accent} />
                <Text style={[styles.subscriptionTitle, { color: colors.text.primary }]}>GRIIT Premium</Text>
                <Check size={18} color={colors.success} />
              </View>
              {profile.subscription_expiry && (
                <Text style={[styles.subscriptionSub, { color: colors.text.secondary }]}>
                  Renews {new Date(profile.subscription_expiry).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              )}
              <TouchableOpacity
                onPress={openSubscriptionManagement}
                style={styles.subscriptionLink}
                activeOpacity={0.7}
                accessibilityLabel="Manage subscription"
                accessibilityRole="button"
              >
                <Text style={[styles.subscriptionLinkText, { color: colors.accent }]}>Manage subscription</Text>
                <ChevronRight size={16} color={colors.accent} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.subscriptionRow}>
                <Crown size={20} color={colors.text.muted} />
                <Text style={[styles.subscriptionTitle, { color: colors.text.primary }]}>GRIIT Free</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: ROUTES.PRICING as never, params: { source: "profile" } } as never)}
                style={[styles.subscriptionCta, { backgroundColor: colors.accent }]}
                activeOpacity={0.85}
                accessibilityLabel="Upgrade to Premium"
                accessibilityRole="button"
              >
                <Text style={styles.subscriptionCtaText}>Upgrade to Premium →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TierProgressBar
          currentPoints={totalDaysSecured}
          pointsRequiredForNextTier={ptsToNext}
          currentTier={tierName}
          nextTier={nextTierName}
        />

        <LifetimeStatsCard
          currentStreak={currentStreak}
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

        <DisciplineGrowthCard
          pastValue={0}
          currentValue={disciplineScore}
          delta={disciplineScore}
          periodLabel="30 days"
        />

        <AchievementsSection achievements={achievements} loading={dashboardDataLoading || achievementsQuery.isLoading} />

        <CompletedChallengesSection challenges={completedChallengesList} loading={dashboardDataLoading} />

        {dashboardDataError && (
          <View style={[styles.errorCard, { marginHorizontal: 20, marginTop: 16 }]}>
            <Text style={[styles.errorSubtitle, { marginBottom: 12 }]}>Couldn&apos;t load some sections.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} activeOpacity={0.7} accessibilityLabel="Retry" accessibilityRole="button">
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
          name={(profile.display_name || profile.username || "").trim() || "User"}
          disciplineScore={disciplineScore}
          currentStreak={currentStreak}
          tier={tierName ?? "Starter"}
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
              router.push(ROUTES.EDIT_PROFILE as never);
            }}
            activeOpacity={0.7}
            accessibilityLabel="Edit your profile"
            accessibilityRole="button"
          >
            <View style={styles.menuIconWrap}>
              <Globe size={18} color={DS_COLORS.textSecondary} />
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
              router.push(ROUTES.SETTINGS as never);
            }}
            activeOpacity={0.7}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <View style={styles.menuIconWrap}>
              <Settings size={18} color={DS_COLORS.textSecondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuSubtext}>Privacy, notifications, consequences</Text>
            </View>
            <ChevronRight size={18} color={DS_COLORS.textMuted} />
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
            accessibilityLabel="Sign out of your account"
            accessibilityRole="button"
          >
            <Text style={[styles.signOutText, { color: DS_COLORS.accent }]}>↪ Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

function ProfileSkeleton() {
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
          <View key={i} style={[skeletonStyles.statItem, { backgroundColor: DS_COLORS.card }]}>
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
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    justifyContent: "space-between",
  },
});

function createProfileStyles() {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS_COLORS.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: DS_SPACING.section },
    guestIdentityCard: {
      backgroundColor: DS_COLORS.card,
      borderRadius: DS_RADIUS.cardAlt,
      padding: DS_SPACING.xxl,
      marginHorizontal: DS_SPACING.screenHorizontal,
      marginTop: DS_SPACING.xxl,
      alignItems: "center",
      borderWidth: DS_BORDERS.width,
      borderColor: DS_COLORS.border,
    },
    guestIdentityTitle: {
      fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
      fontWeight: "700" as const,
      color: DS_COLORS.textPrimary,
      marginBottom: DS_SPACING.sm,
      textAlign: "center",
    },
    guestIdentitySub: {
      fontSize: DS_TYPOGRAPHY.secondary.fontSize,
      color: DS_COLORS.textSecondary,
      textAlign: "center",
      marginBottom: DS_SPACING.xl,
    },
    guestIdentityCta: {
      backgroundColor: DS_COLORS.accent,
      paddingVertical: DS_SPACING.lg,
      paddingHorizontal: DS_SPACING.xxl,
      borderRadius: DS_RADIUS.button,
    },
    guestIdentityCtaText: { fontSize: DS_TYPOGRAPHY.buttonSmall.fontSize, fontWeight: "700" as const, color: DS_COLORS.white },
    errorScrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: DS_SPACING.xxl,
      paddingBottom: 60,
    },
    errorCard: {
      alignItems: "center",
      backgroundColor: DS_COLORS.card,
      borderRadius: DS_RADIUS.cardAlt,
      paddingVertical: DS_SPACING.xxxl,
      paddingHorizontal: DS_SPACING.xxl,
      borderWidth: DS_BORDERS.width,
      borderColor: DS_COLORS.border,
    },
    errorIconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: DS_COLORS.chipFill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: DS_SPACING.lg,
    },
    errorTitle: {
      fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
      fontWeight: "700" as const,
      color: DS_COLORS.textPrimary,
      textAlign: "center",
      marginBottom: DS_SPACING.sm,
    },
    errorSubtitle: {
      fontSize: DS_TYPOGRAPHY.secondary.fontSize,
      color: DS_COLORS.textSecondary,
      textAlign: "center",
      marginBottom: DS_SPACING.xxl,
      lineHeight: 22,
    },
    retryButton: {
      backgroundColor: DS_COLORS.accent,
      paddingHorizontal: DS_SPACING.xxxl,
      paddingVertical: DS_SPACING.md,
      borderRadius: DS_RADIUS.button,
      marginBottom: DS_SPACING.lg,
    },
    retryButtonText: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "700" as const, color: DS_COLORS.white },
    signOutLink: { paddingVertical: DS_SPACING.sm },
    signOutLinkText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "500" as const, color: DS_COLORS.textMuted, textDecorationLine: "underline" as const },
    menuEditLabel: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: DS_COLORS.textSecondary },
    integrationsSection: { paddingHorizontal: DS_SPACING.screenHorizontal, paddingTop: DS_SPACING.xl },
    integrationsTitle: {
      fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
      fontWeight: "600" as const,
      color: DS_COLORS.textSecondary,
      marginBottom: DS_SPACING.sm,
      textTransform: "uppercase" as const,
    },
    integrationsCard: {
      backgroundColor: DS_COLORS.card,
      borderRadius: DS_RADIUS.cardAlt,
      borderWidth: DS_BORDERS.width,
      borderColor: DS_COLORS.border,
      padding: DS_SPACING.cardPadding,
    },
    integrationsRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: DS_SPACING.md },
    integrationsIconWrap: {
      width: 44,
      height: 44,
      borderRadius: DS_RADIUS.iconButton,
      backgroundColor: DS_COLORS.accentSoft,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    integrationsTextWrap: { flex: 1 },
    integrationsName: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "600" as const, color: DS_COLORS.textPrimary },
    integrationsSub: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textMuted, marginTop: 2 },
    integrationsConnectBtn: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: DS_SPACING.sm,
      backgroundColor: DS_COLORS.activityOrange,
      paddingVertical: DS_SPACING.sm,
      paddingHorizontal: DS_SPACING.lg,
      borderRadius: DS_RADIUS.input,
    },
    integrationsConnectBtnDisabled: { opacity: 0.7 },
    integrationsConnectText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: DS_COLORS.white },
    integrationsDisconnectBtn: { paddingVertical: DS_SPACING.sm, paddingHorizontal: DS_SPACING.md },
    integrationsDisconnectText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, fontWeight: "600" as const, color: DS_COLORS.danger },
    integrationsActivitiesToggle: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between",
      marginTop: DS_SPACING.md,
      paddingTop: DS_SPACING.md,
      borderTopWidth: 1,
      borderTopColor: DS_COLORS.border,
    },
    integrationsActivitiesToggleText: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textSecondary },
    integrationsActivitiesList: { marginTop: DS_SPACING.sm, gap: DS_SPACING.sm },
    integrationsActivityRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: DS_SPACING.sm,
      paddingHorizontal: DS_SPACING.md,
      backgroundColor: DS_COLORS.chipFill,
      borderRadius: DS_RADIUS.input,
    },
    integrationsActivityName: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textPrimary, flex: 1 },
    integrationsActivityMeta: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.textMuted, marginLeft: DS_SPACING.sm },
    integrationsActivitiesEmpty: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, color: DS_COLORS.textMuted, marginTop: DS_SPACING.sm },
    subscriptionCard: {
      marginHorizontal: DS_SPACING.screenHorizontal,
      marginTop: DS_SPACING.md,
      padding: DS_SPACING.md,
      borderRadius: DS_RADIUS.cardAlt,
      borderWidth: 1,
    },
    subscriptionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    subscriptionTitle: { fontSize: 17, fontWeight: "700", flex: 1 },
    subscriptionSub: { fontSize: 13, marginTop: 4 },
    subscriptionLink: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    subscriptionLinkText: { fontSize: 14, fontWeight: "600" },
    subscriptionCta: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: DS_RADIUS.sm, alignItems: "center" },
    subscriptionCtaText: { fontSize: 15, fontWeight: "600", color: "#FFF" },
    menuSection: { paddingHorizontal: DS_SPACING.screenHorizontal, paddingTop: DS_SPACING.lg },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: DS_SPACING.md,
      backgroundColor: DS_COLORS.card,
      padding: DS_SPACING.cardPadding,
      borderRadius: DS_RADIUS.cardAlt,
      borderWidth: DS_BORDERS.width,
      borderColor: DS_COLORS.border,
    },
    menuIconWrap: {
      width: 40,
      height: 40,
      borderRadius: DS_RADIUS.iconButton,
      backgroundColor: DS_COLORS.chipFill,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    menuTextWrap: { flex: 1 },
    menuText: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "600" as const, color: DS_COLORS.textPrimary },
    menuSubtext: { fontSize: DS_TYPOGRAPHY.statLabel.fontSize, color: DS_COLORS.textMuted, marginTop: 2 },
    dangerSection: { paddingHorizontal: DS_SPACING.screenHorizontal, paddingTop: DS_SPACING.xxl, marginTop: DS_SPACING.sm, alignItems: "center" as const },
    signOutButton: { paddingVertical: DS_SPACING.md, paddingHorizontal: DS_SPACING.xl },
    signOutText: { fontSize: DS_TYPOGRAPHY.bodySmall.fontSize, fontWeight: "600" as const },
    bottomSpacer: { height: DS_SPACING.xl },
  });
}
