import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Dumbbell,
  Brain,
  Shield,
  TrendingUp,
  WifiOff,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { trpcQuery } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { colors as tokenColors } from "@/src/theme/tokens";
import type { StarterChallenge } from "@/mocks/starter-challenges";
import { styles } from "@/styles/discover-styles";
import {
  SearchBar,
  FilterChip,
  SectionHeader,
  EmptyState,
  ChallengeCard24h,
  ChallengeCardFeatured,
  ChallengeRowCard,
} from "@/src/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type CategoryKey = "all" | "fitness" | "mind" | "discipline";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  extreme: "Extreme",
};

const CATEGORY_FILTERS: { key: CategoryKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "fitness", label: "Fitness", icon: Dumbbell },
  { key: "mind", label: "Mind", icon: Brain },
  { key: "discipline", label: "Discipline", icon: Shield },
];

function isDailyActive(c: StarterChallenge): boolean {
  if (!c.is_daily) return false;
  if (!c.ends_at) return true;
  return new Date(c.ends_at).getTime() > Date.now();
}

function matchesCategory(c: StarterChallenge, cat: CategoryKey): boolean {
  if (cat === "all") return true;
  if (cat === "mind" && (c.category === "mind" || c.category === "mental")) return true;
  return c.category === cat;
}

function matchesSearch(c: StarterChallenge, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    c.title.toLowerCase().includes(lower) ||
    c.description.toLowerCase().includes(lower) ||
    c.short_hook.toLowerCase().includes(lower)
  );
}

function SkeletonPulse({ style }: { style: any }) {
  const animValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animValue]);

  return <Animated.View style={[style, { opacity: animValue }]} />;
}

function SkeletonCard({ featured, cardColor }: { featured: boolean; cardColor?: string }) {
  const { colors } = useTheme();
  const bg = cardColor ?? colors.card;
  if (featured) {
    return (
      <View style={[styles.skeletonFeaturedCard, { backgroundColor: bg }]}>
        <View style={styles.skeletonAccent} />
        <View style={styles.skeletonFeaturedContent}>
          <View style={styles.skeletonTopRow}>
            <SkeletonPulse style={styles.skeletonBadge} />
            <SkeletonPulse style={styles.skeletonDiffPill} />
          </View>
          <SkeletonPulse style={styles.skeletonTitle} />
          <SkeletonPulse style={styles.skeletonHook} />
          <View style={styles.skeletonChipsRow}>
            <SkeletonPulse style={styles.skeletonChip} />
            <SkeletonPulse style={styles.skeletonChipMed} />
          </View>
          <SkeletonPulse style={styles.skeletonMeta} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.skeletonCompactCard, { backgroundColor: bg }]}>
      <View style={styles.skeletonCompactBar} />
      <View style={styles.skeletonCompactContent}>
        <SkeletonPulse style={styles.skeletonCompactTitle} />
        <SkeletonPulse style={styles.skeletonCompactDesc} />
        <SkeletonPulse style={styles.skeletonCompactMeta} />
      </View>
    </View>
  );
}

function SkeletonList({ cardColor }: { cardColor?: string }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonPulse style={styles.skeletonSectionIcon} />
          <SkeletonPulse style={styles.skeletonSectionLabel} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skeletonDailyScroll}>
          {[0, 1, 2].map((i) => (
            <SkeletonPulse key={`sd-${i}`} style={styles.skeletonDailyCard} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonPulse style={styles.skeletonSectionIcon} />
          <SkeletonPulse style={styles.skeletonSectionLabel} />
        </View>
        <View style={styles.featuredList}>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={`sf-${i}`} featured cardColor={cardColor} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [featuredData, setFeaturedData] = useState<unknown[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [starterPack, setStarterPack] = useState<unknown[]>([]);
  const FEATURED_PAGE_SIZE = 20;

  const fetchStarterPack = useCallback(async () => {
    try {
      const data = await trpcQuery("challenges.getStarterPack");
      setStarterPack(Array.isArray(data) ? data : []);
    } catch {
      setStarterPack([]);
    }
  }, []);

  const fetchFeatured = useCallback(async (cursor?: string, append = false) => {
    if (append) setLoadingMore(true);
    else setIsFetching(true);
    setFeaturedError(false);
    const params: Record<string, string | number> = {
      limit: FEATURED_PAGE_SIZE,
    };
    if (searchQuery) params.search = searchQuery;
    if (activeCategory !== "all") params.category = activeCategory;
    if (cursor) params.cursor = cursor;

    try {
      const data = await trpcQuery("challenges.getFeatured", params);
      const isPaginated = data != null && typeof data === "object" && "items" in data;
      const list = isPaginated
        ? (data as { items: unknown[]; nextCursor?: string }).items ?? []
        : Array.isArray(data) ? data : [];
      const next = isPaginated ? (data as { nextCursor?: string }).nextCursor : undefined;
      setNextCursor(next);
      if (append) {
        setFeaturedData((prev) => [...prev, ...list]);
      } else {
        setFeaturedData(list);
      }
      setFeaturedError(false);
    } catch {
      setFeaturedError(true);
      if (!append) setFeaturedData([]);
    } finally {
      setFeaturedLoading(false);
      setIsFetching(false);
      setLoadingMore(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    fetchStarterPack();
  }, [fetchStarterPack]);

  useEffect(() => {
    setFeaturedLoading(true);
    const timer = setTimeout(() => {
      fetchFeatured();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFeatured]);

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!featuredLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimedOut(true);
      setFeaturedLoading(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [featuredLoading]);

  const isLoading = featuredLoading && !timedOut;
  const isError = featuredError || timedOut;
  const allChallenges = useMemo((): StarterChallenge[] => {
    const serverData = featuredData;
    if (serverData && serverData.length > 0) {
      return serverData.map((c: any) => {
        const tasks = c.tasks ?? c.challenge_tasks ?? [];
        return {
          id: c.id,
          title: c.title,
          description: c.description ?? "",
          short_hook: c.short_hook ?? c.description ?? "",
          theme_color: c.theme_color ?? tokenColors.accentOrange,
          difficulty: c.difficulty ?? "medium",
          duration_type: c.duration_type ?? "multi_day",
          duration_days: c.duration_days ?? 30,
          category: c.category ?? "fitness",
          visibility: c.visibility ?? "public",
          status: c.status ?? "published",
          is_featured: c.is_featured ?? false,
          is_daily: c.is_daily ?? (c.duration_type === "24h"),
          starts_at: c.starts_at ?? null,
          ends_at: c.ends_at ?? null,
          participants_count: c.participants_count ?? 0,
          active_today_count: c.active_today_count ?? 0,
          challenge_tasks: tasks,
          tasks,
          participation_type: c.participation_type,
          run_status: c.run_status,
          team_size: c.team_size,
          shared_goal_target: c.shared_goal_target,
          shared_goal_unit: c.shared_goal_unit,
        };
      });
    }
    return [];
  }, [featuredData]);

  const dailyChallenges = useMemo(() => {
    return allChallenges
      .filter((c) => c.is_daily && isDailyActive(c))
      .filter((c) => matchesCategory(c, activeCategory))
      .filter((c) => matchesSearch(c, searchQuery));
  }, [allChallenges, activeCategory, searchQuery]);

  const featuredChallenges = useMemo(() => {
    return allChallenges
      .filter((c) => !c.is_daily && c.is_featured)
      .filter((c) => matchesCategory(c, activeCategory))
      .filter((c) => matchesSearch(c, searchQuery));
  }, [allChallenges, activeCategory, searchQuery]);

  const otherChallenges = useMemo(() => {
    return allChallenges
      .filter((c) => !c.is_daily && !c.is_featured)
      .filter((c) => matchesCategory(c, activeCategory))
      .filter((c) => matchesSearch(c, searchQuery));
  }, [allChallenges, activeCategory, searchQuery]);

  const totalVisible = dailyChallenges.length + featuredChallenges.length + otherChallenges.length;

  const handleRefresh = useCallback(() => {
    setNextCursor(undefined);
    fetchStarterPack();
    fetchFeatured(undefined, false);
  }, [fetchStarterPack, fetchFeatured]);

  const loadMore = useCallback(() => {
    if (nextCursor && !loadingMore) fetchFeatured(nextCursor, true);
  }, [nextCursor, loadingMore, fetchFeatured]);

  const handleChallengePress = useCallback(
    (challengeId: string) => {
      const id = challengeId != null ? String(challengeId) : "";
      if (!id) return;
      try {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch { /* ignore */ }
      router.push(`/challenge/${id}` as any);
    },
    [router]
  );

  const handleCategoryPress = useCallback((key: CategoryKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(key);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const getDurationLabel = useCallback((challenge: StarterChallenge) => {
    if (challenge.duration_type === "24h" || challenge.is_daily) return "24H";
    const days = challenge.duration_days;
    return `${days} day${days === 1 ? "" : "s"}`;
  }, []);

  const renderDailyItem = useCallback(
    ({ item: c }: { item: StarterChallenge }) => (
      <ChallengeCard24h
        title={c.title}
        description={c.short_hook}
        endsAt={c.ends_at}
        difficulty={DIFFICULTY_LABELS[c.difficulty] ?? "Medium"}
        stripeColor={c.theme_color || tokenColors.orangeStripe}
        tasksPreview={c.tasks.slice(0, 2).map((t) => ({ icon: t.type, label: t.title }))}
        participantsCount={c.participants_count ?? 0}
        onPress={() => handleChallengePress(c.id)}
      />
    ),
    [handleChallengePress]
  );

  const renderErrorBanner = () => {
    if (!isError) return null;
    return (
      <View style={styles.errorBanner}>
        <View style={styles.errorBannerLeft}>
          <WifiOff size={12} color="#B5B5B5" />
          <Text style={styles.errorBannerText}>Offline mode</Text>
        </View>
        <TouchableOpacity
          style={styles.retryPill}
          onPress={handleRefresh}
          activeOpacity={0.7}
          testID="discover-retry-button"
        >
          <Text style={styles.retryPillText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonList cardColor={colors.card} />;
    }

    if (totalVisible === 0) {
      const isFiltered = Boolean(searchQuery || activeCategory !== "all");
      return (
        <EmptyState
          title={isFiltered ? "No challenges found" : "No challenges yet. Be the first to create one!"}
          subtitle={searchQuery ? "Try a different search or category" : activeCategory !== "all" ? "Try another category or clear filters." : "Create a challenge and invite others to join."}
          primaryCtaLabel={searchQuery ? "Clear search" : isFiltered ? "Clear filters" : "Create challenge"}
          onPrimaryCta={searchQuery ? clearSearch : isFiltered ? () => { setActiveCategory("all"); setSearchQuery(""); handleRefresh(); } : () => router.push("/(tabs)/create" as any)}
          secondaryCtaLabel="Refresh"
          onSecondaryCta={handleRefresh}
        />
      );
    }

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !featuredLoading}
            onRefresh={handleRefresh}
            tintColor={tokenColors.accentOrange}
          />
        }
      >
        {renderErrorBanner()}

        {starterPack.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Starter Pack"
              icon={<Shield size={18} color={tokenColors.accentOrange} />}
              caption="Join in 2 taps · Easy"
            />
            <View style={styles.compactList}>
              {starterPack.map((c: any) => (
                <ChallengeRowCard
                  key={c.id}
                  title={c.title}
                  description={c.short_hook || c.description}
                  stripeColor={c.theme_color || tokenColors.orangeStripe}
                  durationLabel={c.duration_type === "24h" ? "24H" : `${c.duration_days ?? 1} day${(c.duration_days ?? 1) === 1 ? "" : "s"}`}
                  taskCount={c.tasks?.length ?? 0}
                  participantsCount={c.participants_count ?? 0}
                  statusDotColor={c.theme_color}
                  onPress={() => handleChallengePress(c.id)}
                  participationType={c.participation_type}
                  teamSize={c.team_size}
                  sharedGoalTarget={c.shared_goal_target}
                  sharedGoalUnit={c.shared_goal_unit}
                />
              ))}
            </View>
          </View>
        )}

        {dailyChallenges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="24-Hour Challenges"
              icon={<Zap size={18} color={tokenColors.badgeRedText} />}
              caption="New every day"
            />
            <FlatList
              data={dailyChallenges}
              keyExtractor={(item) => item.id}
              horizontal
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dailyScrollContent}
              renderItem={renderDailyItem}
            />
          </View>
        )}

        {featuredChallenges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Featured"
              icon={<TrendingUp size={18} color={tokenColors.accentOrange} />}
            />
            <View style={styles.featuredList}>
              {featuredChallenges.map((c) => (
                <ChallengeCardFeatured
                  key={c.id}
                  title={c.title}
                  description={c.short_hook ?? c.description}
                  difficulty={DIFFICULTY_LABELS[c.difficulty] ?? "Medium"}
                  stripeColor={c.theme_color || tokenColors.orangeStripe}
                  tasksPreview={c.tasks.slice(0, 3).map((t) => ({ icon: t.type, label: t.title }))}
                  durationLabel={getDurationLabel(c)}
                  taskCount={c.tasks.length}
                  participantsCount={c.participants_count ?? 0}
                  activeTodayCount={c.active_today_count ?? 0}
                  onPress={() => handleChallengePress(c.id)}
                />
              ))}
            </View>
          </View>
        )}

        {otherChallenges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="More Challenges"
              icon={<Sparkles size={18} color={tokenColors.textSecondary} />}
            />
            <View style={styles.compactList}>
              {otherChallenges.map((c) => (
                <ChallengeRowCard
                  key={c.id}
                  title={c.title}
                  description={c.short_hook || c.description}
                  stripeColor={c.theme_color || tokenColors.orangeStripe}
                  durationLabel={getDurationLabel(c)}
                  taskCount={c.tasks.length}
                  participantsCount={c.participants_count ?? 0}
                  statusDotColor={c.theme_color}
                  onPress={() => handleChallengePress(c.id)}
                  participationType={(c as any).participation_type}
                  teamSize={(c as any).team_size}
                  sharedGoalTarget={(c as any).shared_goal_target}
                  sharedGoalUnit={(c as any).shared_goal_unit}
                />
              ))}
            </View>
          </View>
        )}

        {nextCursor ? (
          <View style={styles.loadMoreWrap}>
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={loadMore}
              disabled={loadingMore}
              activeOpacity={0.8}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={tokenColors.accentOrange} />
              ) : (
                <Text style={styles.loadMoreText}>Load more</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Discover</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>Find challenges worth committing to</Text>
        </View>

        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search challenges…"
            onClear={clearSearch}
          />
        </View>

        <View style={styles.categoryRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeCategory === cat.key;
              const IconComp = cat.icon;
              return (
                <FilterChip
                  key={cat.key}
                  label={cat.label}
                  selected={isActive}
                  onPress={() => handleCategoryPress(cat.key)}
                  icon={<IconComp size={16} color={isActive ? tokenColors.white : tokenColors.chipText} />}
                />
              );
            })}
          </ScrollView>
        </View>

        {renderContent()}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

