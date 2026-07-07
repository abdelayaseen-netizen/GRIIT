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
  Pressable,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS_V2, DS_SPACING_V2 } from "@/lib/design-system";
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

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

function DiscoverScreenInner() {
  const router = useRouter();
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

  const handleBuildYourOwn = useCallback(() => {
    trackEvent("challenge_created");
    router.push(ROUTES.CREATE_WIZARD as never);
  }, [router]);

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
            tintColor={DS_COLORS_V2.brand.primary}
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

        {/* Build your own CTA — routes to existing create wizard entry (not internals) */}
        <View style={styles.buildOwnSection}>
          <Text style={styles.buildOwnTitle}>Have your own idea?</Text>
          <Text style={styles.buildOwnSub}>
            Create a custom challenge and invite others to join.
          </Text>
          <Pressable
            onPress={handleBuildYourOwn}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Build your own challenge"
            style={({ pressed }) => [
              styles.buildOwnCta,
              pressed ? styles.buildOwnCtaPressed : null,
            ]}
          >
            <Text style={styles.buildOwnCtaText}>Build your own</Text>
          </Pressable>
        </View>
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
    backgroundColor: DS_COLORS_V2.surface.canvas,
  },
  header: {
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.6,
  },
  scrollContent: {
    paddingBottom: 115,
  },
  buildOwnSection: {
    marginHorizontal: DS_SPACING_V2.lg,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    padding: 20,
    gap: 8,
  },
  buildOwnTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.2,
  },
  buildOwnSub: {
    fontSize: 15,
    fontWeight: '400',
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 22,
  },
  buildOwnCta: {
    height: 48,
    borderRadius: 15,
    backgroundColor: DS_COLORS_V2.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buildOwnCtaPressed: {
    opacity: 0.82,
  },
  buildOwnCtaText: {
    fontSize: 17,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryText,
  },
});
