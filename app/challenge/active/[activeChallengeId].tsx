import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  MoreHorizontal,
  Check,
  Camera,
  Timer,
  FileText,
  CheckCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { getTodayDateKey } from "@/lib/date-utils";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorRetry } from "@/components/ErrorRetry";
import { EmptyState } from "@/components/ui/EmptyState";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { buildTaskConfigParam } from "@/lib/build-task-config-param";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackEvent } from "@/lib/analytics";

type TaskRow = {
  id: string;
  title?: string | null;
  task_type?: string | null;
  verification_type?: string | null;
  estimated_minutes?: number | null;
  order_index?: number | null;
  config?: Record<string, unknown> | null;
};

type ChallengeRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  duration_days?: number | null;
  difficulty?: string | null;
  category?: string | null;
  duration_type?: string | null;
  challenge_tasks?: TaskRow[] | null;
  rules?: string[] | unknown[] | null;
};

type ActiveChallengeRow = {
  id: string;
  challenge_id: string;
  start_at?: string | null;
  started_at?: string | null;
  created_at?: string | null;
  current_day?: number | null;
  challenges?: ChallengeRow | null;
};

function getHeaderColor(category: string | undefined): string {
  const cat = category?.toUpperCase();
  if (cat === "FITNESS") return DS_COLORS.HEADER_FITNESS_DEEP;
  if (cat === "MIND") return DS_COLORS.HEADER_MIND_DEEP;
  if (cat === "DISCIPLINE") return DS_COLORS.HEADER_DISCIPLINE_DEEP;
  if (cat === "FAITH") return DS_COLORS.HEADER_FAITH_DEEP;
  return DS_COLORS.HEADER_DEFAULT;
}

const AVATAR_COLORS = [
  DS_COLORS.AVATAR_1,
  DS_COLORS.AVATAR_2,
  DS_COLORS.AVATAR_3,
  DS_COLORS.AVATAR_4,
  DS_COLORS.AVATAR_5,
];

export default function ActiveChallengeDetailScreen() {
  const { activeChallengeId } = useLocalSearchParams<{ activeChallengeId: string }>();
  const id = typeof activeChallengeId === "string" ? activeChallengeId : Array.isArray(activeChallengeId) ? activeChallengeId[0] : undefined;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: activeChallenge, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["activeChallenge", id],
    queryFn: async (): Promise<ActiveChallengeRow | null> => {
      const { data, error: err } = await supabase
        .from("active_challenges")
        .select(`
          *,
          challenges (
            id, title, description, duration_days, difficulty, category, duration_type,
            challenge_tasks ( id, title, task_type, order_index, config )
          )
        `)
        .eq("id", id!)
        .single();
      if (err) throw err;
      return data as ActiveChallengeRow | null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: checkins = [] } = useQuery({
    queryKey: ["check_ins", "today", id],
    queryFn: async () => {
      const dateKey = getTodayDateKey();
      const { data, error: err } = await supabase
        .from("check_ins")
        .select("task_id, status")
        .eq("active_challenge_id", id!)
        .eq("date_key", dateKey);
      if (err) throw err;
      return (data ?? []) as { task_id: string; status: string }[];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const currentDay = useMemo(() => {
    if (!activeChallenge) return 1;
    const startDate = new Date(
      activeChallenge.start_at || (activeChallenge as { started_at?: string }).started_at || activeChallenge.created_at!
    );
    const daysDiff = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, daysDiff + 1);
  }, [activeChallenge]);

  const challenge = activeChallenge?.challenges;
  const challengeId = challenge?.id ?? activeChallenge?.challenge_id ?? "";

  const taskSkippedTracked = useRef(false);
  useEffect(() => {
    if (!activeChallenge || taskSkippedTracked.current) return;
    const joinedAt = new Date(
      activeChallenge.started_at ?? activeChallenge.start_at ?? activeChallenge.created_at ?? 0
    );
    if (Number.isNaN(joinedAt.getTime())) return;
    const daysSinceJoin = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
    const dbDay =
      typeof activeChallenge.current_day === "number" && activeChallenge.current_day > 0
        ? activeChallenge.current_day
        : currentDay;
    if (daysSinceJoin > dbDay) {
      taskSkippedTracked.current = true;
      try {
        trackEvent("task_skipped", {
          challenge_id: challengeId || activeChallenge.challenge_id,
          missed_days: Math.max(0, daysSinceJoin - dbDay),
        });
      } catch {
        /* non-fatal */
      }
    }
  }, [activeChallenge, currentDay, challengeId]);
  const tasks = useMemo(() => {
    const raw = challenge?.challenge_tasks ?? [];
    return [...raw].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [challenge?.challenge_tasks]);
  const completedTaskIds = new Set(
    checkins.filter((c) => c.status === "completed").map((c) => c.task_id)
  );
  const allDoneToday = tasks.length > 0 && tasks.every((t) => completedTaskIds.has(t.id));
  const memberCount = (challenge as { participants_count?: number })?.participants_count ?? 0;
  const activeToday = (challenge as { active_today_count?: number })?.active_today_count ?? 0;
  const securedTodayPct = memberCount > 0 ? Math.round((activeToday / Math.max(1, memberCount)) * 100) : 0;
  const completionRate = (challenge as { completion_rate?: number })?.completion_rate ?? 0;
  const headerColor = useMemo(() => getHeaderColor(challenge?.category ?? undefined), [challenge?.category]);
  const eyebrowLabel = useMemo(() => {
    if (challenge?.duration_type === "24h") return "⚡ 24-HOUR CHALLENGE";
    if ((challenge as { is_featured?: boolean })?.is_featured) return "🏆 FEATURED";
    const pc = (challenge as { participants_count?: number })?.participants_count ?? 0;
    if (pc > 100) return `🔥 ${pc} active today`;
    if (challenge?.difficulty === "extreme") return "💀 EXTREME CHALLENGE";
    return null;
  }, [challenge?.duration_type, challenge?.difficulty, challenge]);
  const { stats } = useApp();
  const { user } = useAuth();
  const streakCount = (stats as { activeStreak?: number })?.activeStreak ?? 0;
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const { error: leaveError, showError: showLeaveError, clearError: clearLeaveError } = useInlineError();

  const onRefresh = useCallback(() => refetch(), [refetch]);
  const handleLeaveChallenge = useCallback(() => {
    if (!challengeId) return;
    clearLeaveError();
    setLeaveConfirmVisible(true);
  }, [challengeId, clearLeaveError]);

  const confirmLeaveChallenge = useCallback(async () => {
    if (!challengeId) return;
    setLeaveConfirmVisible(false);
    try {
      await trpcMutate(TRPC.challenges.leave, { challengeId });
      await queryClient.invalidateQueries({ queryKey: ["home"] });
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      router.replace(ROUTES.TABS_HOME as never);
    } catch (err) {
      captureError(err, "ActiveChallengeLeaveChallenge");
      showLeaveError("Something went wrong. Please try again.");
    }
  }, [challengeId, queryClient, router, showLeaveError, user?.id]);

  const handleContinueToday = useCallback(() => {
    if (!id || !activeChallenge) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(allDoneToday ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
    }
    if (allDoneToday) {
      router.push(ROUTES.TABS_HOME as never);
      return;
    }
    const firstIncomplete = tasks.find((t) => !completedTaskIds.has(t.id));
    if (firstIncomplete) {
      router.push({
        pathname: ROUTES.TASK_COMPLETE,
        params: {
          taskId: firstIncomplete.id,
          activeChallengeId: id,
          taskType: firstIncomplete.task_type ?? "manual",
          taskName: firstIncomplete.title ?? "",
          taskDescription: "",
          taskConfig: buildTaskConfigParam(firstIncomplete as Record<string, unknown>),
        },
      } as never);
    } else {
      router.push(ROUTES.TABS_HOME as never);
    }
  }, [id, activeChallenge, allDoneToday, tasks, completedTaskIds, router]);

  const getTaskIcon = (task: TaskRow) => {
    const type = (task.task_type ?? task.verification_type ?? "").toUpperCase();
    if (type === "PHOTO" || type === "MANUAL") return Camera;
    if (type === "TIMER") return Timer;
    if (type === "TEXT" || type === "JOURNAL") return FileText;
    return CheckCircle;
  };

  if (!id) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.centerWrap}>
          <Text style={s.notFoundText}>Not found</Text>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
            style={s.retryBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={s.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: DS_COLORS.HEADER_ORANGE }]}>
        <SafeAreaView style={s.safeTop} edges={["top"]} />
        <View style={s.loadingBody}>
          <ActivityIndicator size="large" color={DS_COLORS.WHITE} />
          <Text style={s.loadingText}>Loading challenge…</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.centerWrap, { paddingHorizontal: 24 }]}>
          <ErrorRetry message="Couldn't load challenge progress" onRetry={() => void refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeChallenge) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.centerWrap}>
          <Text style={s.notFoundText}>Challenge not found</Text>
          <TouchableOpacity onPress={() => refetch()} style={s.retryBtn} accessibilityLabel="Retry loading challenge" accessibilityRole="button">
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* SECTION 1 — HEADER (fixed, ~42%) */}
      <SafeAreaView style={s.safeTop} edges={["top"]} />
      <View style={[s.header, { backgroundColor: headerColor }]}>
        <View style={s.headerTopBar}>
          <TouchableOpacity style={s.headerCircleBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))} accessibilityLabel="Back" accessibilityRole="button">
            <ChevronLeft size={20} color={DS_COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={s.headerCenterTitle}>Challenge</Text>
          <TouchableOpacity
            style={s.headerCircleBtn}
            onPress={handleLeaveChallenge}
            accessibilityLabel="Open challenge options"
            accessibilityRole="button"
          >
            <MoreHorizontal size={20} color={DS_COLORS.WHITE} />
          </TouchableOpacity>
        </View>
        {eyebrowLabel != null && <Text style={s.eyebrow}>{eyebrowLabel}</Text>}
        <Text style={s.challengeTitle}>{challenge?.title ?? "Challenge"}</Text>
        {challenge?.description ? (
          <Text style={s.challengeSubtitle} numberOfLines={2}>{challenge.description}</Text>
        ) : null}
        <View style={s.pillRow}>
          <View style={s.pill}><Text style={s.pillText}>{challenge?.duration_days ?? 0} days</Text></View>
          <View style={s.pill}><Text style={s.pillText}>Day {currentDay}/{challenge?.duration_days ?? 0}</Text></View>
          {challenge?.difficulty ? (
            <View style={s.pill}><Text style={s.pillText}>{String(challenge.difficulty)}</Text></View>
          ) : null}
        </View>
      </View>

      {/* SECTION 2 — SCROLLABLE BODY */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT_PRIMARY} />}
      >
        <InlineError message={leaveError} onDismiss={clearLeaveError} />
        <View style={s.body}>
          {/* Card A — Members */}
          <View style={s.card}>
            <View style={s.membersRow}>
              <View style={s.avatarStack}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[s.avatarCircle, { backgroundColor: AVATAR_COLORS[i % 5], marginLeft: i > 0 ? -10 : 0 }]}>
                    <Text style={s.avatarInitial}>?</Text>
                  </View>
                ))}
              </View>
              <View style={s.membersText}>
                <Text style={s.membersPrimary}>{memberCount} in this challenge</Text>
                <Text style={s.membersSecondary}>
                  {memberCount === 0 ? "Be the first to join" : `${activeToday} active today`}
                </Text>
              </View>
            </View>
          </View>

          {/* Card B — Stats */}
          <View style={s.card}>
            <View style={s.statsRow}>
              <View style={s.statsCol}>
                <Text style={[s.statsValue, { color: DS_COLORS.ACCENT_PRIMARY }]}>{securedTodayPct}%</Text>
                <Text style={s.statsLabel}>secured today</Text>
              </View>
              <View style={s.statsDivider} />
              <View style={s.statsCol}>
                <Text style={[s.statsValue, { color: DS_COLORS.ACCENT_PRIMARY }]}>{completionRate}%</Text>
                <Text style={s.statsLabel}>completion rate</Text>
              </View>
            </View>
          </View>

          {/* Today's Goals */}
          <Text style={s.sectionTitle}>Today&apos;s Goals</Text>
          {tasks.length === 0 ? (
            <View style={{ marginBottom: 12 }}>
              <EmptyState
                icon={CheckCircle}
                title="No tasks completed yet"
                subtitle="Start checking off today's tasks"
              />
            </View>
          ) : (
          <View style={[s.card, s.missionCard]}>
            {tasks.map((task) => {
              const isCompleted = completedTaskIds.has(task.id);
              const IconComp = getTaskIcon(task);
              const estMin = task.estimated_minutes ?? (task as { duration_minutes?: number }).duration_minutes;
              const verificationType = (task.verification_type ?? task.task_type ?? "Check").toString();
              return (
                <TouchableOpacity
                  key={task.id}
                  style={s.missionRow}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({
                      pathname: ROUTES.TASK_COMPLETE,
                      params: {
                        taskId: task.id,
                        activeChallengeId: id,
                        taskType: task.task_type ?? "manual",
                        taskName: task.title ?? "",
                        taskDescription: "",
                        taskConfig: buildTaskConfigParam(task as Record<string, unknown>),
                      },
                    } as never);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isCompleted
                      ? `Open completed task ${task.title ?? "Task"}`
                      : `Start task ${task.title ?? "Task"}`
                  }
                >
                  <View style={[s.missionIconWrap, isCompleted && s.missionIconWrapDone]}>
                    <IconComp size={20} color={isCompleted ? DS_COLORS.ACCENT_GREEN : DS_COLORS.ACCENT_PRIMARY} />
                  </View>
                  <View style={s.missionContent}>
                    <Text style={[s.missionTaskTitle, isCompleted && s.missionTaskTitleDone]}>{task.title ?? "Task"}</Text>
                    <Text style={s.missionTaskSub}>{verificationType} · ~{estMin ?? "?"} min</Text>
                  </View>
                  {isCompleted ? (
                    <Check size={20} color={DS_COLORS.ACCENT_GREEN} />
                  ) : (
                    <Text style={s.startLink}>Start ›</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          )}

          {/* Rules */}
          {challenge?.rules && Array.isArray(challenge.rules) && challenge.rules.length > 0 && (
            <>
              <Text style={s.sectionTitleRules}>Rules</Text>
              <View style={[s.card, s.rulesCard]}>
                {(challenge.rules as string[]).map((rule: string, i: number) => (
                  <View key={i} style={[s.ruleRow, i < challenge.rules!.length - 1 && s.ruleRowBorder]}>
                    <View style={s.ruleCheck}>
                      <Check size={14} color={DS_COLORS.ACCENT_GREEN} />
                    </View>
                    <Text style={s.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* About */}
          <Text style={s.sectionTitleAbout}>About</Text>
          <Text style={s.aboutText}>{challenge?.description ?? ""}</Text>
          {/* Day secured celebration card */}
          {allDoneToday && (
            <View style={s.celebrationCard}>
              <Text style={s.celebrationEmoji}>🔥</Text>
              <Text style={s.celebrationTitle}>You showed up.</Text>
              <Text style={s.celebrationSub}>
                Day {currentDay} secured. Keep the streak alive.
              </Text>
              <Text style={s.celebrationStreak}>
                {streakCount} day streak
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* SECTION 3 — BOTTOM CTA (fixed) */}
      <View style={[s.footer, { paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity
          style={[s.ctaButton, allDoneToday ? { backgroundColor: DS_COLORS.ACCENT_GREEN } : { backgroundColor: DS_COLORS.ACCENT_PRIMARY }]}
          onPress={handleContinueToday}
          activeOpacity={0.85}
          accessibilityLabel={allDoneToday ? "Day secured" : "Continue today"}
          accessibilityRole="button"
        >
          <Text style={s.ctaText}>{allDoneToday ? "Day Secured ✓" : "Continue Today"}</Text>
        </TouchableOpacity>
        <Text style={s.ctaMicro}>Day resets at midnight</Text>
      </View>

      <ConfirmDialog
        visible={leaveConfirmVisible}
        title={`Leave ${challenge?.title ?? "challenge"}?`}
        message="Your progress in this challenge will be lost. You'll need to rejoin to start again."
        confirmLabel="Leave"
        destructive
        onCancel={() => setLeaveConfirmVisible(false)}
        onConfirm={() => void confirmLeaveChallenge()}
      />
    </View>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  safeTop: { backgroundColor: "transparent" },
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  notFoundText: { fontSize: 18, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 16 },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: DS_COLORS.ACCENT_PRIMARY },
  retryBtnText: { fontSize: 16, fontWeight: "700", color: DS_COLORS.WHITE },
  loadingBody: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { fontSize: 15, color: DS_COLORS.WHITE, marginTop: 12 },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenterTitle: { fontSize: 16, fontWeight: "500", color: DS_COLORS.WHITE },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: DS_COLORS.WHITE,
    opacity: 0.8,
    marginTop: 16,
  },
  challengeTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: DS_COLORS.WHITE,
    lineHeight: 38,
    marginTop: 6,
  },
  challengeSubtitle: { fontSize: 15, color: DS_COLORS.WHITE, opacity: 0.65, marginTop: 4 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  pill: {
    backgroundColor: DS_COLORS.OVERLAY_BLACK_25,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: { color: DS_COLORS.WHITE, fontSize: 13, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  body: {},
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: DS_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  membersRow: { flexDirection: "row", alignItems: "center" },
  avatarStack: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DS_COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 11, fontWeight: "700", color: DS_COLORS.WHITE },
  membersText: { marginLeft: 12, flex: 1 },
  membersPrimary: { fontSize: 15, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  membersSecondary: { fontSize: 13, color: DS_COLORS.TEXT_SECONDARY, marginTop: 2 },
  statsRow: { flexDirection: "row", alignItems: "stretch" },
  statsCol: { flex: 1, alignItems: "center", justifyContent: "center" },
  statsValue: { fontSize: 28, fontWeight: "700" },
  statsLabel: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, marginTop: 4 },
  statsDivider: { width: 1, backgroundColor: DS_COLORS.DIVIDER, alignSelf: "stretch", marginVertical: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginTop: 8, marginBottom: 12 },
  missionCard: { overflow: "hidden" },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  missionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  missionIconWrapDone: { backgroundColor: DS_COLORS.ACCENT_GREEN_BG },
  missionContent: { flex: 1 },
  missionTaskTitle: { fontSize: 15, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  missionTaskTitleDone: { textDecorationLine: "line-through", color: DS_COLORS.TEXT_MUTED },
  missionTaskSub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, marginTop: 2 },
  startLink: { fontSize: 14, fontWeight: "500", color: DS_COLORS.DISCOVER_CORAL },
  sectionTitleRules: { fontSize: 20, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginTop: 16, marginBottom: 12 },
  rulesCard: { overflow: "hidden" },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 14 },
  ruleRowBorder: { borderBottomWidth: 0.5, borderBottomColor: DS_COLORS.DIVIDER, marginHorizontal: 16 },
  ruleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DS_COLORS.ACCENT_GREEN_BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },
  ruleText: { flex: 1, fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 20 },
  sectionTitleAbout: { fontSize: 20, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginTop: 16, marginBottom: 12 },
  aboutText: { fontSize: 15, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 24, marginBottom: 32 },
  celebrationCard: {
    backgroundColor: DS_COLORS.GREEN_BG,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 0,
    marginBottom: 12,
  },
  celebrationEmoji: { fontSize: 32 },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: DS_COLORS.ACCENT_GREEN,
    marginTop: 8,
  },
  celebrationSub: {
    fontSize: 14,
    color: DS_COLORS.ACCENT_GREEN,
    marginTop: 4,
    textAlign: "center",
  },
  celebrationStreak: {
    fontSize: 32,
    fontWeight: "800",
    color: DS_COLORS.ACCENT_GREEN,
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DS_COLORS.WHITE,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.DIVIDER,
  },
  ctaButton: { borderRadius: 14, height: 56, width: "100%", alignItems: "center", justifyContent: "center" },
  ctaText: { color: DS_COLORS.WHITE, fontSize: 17, fontWeight: "700" },
  ctaMicro: { fontSize: 12, color: DS_COLORS.TEXT_MUTED, textAlign: "center", marginTop: 8 },
});
