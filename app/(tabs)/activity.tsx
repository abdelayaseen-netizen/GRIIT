import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, Target, Users } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { DS_COLORS, DS_SHADOWS } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/avatar";
import { consistencyScore } from "@/lib/scoring";
import { relativeTime } from "@/lib/utils/relativeTime";
import { shareInvite } from "@/lib/share";
import LoadingState from "@/components/shared/LoadingState";
import { SkeletonLeaderboardRow } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";

type MainTab = "notifications" | "leaderboard";
type LeaderScope = "global" | "friends" | "challenge";

type NotifRow = {
  id: string;
  type: "respect" | "comment" | "follow" | "rank";
  read: boolean;
  createdAt: string;
  actorId: string | null;
  actorUsername: string | null;
  actorDisplayName: string | null;
  actorAvatarUrl: string | null;
  metadata: Record<string, unknown>;
};

type BoardEntry = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  rank: number;
  points: number;
  checkInsThisWeek: number;
  currentStreak: number;
  progressVsLeader: number;
  gapToAbove: number;
};

function getNotifText(n: NotifRow): { bold: string; rest: string } {
  const name = n.actorDisplayName ?? n.actorUsername ?? "Someone";
  const challengeName = String(n.metadata.challenge_title ?? n.metadata.challenge_name ?? "challenge");
  switch (n.type) {
    case "respect":
      return { bold: name, rest: ` respected your ${challengeName} check-in` };
    case "comment":
      return { bold: name, rest: ` commented — "${String(n.metadata.comment_text ?? "").slice(0, 80)}"` };
    case "follow":
      return { bold: name, rest: " started following you" };
    case "rank":
      return {
        bold: "",
        rest: `You're #${n.metadata.rank} on ${challengeName} — ${n.metadata.rankGap} pts behind #${Number(n.metadata.rank) - 1}`,
      };
    default:
      return { bold: "", rest: "Notification" };
  }
}

function rankNumColor(rank: number): string {
  if (rank === 2) return DS_COLORS.TEXT_SECONDARY;
  if (rank === 3) return DS_COLORS.CELEB_BONUS_AMBER;
  if (rank >= 4) return DS_COLORS.TEXT_MUTED;
  return DS_COLORS.TEXT_PRIMARY;
}

export default function ActivityScreen() {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<MainTab>("notifications");
  const [scope, setScope] = useState<LeaderScope>("global");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const notifQuery = useQuery({
    queryKey: ["activity", "notifications", user?.id],
    queryFn: () => trpcQuery(TRPC.notifications.getAll) as Promise<{ unread: NotifRow[]; earlier: NotifRow[] }>,
    enabled: !isGuest && !!user?.id && mainTab === "notifications",
    staleTime: 30 * 1000,
  });

  const friendsBoard = useQuery({
    queryKey: ["activity", "leaderboard", "friends", user?.id],
    queryFn: () => trpcQuery(TRPC.leaderboard.getFriendsBoard) as Promise<{ leaderPoints: number; entries: BoardEntry[] }>,
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "friends",
    staleTime: 60 * 1000,
  });

  const globalLeaderboard = useQuery({
    queryKey: ["activity", "leaderboard", "global", user?.id],
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
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "global",
    staleTime: 60 * 1000,
  });

  const myActive = useQuery({
    queryKey: ["activity", "myActive", user?.id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<{ challenge_id?: string; challenges?: { id?: string; title?: string } }[]>,
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "challenge",
    staleTime: 60 * 1000,
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
    queryKey: ["activity", "leaderboard", "challenge", selectedChallengeId, user?.id],
    queryFn: () =>
      trpcQuery(TRPC.leaderboard.getChallengeBoard, { challengeId: selectedChallengeId! }) as Promise<{
        leaderPoints: number;
        challengeTitle: string;
        visibility: string;
        entries: BoardEntry[];
      }>,
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "challenge" && !!selectedChallengeId,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (mainTab !== "notifications" || !user?.id) return;
    let cancelled = false;
    void (async () => {
      try {
        await trpcMutate(TRPC.notifications.markAllRead);
        if (!cancelled) void queryClient.invalidateQueries({ queryKey: ["activity", "notifications", user.id] });
      } catch (e) {
        captureError(e, "ActivityMarkAllRead");
        console.error("[Activity] markAllRead", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab, user?.id, queryClient]);

  useEffect(() => {
    const friendEntries = friendsBoard.data?.entries ?? [];
    if (scope === "friends" && friendEntries.length <= 1) {
      setScope("global");
    }
  }, [friendsBoard.data?.entries, scope]);

  const onRefresh = useCallback(async () => {
    await Promise.all([
      notifQuery.refetch(),
      friendsBoard.refetch(),
      globalLeaderboard.refetch(),
      challengeBoard.refetch(),
      myActive.refetch(),
    ]);
  }, [notifQuery, friendsBoard, globalLeaderboard, challengeBoard, myActive]);

  const refreshing =
    notifQuery.isRefetching ||
    friendsBoard.isRefetching ||
    globalLeaderboard.isRefetching ||
    challengeBoard.isRefetching;

  if (isGuest || !user?.id) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Text style={styles.screenTitle}>Activity</Text>
        <View style={styles.guestWrap}>
          <Text style={styles.guestText}>Sign in to see notifications and leaderboards.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.DISCOVER_CORAL} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.screenTitle} accessibilityRole="header">
          Activity
        </Text>

        <View style={styles.mainSwitcher}>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "notifications" && styles.mainTabOn]}
            onPress={() => setMainTab("notifications")}
            accessibilityRole="tab"
            accessibilityLabel="Notifications tab"
            accessibilityState={{ selected: mainTab === "notifications" }}
          >
            <Text style={[styles.mainTabText, mainTab === "notifications" && styles.mainTabTextOn]}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTab, mainTab === "leaderboard" && styles.mainTabOn]}
            onPress={() => setMainTab("leaderboard")}
            accessibilityRole="tab"
            accessibilityLabel="Leaderboard tab"
            accessibilityState={{ selected: mainTab === "leaderboard" }}
          >
            <Text style={[styles.mainTabText, mainTab === "leaderboard" && styles.mainTabTextOn]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {mainTab === "notifications" ? (
          <NotificationsBody query={notifQuery} userId={user.id} />
        ) : (
          <LeaderboardBody
            scope={scope}
            setScope={setScope}
            userId={user.id}
            friendsBoard={friendsBoard}
            globalLeaderboard={globalLeaderboard}
            challengeBoard={challengeBoard}
            myActive={myActive}
            selectedChallengeId={selectedChallengeId}
            setSelectedChallengeId={setSelectedChallengeId}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationsBody({
  query,
  userId,
}: {
  query: ReturnType<typeof useQuery<{ unread: NotifRow[]; earlier: NotifRow[] }>>;
  userId: string;
}) {
  const qc = useQueryClient();
  const router = useRouter();

  const onFollow = useCallback(
    async (actorId: string) => {
      try {
        await trpcMutate(TRPC.profiles.followUser, { userId: actorId });
        void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
      } catch (e) {
        captureError(e, "ActivityFollowUser");
        console.error("[Activity] follow", e);
      }
    },
    [qc, userId]
  );

  if (query.isPending) return <LoadingState message="Loading notifications..." />;
  if (query.isError) return <ErrorState message="Couldn't load notifications" onRetry={() => void query.refetch()} />;

  const unread = query.data?.unread ?? [];
  const earlier = query.data?.earlier ?? [];

  return (
    <View>
      {unread.length > 0 ? (
        <>
          <Text style={styles.groupLabel}>NEW</Text>
          {unread.map((n) => (
            <NotificationRow key={n.id} n={n} onFollow={onFollow} unread />
          ))}
        </>
      ) : null}
      {earlier.length > 0 ? (
        <>
          <Text style={styles.groupLabel}>EARLIER</Text>
          {earlier.map((n) => (
            <NotificationRow key={n.id} n={n} onFollow={onFollow} unread={false} />
          ))}
        </>
      ) : null}
      {unread.length === 0 && earlier.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={40} color={DS_COLORS.TEXT_TERTIARY} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyBody}>
            Complete a challenge to start getting Respect from others
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/(tabs)/home" as never)}
            accessibilityLabel="Go to my challenges"
            accessibilityRole="button"
          >
            <Text style={styles.emptyButtonText}>Go to my challenges</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function NotificationRow({
  n,
  onFollow,
  unread,
}: {
  n: NotifRow;
  onFollow: (id: string) => void;
  unread: boolean;
}) {
  const text = getNotifText(n);
  const colors = n.actorId ? getAvatarColor(n.actorId) : getAvatarColor(n.id);
  const initial = (n.actorDisplayName ?? n.actorUsername ?? "?").charAt(0).toUpperCase();

  return (
    <View style={[styles.notifRow, DS_SHADOWS.cardSubtle, unread ? styles.notifUnread : styles.notifRead]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.notifAvatar, { backgroundColor: colors.bg }]}>
          <Text style={[styles.notifAvatarLetter, { color: colors.letter }]}>{n.type === "rank" ? "★" : initial}</Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: n.type === "respect" ? DS_COLORS.DISCOVER_CORAL : n.type === "comment" ? DS_COLORS.CELEB_BONUS_PURPLE : DS_COLORS.DISCOVER_GREEN },
          ]}
        >
          <Text style={[styles.typeBadgeText, n.type === "follow" && styles.typeBadgeFollow]}>
            {n.type === "respect" ? "🔥" : n.type === "comment" ? "💬" : n.type === "follow" ? "+" : "★"}
          </Text>
        </View>
      </View>
      <View style={styles.notifBody}>
        <Text style={styles.notifMain}>
          {text.bold ? <Text style={styles.notifBold}>{text.bold}</Text> : null}
          {text.rest}
        </Text>
        <Text style={styles.notifTime}>{relativeTime(n.createdAt)}</Text>
      </View>
      {n.type === "follow" && n.actorId ? (
        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => onFollow(n.actorId!)}
          accessibilityRole="button"
          accessibilityLabel="Follow back"
        >
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      ) : n.type === "respect" || n.type === "comment" ? (
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.thumbEmoji}>📸</Text>
        </View>
      ) : null}
    </View>
  );
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
}) {
  const activeList = myActive.data ?? [];
  const friendEntries = friendsBoard.data?.entries ?? [];
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
    (scope === "challenge" && challengeBoard.isError);

  return (
    <View>
      <View style={styles.scopeSwitcher}>
        {(["global", "friends", "challenge"] as const).map((s) => {
          const scopeName = s === "global" ? "Global" : s === "friends" ? "Friends" : "This Challenge";
          return (
          <TouchableOpacity
            key={s}
            style={[styles.scopeTab, scope === s && styles.scopeTabOn]}
            onPress={() => setScope(s)}
            accessibilityRole="button"
            accessibilityLabel={`${scopeName} leaderboard — ${scope === s ? "selected" : "not selected"}`}
            accessibilityState={{ selected: scope === s }}
          >
            <Text style={[styles.scopeTabText, scope === s && styles.scopeTabTextOn]}>
              {s === "global" ? "Global" : s === "friends" ? "Friends" : "This Challenge"}
            </Text>
          </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
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
            void challengeBoard.refetch();
          }}
        />
      ) : null}

      {!loading && !err && scope === "global" ? (
        globalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Global leaderboard</Text>
            <Text style={styles.emptyBody}>Complete your first check-in to appear here</Text>
          </View>
        ) : (
          <>
            <View style={styles.scoreNote}>
              <Text style={styles.scoreNoteIcon}>⚡</Text>
              <Text style={styles.scoreNoteText}>
                <Text style={styles.scoreNoteBold}>Overall consistency</Text>
                {" — top performers this week by check-ins and streak across GRIIT."}
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
          <View style={styles.emptyState}>
            <Users size={40} color={DS_COLORS.TEXT_TERTIARY} />
            <Text style={styles.emptyTitle}>No friends on GRIIT yet</Text>
            <Text style={styles.emptyBody}>
              Invite friends to compete together on the leaderboard
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => void handleInviteFriend()}
              accessibilityLabel="Invite a friend to GRIIT"
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>Invite a friend</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.scoreNote}>
              <Text style={styles.scoreNoteIcon}>⚡</Text>
              <Text style={styles.scoreNoteText}>
                <Text style={styles.scoreNoteBold}>Overall consistency</Text>
                {" — total check-ins × streak across all active challenges this week."}
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
            <View style={styles.emptyLb}>
              <Target size={32} color={DS_COLORS.TEXT_MUTED} />
              <Text style={styles.emptySub}>Join a challenge to see this leaderboard.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengePills}>
              {activeList.map((item, i) => {
                const cid = item.challenge_id ?? item.challenges?.id ?? "";
                const title = item.challenges?.title ?? "Challenge";
                const sel = cid === selectedChallengeId;
                return (
                  <TouchableOpacity
                    key={cid || String(i)}
                    style={[styles.challengePill, sel ? styles.challengePillOn : styles.challengePillOff]}
                    onPress={() => cid && setSelectedChallengeId(cid)}
                    accessibilityRole="button"
                    accessibilityLabel={`View leaderboard for ${title} — ${sel ? "selected" : "not selected"}`}
                    accessibilityState={{ selected: sel }}
                  >
                    <Text style={[styles.challengePillText, sel && styles.challengePillTextOn]} numberOfLines={1}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {selectedChallengeId ? (
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
                    : `🌐 Public · ${challengeBoard.data?.entries.length ?? 0} people in this challenge`}
              </Text>
            </View>
          ) : null}
          <View style={styles.scoreNote}>
            <Text style={styles.scoreNoteIcon}>🔥</Text>
            <Text style={styles.scoreNoteText}>
              <Text style={styles.scoreNoteBold}>Ranked by consistency</Text>
              {" — daily check-ins × streak multiplier. Everyone started this challenge so the playing field is level."}
            </Text>
          </View>
          <BoardList entries={challengeBoard.data?.entries ?? []} leaderPoints={challengeBoard.data?.leaderPoints ?? 1} viewerId={userId} />
        </>
      ) : null}
    </View>
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

  return (
    <View style={{ marginBottom: 24 }}>
      <CrownCard entry={first} />
      {rest.map((e) => (
        <RegularRow key={e.userId} entry={e} leaderPoints={leaderPoints} />
      ))}
      {viewer && !(viewer.rank === 1 && first.userId === viewerId) ? (
        <>
          <View style={styles.yourRankDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.yourRankLabel}>Your rank</Text>
            <View style={styles.dividerLine} />
          </View>
          <YourRankCard entry={viewer} />
        </>
      ) : null}
    </View>
  );
}

function CrownCard({ entry }: { entry: BoardEntry }) {
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  return (
    <View style={styles.crownCard}>
      <View style={styles.crownEyebrow}>
        <View style={styles.crownDot} />
        <Text style={styles.crownEyebrowText}>MOST CONSISTENT THIS WEEK</Text>
      </View>
      <View style={styles.crownMainRow}>
        <Text style={styles.crownRank}>#1</Text>
        <View style={[styles.crownAvatar, { backgroundColor: colors.bg }]}>
          <Text style={[styles.crownAvatarLetter, { color: colors.letter }]}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.crownName}>{entry.displayName}</Text>
            <View style={styles.crownStreakPill}>
              <Text style={styles.crownStreakText}>🔥 {entry.currentStreak}</Text>
            </View>
          </View>
          <Text style={styles.crownSub}>{entry.checkInsThisWeek} check-ins this week</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.crownPts}>{entry.points}</Text>
          <Text style={styles.crownPtsLabel}>pts</Text>
        </View>
      </View>
      <View
        style={styles.crownActions}
        accessibilityRole="none"
        accessibilityLabel={`Respect and comment actions for ${entry.displayName || entry.username} — not interactive`}
      >
        <View style={styles.crownPrimary}>
          <Text style={styles.crownPrimaryText}>🔥 Respect</Text>
        </View>
        <View style={styles.crownSecondary}>
          <Text style={styles.crownSecondaryText}>💬 Comment</Text>
        </View>
      </View>
    </View>
  );
}

function RegularRow({ entry, leaderPoints }: { entry: BoardEntry; leaderPoints: number }) {
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  const pct = leaderPoints > 0 ? Math.min(100, (entry.points / leaderPoints) * 100) : 0;
  return (
    <View style={[styles.regRow, DS_SHADOWS.cardSubtle]}>
      <Text style={[styles.regRank, { color: rankNumColor(entry.rank) }]}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.regName}>{entry.displayName}</Text>
          <View style={styles.regStreakPill}>
            <Text style={styles.regStreakText}>🔥 {entry.currentStreak}</Text>
          </View>
        </View>
        <Text style={styles.regSub}>{entry.checkInsThisWeek} check-ins · score {entry.points}</Text>
        <View style={styles.regTrack}>
          <View style={[styles.regFill, { width: `${pct}%` }]} />
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.regPts}>{entry.points}</Text>
        <Text style={styles.regPtsLabel}>pts</Text>
      </View>
    </View>
  );
}

function YourRankCard({ entry }: { entry: BoardEntry }) {
  const colors = getAvatarColor(entry.userId);
  const initial = (entry.displayName || entry.username).charAt(0).toUpperCase();
  const gap = entry.gapToAbove;
  return (
    <View style={styles.yourCard}>
      <Text style={styles.yourRankNum}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.yourName}>{entry.displayName}</Text>
        <Text style={styles.yourSub}>
          {gap > 0 ? `${gap} pts behind #${entry.rank - 1}` : "You're at the top"}
        </Text>
      </View>
      <Text style={styles.yourPts}>{entry.points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  scrollContent: { paddingBottom: 32 },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    letterSpacing: -0.5,
    paddingHorizontal: 18,
    paddingTop: 8,
    marginBottom: 14,
  },
  mainSwitcher: {
    marginHorizontal: 12,
    marginBottom: 14,
    backgroundColor: DS_COLORS.ONBOARDING_BORDER,
    borderRadius: 12,
    padding: 3,
    flexDirection: "row",
    gap: 3,
  },
  mainTab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  mainTabOn: { backgroundColor: DS_COLORS.WHITE },
  mainTabText: { fontSize: 13, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  mainTabTextOn: { color: DS_COLORS.TEXT_PRIMARY },
  groupLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: DS_COLORS.TAB_INACTIVE,
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  notifRow: {
    backgroundColor: DS_COLORS.WHITE,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 14,
    paddingVertical: 12,
    paddingRight: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: DS_COLORS.DISCOVER_CORAL, paddingLeft: 10 },
  notifRead: { paddingLeft: 13 },
  avatarWrap: { position: "relative", flexShrink: 0, marginLeft: 4 },
  notifAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notifAvatarLetter: { fontSize: 13, fontWeight: "700" },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: DS_COLORS.BG_PAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgeText: { fontSize: 9, fontWeight: "700", color: DS_COLORS.WHITE },
  typeBadgeFollow: { color: DS_COLORS.WHITE, fontWeight: "700" },
  notifBody: { flex: 1 },
  notifMain: { fontSize: 12, color: DS_COLORS.grayDarker, lineHeight: 17 },
  notifBold: { fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  notifTime: { fontSize: 10, color: DS_COLORS.TEXT_MUTED, marginTop: 2, fontWeight: "600" },
  followBtn: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  followBtnText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.WHITE },
  thumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: DS_COLORS.BG_DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbEmoji: { fontSize: 16, opacity: 0.6 },
  scopeSwitcher: {
    marginHorizontal: 12,
    marginBottom: 14,
    backgroundColor: DS_COLORS.ONBOARDING_BORDER,
    borderRadius: 12,
    padding: 3,
    flexDirection: "row",
    gap: 3,
  },
  scopeTab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" },
  scopeTabOn: { backgroundColor: DS_COLORS.WHITE },
  scopeTabText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  scopeTabTextOn: { color: DS_COLORS.TEXT_PRIMARY },
  scoreNote: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  scoreNoteIcon: { fontSize: 14, marginTop: 1 },
  scoreNoteText: { flex: 1, fontSize: 11, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 16 },
  scoreNoteBold: { fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  crownCard: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderRadius: 18,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 16,
  },
  crownEyebrow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  crownDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: DS_COLORS.CELEB_BONUS_AMBER },
  crownEyebrowText: {
    fontSize: 9,
    fontWeight: "700",
    color: DS_COLORS.CELEB_BONUS_AMBER,
    letterSpacing: 1.2,
  },
  crownMainRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  crownRank: { fontSize: 22, fontWeight: "700", color: DS_COLORS.CELEB_BONUS_AMBER, width: 28 },
  crownAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  crownAvatarLetter: { fontSize: 15, fontWeight: "700" },
  crownName: { fontSize: 13, fontWeight: "700", color: DS_COLORS.WHITE },
  crownStreakPill: {
    backgroundColor: "rgba(200,147,26,0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  crownStreakText: { fontSize: 9, fontWeight: "700", color: DS_COLORS.CELEB_BONUS_AMBER },
  crownSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  crownPts: { fontSize: 20, fontWeight: "700", color: DS_COLORS.CELEB_BONUS_AMBER, lineHeight: 20 },
  crownPtsLabel: { fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: "600" },
  crownActions: { flexDirection: "row", gap: 8 },
  crownPrimary: {
    flex: 1,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 99,
    paddingVertical: 9,
    alignItems: "center",
  },
  crownPrimaryText: { fontSize: 12, fontWeight: "700", color: DS_COLORS.WHITE },
  crownSecondary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    paddingVertical: 9,
    alignItems: "center",
  },
  crownSecondaryText: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.5)" },
  regRow: {
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  regRank: { width: 24, textAlign: "center", fontSize: 16, fontWeight: "700" },
  regAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  regAvatarLetter: { fontSize: 13, fontWeight: "700" },
  regName: { fontSize: 12, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  regStreakPill: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  regStreakText: { fontSize: 9, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  regSub: { fontSize: 10, color: DS_COLORS.TAB_INACTIVE, marginTop: 1 },
  regTrack: {
    height: 2,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderRadius: 99,
    marginTop: 6,
    overflow: "hidden",
  },
  regFill: { height: 2, backgroundColor: DS_COLORS.DISCOVER_CORAL, borderRadius: 99 },
  regPts: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  regPtsLabel: { fontSize: 9, color: DS_COLORS.TEXT_MUTED, fontWeight: "600" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  yourRankDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(0,0,0,0.08)" },
  yourRankLabel: { fontSize: 10, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  yourCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderWidth: 1.5,
    borderColor: DS_COLORS.ACCENT_TINT_BORDER,
  },
  yourRankNum: { width: 24, textAlign: "center", fontSize: 13, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  yourName: { fontSize: 12, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  yourSub: { fontSize: 10, color: DS_COLORS.TEXT_SECONDARY, marginTop: 1 },
  yourPts: { fontSize: 14, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  challengePills: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  challengePill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 99,
    marginRight: 8,
    maxWidth: 200,
  },
  challengePillOn: { backgroundColor: DS_COLORS.DISCOVER_CORAL },
  challengePillOff: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: DS_COLORS.TEXT_SECONDARY,
  },
  challengePillText: { fontSize: 11, fontWeight: "700", color: DS_COLORS.TEXT_SECONDARY },
  challengePillTextOn: { color: DS_COLORS.WHITE },
  privacyPill: {
    marginHorizontal: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  privacyPillText: { fontSize: 10, fontWeight: "700" },
  teamEmpty: { paddingVertical: 40, alignItems: "center", paddingHorizontal: 24 },
  teamEmptyEmoji: { fontSize: 36, opacity: 0.25, marginBottom: 12 },
  teamEmptySub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center", lineHeight: 18 },
  findTeamBtn: {
    marginTop: 16,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 99,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  findTeamBtnText: { fontSize: 13, fontWeight: "700", color: DS_COLORS.WHITE },
  teamTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DS_COLORS.TEXT_PRIMARY,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyLb: { paddingVertical: 24, alignItems: "center", paddingHorizontal: 20 },
  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
  emptyBody: {
    fontSize: 14,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
  },
  emptyButtonText: {
    color: DS_COLORS.WHITE,
    fontSize: 14,
    fontWeight: "500",
  },
  guestWrap: { padding: 24 },
  guestText: { fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
});
