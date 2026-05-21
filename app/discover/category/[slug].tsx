import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react-native";

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
  DS_MEASURES,
} from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkeletonBase } from "@/components/skeletons";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";
import {
  CompactChallengeRow,
  type CompactChallengeRowData,
  type CompactChallengeProofType,
} from "@/components/challenges/CompactChallengeRow";
import {
  type ChallengeCategory,
  type ChallengeDifficulty,
} from "@/components/challenges/_card-helpers";

const PAGE_SIZE = 20;

const CATEGORY_TITLES: Record<string, string> = {
  body: "Body",
  mind: "Mind",
  faith: "Faith",
  focus: "Focus",
};

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
  if (Array.isArray(resp)) return { items: resp, nextCursor: undefined };
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

function CategoryListSkeleton() {
  return (
    <View style={styles.list}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <SkeletonBase
          key={i}
          height={68}
          borderRadius={DS_RADIUS.LG}
          style={styles.skeletonRow}
        />
      ))}
    </View>
  );
}

function CategoryScreenInner() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slugRaw = String(params.slug ?? "").toLowerCase();
  const slug = (CATEGORY_TITLES[slugRaw] ? slugRaw : "focus") as keyof typeof CATEGORY_TITLES;
  const title = CATEGORY_TITLES[slug] ?? "Discover";

  React.useEffect(() => {
    trackEvent("discover_category_viewed", { category: slug });
  }, [slug]);

  const query = useInfiniteQuery<ListPage, Error>({
    queryKey: ["discoverCategory", slug],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" ? pageParam : undefined;
      const resp = (await trpcQuery(TRPC.challenges.list, {
        category: slug,
        limit: PAGE_SIZE,
        cursor,
      })) as ListResponse;
      return asListPage(resp);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });

  if (query.isError) captureError(query.error, `DiscoverCategory.${slug}`);

  const items: CompactChallengeRowData[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
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
  }, [query.data]);

  const onRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["discoverCategory", slug] });
  }, [queryClient, slug]);

  const onEndReached = useCallback(() => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    void query.fetchNextPage();
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: CompactChallengeRowData }) => (
      <View style={styles.itemWrap}>
        <CompactChallengeRow data={item} />
      </View>
    ),
    []
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const listEmpty = useMemo(() => {
    if (query.isPending) return <CategoryListSkeleton />;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No challenges in this category yet.</Text>
      </View>
    );
  }, [query.isPending]);

  const listFooter = useMemo(
    () =>
      query.isFetchingNextPage ? (
        <View style={styles.loadMoreRow}>
          <ActivityIndicator size="small" color={DS_COLORS.ACCENT} />
        </View>
      ) : null,
    [query.isFetchingNextPage]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.backBtn} />
      </View>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={onRefresh}
            tintColor={DS_COLORS.ACCENT}
          />
        }
      />
    </SafeAreaView>
  );
}

export default function DiscoverCategoryScreen() {
  return (
    <ErrorBoundary>
      <CategoryScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  listContent: {
    paddingTop: DS_SPACING.sm,
    paddingBottom: DS_MEASURES.TAB_BAR_HEIGHT + DS_SPACING.xxl,
  },
  list: {
    paddingHorizontal: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
  itemWrap: {
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.sm,
  },
  skeletonRow: {
    marginBottom: DS_SPACING.sm,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.xxl,
  },
  emptyText: {
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  loadMoreRow: {
    paddingVertical: DS_SPACING.md,
    alignItems: "center",
  },
});
