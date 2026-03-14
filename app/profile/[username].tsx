import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery } from "@/lib/trpc";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";
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
  total_days_secured: number;
  tier: string;
  active_streak: number;
  bio?: string | null;
  created_at?: string | null;
};

/**
 * Deep link: /profile/[username]
 * Shows public profile for the given username.
 */
export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const decoded = username ? decodeURIComponent(username) : "";

  useEffect(() => {
    if (!decoded) {
      router.replace(ROUTES.TABS as never);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    trpcQuery("profiles.getPublicByUsername", { username: decoded })
      .then((data) => {
        if (!cancelled) setProfile(data as PublicProfile | null);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [decoded, router]);

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
          <Text style={[styles.text, { color: colors.text.secondary }]}>Couldn&apos;t load profile. Check your connection and try again.</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              setIsError(false);
              setIsLoading(true);
              trpcQuery("profiles.getPublicByUsername", { username: decoded })
                .then((data) => setProfile(data as PublicProfile | null))
                .catch(() => setIsError(true))
                .finally(() => setIsLoading(false));
            }}
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
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text.secondary }]}>Profile not found</Text>
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
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
            avatarUrl={profile.avatar_url ?? undefined}
            fullName={displayName}
            username={profile.username ?? ""}
            currentTier={profile.tier ?? "Starter"}
            joinDate={joinedDate}
            bio={profile.bio ?? undefined}
            showEditButton={false}
          />
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
  text: { fontSize: 16 },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: { fontSize: 16, fontWeight: "600", color: DS_COLORS.white },
});
