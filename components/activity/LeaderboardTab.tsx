import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Target, Trophy, UserPlus, Users } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, DS_SHADOWS } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/avatar";
import { consistencyScore } from "@/lib/scoring";
import { inviteToChallenge, shareInvite } from "@/lib/share";
import { SkeletonLeaderboardRow } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import { ROUTES } from "@/lib/routes";
import { styles } from "@/components/activity/activity-styles";
import type { BoardEntry, LeaderScope } from "@/components/activity/types";

function rankNumColor(rank: number): string {
  if (rank === 2) return DS_COLORS.TEXT_SECONDARY;
  if (rank === 3) return DS_COLORS.CELEB_BONUS_AMBER;
  if (rank >= 4) return DS_COLORS.TEXT_MUTED;
  return DS_COLORS.TEXT_PRIMARY;
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
  listHeader,
  refreshing,
  onRefresh,
}: {
  scope: LeaderScope;
  setScope: (s: LeaderScope) => void;
  userId: string;
  friendsBoard: ReturnType<typeof useQuery<{ leaderPoints: number; entries: BoardEntry[] }>>;
  globalLeaderboard: ReturnType<
    typeof useQuery<{
      entries: Array<{
        userId: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
        securedDaysThisWeek: number;
        currentStreak: number;
        rank: number;
      }>;
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
  listHeader: React.ReactNode;
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
  const globalLeaderPoints = globalEntries[0]?.points ?? 1;
  const handleInviteFriend = async () => {
    await shareInvite();
  };

  const handleInviteToThisChallenge = async () => {
    if (!selectedChallengeId) return;
    await inviteToChallenge(
      { name: challengeBoard.data?.challengeTitle ?? "Challenge", id: selectedChallengeId },
      userId
    );
  };

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

  const leaderboardInner = (
    <View>
      <View style={styles.scopeSwitcher}>
        {(["global", "friends", "challenge"] as const).map((s) => {
          const scopeName = s === "global" ? "Global" : s === "friends" ? "Friends" : "Challenges";
          return (
            <TouchableOpacity accessibilityRole="button"
              key={s}
              style={[styles.scopeTab, scope === s && styles.scopeTabOn]}
              onPress={() => setScope(s)}
              accessibilityLabel={`${scopeName} leaderboard — ${scope === s ? "selected" : "not selected"}`}
              accessibilityState={{ selected: scope === s }}
            >
              <Text style={[styles.scopeTabText, scope === s && styles.scopeTabTextOn]}>
                {s === "global" ? "Global" : s === "friends" ? "Friends" : "Challenges"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.lbSkeletonPad}>
          <SkeletonLeaderboardRow />
          <SkeletonLeaderboardRow />
          <SkeletonLeaderboardRow />
          <SkeletonLeaderboardRow />
          <SkeletonLeaderboardRow />
        </View>
      ) : null}
      {err ? (
        <ErrorState
          message="Couldn't load leaderboard"
          onRetry={() => {
            void friendsBoard.refetch();
            void globalLeaderboard.refetch();
            void myActive.refetch();
            void challengeBoard.refetch();
          }}
        />
      ) : null}

      {!loading && !err && scope === "global" ? (
        globalEntries.length === 0 ? (
          <View style={styles.emptyStateFill}>
            <View style={styles.emptyIconCircle}>
              <Trophy size={40} color={DS_COLORS.TEXT_MUTED} style={styles.iconMuted} />
            </View>
            <Text style={styles.emptyTitleStrong}>Earn your spot</Text>
            <Text style={styles.emptyBodyNarrow}>
              Complete a daily check-in to appear on the global leaderboard.
            </Text>
            <Text style={styles.emptyFootnote}>Rankings reset every Monday.</Text>
            <TouchableOpacity accessibilityRole="button"
              onPress={() => router.push(ROUTES.TABS_HOME as never)}
              accessibilityLabel="Go to my challenges"
            >
              <Text style={styles.emptyTextCta}>Go to my challenges →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.scoreNoteWarm}>
              <Text style={styles.scoreNoteIcon}>🔥</Text>
              <Text style={styles.scoreNoteText}>
                <Text style={styles.scoreNoteBold}>Global rankings reset every Monday.</Text>
                {" Complete daily check-ins to climb the board."}
              </Text>
            </View>
            <BoardList
              entries={globalEntries}
              leaderPoints={globalLeaderPoints}
              viewerId={userId}
            />
          </>
        )
      ) : null}

      {!loading && !err && scope === "friends" ? (
        friendEntries.length <= 1 ? (
          <View style={styles.emptyStateFill}>
            <View style={styles.emptyIconCircle}>
              <Users size={40} color={DS_COLORS.TEXT_MUTED} style={styles.iconMuted} />
            </View>
            <Text style={styles.emptyTitleStrong}>No friends on GRIIT yet</Text>
            <Text style={styles.emptyBodyNarrow}>
              Invite friends to compete together on the leaderboard.
            </Text>
            <TouchableOpacity accessibilityRole="button"
              style={styles.emptyInvitePill}
              onPress={() => void handleInviteFriend()}
              accessibilityLabel="Invite a friend"
            >
              <Text style={styles.emptyInvitePillText}>Invite a friend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.scoreNoteWarm}>
              <Text style={styles.scoreNoteIcon}>🔥</Text>
              <Text style={styles.scoreNoteText}>
                <Text style={styles.scoreNoteBold}>See how you stack up against friends.</Text>
                {" Rankings reset every Monday."}
              </Text>
            </View>
            <BoardList
              entries={friendEntries}
              leaderPoints={friendsBoard.data?.leaderPoints ?? 1}
              viewerId={userId}
            />
          </>
        )
      ) : null}

      {!loading && !err && scope === "challenge" ? (
        <>
          {activeList.length === 0 ? (
            <View style={styles.emptyStateFill}>
              <View style={styles.emptyIconCircle}>
                <Target size={40} color={DS_COLORS.TEXT_MUTED} style={styles.iconMuted} />
              </View>
              <Text style={styles.emptyTitleStrong}>No active challenges</Text>
              <Text style={styles.emptyBodyNarrow}>
                Join a challenge to start competing on the leaderboard.
              </Text>
              <TouchableOpacity accessibilityRole="button"
                onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
                accessibilityLabel="Browse challenges"
              >
                <Text style={styles.emptyTextCta}>Browse challenges →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              horizontal
              data={activeList}
              keyExtractor={(item, i) => item.challenge_id ?? item.challenges?.id ?? `ch-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengePillsRow}
              renderItem={({ item }) => {
                const cid = item.challenge_id ?? item.challenges?.id ?? "";
                const title = item.challenges?.title ?? "Challenge";
                const sel = cid === selectedChallengeId;
                return (
                  <TouchableOpacity accessibilityRole="button"
                    style={[styles.challengePillNew, sel ? styles.challengePillNewOn : styles.challengePillNewOff]}
                    onPress={() => cid && setSelectedChallengeId(cid)}
                    accessibilityLabel={`View leaderboard for ${title}`}
                    accessibilityState={{ selected: sel }}
                  >
                    <Text
                      style={[styles.challengePillNewText, sel ? styles.challengePillNewTextOn : styles.challengePillNewTextOff]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {activeList.length > 0 && selectedChallengeId ? (
            <View style={styles.challengeScopeToggle}>
              <TouchableOpacity accessibilityRole="button"
                onPress={() => setChallengeScope("friends")}
                accessibilityLabel="Show friends only"
                style={[
                  styles.challengeScopeTab,
                  {
                    borderBottomColor:
                      challengeScope === "friends" ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.BORDER,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.challengeScopeTabText,
                    { color: challengeScope === "friends" ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.TEXT_MUTED },
                  ]}
                >
                  Friends
                </Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button"
                onPress={() => setChallengeScope("everyone")}
                accessibilityLabel="Show everyone"
                style={[
                  styles.challengeScopeTab,
                  {
                    borderBottomColor:
                      challengeScope === "everyone" ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.BORDER,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.challengeScopeTabText,
                    { color: challengeScope === "everyone" ? DS_COLORS.DISCOVER_CORAL : DS_COLORS.TEXT_MUTED },
                  ]}
                >
                  Everyone
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {activeList.length > 0 && selectedChallengeId ? (
            <View
              style={[
                styles.privacyPill,
                {
                  backgroundColor:
                    (challengeBoard.data?.visibility ?? "public").toLowerCase() === "friends"
                      ? DS_COLORS.DISCOVER_DIFF_TINT_MED
                      : (challengeBoard.data?.visibility ?? "public").toLowerCase() === "private"
                        ? DS_COLORS.DISCOVER_DIVIDER
                        : DS_COLORS.GREEN_BG,
                },
              ]}
            >
              <Text
                style={[
                  styles.privacyPillText,
                  {
                    color:
                      (challengeBoard.data?.visibility ?? "public").toLowerCase() === "friends"
                        ? DS_COLORS.DISCOVER_BLUE
                        : (challengeBoard.data?.visibility ?? "public").toLowerCase() === "private"
                          ? DS_COLORS.TEXT_SECONDARY
                          : DS_COLORS.GREEN,
                  },
                ]}
              >
                {(challengeBoard.data?.visibility ?? "public").toLowerCase() === "friends"
                  ? "👥 Friends only"
                  : (challengeBoard.data?.visibility ?? "public").toLowerCase() === "private"
                    ? "🔒 Private — only you can see this"
                    : `🌐 Public · ${challengeEntries.length} people in this challenge`}
              </Text>
            </View>
          ) : null}
          {activeList.length > 0 && selectedChallengeId ? (
            <>
              <View style={styles.scoreNoteWarm}>
                <Text style={styles.scoreNoteIcon}>🔥</Text>
                <Text style={styles.scoreNoteText}>
                  <Text style={styles.scoreNoteBold}>Ranked by consistency</Text>
                  {" — check-ins × streak. Resets Monday."}
                </Text>
              </View>
              <BoardList
                entries={challengeEntries}
                leaderPoints={challengeBoard.data?.leaderPoints ?? 1}
                viewerId={userId}
              />
              {challengeEntries.length === 1 ? (
                <View style={styles.soloChallengeHint}>
                  <UserPlus size={20} color={DS_COLORS.TEXT_MUTED} />
                  <Text style={styles.soloChallengeHintText}>Challenge your friends to climb the ranks</Text>
                  <TouchableOpacity accessibilityRole="button"
                    onPress={() => void handleInviteToThisChallenge()}
                    accessibilityLabel="Invite friends to this challenge"
                  >
                    <Text style={styles.emptyTextCta}>Invite friends to this challenge →</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={[]}
      keyExtractor={(_, i) => `lb-pad-${i}`}
      renderItem={() => null}
      ListHeaderComponent={
        <>
          {listHeader}
          {leaderboardInner}
        </>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.DISCOVER_CORAL} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.leaderboardFlatFlex}
      keyboardShouldPersistTaps="handled"
    />
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
    [router]
  );
}

function BoardList({ entries, leaderPoints, viewerId }: { entries: BoardEntry[]; leaderPoints: number; viewerId: string }) {
  const viewer = entries.find((e) => e.userId === viewerId);
  if (entries.length === 0) {
    return (
      <View style={styles.emptyLb}>
        <Text style={styles.emptyTitle}>No entries yet</Text>
        <Text style={styles.emptySub}>Check in this week to climb the board.</Text>
      </View>
    );
  }

  const first = entries[0]!;
  const rest = entries.slice(1).filter((e) => e.userId !== viewerId);

  const footer =
    viewer && !(viewer.rank === 1 && first.userId === viewerId) ? (
      <>
        <View style={styles.yourRankDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.yourRankLabel}>Your rank</Text>
          <View style={styles.dividerLine} />
        </View>
        <YourRankCard entry={viewer} viewerId={viewerId} />
      </>
    ) : null;

  return (
    <View style={styles.boardListSection}>
      <CrownCard entry={first} viewerId={viewerId} />
      <FlatList
        data={rest}
        keyExtractor={(e) => e.userId}
        renderItem={({ item }) => (
          <RegularRow entry={item} leaderPoints={leaderPoints} viewerId={viewerId} />
        )}
        scrollEnabled={false}
        nestedScrollEnabled
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        ListFooterComponent={footer}
        removeClippedSubviews={Platform.OS === "android"}
      />
    </View>
  );
}

function CrownCard({ entry, viewerId }: { entry: BoardEntry; viewerId: string }) {
  const openProfile = useOpenLeaderboardProfile();
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  const isSelf = entry.userId === viewerId;
  return (
    <Pressable accessibilityRole="button"
      style={styles.crownCard}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityLabel={`View profile for ${entry.displayName}`}
    >
      {isSelf ? <View style={styles.rowSelfAccent} /> : null}
      <View style={styles.crownEyebrow}>
        <View style={styles.crownDot} />
        <Text style={styles.crownEyebrowText}>MOST CONSISTENT THIS WEEK</Text>
      </View>
      <View style={styles.crownMainRow}>
        <Text style={styles.crownRank}>#1</Text>
        <View style={[styles.crownAvatar, { backgroundColor: colors.bg }]}>
          <Text style={[styles.crownAvatarLetter, { color: colors.letter }]}>{initial}</Text>
        </View>
        <View style={styles.flex1}>
          <View style={styles.nameRow}>
            <Text style={styles.crownName}>{entry.displayName}</Text>
            {isSelf ? (
              <View style={styles.youBadgeDark}>
                <Text style={styles.youBadgeDarkText}>You</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.crownSubWrap}>
            <Text style={styles.crownSub}>
              {entry.checkInsThisWeek} check-ins · 🔥 {entry.currentStreak}
            </Text>
          </View>
        </View>
        <View style={styles.alignEnd}>
          <Text style={styles.crownPts}>{entry.points}</Text>
          <View style={styles.crownPtsLabelWrap}>
            <Text style={styles.crownPtsLabel}>pts</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const RegularRow = React.memo(function RegularRow({
  entry,
  leaderPoints,
  viewerId,
}: {
  entry: BoardEntry;
  leaderPoints: number;
  viewerId: string;
}) {
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  const pct = leaderPoints > 0 ? Math.min(100, (entry.points / leaderPoints) * 100) : 0;
  const openProfile = useOpenLeaderboardProfile();
  const isSelf = entry.userId === viewerId;
  return (
    <Pressable accessibilityRole="button"
      style={[styles.regRow, DS_SHADOWS.cardSubtle]}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityLabel={`View profile for ${entry.displayName}`}
    >
      {isSelf ? <View style={styles.rowSelfAccent} /> : null}
      <Text style={[styles.regRank, { color: rankNumColor(entry.rank) }]}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={styles.flex1}>
        <View style={styles.nameRow}>
          <Text style={styles.regName}>{entry.displayName}</Text>
          {isSelf ? (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          ) : null}
          <View style={styles.regStreakPill}>
            <Text style={styles.regStreakText}>🔥 {entry.currentStreak}</Text>
          </View>
        </View>
        <Text style={styles.regSubMuted}>
          {entry.checkInsThisWeek} check-ins · 🔥 {entry.currentStreak}
        </Text>
        <View style={styles.regTrack}>
          <View style={[styles.regFill, { width: `${pct}%` }]} />
        </View>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.regPts}>{entry.points}</Text>
        <Text style={styles.regPtsLabel}>pts</Text>
      </View>
    </Pressable>
  );
});

function YourRankCard({ entry, viewerId }: { entry: BoardEntry; viewerId: string }) {
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  const gap = entry.gapToAbove;
  const openProfile = useOpenLeaderboardProfile();
  const isSelf = entry.userId === viewerId;
  return (
    <Pressable accessibilityRole="button"
      style={styles.yourCard}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityLabel="View your profile"
    >
      {isSelf ? <View style={styles.rowSelfAccent} /> : null}
      <Text style={styles.yourRankNum}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={styles.flex1}>
        <View style={styles.nameRow}>
          <Text style={styles.yourName}>{entry.displayName}</Text>
          {isSelf ? (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.yourSubMuted}>
          {entry.checkInsThisWeek} check-ins · 🔥 {entry.currentStreak}
        </Text>
        <Text style={styles.yourSub}>
          {gap > 0 ? `${gap} pts behind #${entry.rank - 1}` : "You're at the top"}
        </Text>
      </View>
      <Text style={styles.yourPts}>{entry.points}</Text>
    </Pressable>
  );
}

export interface LeaderboardTabProps {
  userId: string;
  listHeader: React.ReactNode;
}

export function LeaderboardTab({ userId, listHeader }: LeaderboardTabProps) {
  const [scope, setScope] = useState<LeaderScope>("global");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeScope, setChallengeScope] = useState<"friends" | "everyone">("friends");

  const friendsBoard = useQuery({
    queryKey: ["activity", "leaderboard", "friends", userId],
    queryFn: () => trpcQuery(TRPC.leaderboard.getFriendsBoard) as Promise<{ leaderPoints: number; entries: BoardEntry[] }>,
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const globalLeaderboard = useQuery({
    queryKey: ["activity", "leaderboard", "global", userId],
    queryFn: () =>
      trpcQuery(TRPC.leaderboard.getWeekly, { limit: 20 }) as Promise<{
        entries: Array<{
          userId: string;
          username: string;
          displayName: string;
          avatarUrl: string | null;
          securedDaysThisWeek: number;
          currentStreak: number;
          rank: number;
        }>;
      }>,
    enabled: !!userId,
    staleTime: 60 * 1000,
    retry: 2,
  });

  const myActive = useQuery({
    queryKey: ["activity", "myActive", userId],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<{ challenge_id?: string; challenges?: { id?: string; title?: string } }[]>,
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
      listHeader={listHeader}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
