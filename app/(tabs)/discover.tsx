import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

import { StreakRiskBanner, type StreakAtRiskData } from "@/components/discover/StreakRiskBanner";
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
} from "@/components/challenges/CompactChallengeRow";
import {
  TeamChallengeCard,
  type TeamChallengeCardData,
} from "@/components/challenges/TeamChallengeCard";

type HabitItem = (CompactChallengeRowData & { is_team: false }) | (TeamChallengeCardData & { is_team: true });

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

function HabitList({ items }: { items: HabitItem[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.habitList}>
      {items.map((item) =>
        item.is_team ? (
          <TeamChallengeCard key={item.id} data={item} />
        ) : (
          <CompactChallengeRow key={item.id} data={item} />
        )
      )}
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

  const habitsQuery = useQuery({
    queryKey: ["discover", "habits", selectedCategory],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getDiscoverHabits, {
        category: selectedCategory,
      }) as Promise<
        ({
          id: string;
          slug: string | null;
          name: string;
          duration_days: number;
          difficulty: "EASY" | "MED" | "HARD";
          proof_type: "photo" | "text" | "location";
          category: "body" | "mind" | "faith" | "focus";
          is_team: boolean;
          team_size: number | null;
          filled_spots: number;
          team_preview: { user_id: string; username: string | null; avatar_url: string | null }[];
        })[]
      >,
    staleTime: 60 * 1000,
  });

  const isFeaturedLoading = featuredQuery.isPending;
  const isGridLoading = gridQuery.isPending;
  const isHabitsLoading = habitsQuery.isPending;

  if (featuredQuery.isError) captureError(featuredQuery.error, "DiscoverV3.getDiscoverFeatured");
  if (streakAtRiskQuery.isError)
    captureError(streakAtRiskQuery.error, "DiscoverV3.getStreakAtRisk");
  if (gridQuery.isError) captureError(gridQuery.error, "DiscoverV3.getDiscoverGrid");
  if (habitsQuery.isError) captureError(habitsQuery.error, "DiscoverV3.getDiscoverHabits");

  const isRefreshing =
    featuredQuery.isRefetching ||
    gridQuery.isRefetching ||
    habitsQuery.isRefetching ||
    streakAtRiskQuery.isRefetching;

  const onRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["discover"] });
  }, [queryClient]);

  const habitItems: HabitItem[] = (habitsQuery.data ?? []).map((row) =>
    row.is_team
      ? ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          duration_days: row.duration_days,
          difficulty: row.difficulty,
          category: row.category,
          team_size: row.team_size,
          filled_spots: row.filled_spots,
          team_preview: row.team_preview,
          is_team: true,
        } as const)
      : ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          duration_days: row.duration_days,
          difficulty: row.difficulty,
          proof_type: row.proof_type,
          category: row.category,
          is_team: false,
        } as const)
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
      >
        <DiscoverHeader />

        <StreakRiskBanner data={streakAtRiskQuery.data ?? null} />

        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {isFeaturedLoading ? (
          <FeaturedSkeleton />
        ) : (
          <HeroFeaturedCard data={featuredQuery.data ?? null} />
        )}

        <View style={styles.sectionPad}>
          <SectionHeader title="Quick wins · 24 hours" style={styles.sectionHeader} />
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
          <Text style={styles.sectionSub}>Multi-day challenges · solo or with friends</Text>
        </View>
        {isHabitsLoading ? (
          <HabitListSkeleton />
        ) : (
          <HabitList items={habitItems} />
        )}
      </ScrollView>
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
  scrollContent: {
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
  habitList: {
    paddingHorizontal: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
  skeletonHeroOuter: {
    paddingHorizontal: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
  },
});
