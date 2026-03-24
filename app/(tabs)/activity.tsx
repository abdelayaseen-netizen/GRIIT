import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Users, ChevronRight, Activity } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/contexts/AppContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { CommunityHeader, type CommunityFilter } from "@/components/community/CommunityHeader";
import { Leaderboard, type CommunityLeaderboardEntry } from "@/components/community/Leaderboard";
import { LiveActivity, type LiveActivityItem } from "@/components/community/LiveActivity";
import { YourStats } from "@/components/community/YourStats";
import { EmptyState } from "@/components/shared/EmptyState";
import Card from "@/components/shared/Card";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import StatBadge from "@/components/shared/StatBadge";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";

interface FeedEventItem {
  id: string;
  user_id: string;
  event_type: string;
  challenge_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  display_name: string;
  username: string;
  reaction_count?: number;
  reacted_by_me?: boolean;
}

function mapLeaderboardEntry(entry: {
  userId: string;
  username: string;
  displayName: string;
  rank: number;
  securedDaysThisWeek: number;
}): CommunityLeaderboardEntry {
  return {
    userId: entry.userId,
    username: entry.username,
    displayName: entry.displayName || entry.username,
    rank: entry.rank,
    points: entry.securedDaysThisWeek,
  };
}

function mapFeedItem(event: FeedEventItem): LiveActivityItem {
  const metadata = event.metadata || {};
  const m = metadata as Record<string, unknown>;
  return {
    id: event.id,
    userId: event.user_id,
    username: event.username,
    displayName: event.display_name || event.username,
    eventType: event.event_type,
    challengeName: (metadata.challenge_name as string | undefined) || null,
    dayNumber: (metadata.day_number as number | undefined) ?? null,
    createdAt: event.created_at,
    metadata: {
      has_photo: Boolean(m.has_photo),
      photo_url: (m.photo_url as string | null | undefined) ?? null,
      verification_method: (m.verification_method as string | null | undefined) ?? null,
      is_hard_mode: Boolean(m.is_hard_mode),
      heart_rate_verified: Boolean(m.heart_rate_verified),
      location_verified: Boolean(m.location_verified),
      task_name: (m.task_name as string | null | undefined) ?? null,
      task_type: (m.task_type as string | null | undefined) ?? null,
    },
    reactionCount: event.reaction_count ?? 0,
    reactedByMe: !!event.reacted_by_me,
  };
}

function FriendStreakCard({ username }: { username: string }) {
  const onShare = useCallback(async () => {
    trackEvent("share_tapped", { content_type: "friend_streak" });
    try {
      const result = await Share.share({
        message: `Join me on GRIIT! Let's start a friend streak and hold each other accountable. Download GRIIT and add me: @${username}`,
      });
      if (result.action === Share.sharedAction) {
        trackEvent("invite_sent", { content_type: "friend_streak" });
      }
    } catch (err) {
      captureError(err, { context: "Community FriendStreakCard share" });
    }
  }, [username]);

  return (
    <TouchableOpacity
      style={styles.friendTouch}
      onPress={onShare}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Start a friend streak"
    >
      <View style={styles.friendIconBox}>
        <Users size={16} color={DS_COLORS.DISCOVER_CORAL} />
      </View>
      <View style={styles.friendBody}>
        <Text style={styles.friendTitle}>Start a friend streak</Text>
        <Text style={styles.friendSubtitle}>
          Invite a friend. Both check in daily. Don&apos;t break the chain.
        </Text>
      </View>
      <ChevronRight size={14} color={DS_COLORS.TAB_INACTIVE} />
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { currentUser, refetchAll } = useApp();
  const [filter, setFilter] = useState<CommunityFilter>("global");

  const leaderboardQuery = useQuery({
    queryKey: ["community", "leaderboard", filter],
    queryFn: async () => {
      const result = (await trpcQuery(TRPC.leaderboard.getWeekly)) as {
        entries: Array<{
          userId: string;
          username: string;
          displayName: string;
          rank: number;
          securedDaysThisWeek: number;
        }>;
        currentUserRank: number | null;
        totalSecuredToday: number;
      };
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const feedQuery = useInfiniteQuery({
    queryKey: ["community", "feed", currentUser?.id, filter],
    queryFn: async ({ pageParam }: { pageParam?: string }) =>
      (await trpcQuery(TRPC.feed.list, {
        limit: 15,
        cursor: pageParam,
      })) as { items: FeedEventItem[]; nextCursor: string | null },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const leaderboardEntries = useMemo(
    () => (leaderboardQuery.data?.entries ?? []).map(mapLeaderboardEntry),
    [leaderboardQuery.data?.entries]
  );
  const currentUserName =
    currentUser?.name || currentUser?.id || "You";
  const currentUserEntry = leaderboardEntries.find((item) => item.userId === currentUser?.id);
  const feedItems = useMemo(
    () => (feedQuery.data?.pages ?? []).flatMap((page) => page.items).map(mapFeedItem),
    [feedQuery.data?.pages]
  );

  const activeChallengesQuery = useQuery({
    queryKey: ["community", "activeChallenges", currentUser?.id],
    queryFn: async () => {
      const result = (await trpcQuery(TRPC.challenges.listMyActive)) as unknown[];
      return Array.isArray(result) ? result.length : 0;
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isRefreshing =
    leaderboardQuery.isRefetching ||
    feedQuery.isRefetching ||
    activeChallengesQuery.isRefetching;

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([
      leaderboardQuery.refetch(),
      feedQuery.refetch(),
      activeChallengesQuery.refetch(),
    ]);
  }, [refetchAll, leaderboardQuery, feedQuery, activeChallengesQuery]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={DS_COLORS.ACCENT} />
        }
      >
        <CommunityHeader selectedFilter={filter} onSelectFilter={setFilter} />
        <View style={{ paddingHorizontal: DS_SPACING.xl, marginTop: DS_SPACING.sm }}>
          <StatBadge label="active challenges" value={activeChallengesQuery.data ?? 0} />
        </View>

        <SectionHeader title="Leaderboard" />
        {leaderboardQuery.isError ? (
          <ErrorState message="Couldn't load leaderboard" onRetry={() => void leaderboardQuery.refetch()} />
        ) : leaderboardQuery.isPending && !leaderboardQuery.data ? (
          <LoadingState containerStyle={{ paddingVertical: DS_SPACING.xxl }} />
        ) : (
          <Leaderboard
            entries={leaderboardEntries}
            currentUserName={currentUserName}
            currentUserRank={leaderboardQuery.data?.currentUserRank ?? null}
            currentUserPoints={currentUserEntry?.points ?? 0}
            onStartEarning={() => router.push("/(tabs)/discover")}
          />
        )}

        <SectionHeader title="Live activity" />
        {feedQuery.isError ? (
          <ErrorState message="Couldn't load activity" onRetry={() => void feedQuery.refetch()} />
        ) : currentUser?.id && feedQuery.isPending && !feedQuery.data ? (
          <LoadingState containerStyle={{ paddingVertical: DS_SPACING.xxl }} />
        ) : currentUser?.id && !feedQuery.isError && feedItems.length === 0 && !feedQuery.isPending ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            subtitle="Complete tasks to see your progress here"
            action={{
              label: "Go to challenges",
              onPress: () => router.push("/(tabs)" as never),
            }}
          />
        ) : (
          <LiveActivity items={feedItems} currentUserId={currentUser?.id ?? null} />
        )}

        <YourStats
          goalsSecuredToday={leaderboardQuery.data?.totalSecuredToday ?? 0}
          weeklyRank={leaderboardQuery.data?.currentUserRank ?? null}
          pointsThisWeek={currentUserEntry?.points ?? 0}
          activeChallenges={activeChallengesQuery.data ?? 0}
        />

        <Card padded={false} containerStyle={styles.friendCard}>
          <FriendStreakCard username={(currentUser?.name ?? "griit-user").replace(/\s+/g, ".").toLowerCase()} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  friendCard: {
    marginHorizontal: DS_SPACING.xl,
    marginTop: 18,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: DS_RADIUS.card,
  },
  friendTouch: {
    padding: DS_SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
  },
  friendIconBox: {
    width: 36,
    height: 36,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  friendBody: {
    flex: 1,
  },
  friendTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  friendSubtitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: 2,
    lineHeight: 15,
  },
});
