import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  MoreHorizontal,
  Check,
  Camera,
  Timer,
  Target,
  Pencil,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useApp } from "@/contexts/AppContext";
import { ROUTES } from "@/lib/routes";
import type { ChallengeTaskFromApi, CheckinFromApi } from "@/types";
import {
  DS_COLORS,
  DS_SPACING,
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_SHADOWS,
} from "@/lib/design-system";
import { Platform } from "react-native";

const TASK_ICONS: Record<string, React.ElementType> = {
  run: Target,
  timer: Timer,
  journal: Pencil,
  photo: Camera,
  checkin: Target,
  checklist: Target,
  manual: Target,
  custom: Target,
};

function getHeaderBg(category: string | undefined): string {
  if (category === "MIND") return DS_COLORS.CATEGORY_MIND;
  if (category === "FITNESS") return DS_COLORS.CATEGORY_FITNESS;
  if (category === "DISCIPLINE") return DS_COLORS.CATEGORY_DISCIPLINE;
  return DS_COLORS.BG_HEADER_DEFAULT;
}

export default function ActiveChallengeDetailScreen() {
  const { activeChallengeId } = useLocalSearchParams<{ activeChallengeId: string }>();
  const id = typeof activeChallengeId === "string" ? activeChallengeId : Array.isArray(activeChallengeId) ? activeChallengeId[0] : undefined;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refetchAll } = useApp();

  const listQuery = useQuery({
    queryKey: ["challenge", "listMyActive", id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    enabled: !!id,
  });

  const checkinsQuery = useQuery({
    queryKey: ["checkins", "today", id],
    queryFn: () => trpcQuery(TRPC.checkins.getTodayCheckins, { activeChallengeId: id! }) as Promise<CheckinFromApi[]>,
    enabled: !!id,
  });

  const ac = useMemo(() => {
    const list = Array.isArray(listQuery.data) ? listQuery.data : [];
    return list.find((r: { id?: string }) => r.id === id) as {
      id: string;
      challenge_id: string;
      user_id: string;
      status: string;
      start_at?: string;
      started_at?: string;
      challenges?: {
        id: string;
        title?: string;
        description?: string;
        duration_days?: number;
        difficulty?: string;
        category?: string;
        duration_type?: string;
        challenge_tasks?: Array<{
          id: string;
          title?: string;
          task_type?: string;
          type?: string;
          order_index?: number;
          verification_type?: string;
          estimated_minutes?: number;
          duration_minutes?: number;
        }>;
        rules?: string[] | unknown[];
      };
    } | undefined;
  }, [listQuery.data, id]);

  const currentDay = useMemo(() => {
    if (!ac) return 1;
    const startAt = ac.start_at ?? (ac as { started_at?: string }).started_at;
    if (!startAt) return 1;
    return Math.floor((Date.now() - new Date(startAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [ac]);

  const challenge = ac?.challenges;
  const durationDays = challenge?.duration_days ?? 1;
  const todayCheckins = (checkinsQuery.data ?? []) as CheckinFromApi[];
  const completedTaskIds = new Set(
    todayCheckins.filter((c) => c.status === "completed").map((c) => c.task_id)
  );
  const tasks = useMemo(() => {
    const raw = challenge?.challenge_tasks ?? [];
    return [...raw].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [challenge?.challenge_tasks]);
  const requiredTasks = tasks.filter((t: { required?: boolean }) => t.required !== false);
  const completedCount = requiredTasks.filter((t: { id: string }) => completedTaskIds.has(t.id)).length;
  const allDoneToday = requiredTasks.length > 0 && completedCount >= requiredTasks.length;
  const participantsCount = (challenge as { participants_count?: number })?.participants_count ?? 0;
  const activeTodayCount = (challenge as { active_today_count?: number })?.active_today_count ?? 0;
  const completionRate = (challenge as { completion_rate?: number })?.completion_rate ?? 0;
  const securedTodayPct = participantsCount > 0 ? Math.round((activeTodayCount / Math.max(1, participantsCount)) * 100) : 0;
  const headerBg = getHeaderBg(challenge?.category);
  const challengeTypeLabel = challenge?.duration_type === "24h" ? "24-HOUR CHALLENGE" : "STANDARD";
  const difficultyLabel = challenge?.difficulty ? String(challenge.difficulty).toUpperCase() : "";

  const onRefresh = useCallback(async () => {
    await Promise.all([listQuery.refetch(), checkinsQuery.refetch(), refetchAll()]);
  }, [listQuery, checkinsQuery, refetchAll]);

  const handleContinueToday = useCallback(() => {
    if (!id || !ac) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (allDoneToday) {
      router.push(ROUTES.TABS_HOME as never);
      return;
    }
    const firstIncomplete = requiredTasks.find((t: { id: string }) => !completedTaskIds.has(t.id));
    if (firstIncomplete) {
      router.push({
        pathname: ROUTES.TASK_COMPLETE,
        params: {
          taskId: firstIncomplete.id,
          activeChallengeId: id,
          taskType: (firstIncomplete as { type?: string }).type ?? (firstIncomplete as { task_type?: string }).task_type ?? "manual",
          taskName: firstIncomplete.title ?? "",
          taskDescription: "",
          taskConfig: "{}",
        },
      } as never);
    } else {
      router.push(ROUTES.TABS_HOME as never);
    }
  }, [id, ac, allDoneToday, requiredTasks, completedTaskIds, router]);

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerWrap}>
          <Text style={styles.notFoundText}>Not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (listQuery.isLoading || (!ac && listQuery.isSuccess)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={DS_COLORS.ACCENT_PRIMARY} />
          <Text style={styles.loadingText}>Loading challenge…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ac) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerWrap}>
          <Text style={styles.notFoundText}>Challenge not found</Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.TABS_HOME as never)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: DS_COLORS.BG_PAGE }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={listQuery.isRefetching} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT_PRIMARY} />
        }
      >
        {/* Header — solid color */}
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={24} color={DS_COLORS.WHITE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} accessibilityLabel="More" accessibilityRole="button">
              <MoreHorizontal size={22} color={DS_COLORS.WHITE} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>{challengeTypeLabel}</Text>
          <Text style={styles.title}>{challenge?.title ?? "Challenge"}</Text>
          {challenge?.description ? (
            <Text style={styles.subtitle} numberOfLines={2}>{challenge.description}</Text>
          ) : null}
          <View style={styles.pillRow}>
            <View style={styles.pill}><Text style={styles.pillText}>{durationDays}d</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Day {currentDay}/{durationDays}</Text></View>
            {difficultyLabel ? (
              <View style={styles.pill}><Text style={styles.pillText}>{difficultyLabel}</Text></View>
            ) : null}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Members card */}
          <View style={[styles.card, DS_SHADOWS.card]}>
            <View style={styles.membersRow}>
              <View style={styles.avatarStack}>
                {[1, 2, 3, 4, 5].slice(0, 5).map((i) => (
                  <View key={i} style={[styles.avatarCircle, { backgroundColor: [DS_COLORS.AVATAR_1, DS_COLORS.AVATAR_2, DS_COLORS.AVATAR_3, DS_COLORS.AVATAR_4, DS_COLORS.AVATAR_5][i % 5], marginLeft: i > 1 ? -10 : 0 }]} />
                ))}
              </View>
              <View style={styles.membersText}>
                <Text style={styles.membersPrimary}>{participantsCount} in this challenge</Text>
                <Text style={styles.membersSecondary}>{activeTodayCount} active today</Text>
              </View>
            </View>
          </View>

          {/* Stats card — only if user has started */}
          <View style={[styles.card, DS_SHADOWS.card]}>
            <View style={styles.statsRow}>
              <View style={styles.statsCol}>
                <Text style={[styles.statsValue, { color: DS_COLORS.ACCENT_PRIMARY }]}>{securedTodayPct}%</Text>
                <Text style={styles.statsLabel}>secured today</Text>
              </View>
              <View style={[styles.statsDivider, { backgroundColor: DS_COLORS.BORDER }]} />
              <View style={styles.statsCol}>
                <Text style={[styles.statsValue, { color: DS_COLORS.ACCENT_PRIMARY }]}>{completionRate}%</Text>
                <Text style={styles.statsLabel}>completion rate</Text>
              </View>
            </View>
          </View>

          {/* Day tracker — dots (no progress grid) */}
          <View style={[styles.card, DS_SHADOWS.card]}>
            {durationDays <= 30 ? (
              <View style={styles.dotsRow}>
                {Array.from({ length: durationDays }, (_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = dayNum < currentDay;
                  const isCurrent = dayNum === currentDay;
                  return (
                    <View
                      key={dayNum}
                      style={[
                        styles.dot,
                        isCompleted && { backgroundColor: DS_COLORS.ACCENT_PRIMARY },
                        isCurrent && { backgroundColor: "transparent", borderWidth: 2, borderColor: DS_COLORS.ACCENT_PRIMARY },
                        !isCompleted && !isCurrent && { backgroundColor: DS_COLORS.TEXT_MUTED + "40" },
                      ]}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.dayTrackerText}>Day {currentDay} of {durationDays}</Text>
            )}
          </View>

          {/* Today's Missions */}
          <Text style={styles.sectionTitle}>Today&apos;s Missions</Text>
          <View style={[styles.card, DS_SHADOWS.card]}>
            {requiredTasks.map((task: { id: string; title?: string; task_type?: string; type?: string; duration_minutes?: number; estimated_minutes?: number }, index: number) => {
              const taskType = (task as { type?: string }).type ?? (task as { task_type?: string }).task_type ?? "manual";
              const IconComp = TASK_ICONS[taskType] ?? TASK_ICONS.photo;
              const isPhoto = taskType === "photo" || taskType === "manual";
              const isTimer = taskType === "timer";
              const isChecklist = taskType === "checklist" || taskType === "checkin";
              const isText = taskType === "journal";
              const iconComp = isPhoto ? Camera : isTimer ? Timer : isChecklist ? Target : Pencil;
              const isCompleted = completedTaskIds.has(task.id);
              const estMin = task.duration_minutes ?? task.estimated_minutes;
              const verificationLabel = taskType === "photo" ? "Photo" : taskType === "timer" ? "Timer" : taskType === "journal" ? "Journal" : "Check";
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.missionRow, index < requiredTasks.length - 1 && styles.missionRowBorder]}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: ROUTES.TASK_COMPLETE,
                      params: {
                        taskId: task.id,
                        activeChallengeId: id,
                        taskType: taskType,
                        taskName: task.title ?? "",
                        taskDescription: "",
                        taskConfig: "{}",
                      },
                    } as never);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <View style={[styles.missionIconWrap, { backgroundColor: DS_COLORS.TASK_ICON_BG }]}>
                    {isCompleted ? (
                      <Check size={18} color={DS_COLORS.ACCENT_GREEN} />
                    ) : (
                      React.createElement(iconComp, { size: 18, color: DS_COLORS.TASK_ICON_COLOR })
                    )}
                  </View>
                  <View style={styles.missionContent}>
                    <Text style={[styles.missionTitle, isCompleted && styles.missionTitleDone]}>{task.title ?? "Task"}</Text>
                    <Text style={styles.missionSub}>
                      {verificationLabel}{estMin != null ? ` · ${estMin} min` : ""}
                    </Text>
                  </View>
                  {!isCompleted && (
                    <Text style={styles.startLink}>Start &gt;</Text>
                  )}
                  {isCompleted && (
                    <Check size={20} color={DS_COLORS.ACCENT_GREEN} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Rules */}
          {challenge?.rules && Array.isArray(challenge.rules) && challenge.rules.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Rules</Text>
              <View style={[styles.card, DS_SHADOWS.card]}>
                {(challenge.rules as string[]).map((rule: string, i: number) => (
                  <View key={i} style={styles.ruleRow}>
                    <View style={[styles.ruleCheck, { backgroundColor: DS_COLORS.ACCENT_GREEN }]}>
                      <Check size={12} color={DS_COLORS.WHITE} />
                    </View>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {challenge?.description ?? "No description."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + DS_SPACING.md }]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            allDoneToday ? { backgroundColor: DS_COLORS.ACCENT_GREEN } : { backgroundColor: DS_COLORS.ACCENT_PRIMARY },
          ]}
          onPress={handleContinueToday}
          activeOpacity={0.85}
          accessibilityLabel={allDoneToday ? "Day secured" : "Continue today"}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>
            {allDoneToday ? "Day Secured ✓" : "Continue Today"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.ctaMicro}>Day resets at midnight</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: 0,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 12,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.WHITE,
  },
  header: {
    paddingTop: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.lg,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DS_SPACING.lg,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: DS_COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: DS_COLORS.WHITE,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: DS_COLORS.WHITE,
    opacity: 0.7,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
  },
  body: {
    paddingTop: DS_SPACING.lg,
  },
  card: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.card,
    padding: 16,
    marginBottom: DS_SPACING.md,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.BORDER,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  membersText: {
    flex: 1,
  },
  membersPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  membersSecondary: {
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  statsCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  statsDivider: {
    width: 1,
    marginVertical: 4,
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayTrackerText: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  missionRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.BORDER,
  },
  missionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  missionTitleDone: {
    textDecorationLine: "line-through",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  missionSub: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  startLink: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.ACCENT_PRIMARY,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ruleCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  ruleText: {
    fontSize: 14,
    color: DS_COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  aboutText: {
    fontSize: 15,
    color: DS_COLORS.TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: DS_SPACING.lg,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: DS_SPACING.md,
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  ctaButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: DS_COLORS.WHITE,
  },
  ctaMicro: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    textAlign: "center",
    marginTop: 8,
  },
});
