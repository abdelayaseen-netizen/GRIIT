import React, { useMemo, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useInfiniteQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS } from "@/lib/design-system";
import { styles } from "@/styles/discover-styles";
import { FilterChip } from "@/src/components/ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ROUTES } from "@/lib/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { HeroFeaturedCard } from "@/components/challenges/HeroFeaturedCard";
import { DailyCard } from "@/components/challenges/DailyCard";
import { TeamChallengeCard } from "@/components/challenges/TeamChallengeCard";
import { PopularChallengeRow } from "@/components/challenges/PopularChallengeRow";

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

export default function DiscoverScreen() {
  const router = useRouter();
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
  });

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
              <TouchableOpacity style={styles.v3SearchBtn} onPress={() => setSearchOpen((v) => !v)} activeOpacity={0.8}>
                <Search size={15} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.v3Subtitle}>What are you willing to commit to?</Text>
          </View>

          {searchOpen ? (
            <View style={styles.v3SearchInlineWrap}>
              <View style={styles.v3SearchInline}>
                <Text style={styles.v3SearchLabel}>Search: </Text>
                <TouchableOpacity onPress={() => setQuery("")}><Text style={styles.v3SearchClear}>Clear</Text></TouchableOpacity>
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

          <View style={styles.v3SectionPad}><HeroFeaturedCard challenge={hero ? { id: hero.id, title: hero.title ?? "Challenge", description: hero.short_hook ?? hero.description, duration_days: hero.duration_days, participants_count: hero.participants_count } : null} onPress={openChallenge} /></View>

          <View style={styles.v3SectionHeader}><Text style={styles.v3SectionTitle}>Expires tonight</Text><View style={styles.v3Dot} /></View>
          <FlatList
            horizontal
            data={daily}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.v3FlatPad}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => (
              <DailyCard
                challenge={{
                  id: item.id,
                  title: item.title ?? "Challenge",
                  description: item.short_hook ?? item.description,
                  difficulty: item.difficulty,
                  participants_count: item.participants_count,
                }}
                onPress={openChallenge}
              />
            )}
          />

          <View style={styles.v3SectionHeaderSolo}><Text style={styles.v3SectionTitle}>Bring your people</Text></View>
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
              />
            ))}
          </View>

          <View style={styles.v3SectionHeaderBetween}>
            <Text style={styles.v3SectionTitle}>Challenges for you</Text>
            <TouchableOpacity onPress={() => setActiveCategory("all")}><Text style={styles.v3SeeAll}>See all</Text></TouchableOpacity>
          </View>
          <View style={styles.v3PopularWrap}>
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
              />
            ))}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
