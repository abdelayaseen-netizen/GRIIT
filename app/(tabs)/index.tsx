import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Flame, Zap, Target } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import type { TodayCheckinForUser, StatsFromApi, ChallengeTaskFromApi } from "@/types";
import DailyQuote from "@/components/home/DailyQuote";
import GoalCard from "@/components/home/GoalCard";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import LiveFeed from "@/components/home/LiveFeed";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { EmptyState } from "@/components/EmptyState";
import { ErrorRetry } from "@/components/ErrorRetry";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { useCelebrationStore } from "@/store/celebrationStore";
import { prefetchActiveChallengeById } from "@/lib/prefetch-queries";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

type TaskRow = { id: string; title?: string; type?: string; required?: boolean };
type ActiveRow = {
  id: string;
  challenge_id: string;
  /** `listMyActive` selects `active_challenges.*` — DB column is `current_day`. */
  current_day?: number;
  challenges?: {
    id?: string;
    title?: string;
    duration_days?: number;
    challenge_tasks?: TaskRow[];
  };
};

type HomeData = {
  activeList: ActiveRow[];
  todayCheckins: TodayCheckinForUser[];
  securedDateKeys: string[];
  feedItems: { id: string; username: string; challengeName: string; action: "joined" | "completed"; age: string }[];
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

function toAge(iso: string): string {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** JSON for `app/task/complete` — matches TaskCompleteConfig fields from mapped challenge_tasks. */
function buildTaskConfigParam(task: ChallengeTaskFromApi | undefined): string {
  if (!task) return "{}";
  try {
    const t = task as Record<string, unknown>;
    return JSON.stringify({
      require_photo: t.require_photo ?? t.require_photo_proof,
      min_duration_minutes: t.min_duration_minutes ?? t.duration_minutes,
      min_words: t.min_words,
      timer_direction: t.timer_direction,
      timer_hard_mode: t.timer_hard_mode ?? t.strict_timer_mode,
      require_heart_rate: t.require_heart_rate,
      heart_rate_threshold: t.heart_rate_threshold,
      require_location: t.require_location,
      location_name: t.location_name,
      location_latitude: t.location_latitude,
      location_longitude: t.location_longitude,
      location_radius_meters: t.location_radius_meters,
    });
  } catch (err) {
    console.error("[Home] buildTaskConfigParam failed:", err);
    return "{}";
  }
}

function deriveRank(stats: StatsFromApi | null | undefined): string {
  if (stats?.tier && stats.tier.trim()) return stats.tier;
  const streak = stats?.activeStreak ?? 0;
  if (streak >= 75) return "Legend";
  if (streak >= 30) return "Elite";
  if (streak >= 14) return "Disciplined";
  if (streak >= 7) return "Builder";
  return "Starter";
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll } = useApp();

  const homeQuery = useQuery({
    queryKey: ["home", "v2", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<HomeData> => {
      const settled = await Promise.allSettled([
        trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
        trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<TodayCheckinForUser[]>,
        trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
        trpcQuery(TRPC.feed.list, { limit: 5 }) as Promise<{ items?: { id: string; event_type: string; username?: string; display_name?: string; metadata?: Record<string, unknown>; created_at: string }[] }>,
      ]);

      const activeRaw =
        settled[0].status === "fulfilled"
          ? settled[0].value
          : (console.error("[Home] listMyActive failed:", settled[0].reason), []);
      const checkinsRaw =
        settled[1].status === "fulfilled"
          ? settled[1].value
          : (console.error("[Home] getTodayCheckinsForUser failed:", settled[1].reason), []);
      const securedRaw =
        settled[2].status === "fulfilled"
          ? settled[2].value
          : (console.error("[Home] getSecuredDateKeys failed:", settled[2].reason), []);
      const feedRaw =
        settled[3].status === "fulfilled"
          ? settled[3].value
          : (console.error("[Home] feed.list failed:", settled[3].reason), { items: [] as { id: string; event_type: string; username?: string; display_name?: string; metadata?: Record<string, unknown>; created_at: string }[] });

      const activeList = (Array.isArray(activeRaw) ? activeRaw : []) as ActiveRow[];
      const todayCheckins = Array.isArray(checkinsRaw) ? checkinsRaw : [];
      const securedDateKeys = Array.isArray(securedRaw) ? securedRaw : [];
      const feedItems = (feedRaw.items ?? []).slice(0, 5).map((f) => {
        const name = f.display_name ?? f.username ?? "user";
        const challengeNameRaw = f.metadata?.challenge_title;
        const challengeName = typeof challengeNameRaw === "string" && challengeNameRaw.trim() ? challengeNameRaw : "a challenge";
        const action: "joined" | "completed" = f.event_type === "secured_day" ? "completed" : "joined";
        return { id: f.id, username: name, challengeName, action, age: toAge(f.created_at) };
      });
      return { activeList, todayCheckins, securedDateKeys, feedItems };
    },
  });

  const firstActive = homeQuery.data?.activeList[0];
  const challengeName = firstActive?.challenges?.title;
  const currentDay = firstActive?.current_day ?? 1;
  const durationDays = firstActive?.challenges?.duration_days ?? 14;

  const goals = useMemo(() => {
    const tasks = firstActive?.challenges?.challenge_tasks ?? [];
    const required = tasks.filter((t) => t.required !== false);
    const doneSet = new Set(
      (homeQuery.data?.todayCheckins ?? [])
        .filter((c) => c.active_challenge_id === firstActive?.id && c.status === "completed")
        .map((c) => c.task_id)
    );
    return required.map((t) => ({ id: t.id, title: t.title ?? t.type ?? "Goal", completed: doneSet.has(t.id) }));
  }, [firstActive, homeQuery.data?.todayCheckins]);

  const streak = stats?.activeStreak ?? 0;
  const basePoints = (stats?.totalDaysSecured ?? 0) * 5;
  const activeCount = homeQuery.data?.activeList.length ?? 0;
  const points = activeCount > 0 ? Math.max(7, basePoints) : basePoints;
  const rank = deriveRank(stats ?? null);
  const securedKeys = homeQuery.data?.securedDateKeys ?? [];
  const hasEverSecured = securedKeys.length > 0 || (stats?.totalDaysSecured ?? 0) > 0;
  const statsAllZero = streak === 0 && points === 0;
  const showStatDash = statsAllZero;

  const showCelebration = useCelebrationStore((s) => s.show);

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user?.id) return;
      let cancelled = false;
      const run = async () => {
        const n = stats?.activeStreak ?? 0;
        if (!STREAK_MILESTONES.some((m) => m === n)) return;
        const key = `griit_milestone_${n}`;
        const shown = await AsyncStorage.getItem(key);
        if (cancelled || shown) return;
        await AsyncStorage.setItem(key, "true");
        showCelebration({
          title: `${n}-day streak!`,
          subtitle: "You're building something real.",
          type: "streak",
        });
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, [isGuest, user?.id, stats?.activeStreak, showCelebration])
  );

  const refresh = useCallback(async () => {
    await Promise.all([homeQuery.refetch(), refetchAll()]);
  }, [homeQuery, refetchAll]);

  const onPressGoal = useCallback(
    (goalId: string) => {
      if (!firstActive?.id || goalId === "__commit__") return;
      const tasks = firstActive?.challenges?.challenge_tasks ?? [];
      const task = tasks.find((t) => t.id === goalId) as ChallengeTaskFromApi | undefined;
      const taskType = String(task?.type ?? "manual").toLowerCase();
      const taskName = (task?.title ?? "Task").trim() || "Task";
      const taskConfig = buildTaskConfigParam(task);
      const q = new URLSearchParams({
        taskId: goalId,
        activeChallengeId: firstActive.id,
        taskType,
        taskName,
        taskDescription: "",
        taskConfig,
      }).toString();
      router.push(`${ROUTES.TASK_COMPLETE}?${q}` as never);
    },
    [firstActive, router]
  );

  if (isGuest) {
    return (
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={s.header}><Text style={s.greeting}>{getGreeting()}</Text><Text style={s.word}>GRIIT</Text></View>
          <DailyQuote />
          <GoalCard goals={[]} onPressGoal={() => {}} onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)} />
          <DiscoverCTA onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={homeQuery.isRefetching}
            onRefresh={refresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.word}>GRIIT</Text>
          </View>
          <View style={s.pills}>
            <View style={[s.pill, streak > 0 && s.pillWarm]}>
              <Flame size={13} color={DS_COLORS.DISCOVER_CORAL} />
              <Text style={s.pillText}>{showStatDash ? "—" : String(streak)}</Text>
            </View>
            <View style={[s.pill, points > 0 && s.pillPurple]}>
              <Zap size={13} color={DS_COLORS.DISCOVER_BLUE} />
              <Text style={s.pillText}>{showStatDash ? "—" : String(points)}</Text>
            </View>
          </View>
        </View>

        <DailyQuote />

        {homeQuery.isPending && !homeQuery.data ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={DS_COLORS.ACCENT} />
          </View>
        ) : homeQuery.isError ? (
          <ErrorRetry message="Couldn't load your dashboard" onRetry={() => void homeQuery.refetch()} />
        ) : (homeQuery.data?.activeList.length ?? 0) === 0 ? (
          <EmptyState
            icon={Target}
            title="No active challenges"
            subtitle="Find a challenge that pushes your limits"
            action={{
              label: "Browse challenges",
              onPress: () => router.push(ROUTES.TABS_DISCOVER as never),
            }}
          />
        ) : (
          <GoalCard
            challengeName={challengeName}
            goals={goals}
            currentDay={currentDay}
            durationDays={durationDays}
            onPressGoal={onPressGoal}
            onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
            onPressInActiveChallenge={() => {
              if (firstActive?.id) void prefetchActiveChallengeById(queryClient, firstActive.id);
            }}
            isError={homeQuery.isError}
          />
        )}

        <WeekStrip
          securedDateKeys={securedKeys}
          currentStreak={streak}
          freezeCount={(stats as StatsFromApi | null)?.lastStandsAvailable ?? 0}
          hasEverSecured={hasEverSecured}
        />
        <NextUnlock currentStreak={streak} />

        <View style={s.statsRow}>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.ACCENT_TINT }]}>
              <Flame size={16} color={DS_COLORS.DISCOVER_CORAL} />
            </View>
            <Text style={s.statValue}>{showStatDash ? "—" : streak}</Text>
            <Text style={s.statLabel}>streak</Text>
          </View>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.purpleTintWarm }]}>
              <Zap size={16} color={DS_COLORS.CATEGORY_MIND} />
            </View>
            <Text style={s.statValue}>{showStatDash ? "—" : points}</Text>
            <Text style={s.statLabel}>points</Text>
          </View>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: DS_COLORS.GREEN_BG }]}>
              <Target size={16} color={DS_COLORS.GREEN} />
            </View>
            <Text style={s.rankValue}>{rank}</Text>
            <Text style={s.statLabel}>rank</Text>
          </View>
        </View>

        <LiveFeed items={homeQuery.data?.feedItems ?? []} />
        <DiscoverCTA onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  headerRow: {
    paddingHorizontal: DS_SPACING.xl,
    paddingTop: DS_SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: { paddingHorizontal: DS_SPACING.xl, paddingTop: DS_SPACING.md },
  greeting: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED },
  word: {
    marginTop: 2,
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  pills: { flexDirection: "row", gap: 6 },
  pill: {
    backgroundColor: DS_COLORS.WHITE,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: DS_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pillWarm: { backgroundColor: DS_COLORS.ACCENT_TINT },
  pillPurple: { backgroundColor: DS_COLORS.purpleTintWarm },
  pillText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  statsRow: { marginTop: DS_SPACING.md, marginHorizontal: DS_SPACING.xl, flexDirection: "row", gap: DS_SPACING.sm },
  stat: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    padding: DS_SPACING.md,
    alignItems: "center",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.sm,
  },
  statValue: {
    fontSize: DS_TYPOGRAPHY.SIZE_XL,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 3,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    color: DS_COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingWrap: { paddingVertical: DS_SPACING.xxl, alignItems: "center" },
});
