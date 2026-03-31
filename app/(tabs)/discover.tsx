import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  Pressable,
  Keyboard,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X, Plus, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { DS_COLORS } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkeletonHeroCard, SkeletonChallengeCard } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import { ROUTES } from "@/lib/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { HeroFeaturedCard } from "@/components/challenges/HeroFeaturedCard";
import {
  DiscoverMiniChallengeCard,
  DiscoverChallengeSearchRow,
  type MiniCardChallenge,
  type FullCardChallenge,
} from "@/components/discover/DiscoverChallengeCards";
import { FilterChips, type DiscoverFilterId } from "@/components/discover/FilterChips";
import { ActivityTicker } from "@/components/discover/ActivityTicker";
import { CompactChallengeRow } from "@/components/discover/CompactChallengeRow";
import { PickedForYou, type PickedChallenge } from "@/components/discover/PickedForYou";
import { prefetchChallengeById } from "@/lib/prefetch-queries";
import { Avatar } from "@/components/Avatar";

const RECENT_SEARCHES_KEY = "griit_recent_searches";
const BROWSE_CATEGORIES = ["Fitness", "Mind", "Discipline", "Faith", "Team"] as const;

type DiscoverChallenge = MiniCardChallenge &
  FullCardChallenge & {
    visibility?: string;
    is_featured?: boolean;
    is_daily?: boolean;
    duration_type?: string;
    ends_at?: string | null;
    participation_type?: string;
    recent_joins_7d?: number;
    joins_today?: number;
    team_preview?: { user_id: string; username: string | null; avatar_url: string | null }[];
  };

type SearchUser = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
};

function isTeamChallenge(c: DiscoverChallenge): boolean {
  const pt = String(c.participation_type ?? "").toLowerCase();
  return pt === "duo" || pt === "team" || pt === "shared_goal";
}

function isDaily(c: DiscoverChallenge): boolean {
  if (c.is_daily) return true;
  if (c.duration_type === "24h") return true;
  return (c.duration_days ?? 0) === 1;
}

function isActiveDaily(c: DiscoverChallenge): boolean {
  if (!isDaily(c)) return false;
  if (!c.ends_at) return true;
  return new Date(c.ends_at).getTime() > Date.now();
}

function isPublic(c: DiscoverChallenge): boolean {
  return String(c.visibility ?? "public").toLowerCase() === "public";
}

function matchesDiscoverFilter(c: DiscoverChallenge, f: DiscoverFilterId): boolean {
  if (f === "All") return true;
  if (f === "Easy") return String(c.difficulty ?? "").toLowerCase() === "easy";
  if (f === "7 days") return (c.duration_days ?? 0) === 7;
  const cat = String(c.category ?? "").toLowerCase();
  if (f === "Physical") return cat === "fitness";
  if (f === "Mental") return cat === "mind" || cat === "mindfulness";
  if (f === "Spiritual") return cat === "faith";
  return true;
}

function toCompactDifficulty(d?: string | null): "EASY" | "MED" | "HARD" {
  const x = String(d ?? "medium").toLowerCase();
  if (x === "easy") return "EASY";
  if (x === "hard" || x === "extreme") return "HARD";
  return "MED";
}

function badgeForDiscoverChallenge(c: DiscoverChallenge): string | undefined {
  const t = (c.title ?? "").toLowerCase();
  if (t.includes("gratitude") && t.includes("journal")) return "Grateful Heart";
  if (t.includes("gratitude")) return "Grateful Heart";
  if (t.includes("cold")) return "Ice Breaker";
  if (t.includes("hydrat") || t.includes("water") || t.includes("gallon")) return "Hydrated";
  if (t.includes("prayer") || t.includes("pray")) return "Faithful";
  if (t.includes("bed")) return "Commander";
  if (t.includes("breath")) return "Zen Mind";
  if (t.includes("wake") || t.includes("5am") || t.includes("5 am")) return "Early Riser";
  if (t.includes("social media") || t.includes("no phone")) return "Unplugged";
  if (t.includes("step") || t.includes("10k") || t.includes("walk")) return "Road Warrior";
  return undefined;
}

function teamSizeLabel(teamSize?: number): string {
  const s = teamSize ?? 4;
  if (s <= 2) return "2 people";
  if (s <= 4) return "3-4 people";
  return `${s} people`;
}

function challengeMatchesQuery(c: DiscoverChallenge, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (s === "24h" || s === "24-hour" || s === "24 hour") return isDaily(c);
  if (s === "team") return isTeamChallenge(c);
  if (s === "solo") return !isTeamChallenge(c) && !isDaily(c);
  const cat = String(c.category ?? "").toLowerCase();
  if (BROWSE_CATEGORIES.some((x) => x.toLowerCase() === s) && s !== "team") {
    return cat === s;
  }
  return (
    (c.title ?? "").toLowerCase().includes(s) ||
    (c.description ?? "").toLowerCase().includes(s) ||
    (c.short_hook ?? "").toLowerCase().includes(s)
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isPremium } = useApp();
  const isGuest = useIsGuest();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chipFilter, setChipFilter] = useState<DiscoverFilterId>("All");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const filterQuery = debouncedQuery.trim() || searchQuery.trim();

  const discoverFeed = useQuery({
    queryKey: ["discover", "feed", "v2"],
    queryFn: () => trpcQuery(TRPC.challenges.getDiscoverFeed) as Promise<{ challenges: DiscoverChallenge[] }>,
    staleTime: 60 * 1000,
  });

  const categoryCountsQuery = useQuery({
    queryKey: ["discover", "categoryCounts"],
    queryFn: () => trpcQuery(TRPC.challenges.getCategoryCounts) as Promise<Record<string, number>>,
    enabled: searchFocused && !searchQuery.trim(),
    staleTime: 5 * 60 * 1000,
  });

  const peopleSearch = useQuery({
    queryKey: ["discover", "peopleSearch", debouncedQuery, user?.id],
    queryFn: () => trpcQuery(TRPC.profiles.search, { query: debouncedQuery.trim() }) as Promise<SearchUser[]>,
    enabled: !isGuest && !!user?.id && debouncedQuery.trim().length >= 1 && searchFocused,
    staleTime: 30 * 1000,
  });

  const myActiveForDiscover = useQuery({
    queryKey: ["discover", "myActive", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<{ challenge_id?: string }[]>,
    enabled: !isGuest && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const recommendedQuery = useQuery({
    queryKey: ["discover", "recommended"],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getRecommended) as Promise<{
        challenges: Array<
          Omit<PickedChallenge, "badgeLabel"> & { completionRate?: number }
        >;
      }>,
    staleTime: 60 * 1000,
  });

  const activeChallengeIds = useMemo(() => {
    const rows = myActiveForDiscover.data;
    if (!Array.isArray(rows)) return new Set<string>();
    return new Set(rows.map((r) => r.challenge_id).filter((cid): cid is string => typeof cid === "string" && cid.length > 0));
  }, [myActiveForDiscover.data]);

  const activeCount = useMemo(
    () => (Array.isArray(myActiveForDiscover.data) ? myActiveForDiscover.data.length : 0),
    [myActiveForDiscover.data]
  );

  const allPublic = useMemo(() => {
    const list = discoverFeed.data?.challenges ?? [];
    return list.filter(isPublic);
  }, [discoverFeed.data?.challenges]);

  const filteredPublic = useMemo(
    () => allPublic.filter((c) => matchesDiscoverFilter(c, chipFilter)),
    [allPublic, chipFilter]
  );

  const pickedForYouData: PickedChallenge[] = useMemo(() => {
    const rows = recommendedQuery.data?.challenges ?? [];
    return rows.map((r) => {
      const { completionRate: _omit, ...rest } = r;
      return {
        ...rest,
        badgeLabel: badgeForDiscoverChallenge({ title: r.title } as DiscoverChallenge),
      };
    });
  }, [recommendedQuery.data?.challenges]);

  const trendingHero = useMemo(() => {
    if (!filteredPublic.length) return null;
    const ranked = [...filteredPublic].sort((a, b) => {
      const jr = (b.recent_joins_7d ?? 0) - (a.recent_joins_7d ?? 0);
      if (jr !== 0) return jr;
      return (b.participants_count ?? 0) - (a.participants_count ?? 0);
    });
    const notIn = ranked.find((c) => !activeChallengeIds.has(c.id));
    return notIn ?? ranked[0] ?? null;
  }, [filteredPublic, activeChallengeIds]);

  const heroIsActive = trendingHero ? activeChallengeIds.has(trendingHero.id) : false;

  const twentyFourHour = useMemo(() => {
    const hId = trendingHero?.id ?? "";
    return filteredPublic
      .filter((c) => c.id !== hId)
      .filter((c) => isActiveDaily(c) && !isTeamChallenge(c))
      .slice(0, 12);
  }, [filteredPublic, trendingHero?.id]);

  const soloChallenges = useMemo(() => {
    const hId = trendingHero?.id ?? "";
    return filteredPublic
      .filter((c) => c.id !== hId)
      .filter((c) => !isTeamChallenge(c) && !isDaily(c) && (c.duration_days ?? 0) > 1)
      .sort((a, b) => (b.participants_count ?? 0) - (a.participants_count ?? 0))
      .slice(0, 5);
  }, [filteredPublic, trendingHero?.id]);

  const teamChallenges = useMemo(() => {
    const hId = trendingHero?.id ?? "";
    return filteredPublic
      .filter((c) => c.id !== hId)
      .filter((c) => isTeamChallenge(c))
      .sort((a, b) => (b.participants_count ?? 0) - (a.participants_count ?? 0))
      .slice(0, 3);
  }, [filteredPublic, trendingHero?.id]);

  const newThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return filteredPublic
      .filter((c) => c.created_at && new Date(c.created_at).getTime() > weekAgo)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }, [filteredPublic]);

  const filteredChallengesForSearch = useMemo(() => {
    if (!filterQuery) return [];
    return allPublic.filter((c) => challengeMatchesQuery(c, filterQuery));
  }, [allPublic, filterQuery]); // search uses full catalog, not chip filter

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) setRecentSearches(parsed.filter((x): x is string => typeof x === "string").slice(0, 5));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchFocused]);

  const pushRecentSearch = useCallback(async (q: string) => {
    const t = q.trim();
    if (t.length < 2) return;
    const next = [t, ...recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [recentSearches]);

  const openChallenge = useCallback(
    (id: string) => {
      if (!id) return;
      if (typeof Haptics.impactAsync === "function") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(ROUTES.CHALLENGE_ID(id) as never);
    },
    [router]
  );

  const prefetchChallengeDetail = useCallback(
    (challengeId: string) => {
      void prefetchChallengeById(queryClient, challengeId);
    },
    [queryClient]
  );

  const renderTwentyFourHourItem = useCallback(
    ({ item }: { item: DiscoverChallenge }) => (
      <DiscoverMiniChallengeCard
        challenge={item}
        onPressIn={() => prefetchChallengeDetail(item.id)}
        onPress={(challengeId) => openChallenge(challengeId)}
      />
    ),
    [openChallenge, prefetchChallengeDetail]
  );

  const categoryCounts = categoryCountsQuery.data ?? {};

  const loading = discoverFeed.isPending;
  const err = discoverFeed.isError;

  const showDefaultSections = !searchFocused && !searchQuery.trim();
  const showBrowseMode = searchFocused && !searchQuery.trim();
  const showSearchResults = searchFocused && searchQuery.trim().length > 0;
  const searchPending = searchQuery.trim() !== debouncedQuery.trim() && searchQuery.trim().length > 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: DS_COLORS.BG_PAGE }} edges={["top"]}>
        <FlatList
          data={[{ key: "discover-root" }]}
          keyExtractor={(item) => item.key}
          renderItem={() => (
            <View>
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, letterSpacing: -0.5 }}>Discover</Text>
            <Text style={{ fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_MUTED, marginTop: 4 }}>
              What are you willing to commit to?
            </Text>
            {!isPremium ? (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  marginTop: 4,
                  color: activeCount >= 3 ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.TEXT_MUTED,
                }}
              >
                {activeCount}/3 challenges active
              </Text>
            ) : null}
          </View>

          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: DS_COLORS.WHITE,
                borderRadius: 14,
                borderWidth: 0.5,
                borderColor: DS_COLORS.BORDER,
                marginHorizontal: 20,
                marginTop: 14,
              },
              searchFocused && { borderColor: DS_COLORS.ACCENT },
            ]}
          >
            <Search size={18} color={searchFocused ? DS_COLORS.ACCENT : DS_COLORS.FEED_META_MUTED} />
            <TextInput
              placeholder="Search challenges or people..."
              placeholderTextColor={DS_COLORS.INPUT_PLACEHOLDER}
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => {
                void pushRecentSearch(searchQuery);
                Keyboard.dismiss();
              }}
              style={{ flex: 1, fontSize: 14, color: DS_COLORS.TEXT_PRIMARY, paddingVertical: Platform.OS === "ios" ? 8 : 4 }}
            />
            {searchQuery.length > 0 ? (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setSearchFocused(false);
                  Keyboard.dismiss();
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={16} color={DS_COLORS.FEED_META_MUTED} />
              </Pressable>
            ) : null}
          </View>

          <FilterChips onFilterChange={setChipFilter} />

          {showBrowseMode ? (
            <View style={{ marginTop: 8, paddingBottom: 32 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: DS_COLORS.FEED_META_MUTED,
                  letterSpacing: 0.5,
                  paddingHorizontal: 20,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                BROWSE BY CATEGORY
              </Text>
              {BROWSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${cat} challenges`}
                  onPress={() => {
                    setSearchQuery(cat);
                    void pushRecentSearch(cat);
                  }}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderBottomWidth: 0.5,
                    borderBottomColor: DS_COLORS.DIVIDER,
                  }}
                >
                  <Text style={{ fontSize: 15, color: DS_COLORS.TEXT_SECONDARY }}>{cat}</Text>
                  <Text style={{ fontSize: 13, color: DS_COLORS.FEED_META_MUTED }}>
                    {categoryCounts[cat] ?? 0} challenges ›
                  </Text>
                </Pressable>
              ))}
              {recentSearches.length > 0 ? (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: DS_COLORS.FEED_META_MUTED,
                      letterSpacing: 0.5,
                      paddingHorizontal: 20,
                      marginTop: 20,
                      marginBottom: 8,
                    }}
                  >
                    RECENT SEARCHES
                  </Text>
                  {recentSearches.slice(0, 3).map((r) => (
                    <Pressable
                      key={r}
                      accessibilityRole="button"
                      accessibilityLabel={`Search for ${r}`}
                      onPress={() => setSearchQuery(r)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        borderBottomWidth: 0.5,
                        borderBottomColor: DS_COLORS.DIVIDER,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: DS_COLORS.TEXT_PRIMARY }}>{r}</Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </View>
          ) : null}

          {showSearchResults ? (
            <View style={{ marginTop: 12, paddingBottom: 40 }}>
              {searchPending ? (
                <Text style={{ paddingHorizontal: 20, color: DS_COLORS.TEXT_MUTED, fontSize: 13, marginBottom: 8 }}>Searching…</Text>
              ) : null}
              {!isGuest && peopleSearch.isPending && !searchPending ? (
                <Text style={{ paddingHorizontal: 20, color: DS_COLORS.TEXT_MUTED, fontSize: 13 }}>Searching people…</Text>
              ) : null}
              {!isGuest && peopleSearch.data && peopleSearch.data.length > 0 ? (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: DS_COLORS.FEED_META_MUTED,
                      letterSpacing: 0.5,
                      paddingHorizontal: 20,
                      marginBottom: 8,
                    }}
                  >
                    PEOPLE
                  </Text>
                  <FlatList
                    data={peopleSearch.data}
                    keyExtractor={(u) => u.user_id}
                    scrollEnabled={false}
                    nestedScrollEnabled
                    renderItem={({ item: u }) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Open profile for ${u.display_name || u.username}`}
                        onPress={() => {
                          void pushRecentSearch(filterQuery);
                          router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u.username)) as never);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                        }}
                      >
                        <Avatar url={u.avatar_url} name={u.username} userId={u.user_id} size={38} />
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY }}>{u.username}</Text>
                          <Text style={{ fontSize: 12, color: DS_COLORS.FEED_META_MUTED, marginTop: 1 }}>
                            {u.current_streak > 0 ? `${u.current_streak}-day streak` : "Active on GRIIT"}
                          </Text>
                        </View>
                      </Pressable>
                    )}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={8}
                    removeClippedSubviews={Platform.OS === "android"}
                  />
                </>
              ) : null}

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: DS_COLORS.FEED_META_MUTED,
                  letterSpacing: 0.5,
                  paddingHorizontal: 20,
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                CHALLENGES
              </Text>
              {searchPending ? null : filteredChallengesForSearch.length === 0 ? (
                <Text style={{ paddingHorizontal: 20, color: DS_COLORS.TEXT_SECONDARY, fontSize: 14 }}>
                  {!isGuest && (peopleSearch.data?.length ?? 0) > 0
                    ? `No challenges match "${filterQuery}"`
                    : `No results for "${filterQuery}". Try another name or keyword.`}
                </Text>
              ) : (
                <FlatList
                  data={filteredChallengesForSearch}
                  keyExtractor={(c) => c.id}
                  scrollEnabled={false}
                  nestedScrollEnabled
                  renderItem={({ item: c }) => (
                    <DiscoverChallengeSearchRow
                      challenge={c}
                      onPress={() => {
                        void pushRecentSearch(filterQuery);
                        openChallenge(c.id);
                      }}
                    />
                  )}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  initialNumToRender={8}
                  removeClippedSubviews={Platform.OS === "android"}
                />
              )}
            </View>
          ) : null}

          {showDefaultSections && err ? (
            <ErrorState message="Couldn't load challenges" onRetry={() => void discoverFeed.refetch()} />
          ) : null}

          {showDefaultSections && loading ? (
            <View>
              <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
                <SkeletonHeroCard />
              </View>
              <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 12 }}>
                <SkeletonChallengeCard />
                <SkeletonChallengeCard />
                <SkeletonChallengeCard />
              </View>
            </View>
          ) : null}

          {showDefaultSections && !loading && !err ? (
            <>
              <PickedForYou challenges={pickedForYouData} />

              <ActivityTicker />

              <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                <HeroFeaturedCard
                  challenge={
                    trendingHero
                      ? {
                          id: trendingHero.id,
                          title: trendingHero.title ?? "Challenge",
                          description: trendingHero.short_hook ?? trendingHero.description,
                          duration_days: trendingHero.duration_days,
                          participants_count: trendingHero.participants_count,
                          category: trendingHero.category,
                          joins_today: trendingHero.joins_today,
                          recent_joins_7d: trendingHero.recent_joins_7d,
                          joinPreview: trendingHero.team_preview,
                        }
                      : null
                  }
                  ctaLabel={heroIsActive ? "Continue" : "Start this challenge"}
                  onPress={openChallenge}
                  onPressIn={trendingHero ? () => prefetchChallengeDetail(trendingHero.id) : undefined}
                />
              </View>

              {twentyFourHour.length > 0 ? (
                <>
                  <SectionHeader
                    title="24-hour challenges"
                    actionLabel="See all"
                    onPressAction={() => {
                      setSearchFocused(true);
                      setSearchQuery("24h");
                    }}
                    style={{ marginTop: 24 }}
                  />
                  <FlatList
                    horizontal
                    data={twentyFourHour}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 8 }}
                    renderItem={renderTwentyFourHourItem}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === "android"}
                  />
                </>
              ) : null}

              {soloChallenges.length > 0 ? (
                <>
                  <SectionHeader
                    title="Solo challenges"
                    actionLabel="See all"
                    onPressAction={() => {
                      setSearchFocused(true);
                      setSearchQuery("solo");
                    }}
                    style={{ marginTop: 24 }}
                  />
                  <View
                    style={{
                      marginHorizontal: 16,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: DS_COLORS.BORDER,
                    }}
                  >
                    <FlatList
                      data={soloChallenges}
                      keyExtractor={(c) => c.id}
                      scrollEnabled={false}
                      nestedScrollEnabled
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: DS_COLORS.BORDER }} />
                      )}
                      renderItem={({ item: c }) => (
                        <CompactChallengeRow
                          id={c.id}
                          title={c.title ?? "Challenge"}
                          duration={c.duration_days ?? 7}
                          difficulty={toCompactDifficulty(c.difficulty)}
                          participantCount={c.participants_count ?? 0}
                          category={c.category ?? undefined}
                          isTeam={false}
                          onPressIn={() => prefetchChallengeDetail(c.id)}
                        />
                      )}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      initialNumToRender={8}
                      removeClippedSubviews={Platform.OS === "android"}
                    />
                  </View>
                </>
              ) : null}

              {teamChallenges.length > 0 ? (
                <>
                  <SectionHeader
                    title="Team challenges"
                    actionLabel="See all"
                    onPressAction={() => {
                      setSearchFocused(true);
                      setSearchQuery("Team");
                    }}
                    style={{ marginTop: 24 }}
                  />
                  <View
                    style={{
                      marginHorizontal: 16,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: DS_COLORS.BORDER,
                    }}
                  >
                    <FlatList
                      data={teamChallenges}
                      keyExtractor={(c) => c.id}
                      scrollEnabled={false}
                      nestedScrollEnabled
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: DS_COLORS.BORDER }} />
                      )}
                      renderItem={({ item: c }) => (
                        <CompactChallengeRow
                          id={c.id}
                          title={c.title ?? "Challenge"}
                          duration={c.duration_days ?? 7}
                          difficulty={toCompactDifficulty(c.difficulty)}
                          participantCount={c.participants_count ?? 0}
                          category={c.category ?? undefined}
                          isTeam
                          teamSize={teamSizeLabel(c.team_size)}
                          onPressIn={() => prefetchChallengeDetail(c.id)}
                        />
                      )}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      initialNumToRender={8}
                      removeClippedSubviews={Platform.OS === "android"}
                    />
                  </View>
                </>
              ) : null}

              {newThisWeek.length > 0 ? (
                <>
                  <SectionHeader title="New this week" style={{ marginTop: 24 }} />
                  <View
                    style={{
                      marginHorizontal: 16,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: DS_COLORS.BORDER,
                    }}
                  >
                    <FlatList
                      data={newThisWeek}
                      keyExtractor={(c) => c.id}
                      scrollEnabled={false}
                      nestedScrollEnabled
                      ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: DS_COLORS.BORDER }} />
                      )}
                      renderItem={({ item: c }) => (
                        <CompactChallengeRow
                          id={c.id}
                          title={c.title ?? "Challenge"}
                          duration={c.duration_days ?? 7}
                          difficulty={toCompactDifficulty(c.difficulty)}
                          participantCount={c.participants_count ?? 0}
                          category={c.category ?? undefined}
                          isTeam={isTeamChallenge(c)}
                          teamSize={isTeamChallenge(c) ? teamSizeLabel(c.team_size) : undefined}
                          onPressIn={() => prefetchChallengeDetail(c.id)}
                        />
                      )}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                      initialNumToRender={8}
                      removeClippedSubviews={Platform.OS === "android"}
                    />
                  </View>
                </>
              ) : null}

              <Pressable
                onPress={() => router.push(ROUTES.CREATE_WIZARD as never)}
                accessibilityRole="button"
                accessibilityLabel="Create a custom challenge"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  marginHorizontal: 16,
                  marginTop: 24,
                  marginBottom: 24,
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  backgroundColor: DS_COLORS.TEXT_PRIMARY,
                  borderRadius: 18,
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: DS_COLORS.FEED_CTA_ICON_BG,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={20} color={DS_COLORS.ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: DS_COLORS.WHITE }}>Build your own</Text>
                  <Text style={{ fontSize: 12, color: DS_COLORS.FEED_META_MUTED, marginTop: 2 }}>Create a custom challenge</Text>
                </View>
                <ChevronRight size={16} color={DS_COLORS.TEXT_SECONDARY} />
              </Pressable>
            </>
          ) : null}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={discoverFeed.isRefetching}
              onRefresh={() => void discoverFeed.refetch()}
              tintColor={DS_COLORS.ACCENT}
            />
          }
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}
