import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Flame, Zap, Target } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import type { TodayCheckinForUser, StatsFromApi } from "@/types";
import DailyQuote from "@/components/home/DailyQuote";
import GoalCard from "@/components/home/GoalCard";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import LiveFeed from "@/components/home/LiveFeed";
import DiscoverCTA from "@/components/home/DiscoverCTA";

type TaskRow = { id: string; title?: string; type?: string; required?: boolean };
type ActiveRow = {
  id: string;
  challenge_id: string;
  current_day_index?: number;
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
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function toAge(iso: string): string {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
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
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const { stats, refetchAll } = useApp();

  const homeQuery = useQuery({
    queryKey: ["home", "v2", user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<HomeData> => {
      const [activeRaw, checkinsRaw, securedRaw, feedRaw] = await Promise.all([
        trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
        trpcQuery(TRPC.checkins.getTodayCheckinsForUser) as Promise<TodayCheckinForUser[]>,
        trpcQuery(TRPC.profiles.getSecuredDateKeys) as Promise<string[]>,
        trpcQuery(TRPC.feed.list, { limit: 5 }) as Promise<{ items?: { id: string; event_type: string; username?: string; display_name?: string; metadata?: Record<string, unknown>; created_at: string }[] }>,
      ]);

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
  const currentDay = firstActive?.current_day_index ?? 1;
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

  const refresh = useCallback(async () => {
    await Promise.all([homeQuery.refetch(), refetchAll()]);
  }, [homeQuery, refetchAll]);

  const onPressGoal = useCallback(() => {
    if (!firstActive?.id) return;
    router.push(ROUTES.CHALLENGE_ACTIVE(firstActive.id) as never);
  }, [firstActive?.id, router]);

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
        refreshControl={<RefreshControl refreshing={homeQuery.isRefetching} onRefresh={refresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.word}>GRIIT</Text>
          </View>
          <View style={s.pills}>
            <View style={[s.pill, streak > 0 && s.pillWarm]}><Flame size={13} color="#E8593C" /><Text style={s.pillText}>{streak}</Text></View>
            <View style={[s.pill, points > 0 && s.pillPurple]}><Zap size={13} color="#5B7FD4" /><Text style={s.pillText}>{points}</Text></View>
          </View>
        </View>

        <DailyQuote />

        <GoalCard
          challengeName={challengeName}
          goals={goals}
          currentDay={currentDay}
          durationDays={durationDays}
          onPressGoal={onPressGoal}
          onPressFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
          isError={homeQuery.isError}
          onRetry={() => homeQuery.refetch()}
        />

        <WeekStrip securedDateKeys={homeQuery.data?.securedDateKeys ?? []} currentStreak={streak} freezeCount={(stats as StatsFromApi | null)?.lastStandsAvailable ?? 0} />
        <NextUnlock currentStreak={streak} />

        <View style={s.statsRow}>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: "#FFF3ED" }]}><Flame size={16} color="#E8593C" /></View>
            <Text style={s.statValue}>{streak}</Text>
            <Text style={s.statLabel}>streak</Text>
          </View>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: "#EDE8FF" }]}><Zap size={16} color="#7C5FD4" /></View>
            <Text style={s.statValue}>{points}</Text>
            <Text style={s.statLabel}>points</Text>
          </View>
          <View style={s.stat}>
            <View style={[s.statIconWrap, { backgroundColor: "#E8F5E9" }]}><Target size={16} color="#2E7D32" /></View>
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  headerRow: { paddingHorizontal: 24, paddingTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  greeting: { fontSize: 13, color: "#999" },
  word: { marginTop: 2, fontSize: 20, fontWeight: "700", color: "#1A1A1A", letterSpacing: -0.3 },
  pills: { flexDirection: "row", gap: 6 },
  pill: { backgroundColor: "#fff", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 5 },
  pillWarm: { backgroundColor: "#FFF3ED" },
  pillPurple: { backgroundColor: "#EDE8FF" },
  pillText: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  statsRow: { marginTop: 12, marginHorizontal: 24, flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12, alignItems: "center" },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  rankValue: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginTop: 3 },
  statLabel: { marginTop: 2, fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
});
