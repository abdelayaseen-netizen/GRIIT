import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { cancelLapsedUserReminders } from "@/lib/notifications";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import ActiveChallengeCard, { type ActiveChallengeItem } from "@/components/profile/ActiveChallengeCard";
import RankProgress from "@/components/profile/RankProgress";
import TrophyCase from "@/components/profile/TrophyCase";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import ProfileActions from "@/components/profile/ProfileActions";

type ActiveRow = {
  id: string;
  current_day?: number;
  progress_percent?: number;
  challenges?: { id?: string; title?: string; duration_days?: number };
};

function formatJoinDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, stats, refetchAll } = useApp();

  const activeListQuery = useQuery({
    queryKey: ["profile", user?.id, "activeChallenges"],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isGuest && !!user?.id,
  });

  const securedDatesQuery = useQuery({
    queryKey: ["profile", user?.id, "securedDateKeys"],
    queryFn: () => trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });

  const refreshing = activeListQuery.isRefetching || securedDatesQuery.isRefetching;
  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([activeListQuery.refetch(), securedDatesQuery.refetch()]);
  }, [refetchAll, activeListQuery, securedDatesQuery]);

  const streak = stats?.activeStreak ?? 0;
  const best = stats?.longestStreak ?? 0;
  const active = stats?.activeChallenges ?? 0;
  const done = stats?.completedChallenges ?? 0;
  const points = (stats?.totalDaysSecured ?? 0) + (active > 0 ? 7 : 0);

  const activeItems = useMemo(() => {
    const rows = (activeListQuery.data ?? []) as ActiveRow[];
    return rows.map((row) => {
      const duration = Math.max(1, row.challenges?.duration_days ?? 1);
      const day = Math.min(duration, Math.max(1, row.current_day ?? 1));
      const progress = row.progress_percent ?? Math.round((day / duration) * 100);
      return {
        id: row.id,
        challengeId: row.challenges?.id,
        title: row.challenges?.title ?? "Challenge",
        currentDay: day,
        durationDays: duration,
        progressPercent: Math.max(0, Math.min(100, progress)),
      } as ActiveChallengeItem;
    });
  }, [activeListQuery.data]);

  const handleShare = useCallback(async () => {
    const rank = stats?.tier ?? "Starter";
    const shareText = `Check out my GRIIT profile!\n\n🔥 ${streak} day streak\n⚡ ${points} discipline points\n🎯 ${rank} rank\n\nDownload GRIIT and start building discipline.`;
    await Share.share({ message: shareText });
  }, [stats?.tier, streak, points]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await cancelLapsedUserReminders();
          await supabase.auth.signOut();
          queryClient.clear();
          const { clearOnboardingStorage } = await import("@/store/onboardingStore");
          await clearOnboardingStorage();
          router.replace(ROUTES.AUTH as never);
        },
      },
    ]);
  }, [router, queryClient]);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.center}>
          <Text style={s.guestTitle}>Sign in to view your profile</Text>
          <Text style={s.guestSub}>Track streaks, rank, and activity in one place.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((profileLoading && !profile) || (!profile && !isError)) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.center}><Text style={s.loading}>Loading profile...</Text></View>
      </SafeAreaView>
    );
  }

  if ((isError || profileMissing) && !profile) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.center}><Text style={s.loading}>Couldn't load your profile right now.</Text></View>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={s.scroll}
      >
        <ProfileHeader
          avatarUrl={profile.avatar_url ?? undefined}
          fullName={(profile.display_name || profile.username || "User").trim()}
          username={profile.username ?? "user"}
          currentTier={stats?.tier ?? "Starter"}
          joinDate={formatJoinDate(profile.created_at)}
          bio={profile.bio ?? ""}
          onShare={handleShare}
        />

        <StatsRow streak={streak} best={best} active={active} done={done} />

        <ActiveChallengeCard
          items={activeItems}
          isLoading={activeListQuery.isLoading}
          onPressItem={(challengeId) => router.push(ROUTES.CHALLENGE_ID(challengeId) as never)}
          onPressBrowse={() => router.push(ROUTES.TABS_DISCOVER as never)}
        />

        <RankProgress points={points} />
        <TrophyCase streak={streak} goalsCompleted={stats?.totalDaysSecured ?? 0} challengesCompleted={done} />
        <ActivityHeatmap securedDateKeys={securedDatesQuery.data ?? []} />
        <ProfileActions onPressSettings={() => router.push(ROUTES.SETTINGS as never)} onPressSignOut={handleSignOut} />

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scroll: { paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  loading: { fontSize: 14, color: "#666" },
  guestTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", textAlign: "center" },
  guestSub: { marginTop: 8, fontSize: 13, color: "#999", textAlign: "center" },
});
