import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Search } from "lucide-react-native";

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
  DS_MEASURES,
} from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  SkeletonHeroCard,
  SkeletonChallengeCard,
  SkeletonBase,
} from "@/components/skeletons";
import SectionHeader from "@/components/shared/SectionHeader";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";

import {
  StreakRiskBanner,
  type StreakAtRiskData,
} from "@/components/discover/StreakRiskBanner";
import {
  CategoryChips,
  type DiscoverCategory,
} from "@/components/discover/CategoryChips";
import {
  HeroFeaturedCard,
  type HeroFeaturedData,
} from "@/components/challenges/HeroFeaturedCard";
import { DailyCard, type DailyCardData } from "@/components/challenges/DailyCard";
import {
  CompactChallengeRow,
  type CompactChallengeRowData,
  type CompactChallengeProofType,
} from "@/components/challenges/CompactChallengeRow";
import {
  type ChallengeCategory,
  type ChallengeDifficulty,
} from "@/components/challenges/_card-helpers";
import { SuggestedPeopleRow } from "@/components/discover/SuggestedPeopleRow";
import { TrendingPostsSection } from "@/components/discover/TrendingPostsSection";
import { CategoryRail } from "@/components/discover/CategoryRail";
import { FindMoreFooter } from "@/components/discover/FindMoreFooter";

const HABIT_PAGE_SIZE = 10;

type ChallengeRow = {
  id: string;
  title?: string | null;
  duration_days?: number | null;
  difficulty?: string | null;
  category?: string | null;
  challenge_tasks?:
    | { task_type?: string | null; config?: Record<string, unknown> | null }[]
    | null;
};

type ListPage = { items: ChallengeRow[]; nextCursor?: string };
type ListResponse = ChallengeRow[] | ListPage;

function asListPage(resp: ListResponse): ListPage {
  if (Array.isArray(resp)) {
    return { items: resp, nextCursor: undefined };
  }
  return { items: resp.items ?? [], nextCursor: resp.nextCursor };
}

function deriveProofType(
  tasks: ChallengeRow["challenge_tasks"]
): CompactChallengeProofType {
  for (const t of tasks ?? []) {
    const tt = String(t.task_type ?? "").toLowerCase();
    const cfg = (t.config ?? {}) as Record<string, unknown>;
    if (tt === "location" || cfg.require_location === true) return "location";
    if (
      tt === "photo" ||
      cfg.require_photo_proof === true ||
      cfg.photo_required === true
    )
      return "photo";
  }
  return "text";
}

function toDifficulty(d: string | null | undefined): ChallengeDifficulty {
  const x = String(d ?? "medium").toLowerCase();
  if (x === "easy") return "EASY";
  if (x === "hard" || x === "extreme") return "HARD";
  return "MED";
}

function toCategory(cat: string | null | undefined): ChallengeCategory {
  const x = String(cat ?? "").toLowerCase();
  if (x === "body" || x === "fitness") return "body";
  if (x === "mind") return "mind";
  if (x === "faith") return "faith";
  return "focus";
}

function DiscoverHeader() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Discover</Text>
      <Pressable
        onPress={() => {
          router.push(ROUTES.TABS_DISCOVER as never);
        }}
        accessibilityRole="button"
        accessibilityLabel="Search challenges"
        hitSlop={8}
        style={styles.headerSearchBtn}
      >
        <Search size={20} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function FeaturedSkeleton() {
  return (
    <View style={styles.skeletonHeroOuter}>
      <SkeletonHeroCard />
    </View>
  );
}

function GridSkeleton() {
  return (
    <View style={styles.gridRow}>
      <View style={styles.gridCell}>
        <SkeletonChallengeCard />
      </View>
      <View style={styles.gridCell}>
        <SkeletonChallengeCard />
      </View>
    </View>
  );
}

function HabitListSkeleton() {
  return (
    <View style={styles.habitList}>
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
    </View>
  );
}

function DailyGrid({ challenges }: { challenges: DailyCardData[] }) {
  if (challenges.length === 0) return null;
  const rows: DailyCardData[][] = [];
  for (let i = 0; i < challenges.length; i += 2) {
    const a = challenges[i];
    const b = challenges[i + 1];
    if (!a) continue;
    rows.push(b ? [a, b] : [a]);
  }
  return (
    <View>
      {rows.map((row, idx) => (
        <View key={`row-${idx}`} style={styles.gridRow}>
          {row.map((c) => (
            <View key={c.id} style={styles.gridCell}>
              <DailyCard data={c} />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.gridCell} /> : null}
        </View>
      ))}
    </View>
  );
}

function DiscoverScreenInner() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<DiscoverCategory>("all");

  const featuredQuery = useQuery({
    queryKey: ["discover", "featured", selectedCategory],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getDiscoverFeatured, {
        category: selectedCategory,
      }) as Promise<HeroFeaturedData | null>,
    staleTime: 60 * 1000,
  });

  const streakAtRiskQuery = useQuery({
    queryKey: ["discover", "streakAtRisk"],
    queryFn: () =>
      trpcQuery(TRPC.feed.getStreakAtRisk) as Promise<StreakAtRiskData | null>,
    staleTime: 5 * 60 * 1000,
  });

  const gridQuery = useQuery({
    queryKey: ["discover", "grid", selectedCategory],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getDiscoverGrid, {
        category: selectedCategory,
      }) as Promise<DailyCardData[]>,
    staleTime: 60 * 1000,
  });

  const habitsInfinite = useInfiniteQuery<ListPage, Error>({
    queryKey: ["discover", "habits-infinite", selectedCategory],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" ? pageParam : undefined;
      const resp = (await trpcQuery(TRPC.challenges.list, {
        category: selectedCategory,
        limit: HABIT_PAGE_SIZE,
        cursor,
      })) as ListResponse;
      return asListPage(resp);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });

  if (featuredQuery.isError)
    captureError(featuredQuery.error, "DiscoverV3.getDiscoverFeatured");
  if (streakAtRiskQuery.isError)
    captureError(streakAtRiskQuery.error, "DiscoverV3.getStreakAtRisk");
  if (gridQuery.isError) captureError(gridQuery.error, "DiscoverV3.getDiscoverGrid");
  if (habitsInfinite.isError)
    captureError(habitsInfinite.error, "DiscoverV3.habitsInfinite");

  const habitItems: CompactChallengeRowData[] = useMemo(() => {
    const pages = habitsInfinite.data?.pages ?? [];
    const out: CompactChallengeRowData[] = [];
    const seen = new Set<string>();
    for (const page of pages) {
      for (const c of page.items) {
        if (seen.has(c.id)) continue;
        seen.add(c.id);
        out.push({
          id: c.id,
          slug: null,
          name: (c.title ?? "Challenge").trim() || "Challenge",
          duration_days: Math.max(1, Number(c.duration_days ?? 7)),
          difficulty: toDifficulty(c.difficulty),
          proof_type: deriveProofType(c.challenge_tasks ?? null),
          category: toCategory(c.category),
        });
      }
    }
    return out;
  }, [habitsInfinite.data]);

  const isFeaturedLoading = featuredQuery.isPending;
  const isGridLoading = gridQuery.isPending;
  const isHabitsLoading = habitsInfinite.isPending;

  const isRefreshing =
    featuredQuery.isRefetching ||
    gridQuery.isRefetching ||
    streakAtRiskQuery.isRefetching ||
    habitsInfinite.isRefetching;

  const onRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["discover"] });
  }, [queryClient]);

  const onEndReached = useCallback(() => {
    if (!habitsInfinite.hasNextPage) return;
    if (habitsInfinite.isFetchingNextPage) return;
    trackEvent("discover_habits_page_loaded", {
      page_count: habitsInfinite.data?.pages.length ?? 0,
      category: selectedCategory,
    });
    void habitsInfinite.fetchNextPage();
  }, [habitsInfinite, selectedCategory]);

  const renderHabit = useCallback(
    ({ item }: { item: CompactChallengeRowData }) => (
      <View style={styles.habitItemWrap}>
        <CompactChallengeRow data={item} />
      </View>
    ),
    []
  );

  const handleCategorySelect = useCallback((next: DiscoverCategory) => {
    setSelectedCategory(next);
    trackEvent("discover_category_chip_tapped", { category: next });
  }, []);

  const listHeader = useMemo(
    () => (
      <View>
        <DiscoverHeader />
        <StreakRiskBanner data={streakAtRiskQuery.data ?? null} />
        <CategoryChips
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
        {isFeaturedLoading ? (
          <FeaturedSkeleton />
        ) : (
          <HeroFeaturedCard data={featuredQuery.data ?? null} />
        )}
        <View style={styles.sectionPad}>
          <SectionHeader
            title="Quick wins · 24 hours"
            style={styles.sectionHeader}
          />
        </View>
        {isGridLoading ? (
          <View style={styles.gridWrap}>
            <GridSkeleton />
            <GridSkeleton />
          </View>
        ) : (
          <View style={styles.gridWrap}>
            <DailyGrid challenges={gridQuery.data ?? []} />
          </View>
        )}
        <View style={styles.sectionPad}>
          <SectionHeader title="Build a habit" style={styles.sectionHeader} />
          <Text style={styles.sectionSub}>
            Multi-day challenges · solo or with friends
          </Text>
        </View>
      </View>
    ),
    [
      streakAtRiskQuery.data,
      selectedCategory,
      handleCategorySelect,
      isFeaturedLoading,
      featuredQuery.data,
      isGridLoading,
      gridQuery.data,
    ]
  );

  const listEmpty = useMemo(() => {
    if (isHabitsLoading) return <HabitListSkeleton />;
    return (
      <View style={styles.emptyHabits}>
        <Text style={styles.emptyText}>No challenges in this category yet.</Text>
      </View>
    );
  }, [isHabitsLoading]);

  const listFooter = useMemo(
    () => (
      <View>
        {habitsInfinite.isFetchingNextPage ? (
          <View style={styles.loadMoreRow}>
            <ActivityIndicator size="small" color={DS_COLORS.ACCENT} />
          </View>
        ) : null}
        <SuggestedPeopleRow />
        <TrendingPostsSection />
        <CategoryRail slug="body" />
        <CategoryRail slug="mind" />
        <CategoryRail slug="faith" />
        <CategoryRail slug="focus" />
        <FindMoreFooter />
      </View>
    ),
    [habitsInfinite.isFetchingNextPage]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlashList
        data={habitItems}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        estimatedItemSize={84}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
      />
    </SafeAreaView>
  );
}

export default function DiscoverScreen() {
  return (
    <ErrorBoundary>
      <DiscoverScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  listContent: {
    paddingBottom: DS_MEASURES.TAB_BAR_HEIGHT + DS_SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: DS_SPACING.sm,
    paddingBottom: DS_SPACING.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  headerSearchBtn: {
    width: 38,
    height: 38,
    borderRadius: DS_RADIUS.PILL,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.WHITE,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  sectionPad: {
    marginTop: DS_SPACING.xl,
  },
  sectionHeader: {
    paddingHorizontal: DS_SPACING.lg,
  },
  sectionSub: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    paddingHorizontal: DS_SPACING.lg,
    marginTop: 2,
    marginBottom: DS_SPACING.sm,
  },
  gridWrap: {
    paddingHorizontal: DS_SPACING.lg,
  },
  gridRow: {
    flexDirection: "row",
    gap: DS_SPACING.md,
    marginTop: DS_SPACING.sm,
  },
  gridCell: {
    flex: 1,
  },
  habitItemWrap: {
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.sm,
  },
  habitList: {
    paddingHorizontal: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
  skeletonHeroOuter: {
    paddingHorizontal: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
  },
  emptyHabits: {
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  loadMoreRow: {
    paddingVertical: DS_SPACING.md,
    alignItems: "center",
  },
});
