/**
 * Discover tab — presentation on DiscoverV3. Same queries as the prior screen:
 * getDiscoverFeatured, feed.getTrending, challenges.getRecommended,
 * profiles.suggested, feed.getStreakAtRisk. Proof posts are filtered out in
 * DiscoverV3 (never mapped into the grid).
 */
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";
import { profilePrimaryName } from "@/lib/profile-display";

import {
  type DiscoverCategory,
} from "@/components/discover/CategoryChips";
import { type HeroFeaturedData } from "@/components/challenges/HeroFeaturedCard";
import { type RecommendedChallenge } from "@/components/discover/grid/ChallengeGridCard";
import { type SuggestedPerson } from "@/components/discover/PersonCard";
import { type StreakAtRiskData } from "@/components/discover/StreakRiskBanner";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import {
  DiscoverV3,
  type DiscoverPerson,
} from "@/components/discover/DiscoverV3";

type TrendingResponse = { posts: LiveFeedPost[] };
type RecommendedResponse = { challenges: RecommendedChallenge[] };
type FollowState = "none" | "pending" | "following";

function categoryMatches(
  challenge: RecommendedChallenge,
  selected: DiscoverCategory,
): boolean {
  if (selected === "all" || selected === "for_you" || selected === "trending") {
    return true;
  }
  const c = (challenge.category ?? "").toLowerCase();
  if (selected === "body") return c === "body" || c === "fitness";
  return c === selected;
}

function personStatus(person: SuggestedPerson): string {
  const streak = person.current_streak;
  const mutuals = Math.max(0, Number(person.mutuals_count ?? 0));
  const parts: string[] = [];
  if (streak > 0) parts.push(`${streak}-day streak`);
  if (mutuals > 0) parts.push(`${mutuals} mutual${mutuals === 1 ? "" : "s"}`);
  return parts.length > 0 ? parts.join(" · ") : "New here";
}

function DiscoverScreenInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] =
    useState<DiscoverCategory>("for_you");
  const [followById, setFollowById] = useState<Record<string, FollowState>>({});
  const [followPendingId, setFollowPendingId] = useState<string | null>(null);

  const featuredQuery = useQuery({
    queryKey: ["discover", "featured", selectedCategory],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getDiscoverFeatured, {
        category:
          selectedCategory === "for_you" || selectedCategory === "trending"
            ? "all"
            : selectedCategory,
      }) as Promise<HeroFeaturedData | null>,
    staleTime: 60 * 1000,
  });

  const trendingQuery = useQuery({
    queryKey: ["discover", "foryou", "trending"],
    queryFn: () =>
      trpcQuery(TRPC.feed.getTrending, { limit: 8 }) as Promise<TrendingResponse>,
    staleTime: 5 * 60 * 1000,
  });

  const recommendedQuery = useQuery({
    queryKey: ["discover", "foryou", "recommended"],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getRecommended) as Promise<RecommendedResponse>,
    staleTime: 5 * 60 * 1000,
  });

  const peopleQuery = useQuery({
    queryKey: ["discover", "foryou", "suggested"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.suggested, { limit: 6 }) as Promise<SuggestedPerson[]>,
    staleTime: 5 * 60 * 1000,
  });

  const streakAtRiskQuery = useQuery({
    queryKey: ["discover", "foryou", "streakAtRisk"],
    queryFn: () =>
      trpcQuery(TRPC.feed.getStreakAtRisk) as Promise<StreakAtRiskData | null>,
    staleTime: 5 * 60 * 1000,
  });

  if (featuredQuery.isError)
    captureError(featuredQuery.error, "Discover.getDiscoverFeatured");
  if (trendingQuery.isError)
    captureError(trendingQuery.error, "DiscoverForYouGrid.trending");
  if (recommendedQuery.isError)
    captureError(recommendedQuery.error, "DiscoverForYouGrid.recommended");
  if (peopleQuery.isError)
    captureError(peopleQuery.error, "DiscoverForYouGrid.people");
  if (streakAtRiskQuery.isError)
    captureError(streakAtRiskQuery.error, "DiscoverForYouGrid.streakAtRisk");

  void trendingQuery.data;
  void streakAtRiskQuery.data;

  const filteredChallenges = useMemo(() => {
    const list = recommendedQuery.data?.challenges ?? [];
    return list.filter((c) => categoryMatches(c, selectedCategory));
  }, [recommendedQuery.data, selectedCategory]);

  const people: DiscoverPerson[] = useMemo(() => {
    return (peopleQuery.data ?? []).map((p) => {
      const state = followById[p.user_id] ?? "none";
      const followLabel =
        state === "following"
          ? "Following"
          : state === "pending"
            ? "Requested"
            : p.is_private
              ? "Request"
              : "Follow";
      return {
        user_id: p.user_id,
        name: profilePrimaryName({
          username: p.username,
          display_name: p.display_name,
        }),
        uri: p.avatar_url,
        status: personStatus(p),
        followLabel,
        followDisabled: state === "following" || state === "pending",
        followPending: followPendingId === p.user_id,
      };
    });
  }, [peopleQuery.data, followById, followPendingId]);

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

  const handleOpenChallenge = useCallback(
    (id: string, slug?: string | null) => {
      const target = (slug ?? id).trim() || id;
      router.push(ROUTES.CHALLENGE_ID(target) as never);
    },
    [router],
  );

  const handleStartFeatured = useCallback(() => {
    const data = featuredQuery.data;
    if (!data?.id) return;
    handleOpenChallenge(data.id, data.slug);
  }, [featuredQuery.data, handleOpenChallenge]);

  const handleOpenPerson = useCallback(
    (userId: string) => {
      const person = (peopleQuery.data ?? []).find((p) => p.user_id === userId);
      if (!person) return;
      const u = (person.username ?? "").trim();
      const target = u ? encodeURIComponent(u) : encodeURIComponent(person.user_id);
      router.push(ROUTES.PROFILE_USERNAME(target) as never);
    },
    [peopleQuery.data, router],
  );

  const handleFollowPerson = useCallback(
    async (userId: string) => {
      const person = (peopleQuery.data ?? []).find((p) => p.user_id === userId);
      if (!person || followPendingId) return;
      const previous = followById[userId] ?? "none";
      const optimistic: FollowState = person.is_private ? "pending" : "following";
      setFollowPendingId(userId);
      setFollowById((cur) => ({ ...cur, [userId]: optimistic }));
      try {
        if (person.is_private) {
          await trpcMutate(TRPC.profiles.sendFollowRequest, { userId });
        } else {
          await trpcMutate(TRPC.profiles.followUser, { userId });
        }
        trackEvent("discover_suggested_follow_tapped", {
          target_user_id: person.user_id,
          is_private: person.is_private,
        });
        void queryClient.invalidateQueries({
          queryKey: ["discover", "foryou", "suggested"],
        });
      } catch (err) {
        setFollowById((cur) => ({ ...cur, [userId]: previous }));
        captureError(err, "Discover.PersonCard.follow");
      } finally {
        setFollowPendingId(null);
      }
    },
    [peopleQuery.data, followPendingId, followById, queryClient],
  );

  const featuredLoading = featuredQuery.isPending && !featuredQuery.data;
  const challengesLoading =
    recommendedQuery.isPending && !recommendedQuery.data;
  const error = featuredQuery.isError || recommendedQuery.isError;
  const refreshing =
    featuredQuery.isRefetching ||
    recommendedQuery.isRefetching ||
    peopleQuery.isRefetching;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <DiscoverV3
        category={selectedCategory}
        onCategory={handleCategorySelect}
        featured={featuredQuery.data ?? null}
        featuredLoading={featuredLoading}
        challenges={filteredChallenges}
        challengesLoading={challengesLoading}
        people={people}
        circleCount={featuredQuery.data?.joinedTodayCount ?? 0}
        error={error}
        onRetry={() => {
          void featuredQuery.refetch();
          void recommendedQuery.refetch();
        }}
        onOpenChallenge={handleOpenChallenge}
        onStartFeatured={handleStartFeatured}
        onBuildOwn={handleBuildYourOwn}
        onOpenPerson={handleOpenPerson}
        onFollowPerson={(id) => {
          void handleFollowPerson(id);
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
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
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
});
