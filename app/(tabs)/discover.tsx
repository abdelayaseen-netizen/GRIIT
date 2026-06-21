/**
 * Discover tab — For-You masonry composition.
 *
 * Replaces the legacy 7-section list footer (the OOM-prone source of the
 * discover crash) with a flat ScrollView that hosts:
 *   1. Lightweight header (title only — no search yet)
 *   2. Category chips (For you / Trending / Body / Mind / Faith / Focus)
 *   3. ForYouHero (immersive 4:5 photo card)
 *   4. DiscoverForYouGrid (masonry of proof / challenge / person / nudge cards)
 *
 * Each grid card is wrapped in its own ErrorBoundary inside the composer, so
 * a single bad item never blanks the screen. Pull-to-refresh invalidates all
 * `discover.*` queries through React Query.
 */
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_DAYLIGHT } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";

import {
  CategoryChips,
  type DiscoverCategory,
} from "@/components/discover/CategoryChips";
import {
  type HeroFeaturedData,
} from "@/components/challenges/HeroFeaturedCard";
import { ForYouHero } from "@/components/discover/ForYouHero";
import { DiscoverForYouGrid } from "@/components/discover/DiscoverForYouGrid";

function DiscoverScreenInner() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<DiscoverCategory>("for_you");

  const featuredQuery = useQuery({
    queryKey: ["discover", "featured", selectedCategory],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getDiscoverFeatured, {
        // Pass the category to the existing endpoint when it's one of the
        // legacy slugs; for `for_you` / `trending`, fall back to "all".
        category:
          selectedCategory === "for_you" || selectedCategory === "trending"
            ? "all"
            : selectedCategory,
      }) as Promise<HeroFeaturedData | null>,
    staleTime: 60 * 1000,
  });

  if (featuredQuery.isError)
    captureError(featuredQuery.error, "Discover.getDiscoverFeatured");

  const isRefreshing = featuredQuery.isRefetching;

  const onRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["discover"] });
  }, [queryClient]);

  const handleCategorySelect = useCallback((next: DiscoverCategory) => {
    setSelectedCategory(next);
    trackEvent("discover_category_chip_tapped", { category: next });
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={DS_DAYLIGHT.color.accent}
          />
        }
      >
        <CategoryChips
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
        <ForYouHero
          data={featuredQuery.data ?? null}
          loading={featuredQuery.isPending}
        />
        <DiscoverForYouGrid selectedCategory={selectedCategory} />
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
    backgroundColor: DS_DAYLIGHT.color.canvas,
  },
  header: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: DS_DAYLIGHT.space.rowGapV,
    paddingBottom: DS_DAYLIGHT.space.rowGapV,
  },
  title: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.screenTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.6,
  },
  scrollContent: {
    paddingBottom: 115,
  },
});
