import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { sharePlainMessage } from "@/lib/share";
import { runClientSignOutCleanup } from "@/lib/signout-cleanup";
import { supabase } from "@/lib/supabase";
import { cancelLapsedUserReminders } from "@/lib/notifications";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import ActiveChallengeCard, { type ActiveChallengeItem } from "@/components/profile/ActiveChallengeCard";
import RankProgress from "@/components/profile/RankProgress";
import TrophyCase from "@/components/profile/TrophyCase";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import ProfileActions from "@/components/profile/ProfileActions";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonProfile } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import Card from "@/components/shared/Card";
import { DS_COLORS } from "@/lib/design-system";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { User } from "lucide-react-native";

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
  const [signOutConfirmVisible, setSignOutConfirmVisible] = useState(false);
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, stats, refetchAll } = useApp();

  const activeListQuery = useQuery({
    queryKey: ["profile", user?.id, "activeChallenges"],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isGuest && !!user?.id,
    placeholderData: (previousData) => previousData,
  });

  const securedDatesQuery = useQuery({
    queryKey: ["profile", user?.id, "securedDateKeys"],
    queryFn: () => trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
    placeholderData: (previousData) => previousData,
  });

  const followCountsQuery = useQuery({
    queryKey: ["profile", user?.id, "followCounts"],
    queryFn: () => trpcQuery(TRPC.profiles.getFollowCounts, { userId: user!.id }) as Promise<{ followers: number; following: number }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });

  const refreshing =
    activeListQuery.isRefetching || securedDatesQuery.isRefetching || followCountsQuery.isRefetching;
  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([activeListQuery.refetch(), securedDatesQuery.refetch(), followCountsQuery.refetch()]);
  }, [refetchAll, activeListQuery, securedDatesQuery, followCountsQuery]);

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
    trackEvent("share_tapped", { content_type: "profile" });
    const rank = stats?.tier ?? "Starter";
    const shareText = `Check out my GRIIT profile!\n\n🔥 ${streak} day streak\n⚡ ${points} discipline points\n🎯 ${rank} rank\n\nDownload GRIIT and start building discipline.`;
    await sharePlainMessage(shareText);
  }, [stats?.tier, streak, points]);

  const performSignOut = useCallback(async () => {
    setSignOutConfirmVisible(false);
    await cancelLapsedUserReminders();
    await supabase.auth.signOut();
    await runClientSignOutCleanup();
    const { clearOnboardingStorage } = await import("@/store/onboardingStore");
    await clearOnboardingStorage();
    router.replace(ROUTES.AUTH as never);
  }, [router]);

  const handleSignOut = useCallback(() => {
    setSignOutConfirmVisible(true);
  }, []);

  if (isGuest) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.center}>
          <Card containerStyle={{ width: "100%" }}>
            <Text style={s.guestTitle}>Sign in to view your profile</Text>
            <Text style={s.guestSub}>Track streaks, rank, and activity in one place.</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if ((profileLoading && !profile) || (!profile && !isError)) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <SkeletonProfile />
      </SafeAreaView>
    );
  }

  if ((isError || profileMissing) && !profile) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={[s.center, { paddingHorizontal: 24 }]}>
          <ErrorState
            message="Couldn't load profile"
            onRetry={() => {
              void refetchAll();
              void activeListQuery.refetch();
              void securedDatesQuery.refetch();
            }}
          />
        </View>
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
          userId={user?.id}
          avatarUrl={profile.avatar_url ?? undefined}
          fullName={(profile.display_name || profile.username || "User").trim()}
          username={profile.username ?? ""}
          currentTier={stats?.tier ?? "Starter"}
          joinDate={formatJoinDate(profile.created_at)}
          bio={profile.bio ?? ""}
          onShare={handleShare}
          onAvatarUpdated={() => void refetchAll()}
          followerCount={followCountsQuery.isSuccess ? followCountsQuery.data.followers : undefined}
          followingCount={followCountsQuery.isSuccess ? followCountsQuery.data.following : undefined}
        />

        <StatsRow streak={streak} best={best} active={active} done={done} />

        {done === 0 && activeItems.length === 0 ? (
          <EmptyState
            icon={User}
            title="Your journey starts here"
            subtitle="Complete challenges to build your stats"
          />
        ) : null}

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

      <ConfirmDialog
        visible={signOutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        destructive
        onCancel={() => setSignOutConfirmVisible(false)}
        onConfirm={() => void performSignOut()}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  scroll: { paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  loading: { fontSize: 14, color: DS_COLORS.TEXT_SECONDARY },
  guestTitle: { fontSize: 18, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, textAlign: "center" },
  guestSub: { marginTop: 8, fontSize: 13, color: DS_COLORS.TEXT_MUTED, textAlign: "center" },
});
