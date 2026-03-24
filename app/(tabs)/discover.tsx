import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { DS_COLORS } from "@/lib/design-system";
import { styles } from "@/styles/discover-styles";
import { FilterChip } from "@/src/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import Card from "@/components/shared/Card";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import { ROUTES } from "@/lib/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { HeroFeaturedCard } from "@/components/challenges/HeroFeaturedCard";
import { DailyCard, type DailyParticipationState } from "@/components/challenges/DailyCard";
import { TeamChallengeCard } from "@/components/challenges/TeamChallengeCard";
import { PopularChallengeRow } from "@/components/challenges/PopularChallengeRow";
import { prefetchChallengeById } from "@/lib/prefetch-queries";

type CategoryKey = "all" | "fitness" | "mind" | "discipline" | "faith" | "team";

type ApiChallenge = {
  id: string;
  title?: string;
  description?: string;
  short_hook?: string;
  difficulty?: string;
  duration_type?: string;
  duration_days?: number;
  category?: string;
  visibility?: string;
  is_featured?: boolean;
  is_daily?: boolean;
  ends_at?: string | null;
  participants_count?: number;
  participation_type?: string;
  team_size?: number;
};

type GetFeaturedResponse = { items: ApiChallenge[]; nextCursor?: string | null } | ApiChallenge[];

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fitness", label: "Fitness" },
  { key: "mind", label: "Mind" },
  { key: "discipline", label: "Discipline" },
  { key: "faith", label: "Faith" },
  { key: "team", label: "Team" },
];

function isTeam(c: ApiChallenge): boolean {
  const pt = (c.participation_type ?? "solo").toLowerCase();
  return pt === "duo" || pt === "team";
}

function isDaily(c: ApiChallenge): boolean {
  if (c.is_daily) return true;
  if (c.duration_type === "24h") return true;
  return (c.duration_days ?? 0) === 1;
}

function isActiveDaily(c: ApiChallenge): boolean {
  if (!isDaily(c)) return false;
  if (!c.ends_at) return true;
  return new Date(c.ends_at).getTime() > Date.now();
}

function categoryMatch(c: ApiChallenge, cat: CategoryKey): boolean {
  if (cat === "all") return true;
  if (cat === "team") return isTeam(c);
  return (c.category ?? "").toLowerCase() === cat;
}

function searchMatch(c: ApiChallenge, q: string): boolean {
  if (!q) return true;
  const s = q.toLowerCase();
  return (c.title ?? "").toLowerCase().includes(s) || (c.description ?? "").toLowerCase().includes(s) || (c.short_hook ?? "").toLowerCase().includes(s);
}

/** Matches `DailyCard` width (154) + `v3HListSep` (10). */
const DAILY_CARD_WIDTH = 154;
const DAILY_ROW_STRIDE = DAILY_CARD_WIDTH + 10;

function getDailyParticipationState(
  challengeId: string,
  activeIds: Set<string>,
  completedIds: Set<string>
): DailyParticipationState {
  if (activeIds.has(challengeId)) return "active";
  if (completedIds.has(challengeId)) return "completed";
  return "available";
}

export default function DiscoverScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isPremium } = useApp();
  const isGuest = useIsGuest();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);

  const featuredQuery = useInfiniteQuery({
    queryKey: ["discover", "v3", activeCategory, debouncedQuery],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const data = (await trpcQuery(TRPC.challenges.getFeatured, {
        limit: 30,
        cursor: pageParam,
      })) as GetFeaturedResponse;
      if (Array.isArray(data)) return { items: data, nextCursor: undefined as string | undefined };
      return { items: data.items ?? [], nextCursor: data.nextCursor ?? undefined };
    },
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const myActiveForDiscover = useQuery({
    queryKey: ["discover", "myActive", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<{ challenge_id?: string }[]>,
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
  const myCompletedForDiscover = useQuery({
    queryKey: ["discover", "completed", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.profiles.getCompletedChallenges) as Promise<{ challengeId: string }[]>,
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
  const activeChallengeIds = useMemo(() => {
    const rows = myActiveForDiscover.data;
    if (!Array.isArray(rows)) return new Set<string>();
    return new Set(rows.map((r) => r.challenge_id).filter((cid): cid is string => typeof cid === "string" && cid.length > 0));
  }, [myActiveForDiscover.data]);
  const completedChallengeIds = useMemo(() => {
    const rows = myCompletedForDiscover.data;
    if (!Array.isArray(rows)) return new Set<string>();
    return new Set(rows.map((r) => r.challengeId).filter((cid): cid is string => typeof cid === "string" && cid.length > 0));
  }, [myCompletedForDiscover.data]);
  const activeCount = useMemo(
    () => (Array.isArray(myActiveForDiscover.data) ? myActiveForDiscover.data.length : 0),
    [myActiveForDiscover.data]
  );

  const all = useMemo(() => (featuredQuery.data?.pages.flatMap((p) => p.items) ?? []).filter((c) => (c.visibility ?? "public").toLowerCase() === "public"), [featuredQuery.data?.pages]);
  const filtered = useMemo(() => all.filter((c) => categoryMatch(c, activeCategory)).filter((c) => searchMatch(c, debouncedQuery)), [all, activeCategory, debouncedQuery]);

  const hero = useMemo(() => {
    const featured = filtered.find((c) => c.is_featured === true);
    if (featured) return featured;
    return [...filtered].sort((a, b) => (b.participants_count ?? 0) - (a.participants_count ?? 0))[0] ?? null;
  }, [filtered]);

  const heroId = hero?.id ?? "";
  const daily = useMemo(() => filtered.filter((c) => c.id !== heroId).filter((c) => isActiveDaily(c)).filter((c) => !isTeam(c)).slice(0, 8), [filtered, heroId]);
  const team = useMemo(() => filtered.filter((c) => c.id !== heroId).filter((c) => isTeam(c)).slice(0, 4), [filtered, heroId]);
  const popular = useMemo(() => filtered.filter((c) => c.id !== heroId).filter((c) => !isDaily(c) && !isTeam(c)).sort((a, b) => (b.participants_count ?? 0) - (a.participants_count ?? 0)).slice(0, 5), [filtered, heroId]);

  const openChallenge = useCallback((id: string) => {
    if (!id) return;
    if (typeof Haptics.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(ROUTES.CHALLENGE_ID(id) as never);
  }, [router]);

  const prefetchChallengeDetail = useCallback(
    (challengeId: string) => {
      void prefetchChallengeById(queryClient, challengeId);
    },
    [queryClient]
  );

  const renderDailyCard = useCallback(
    ({ item }: { item: ApiChallenge }) => (
      <DailyCard
        challenge={{
          id: item.id,
          title: item.title ?? "Challenge",
          description: item.short_hook ?? item.description,
          difficulty: item.difficulty,
          participants_count: item.participants_count,
        }}
        participationState={getDailyParticipationState(item.id, activeChallengeIds, completedChallengeIds)}
        onPress={openChallenge}
        onPressIn={() => prefetchChallengeDetail(item.id)}
      />
    ),
    [openChallenge, prefetchChallengeDetail, activeChallengeIds, completedChallengeIds]
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={featuredQuery.isRefetching} onRefresh={() => featuredQuery.refetch()} tintColor={DS_COLORS.ACCENT_PRIMARY} />}
        >
          <View style={styles.v3Header}>
            <View style={styles.v3HeaderRow}>
              <Text style={styles.v3Title}>Discover</Text>
              <TouchableOpacity
                style={styles.v3SearchBtn}
                onPress={() => setSearchOpen((v) => !v)}
                activeOpacity={0.8}
                accessibilityLabel={searchOpen ? "Close search" : "Open search"}
                accessibilityRole="button"
              >
                <Search size={15} color={DS_COLORS.buttonDisabledText} />
              </TouchableOpacity>
            </View>
            <Text style={styles.v3Subtitle}>What are you willing to commit to?</Text>
            {!isPremium ? (
              <Text
                style={[
                  styles.v3Subtitle,
                  { marginTop: 4, color: activeCount >= 3 ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.TEXT_MUTED },
                ]}
              >
                {activeCount}/3 challenges active
              </Text>
            ) : null}
          </View>

          {searchOpen ? (
            <View style={styles.v3SearchInlineWrap}>
              <View style={styles.v3SearchInline}>
                <Text style={styles.v3SearchLabel}>Search: </Text>
                <TouchableOpacity onPress={() => setQuery("")} accessibilityLabel="Clear search" accessibilityRole="button">
                  <Text style={styles.v3SearchClear}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={styles.v3PillsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.v3PillsContent}>
              {CATEGORIES.map((c) => (
                <FilterChip key={c.key} label={c.label} selected={activeCategory === c.key} onPress={() => setActiveCategory(c.key)} />
              ))}
            </ScrollView>
          </View>

          {featuredQuery.isError ? (
            <ErrorState message="Couldn't load challenges" onRetry={() => void featuredQuery.refetch()} />
          ) : featuredQuery.isPending && !featuredQuery.data ? (
            <LoadingState containerStyle={styles.v3LoadingWrap} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No challenges found"
              subtitle={
                debouncedQuery.trim()
                  ? "Try a different search or check back later"
                  : "Try another category or check back later"
              }
              action={
                debouncedQuery.trim()
                  ? { label: "Clear search", onPress: () => setQuery("") }
                  : undefined
              }
            />
          ) : (
            <>
              <View style={styles.v3SectionPad}>
                <HeroFeaturedCard
                  challenge={
                    hero
                      ? {
                          id: hero.id,
                          title: hero.title ?? "Challenge",
                          description: hero.short_hook ?? hero.description,
                          duration_days: hero.duration_days,
                          participants_count: hero.participants_count,
                          category: hero.category,
                        }
                      : null
                  }
                  onPress={openChallenge}
                  onPressIn={hero ? () => prefetchChallengeDetail(hero.id) : undefined}
                />
              </View>

              <SectionHeader title="24-Hour Challenges" />
              <FlatList
                horizontal
                data={daily}
                keyExtractor={(item) => item.id}
                getItemLayout={(_, index) => ({
                  length: DAILY_CARD_WIDTH,
                  offset: DAILY_ROW_STRIDE * index,
                  index,
                })}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.v3FlatPad}
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews
                ItemSeparatorComponent={() => <View style={styles.v3HListSep} />}
                renderItem={renderDailyCard}
              />

              <SectionHeader title="Bring your people" />
              <View style={styles.v3ListPad}>
                {team.map((c) => (
                  <TeamChallengeCard
                    key={c.id}
                    challenge={{
                      id: c.id,
                      title: c.title ?? "Team Challenge",
                      description: c.short_hook ?? c.description,
                      difficulty: c.difficulty,
                      duration_days: c.duration_days,
                      team_size: c.team_size,
                      participants_count: c.participants_count,
                    }}
                    onPress={openChallenge}
                    onPressIn={() => prefetchChallengeDetail(c.id)}
                  />
                ))}
              </View>

              <SectionHeader
                title="Challenges for you"
                actionLabel="See all"
                onPressAction={() => setActiveCategory("all")}
              />
              <Card padded={false} containerStyle={styles.v3PopularWrap}>
                {popular.map((c, i) => (
                  <PopularChallengeRow
                    key={c.id}
                    challenge={{
                      id: c.id,
                      title: c.title ?? "Challenge",
                      difficulty: c.difficulty,
                      duration_days: c.duration_days,
                      participants_count: c.participants_count,
                    }}
                    index={i}
                    isLast={i === popular.length - 1}
                    onPress={openChallenge}
                    onPressIn={() => prefetchChallengeDetail(c.id)}
                  />
                ))}
              </Card>
              <View style={styles.v3ScrollBottomSpacer} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
