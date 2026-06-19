import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react-native";

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import {
  CompactChallengeRow,
  type CompactChallengeRowData,
  type CompactChallengeProofType,
} from "@/components/challenges/CompactChallengeRow";
import {
  type ChallengeCategory,
  type ChallengeDifficulty,
} from "@/components/challenges/_card-helpers";
import { SkeletonBase } from "@/components/skeletons";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";

export type CategoryRailSlug = "body" | "mind" | "faith" | "focus";

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

type ListResponse =
  | ChallengeRow[]
  | { items: ChallengeRow[]; nextCursor?: string };

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

const TITLES: Record<CategoryRailSlug, string> = {
  body: "Body",
  mind: "Mind",
  faith: "Faith",
  focus: "Focus",
};

function HabitListSkeleton() {
  return (
    <View style={styles.list}>
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
      <SkeletonBase height={68} borderRadius={DS_RADIUS.LG} />
    </View>
  );
}

function CategoryRailInner({
  slug,
  limit = 8,
}: {
  slug: CategoryRailSlug;
  limit?: number;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["discover", "categoryRail", slug, limit],
    queryFn: () =>
      trpcQuery(TRPC.challenges.list, { category: slug, limit }) as Promise<
        ListResponse
      >,
    staleTime: 5 * 60 * 1000,
  });

  if (query.isError) captureError(query.error, `Discover.CategoryRail.${slug}`);

  const items: CompactChallengeRowData[] = useMemo(() => {
    const data = query.data;
    if (!data) return [];
    const rows = Array.isArray(data) ? data : data.items ?? [];
    return rows.slice(0, limit).map((c) => ({
      id: c.id,
      slug: null,
      name: (c.title ?? "Challenge").trim() || "Challenge",
      duration_days: Math.max(1, Number(c.duration_days ?? 7)),
      difficulty: toDifficulty(c.difficulty),
      proof_type: deriveProofType(c.challenge_tasks ?? null),
      category: toCategory(c.category),
    }));
  }, [query.data, limit]);

  const handleSeeAll = useCallback(() => {
    trackEvent("discover_category_see_all_tapped", { category: slug });
    router.push(ROUTES.DISCOVER_CATEGORY(slug) as never);
  }, [router, slug]);

  if (!query.isPending && items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{TITLES[slug]}</Text>
        <Pressable
          onPress={handleSeeAll}
          accessibilityRole="button"
          accessibilityLabel={`See all ${TITLES[slug]} challenges`}
          style={styles.seeAllBtn}
          hitSlop={8}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight
            size={14}
            color={DS_COLORS.DISCOVER_CORAL}
            strokeWidth={2}
          />
        </Pressable>
      </View>
      {query.isPending ? (
        <HabitListSkeleton />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <CompactChallengeRow key={item.id} data={item} />
          ))}
        </View>
      )}
    </View>
  );
}

export const CategoryRail = React.memo(CategoryRailInner);
export default CategoryRail;

const styles = StyleSheet.create({
  section: {
    marginTop: DS_SPACING.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.lg,
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.DISCOVER_CORAL,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  list: {
    paddingHorizontal: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
});
