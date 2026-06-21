/**
 * DiscoverForYouGrid — composer for the Discover For-You masonry grid.
 *
 * Mixes 4 typed sections:
 *   - proof    → trending posts from `feed.getTrending`
 *   - challenge → recommended challenges from `challenges.getRecommended`
 *   - person   → suggested follows from `profiles.suggested`
 *   - nudge    → contextual prompts (badge_in_reach, streak_at_risk, create_your_own)
 *
 * Layout: full-width nudges (streak_at_risk, create_your_own) render outside the
 * grid; everything else flows into a stable two-column layout (`@shopify/flash-list`
 * does not ship MasonryFlashList in this app, so we use a deterministic
 * left/right column split).
 *
 * Each card is wrapped in an `ErrorBoundary` so one bad row never blanks the
 * whole grid.
 */
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { trpcQuery } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkeletonBase } from '@/components/skeletons';
import { captureError } from '@/lib/sentry';

import { type DiscoverCategory } from '@/components/discover/CategoryChips';
import { type StreakAtRiskData } from '@/components/discover/StreakRiskBanner';
import type { LiveFeedPost } from '@/components/feed/feedTypes';

import {
  ChallengeGridCard,
  type RecommendedChallenge,
} from '@/components/discover/grid/ChallengeGridCard';
import { NudgeCard } from '@/components/discover/grid/NudgeCard';
import {
  PersonCard,
  type SuggestedPerson,
} from '@/components/discover/grid/PersonCard';
import {
  ProofTile,
  type ProofTileVariant,
} from '@/components/discover/grid/ProofTile';

type TrendingResponse = { posts: LiveFeedPost[] };
type RecommendedResponse = { challenges: RecommendedChallenge[] };

type NudgeData =
  | {
      variant: 'badge_in_reach';
      badgeName: string;
      daysAway?: number;
      /** Challenge id to navigate to when the nudge is tapped. */
      challengeId: string;
    }
  | {
      variant: 'streak_at_risk';
      streakAtRiskMinutes: number;
    }
  | { variant: 'create_your_own' };

type GridSection =
  | {
      type: 'proof';
      key: string;
      data: LiveFeedPost;
      variant?: ProofTileVariant;
    }
  | {
      type: 'challenge';
      key: string;
      data: RecommendedChallenge;
    }
  | {
      type: 'person';
      key: string;
      data: SuggestedPerson;
    }
  | {
      type: 'nudge';
      key: string;
      data: NudgeData;
    };

export type DiscoverForYouGridProps = {
  selectedCategory: DiscoverCategory;
};

function categoryMatches(
  challenge: RecommendedChallenge,
  selected: DiscoverCategory,
): boolean {
  if (selected === 'all' || selected === 'for_you' || selected === 'trending') {
    return true;
  }
  const c = (challenge.category ?? '').toLowerCase();
  if (selected === 'body') return c === 'body' || c === 'fitness';
  return c === selected;
}

function postCategoryMatches(_post: LiveFeedPost, _selected: DiscoverCategory): boolean {
  // LiveFeedPost has no category today — show trending across the board so
  // the grid never looks empty when a niche chip is selected. Future: wire
  // category through the trending tRPC endpoint and filter here.
  return true;
}

function interleave(args: {
  posts: LiveFeedPost[];
  challenges: RecommendedChallenge[];
  people: SuggestedPerson[];
  streakAtRisk: StreakAtRiskData | null;
}): GridSection[] {
  const { posts, challenges, people, streakAtRisk } = args;
  const out: GridSection[] = [];

  if (streakAtRisk) {
    out.push({
      type: 'nudge',
      key: 'nudge-streak-at-risk',
      data: {
        variant: 'streak_at_risk',
        streakAtRiskMinutes: Math.max(
          1,
          Math.round((streakAtRisk.hours_remaining ?? 0) * 60),
        ),
      },
    });
  }

  // Pattern: challenge / proof / challenge / person / proof / challenge / nudge / proof / ...
  const pattern: ('challenge' | 'proof' | 'person' | 'nudge')[] = [
    'challenge',
    'proof',
    'challenge',
    'person',
    'proof',
    'challenge',
    'nudge',
    'proof',
    'person',
    'challenge',
    'proof',
  ];

  let pi = 0;
  let pp = 0;
  let cp = 0;
  let pe = 0;
  let badgeNudgeUsed = false;

  while (pi < pattern.length) {
    const slot = pattern[pi];
    pi += 1;

    if (slot === 'challenge') {
      const c = challenges[cp];
      if (c) {
        cp += 1;
        out.push({ type: 'challenge', key: `c-${c.id}`, data: c });
      }
      continue;
    }
    if (slot === 'proof') {
      const p = posts[pp];
      if (p) {
        const variant: ProofTileVariant = pp % 2 === 0 ? 'normal' : 'tall';
        pp += 1;
        out.push({
          type: 'proof',
          key: `p-${p.id}`,
          data: p,
          variant,
        });
      }
      continue;
    }
    if (slot === 'person') {
      const ps = people[pe];
      if (ps) {
        pe += 1;
        out.push({ type: 'person', key: `u-${ps.user_id}`, data: ps });
      }
      continue;
    }
    if (slot === 'nudge' && !badgeNudgeUsed) {
      const easyChallenge = challenges.slice(cp).find((c) => c.difficulty === 'EASY');
      if (easyChallenge) {
        badgeNudgeUsed = true;
        out.push({
          type: 'nudge',
          key: 'nudge-badge-in-reach',
          data: {
            variant: 'badge_in_reach',
            badgeName: easyChallenge.title,
            challengeId: easyChallenge.id,
          },
        });
      }
    }
  }

  // Drain any remaining content so we don't waste fetched data.
  for (; cp < challenges.length; cp += 1) {
    const c = challenges[cp];
    if (!c) continue;
    out.push({ type: 'challenge', key: `c-${c.id}`, data: c });
  }
  for (; pp < posts.length; pp += 1) {
    const p = posts[pp];
    if (!p) continue;
    const variant: ProofTileVariant = pp % 2 === 0 ? 'normal' : 'tall';
    out.push({
      type: 'proof',
      key: `p-${p.id}`,
      data: p,
      variant,
    });
  }
  for (; pe < people.length; pe += 1) {
    const ps = people[pe];
    if (!ps) continue;
    out.push({ type: 'person', key: `u-${ps.user_id}`, data: ps });
  }

  // Always close with a "Create your own" nudge.
  out.push({
    type: 'nudge',
    key: 'nudge-create-your-own',
    data: { variant: 'create_your_own' },
  });

  return out;
}

function GridCard({ section }: { section: GridSection }) {
  const router = useRouter();
  const badgeChallengeId =
    section.type === 'nudge' && section.data.variant === 'badge_in_reach'
      ? section.data.challengeId
      : null;
  const handleBadgePress = useCallback(() => {
    if (!badgeChallengeId) return;
    router.push(ROUTES.CHALLENGE_ID(badgeChallengeId) as never);
  }, [router, badgeChallengeId]);

  if (section.type === 'proof') {
    return <ProofTile post={section.data} variant={section.variant} />;
  }
  if (section.type === 'challenge') {
    return <ChallengeGridCard challenge={section.data} />;
  }
  if (section.type === 'person') {
    return <PersonCard person={section.data} />;
  }
  // nudge
  if (section.data.variant === 'badge_in_reach') {
    return (
      <NudgeCard
        variant="badge_in_reach"
        badgeName={section.data.badgeName}
        daysAway={section.data.daysAway}
        onPress={handleBadgePress}
      />
    );
  }
  if (section.data.variant === 'streak_at_risk') {
    return (
      <NudgeCard
        variant="streak_at_risk"
        streakAtRiskMinutes={section.data.streakAtRiskMinutes}
      />
    );
  }
  return <NudgeCard variant="create_your_own" />;
}

function GridSkeleton() {
  return (
    <View style={styles.columns}>
      <View style={styles.column}>
        <SkeletonBase width="100%" height={170} borderRadius={DS_DAYLIGHT.radius.cardSm} />
        <SkeletonBase width="100%" height={120} borderRadius={DS_DAYLIGHT.radius.cardSm} />
        <SkeletonBase width="100%" height={200} borderRadius={DS_DAYLIGHT.radius.cardSm} />
      </View>
      <View style={styles.column}>
        <SkeletonBase width="100%" height={130} borderRadius={DS_DAYLIGHT.radius.cardSm} />
        <SkeletonBase width="100%" height={180} borderRadius={DS_DAYLIGHT.radius.cardSm} />
        <SkeletonBase width="100%" height={150} borderRadius={DS_DAYLIGHT.radius.cardSm} />
      </View>
    </View>
  );
}

export const DiscoverForYouGrid = React.memo(function DiscoverForYouGrid({
  selectedCategory,
}: DiscoverForYouGridProps) {
  const trendingQuery = useQuery({
    queryKey: ['discover', 'foryou', 'trending'],
    queryFn: () =>
      trpcQuery(TRPC.feed.getTrending, { limit: 8 }) as Promise<TrendingResponse>,
    staleTime: 5 * 60 * 1000,
  });

  const recommendedQuery = useQuery({
    queryKey: ['discover', 'foryou', 'recommended'],
    queryFn: () => trpcQuery(TRPC.challenges.getRecommended) as Promise<RecommendedResponse>,
    staleTime: 5 * 60 * 1000,
  });

  const peopleQuery = useQuery({
    queryKey: ['discover', 'foryou', 'suggested'],
    queryFn: () =>
      trpcQuery(TRPC.profiles.suggested, { limit: 6 }) as Promise<SuggestedPerson[]>,
    staleTime: 5 * 60 * 1000,
  });

  const streakAtRiskQuery = useQuery({
    queryKey: ['discover', 'foryou', 'streakAtRisk'],
    queryFn: () =>
      trpcQuery(TRPC.feed.getStreakAtRisk) as Promise<StreakAtRiskData | null>,
    staleTime: 5 * 60 * 1000,
  });

  if (trendingQuery.isError) captureError(trendingQuery.error, 'DiscoverForYouGrid.trending');
  if (recommendedQuery.isError)
    captureError(recommendedQuery.error, 'DiscoverForYouGrid.recommended');
  if (peopleQuery.isError) captureError(peopleQuery.error, 'DiscoverForYouGrid.people');
  if (streakAtRiskQuery.isError)
    captureError(streakAtRiskQuery.error, 'DiscoverForYouGrid.streakAtRisk');

  const filteredChallenges = useMemo(() => {
    const list = recommendedQuery.data?.challenges ?? [];
    return list.filter((c) => categoryMatches(c, selectedCategory));
  }, [recommendedQuery.data, selectedCategory]);

  const filteredPosts = useMemo(() => {
    const list = trendingQuery.data?.posts ?? [];
    return list.filter((p) => postCategoryMatches(p, selectedCategory));
  }, [trendingQuery.data, selectedCategory]);

  const sections = useMemo(
    () =>
      interleave({
        posts: filteredPosts,
        challenges: filteredChallenges,
        people: peopleQuery.data ?? [],
        streakAtRisk: streakAtRiskQuery.data ?? null,
      }),
    [filteredPosts, filteredChallenges, peopleQuery.data, streakAtRiskQuery.data],
  );

  const isInitialLoading =
    (trendingQuery.isPending && !trendingQuery.data) ||
    (recommendedQuery.isPending && !recommendedQuery.data) ||
    (peopleQuery.isPending && !peopleQuery.data);

  if (isInitialLoading) {
    return (
      <View style={styles.wrap}>
        <GridSkeleton />
        <ActivityIndicator
          size="small"
          color={DS_DAYLIGHT.color.accent}
          style={styles.spinner}
        />
      </View>
    );
  }

  const isContentEmpty =
    filteredPosts.length === 0 &&
    filteredChallenges.length === 0 &&
    (peopleQuery.data ?? []).length === 0;

  if (isContentEmpty) {
    return (
      <View style={styles.wrap}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Nothing in {selectedCategory === 'all' ? 'For you' : selectedCategory} yet.
            Try another category or create your own.
          </Text>
        </View>
        <View style={styles.fullWidthNudge}>
          <ErrorBoundary>
            <NudgeCard variant="create_your_own" />
          </ErrorBoundary>
        </View>
      </View>
    );
  }

  // Split sections: full-width nudges (streak_at_risk, create_your_own) render
  // outside the columns; everything else gets distributed left/right.
  const fullWidth: GridSection[] = [];
  const inGrid: GridSection[] = [];
  for (const s of sections) {
    if (
      s.type === 'nudge' &&
      (s.data.variant === 'streak_at_risk' || s.data.variant === 'create_your_own')
    ) {
      fullWidth.push(s);
    } else {
      inGrid.push(s);
    }
  }

  const leftCol = inGrid.filter((_, i) => i % 2 === 0);
  const rightCol = inGrid.filter((_, i) => i % 2 === 1);

  // We want streak_at_risk before everything, create_your_own after everything.
  const top = fullWidth.filter(
    (s) => s.type === 'nudge' && s.data.variant === 'streak_at_risk',
  );
  const bottom = fullWidth.filter(
    (s) => s.type === 'nudge' && s.data.variant === 'create_your_own',
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionHeader}>Popular with your circle</Text>
      {top.map((s) => (
        <View key={s.key} style={styles.fullWidthNudge}>
          <ErrorBoundary>
            <GridCard section={s} />
          </ErrorBoundary>
        </View>
      ))}
      <View style={styles.columns}>
        <View style={styles.column}>
          {leftCol.map((s) => (
            <ErrorBoundary key={s.key}>
              <GridCard section={s} />
            </ErrorBoundary>
          ))}
        </View>
        <View style={styles.column}>
          {rightCol.map((s) => (
            <ErrorBoundary key={s.key}>
              <GridCard section={s} />
            </ErrorBoundary>
          ))}
        </View>
      </View>
      {bottom.map((s) => (
        <View key={s.key} style={styles.fullWidthNudge}>
          <ErrorBoundary>
            <GridCard section={s} />
          </ErrorBoundary>
        </View>
      ))}
    </View>
  );
});

export default DiscoverForYouGrid;

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: 12,
    gap: 14,
  },
  sectionHeader: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.cardTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: -0.2,
    color: DS_DAYLIGHT.color.ink,
    paddingTop: 14,
    paddingBottom: 2,
  },
  columns: {
    flexDirection: 'row',
    gap: 14,
  },
  column: {
    flex: 1,
    gap: 14,
  },
  fullWidthNudge: {
    width: '100%',
  },
  spinner: {
    marginTop: 12,
  },
  empty: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.bodySm,
    color: DS_DAYLIGHT.color.inkMuted,
    textAlign: 'center',
  },
});
