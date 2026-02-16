import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Users,
  Calendar,
  Flame,
  ChevronRight,
  Sparkles,
  BookOpen,
  Dumbbell,
  Brain,
  Shield,
  X,
  TrendingUp,
  WifiOff,
  RefreshCw,
  Compass,
  Clock,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import { STARTER_CHALLENGES } from "@/mocks/starter-challenges";
import type { StarterChallenge } from "@/mocks/starter-challenges";
import { styles } from "@/styles/discover-styles";

type CategoryKey = "all" | "fitness" | "mind" | "discipline";

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string }> = {
  easy: { color: "#22C55E", label: "Easy" },
  medium: { color: "#F59E0B", label: "Medium" },
  hard: { color: "#EF4444", label: "Hard" },
  extreme: { color: "#B91C1C", label: "Extreme" },
};

const CATEGORY_FILTERS: { key: CategoryKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "fitness", label: "Fitness", icon: Dumbbell },
  { key: "mind", label: "Mind", icon: Brain },
  { key: "discipline", label: "Discipline", icon: Shield },
];

const TASK_TYPE_ICONS: Record<string, string> = {
  run: "🏃",
  journal: "📝",
  timer: "⏱️",
  photo: "📸",
  checkin: "✅",
  manual: "🔧",
  toggle: "🔘",
};

function getCountdown(endsAt: string | null): string {
  if (!endsAt) return "";
  const now = Date.now();
  const end = new Date(endsAt).getTime();
  const diff = end - now;
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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

function SkeletonCard({ featured }: { featured: boolean }) {
  if (featured) {
    return (
      <View style={styles.skeletonFeaturedCard}>
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
    <View style={styles.skeletonCompactCard}>
      <View style={styles.skeletonCompactBar} />
      <View style={styles.skeletonCompactContent}>
        <SkeletonPulse style={styles.skeletonCompactTitle} />
        <SkeletonPulse style={styles.skeletonCompactDesc} />
        <SkeletonPulse style={styles.skeletonCompactMeta} />
      </View>
    </View>
  );
}

function SkeletonList() {
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
            <SkeletonCard key={`sf-${i}`} featured />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function CountdownLabel({ endsAt }: { endsAt: string | null }) {
  const [text, setText] = useState(() => getCountdown(endsAt));

  useEffect(() => {
    if (!endsAt) return;
    const interval = setInterval(() => {
      setText(getCountdown(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const isExpired = text === "Expired";

  return (
    <View style={[styles.dailyCountdownPill, isExpired && { backgroundColor: "#F3F4F6" }]}>
      <Clock size={10} color={isExpired ? Colors.text.muted : "#DC2626"} />
      <Text style={[styles.dailyCountdownText, isExpired && { color: Colors.text.muted }]}>
        {text || "--:--:--"}
      </Text>
    </View>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const searchInputRef = useRef<TextInput>(null);

  const featuredQuery = trpc.challenges.getFeatured.useQuery(
    {
      search: searchQuery || undefined,
      category: activeCategory !== "all" ? activeCategory : undefined,
    },
    {
      staleTime: 60_000,
      retry: 0,
      networkMode: "offlineFirst",
      cacheTime: 5 * 60_000,
    }
  );

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!featuredQuery.isLoading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      console.log("[Discover] Query timed out after 6s, showing fallback");
      setTimedOut(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [featuredQuery.isLoading]);

  const isLoading = featuredQuery.isLoading && !timedOut;
  const isError = featuredQuery.isError || timedOut;
  const isFallback = isError || (!isLoading && (featuredQuery.data?.length ?? 0) === 0);

  const allChallenges = useMemo((): StarterChallenge[] => {
    const serverData = featuredQuery.data;
    if (serverData && serverData.length > 0) {
      return serverData.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        short_hook: c.short_hook ?? c.description ?? "",
        theme_color: c.theme_color ?? Colors.accent,
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
        challenge_tasks: c.challenge_tasks ?? c.tasks ?? [],
        tasks: c.tasks ?? c.challenge_tasks ?? [],
      }));
    }
    if (isFallback && !isLoading) return STARTER_CHALLENGES;
    return [];
  }, [featuredQuery.data, isFallback, isLoading]);

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
    featuredQuery.refetch();
  }, [featuredQuery]);

  const handleChallengePress = useCallback(
    (challengeId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log("[Discover] Tapped challenge:", challengeId);
      router.push(`/challenge/${challengeId}` as any);
    },
    [router]
  );

  const handleCategoryPress = useCallback((key: CategoryKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(key);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.blur();
  }, []);

  const getDurationLabel = useCallback((challenge: StarterChallenge) => {
    if (challenge.duration_type === "24h" || challenge.is_daily) return "24H";
    const days = challenge.duration_days;
    return `${days}D`;
  }, []);

  const renderDailyCard = useCallback(
    ({ item: challenge }: { item: StarterChallenge }) => {
      const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.medium;
      const themeColor = challenge.theme_color || Colors.accent;

      return (
        <TouchableOpacity
          style={styles.dailyCard}
          onPress={() => handleChallengePress(challenge.id)}
          activeOpacity={0.85}
          testID={`daily-challenge-${challenge.id}`}
        >
          <View style={[styles.dailyCardGradient, { backgroundColor: themeColor }]} />
          <View style={styles.dailyCardBody}>
            <View style={styles.dailyCardTopRow}>
              <CountdownLabel endsAt={challenge.ends_at} />
              <View style={[styles.dailyDiffPill, { backgroundColor: diffConfig.color + "18" }]}>
                <Text style={[styles.dailyDiffText, { color: diffConfig.color }]}>
                  {diffConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.dailyTitle} numberOfLines={1}>
              {challenge.title}
            </Text>
            <Text style={styles.dailyHook} numberOfLines={2}>
              {challenge.short_hook}
            </Text>

            <View style={styles.dailyChipsRow}>
              {(challenge.tasks || []).slice(0, 2).map((task, i) => (
                <View key={task.id || i} style={styles.dailyChip}>
                  <Text style={styles.dailyChipEmoji}>
                    {TASK_TYPE_ICONS[task.type] || "📋"}
                  </Text>
                  <Text style={styles.dailyChipText} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dailyFooter}>
              <View style={styles.dailyParticipants}>
                <Users size={12} color={Colors.text.tertiary} />
                <Text style={styles.dailyParticipantsText}>
                  {formatCount(challenge.participants_count)}
                </Text>
              </View>
              <View style={styles.dailyArrow}>
                <ChevronRight size={14} color={Colors.text.tertiary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleChallengePress]
  );

  const renderFeaturedCard = useCallback(
    (challenge: StarterChallenge) => {
      const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.medium;
      const themeColor = challenge.theme_color || Colors.accent;
      const taskCount = challenge.tasks?.length || challenge.challenge_tasks?.length || 0;

      return (
        <TouchableOpacity
          key={challenge.id}
          style={styles.featuredCard}
          onPress={() => handleChallengePress(challenge.id)}
          activeOpacity={0.85}
          testID={`featured-challenge-${challenge.id}`}
        >
          <View style={[styles.featuredAccent, { backgroundColor: themeColor }]} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredTopRow}>
              <View style={[styles.featuredBadge, { backgroundColor: themeColor + "18" }]}>
                <Flame size={12} color={themeColor} />
                <Text style={[styles.featuredBadgeText, { color: themeColor }]}>Featured</Text>
              </View>
              <View style={[styles.difficultyPill, { backgroundColor: diffConfig.color + "18" }]}>
                <Text style={[styles.difficultyText, { color: diffConfig.color }]}>
                  {diffConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.featuredTitle} numberOfLines={1}>
              {challenge.title}
            </Text>

            {challenge.short_hook && (
              <Text style={styles.featuredHook} numberOfLines={2}>
                {challenge.short_hook}
              </Text>
            )}

            <View style={styles.featuredTaskPreview}>
              {(challenge.tasks || challenge.challenge_tasks || [])
                .slice(0, 3)
                .map((task, i) => (
                  <View key={task.id || i} style={styles.taskChip}>
                    <Text style={styles.taskChipEmoji}>
                      {TASK_TYPE_ICONS[task.type] || "📋"}
                    </Text>
                    <Text style={styles.taskChipText} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.featuredBottomRow}>
              <View style={styles.featuredStats}>
                <View style={styles.statItem}>
                  <Calendar size={13} color={Colors.text.tertiary} />
                  <Text style={styles.statText}>{getDurationLabel(challenge)}</Text>
                </View>
                <View style={styles.statDot} />
                <View style={styles.statItem}>
                  <BookOpen size={13} color={Colors.text.tertiary} />
                  <Text style={styles.statText}>{taskCount} tasks</Text>
                </View>
                {(challenge.participants_count || 0) > 0 && (
                  <>
                    <View style={styles.statDot} />
                    <View style={styles.statItem}>
                      <Users size={13} color={Colors.text.tertiary} />
                      <Text style={styles.statText}>
                        {formatCount(challenge.participants_count)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <ChevronRight size={18} color={Colors.text.tertiary} />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleChallengePress, getDurationLabel]
  );

  const renderCompactCard = useCallback(
    (challenge: StarterChallenge) => {
      const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty] || DIFFICULTY_CONFIG.medium;
      const themeColor = challenge.theme_color || Colors.accent;
      const taskCount = challenge.tasks?.length || challenge.challenge_tasks?.length || 0;

      return (
        <TouchableOpacity
          key={challenge.id}
          style={styles.compactCard}
          onPress={() => handleChallengePress(challenge.id)}
          activeOpacity={0.85}
          testID={`challenge-${challenge.id}`}
        >
          <View style={[styles.compactColorBar, { backgroundColor: themeColor }]} />
          <View style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {challenge.title}
              </Text>
              <View style={[styles.difficultyDot, { backgroundColor: diffConfig.color }]} />
            </View>
            <Text style={styles.compactDesc} numberOfLines={1}>
              {challenge.short_hook || challenge.description}
            </Text>
            <View style={styles.compactMeta}>
              <Text style={styles.compactMetaText}>
                {getDurationLabel(challenge)} · {taskCount} tasks
              </Text>
              {(challenge.participants_count || 0) > 0 && (
                <Text style={styles.compactParticipants}>
                  {formatCount(challenge.participants_count)} joined
                </Text>
              )}
            </View>
          </View>
          <ChevronRight size={16} color={Colors.text.muted} />
        </TouchableOpacity>
      );
    },
    [handleChallengePress, getDurationLabel]
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
      return <SkeletonList />;
    }

    if (totalVisible === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Compass size={32} color={Colors.text.muted} />
          </View>
          <Text style={styles.emptyTitle}>No challenges found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? "Try a different search or category"
              : "New challenges are being added. Check back soon!"}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>Clear search</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.emptyRefreshButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color={Colors.accent} />
            <Text style={styles.emptyRefreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={featuredQuery.isFetching && !featuredQuery.isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {renderErrorBanner()}

        {dailyChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={16} color="#DC2626" />
              <Text style={styles.sectionTitle}>24-Hour Challenges</Text>
              <Text style={styles.sectionCaption}>New every day</Text>
            </View>
            <FlatList
              data={dailyChallenges}
              renderItem={renderDailyCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dailyScrollContent}
            />
          </View>
        )}

        {featuredChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={Colors.accent} />
              <Text style={styles.sectionTitle}>Featured</Text>
            </View>
            <View style={styles.featuredList}>
              {featuredChallenges.map(renderFeaturedCard)}
            </View>
          </View>
        )}

        {otherChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color={Colors.text.secondary} />
              <Text style={styles.sectionTitle}>More Challenges</Text>
            </View>
            <View style={styles.compactList}>
              {otherChallenges.map(renderCompactCard)}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find challenges worth committing to</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search challenges..."
            placeholderTextColor={Colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            testID="discover-search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={16} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
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
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => handleCategoryPress(cat.key)}
                activeOpacity={0.8}
                testID={`filter-pill-${cat.key}`}
              >
                <IconComp size={14} color={isActive ? "#fff" : Colors.text.secondary} />
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
