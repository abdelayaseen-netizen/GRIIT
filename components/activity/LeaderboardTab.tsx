import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_V3 } from "@/lib/design-system";
import { consistencyScore } from "@/lib/scoring";
import { ROUTES } from "@/lib/routes";
import type { BoardEntry, LeaderScope } from "@/components/activity/types";
import Avatar from "@/components/ds/Avatar";
import Chip from "@/components/ds/Chip";
import DisplayNumber from "@/components/ds/DisplayNumber";
import EmptyState from "@/components/ds/EmptyState";
import ListRow from "@/components/ds/ListRow";
import Skeleton from "@/components/ds/Skeleton";

function checkInLine(checkIns: number, days: number): string {
  const ins = checkIns === 1 ? "1 check in" : `${checkIns} check ins`;
  const d = days === 1 ? "1 day" : `${days} days`;
  return `${ins} · ${d}`;
}

function LeaderboardBody({
  scope,
  setScope,
  userId,
  friendsBoard,
  globalLeaderboard,
  challengeBoard,
  myActive,
  selectedChallengeId,
  setSelectedChallengeId,
  challengeScope,
  setChallengeScope,
  refreshing,
  onRefresh,
}: {
  scope: LeaderScope;
  setScope: (s: LeaderScope) => void;
  userId: string;
  friendsBoard: ReturnType<typeof useQuery<{ leaderPoints: number; entries: BoardEntry[] }>>;
  globalLeaderboard: ReturnType<
    typeof useQuery<{
      entries: {
        userId: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
        securedDaysThisWeek: number;
        currentStreak: number;
        rank: number;
      }[];
    }>
  >;
  challengeBoard: ReturnType<
    typeof useQuery<{ leaderPoints: number; challengeTitle: string; visibility: string; entries: BoardEntry[] }>
  >;
  myActive: ReturnType<typeof useQuery<{ challenge_id?: string; challenges?: { id?: string; title?: string } }[]>>;
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string) => void;
  challengeScope: "friends" | "everyone";
  setChallengeScope: (s: "friends" | "everyone") => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();
  const activeList = myActive.data ?? [];

  const friendEntries = friendsBoard.data?.entries ?? [];
  const challengeEntries = challengeBoard.data?.entries ?? [];
  const globalEntries: BoardEntry[] = useMemo(() => {
    const globalRaw = globalLeaderboard.data?.entries ?? [];
    const mapped = globalRaw.map((e) => {
      const points = consistencyScore(e.securedDaysThisWeek, e.currentStreak);
      return {
        userId: e.userId,
        username: e.username,
        displayName: e.displayName,
        avatarUrl: e.avatarUrl,
        rank: e.rank,
        points,
        checkInsThisWeek: e.securedDaysThisWeek,
        currentStreak: e.currentStreak,
        progressVsLeader: 0,
        gapToAbove: 0,
      };
    });
    const leaderPts = mapped[0]?.points ?? 1;
    return mapped.map((r, i, arr) => ({
      ...r,
      progressVsLeader: leaderPts > 0 ? Math.min(100, Math.round((r.points / leaderPts) * 100)) : 0,
      gapToAbove: i > 0 ? Math.max(0, (arr[i - 1]?.points ?? 0) - r.points) : 0,
    }));
  }, [globalLeaderboard.data?.entries]);

  const loading =
    (scope === "global" && (globalLeaderboard.isPending || (globalLeaderboard.isFetching && !globalLeaderboard.data))) ||
    (scope === "friends" && (friendsBoard.isPending || (friendsBoard.isFetching && !friendsBoard.data))) ||
    (scope === "challenge" &&
      (myActive.isPending ||
        (myActive.isFetching && !myActive.data) ||
        challengeBoard.isPending ||
        (challengeBoard.isFetching && !challengeBoard.data)));

  const err =
    (scope === "global" && globalLeaderboard.isError) ||
    (scope === "friends" && friendsBoard.isError) ||
    (scope === "challenge" && (myActive.isError || challengeBoard.isError));

  const goDiscover = () => router.push(ROUTES.TABS_DISCOVER as never);

  const empty = (
    <View style={styles.emptyPad}>
      <EmptyState
        heading="No ranking yet"
        body="Post a verified day to enter the board."
        actionLabel="Find a challenge"
        onAction={goDiscover}
      />
    </View>
  );

  let entries: BoardEntry[] = [];
  let showEmpty = false;
  if (!loading && !err) {
    if (scope === "global") {
      entries = globalEntries;
      showEmpty = globalEntries.length === 0;
    } else if (scope === "friends") {
      entries = friendEntries;
      showEmpty = friendEntries.length <= 1;
    } else if (activeList.length === 0 || !selectedChallengeId) {
      showEmpty = !loading;
    } else {
      entries = challengeEntries;
      showEmpty = challengeEntries.length === 0;
    }
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={DS_V3.color.brand}
        />
      }
    >
      <View style={styles.week}>
        <Text style={styles.heading}>This week</Text>
        <Text style={styles.caption}>
          Rankings reset every Monday. Post daily to climb.
        </Text>
      </View>
      <View style={styles.chips}>
        <Chip
          label="Global"
          selected={scope === "global"}
          onPress={() => setScope("global")}
        />
        <Chip
          label="Friends"
          selected={scope === "friends"}
          onPress={() => setScope("friends")}
        />
        <Chip
          label="Challenges"
          selected={scope === "challenge"}
          onPress={() => setScope("challenge")}
        />
      </View>

      {scope === "challenge" && activeList.length > 0 ? (
        <View style={styles.extraChips}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {activeList.map((item, i) => {
              const cid = item.challenge_id ?? item.challenges?.id ?? "";
              const title = item.challenges?.title ?? "Challenge";
              return (
                <Chip
                  key={cid || `ch-${i}`}
                  label={title}
                  selected={cid === selectedChallengeId}
                  onPress={() => cid && setSelectedChallengeId(cid)}
                />
              );
            })}
          </ScrollView>
          <View style={styles.chipRow}>
            <Chip
              label="Friends"
              selected={challengeScope === "friends"}
              onPress={() => setChallengeScope("friends")}
            />
            <Chip
              label="Everyone"
              selected={challengeScope === "everyone"}
              onPress={() => setChallengeScope("everyone")}
            />
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.skel}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </View>
      ) : null}

      {err ? (
        <View style={styles.emptyPad}>
          <EmptyState
            heading="Couldn't load leaderboard"
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onRetry={() => {
              void friendsBoard.refetch();
              void globalLeaderboard.refetch();
              void myActive.refetch();
              void challengeBoard.refetch();
            }}
          />
        </View>
      ) : null}

      {!loading && !err && showEmpty ? empty : null}

      {!loading && !err && !showEmpty ? (
        <BoardList entries={entries} viewerId={userId} />
      ) : null}
    </ScrollView>
  );
}

function useOpenLeaderboardProfile() {
  const router = useRouter();
  return useCallback(
    (viewerId: string, entry: BoardEntry) => {
      if (entry.userId === viewerId) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = entry.username?.trim();
      if (!u || u === "?") return;
      if (/^user_[0-9a-f]+$/i.test(u)) return;
      router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
    },
    [router],
  );
}

function BoardList({ entries, viewerId }: { entries: BoardEntry[]; viewerId: string }) {
  const viewer = entries.find((e) => e.userId === viewerId);
  const lastRank = entries[entries.length - 1]?.rank ?? 0;
  const outOfRange = viewer != null && viewer.rank > lastRank;
  const openProfile = useOpenLeaderboardProfile();

  const rows = outOfRange ? entries.filter((e) => e.userId !== viewerId) : entries;

  return (
    <View style={styles.board}>
      {rows.map((entry, i) => (
        <ListRow
          key={entry.userId}
          rank={entry.rank}
          icon={
            <Avatar
              size={DS_V3.size.avatar.sm}
              uri={entry.avatarUrl}
              displayName={entry.displayName}
            />
          }
          title={entry.displayName}
          subtitle={checkInLine(entry.checkInsThisWeek, entry.currentStreak)}
          highlight={entry.userId === viewerId}
          divider={i < rows.length - 1 || (outOfRange && Boolean(viewer))}
          trailing={
            <View style={styles.pts}>
              <DisplayNumber value={entry.points} size="inline" />
              <Text style={styles.ptsLabel}>pts</Text>
            </View>
          }
          onPress={() => openProfile(viewerId, entry)}
        />
      ))}
      {outOfRange && viewer ? (
        <ListRow
          rank={viewer.rank}
          icon={
            <Avatar
              size={DS_V3.size.avatar.sm}
              uri={viewer.avatarUrl}
              displayName={viewer.displayName}
            />
          }
          title={viewer.displayName}
          subtitle={checkInLine(viewer.checkInsThisWeek, viewer.currentStreak)}
          highlight
          divider={false}
          trailing={
            <View style={styles.pts}>
              <DisplayNumber value={viewer.points} size="inline" />
              <Text style={styles.ptsLabel}>pts</Text>
            </View>
          }
          onPress={() => openProfile(viewerId, viewer)}
        />
      ) : null}
    </View>
  );
}

export interface LeaderboardTabProps {
  userId: string;
}

export function LeaderboardTab({ userId }: LeaderboardTabProps) {
  const [scope, setScope] = useState<LeaderScope>("global");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeScope, setChallengeScope] = useState<"friends" | "everyone">("friends");

  const friendsBoard = useQuery({
    queryKey: ["activity", "leaderboard", "friends", userId],
    queryFn: () =>
      trpcQuery(TRPC.leaderboard.getFriendsBoard) as Promise<{
        leaderPoints: number;
        entries: BoardEntry[];
      }>,
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const globalLeaderboard = useQuery({
    queryKey: ["activity", "leaderboard", "global", userId],
    queryFn: () =>
      trpcQuery(TRPC.leaderboard.getWeekly, { limit: 20 }) as Promise<{
        entries: {
          userId: string;
          username: string;
          displayName: string;
          avatarUrl: string | null;
          securedDaysThisWeek: number;
          currentStreak: number;
          rank: number;
        }[];
      }>,
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const myActive = useQuery({
    queryKey: ["activity", "myActive", userId],
    queryFn: () =>
      trpcQuery(TRPC.challenges.listMyActive) as Promise<
        { challenge_id?: string; challenges?: { id?: string; title?: string } }[]
      >,
    enabled: !!userId && scope === "challenge",
    staleTime: 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    const list = myActive.data;
    if (!list?.length || selectedChallengeId) return;
    const row = list[0];
    if (!row) return;
    const cid = row.challenge_id ?? row.challenges?.id;
    if (cid) setSelectedChallengeId(cid);
  }, [myActive.data, selectedChallengeId]);

  const challengeBoard = useQuery({
    queryKey: ["activity", "leaderboard", "challenge", selectedChallengeId, challengeScope, userId],
    queryFn: () =>
      trpcQuery(TRPC.leaderboard.getChallengeBoard, {
        challengeId: selectedChallengeId!,
        scope: challengeScope,
      }) as Promise<{
        leaderPoints: number;
        challengeTitle: string;
        visibility: string;
        entries: BoardEntry[];
      }>,
    enabled: !!userId && scope === "challenge" && !!selectedChallengeId,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const onRefresh = useCallback(async () => {
    await Promise.all([
      friendsBoard.refetch(),
      globalLeaderboard.refetch(),
      challengeBoard.refetch(),
      myActive.refetch(),
    ]);
  }, [friendsBoard, globalLeaderboard, challengeBoard, myActive]);

  const refreshing =
    friendsBoard.isRefetching ||
    globalLeaderboard.isRefetching ||
    challengeBoard.isRefetching ||
    myActive.isRefetching;

  return (
    <LeaderboardBody
      scope={scope}
      setScope={(s) => {
        if (s === "challenge") setChallengeScope("friends");
        setScope(s);
      }}
      userId={userId}
      friendsBoard={friendsBoard}
      globalLeaderboard={globalLeaderboard}
      challengeBoard={challengeBoard}
      myActive={myActive}
      selectedChallengeId={selectedChallengeId}
      setSelectedChallengeId={setSelectedChallengeId}
      challengeScope={challengeScope}
      setChallengeScope={setChallengeScope}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: DS_V3.space.gutter * 6,
  },
  week: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.xs,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  chips: {
    flexDirection: "row",
    gap: DS_V3.space.xs,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  extraChips: {
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.sm,
  },
  chipRow: {
    flexDirection: "row",
    gap: DS_V3.space.xs,
    paddingHorizontal: DS_V3.space.gutter,
  },
  skel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  emptyPad: {
    paddingTop: DS_V3.space.section,
    paddingHorizontal: DS_V3.space.gutter,
  },
  board: {
    paddingTop: DS_V3.space.md,
  },
  pts: {
    alignItems: "flex-end",
  },
  ptsLabel: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
