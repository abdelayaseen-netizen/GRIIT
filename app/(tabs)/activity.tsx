import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Activity as ActivityIcon, Camera, Trophy } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/contexts/AppContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, GRIIT_COLORS, getCategoryColors } from "@/lib/design-system";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
type ActivityItem = {
  id: string;
  type: "activity" | "milestone";
  challengeId: string | null;
  taskName: string;
  challengeTitle: string;
  challengeCategory: string;
  completedAt: string;
  hasProof: boolean;
  milestoneTitle?: string | null;
  milestoneSubtitle?: string | null;
};

type ActivitySection = {
  title: string;
  data: ActivityItem[];
};

function formatSectionLabel(iso: string): string {
  const when = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startWhen = new Date(when.getFullYear(), when.getMonth(), when.getDate()).getTime();
  const diffDays = Math.round((startToday - startWhen) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return when.toLocaleDateString(undefined, { weekday: "long" });
  return when.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const ActivityRow = React.memo(function ActivityRow({
  item,
  onPress,
}: {
  item: ActivityItem;
  onPress: (item: ActivityItem) => void;
}) {
  if (item.type === "milestone") {
    const milestoneColor = getCategoryColors(item.challengeCategory).header;
    return (
      <View style={styles.milestoneWrap} accessibilityRole="text" accessibilityLabel={`Milestone: ${item.milestoneTitle ?? "Milestone"}`}>
        <View style={[styles.milestoneLeft, { backgroundColor: milestoneColor }]} />
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneTitleRow}>
            <Trophy size={16} color={DS_COLORS.ACCENT_PRIMARY} />
            <Text style={styles.milestoneTitle}>{item.milestoneTitle ?? "Milestone reached!"}</Text>
          </View>
          <Text style={styles.milestoneSubtitle}>{item.milestoneSubtitle ?? "Consistency wins. Keep it up."}</Text>
        </View>
      </View>
    );
  }
  const dotColor = getCategoryColors(item.challengeCategory).header;
  return (
    <TouchableOpacity
      style={styles.activityRow}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${item.taskName} for ${item.challengeTitle}, completed at ${formatTime(item.completedAt)}`}
    >
      <View style={[styles.categoryDot, { backgroundColor: dotColor }]} />
      <View style={styles.activityCenter}>
        <Text style={styles.activityTask}>{item.taskName}</Text>
        <Text style={styles.activityChallenge}>{item.challengeTitle}</Text>
      </View>
      <View style={styles.activityRight}>
        <Text style={styles.activityTime}>{formatTime(item.completedAt)}</Text>
        {item.hasProof ? <Camera size={14} color={DS_COLORS.TEXT_SECONDARY} /> : null}
      </View>
    </TouchableOpacity>
  );
});

export default function ActivityScreen() {
  const router = useRouter();
  const { currentUser } = useApp();
  const summaryQuery = useQuery({
    queryKey: ["activity", "summary", currentUser?.id],
    queryFn: () =>
      trpcQuery(TRPC.feed.getMySummary) as Promise<{
        totalTasksCompleted: number;
        currentStreak: number;
        activeChallenges: number;
      }>,
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  const activityQuery = useInfiniteQuery({
    queryKey: ["activity", "feed", currentUser?.id],
    queryFn: async ({ pageParam }: { pageParam?: string }) =>
      (await trpcQuery(TRPC.feed.listMine, {
        limit: 20,
        cursor: pageParam,
      })) as { items: ActivityItem[]; nextCursor: string | null },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const items = useMemo(() => (activityQuery.data?.pages ?? []).flatMap((p) => p.items), [activityQuery.data?.pages]);
  const sections = useMemo<ActivitySection[]>(() => {
    const grouped = new Map<string, ActivityItem[]>();
    for (const item of items) {
      const key = formatSectionLabel(item.completedAt);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(item);
    }
    return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  const handleOpenItem = useCallback(
    (item: ActivityItem) => {
      if (item.type === "activity" && item.challengeId) {
        router.push(`/challenge/${item.challengeId}` as never);
      }
    },
    [router]
  );

  const empty = !activityQuery.isPending && !activityQuery.isError && sections.length === 0;
  const isInitialLoading = activityQuery.isPending && !activityQuery.data;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.headerTitle}>Activity</Text>

      {summaryQuery.data ? (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.statValueAccent]} accessibilityRole="text" accessibilityLabel={`Total tasks completed: ${summaryQuery.data.totalTasksCompleted}`}>
              {summaryQuery.data.totalTasksCompleted}
            </Text>
            <Text style={styles.statLabel}>Tasks done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.statValueAccent]} accessibilityRole="text" accessibilityLabel={`Current streak: ${summaryQuery.data.currentStreak} days`}>
              {summaryQuery.data.currentStreak}
            </Text>
            <Text style={styles.statLabel}>Current streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue} accessibilityRole="text" accessibilityLabel={`${summaryQuery.data.activeChallenges} active challenges`}>
              {summaryQuery.data.activeChallenges}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      ) : null}

      {activityQuery.isError ? (
        <ErrorState message="Couldn't load activity" onRetry={() => void activityQuery.refetch()} />
      ) : isInitialLoading ? (
        <LoadingState message="Loading activity..." />
      ) : empty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <ActivityIcon size={48} color={DS_COLORS.BORDER} />
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first challenge task to see your history here.
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push("/(tabs)/discover" as never)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Browse available challenges"
            >
              <Text style={styles.emptyCtaText}>Browse Challenges</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => <ActivityRow item={item} onPress={handleOpenItem} />}
          onEndReached={() => {
            if (activityQuery.hasNextPage && !activityQuery.isFetchingNextPage) {
              void activityQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            activityQuery.isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <LoadingState message="Loading more..." />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GRIIT_COLORS.background,
  },
  headerTitle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: DS_COLORS.CHALLENGE_HEADER_DARK,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: DS_COLORS.CHALLENGE_HEADER_DARK,
  },
  statValueAccent: {
    color: DS_COLORS.DISCOVER_CORAL,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
    paddingTop: 16,
    paddingBottom: 8,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: DS_COLORS.WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: DS_COLORS.BORDER,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityCenter: {
    flex: 1,
  },
  activityTask: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.CHALLENGE_HEADER_DARK,
  },
  activityChallenge: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  activityTime: {
    fontSize: 11,
    color: DS_COLORS.TEXT_MUTED,
  },
  milestoneWrap: {
    marginBottom: 8,
    flexDirection: "row",
  },
  milestoneLeft: {
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: DS_COLORS.WHITE,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  milestoneTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.CHALLENGE_HEADER_DARK,
  },
  milestoneSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyCard: {
    alignItems: "center",
    maxWidth: 300,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.CHALLENGE_HEADER_DARK,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    maxWidth: 260,
  },
  emptyCta: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  footerLoader: {
    paddingTop: 10,
  },
});
