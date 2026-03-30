import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  FlatList,
  SectionList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, Target, Trophy, UserPlus, Users } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { DS_COLORS, DS_SHADOWS, DS_SPACING } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/avatar";
import { consistencyScore } from "@/lib/scoring";
import { relativeTime } from "@/lib/utils/relativeTime";
import { inviteToChallenge, shareInvite } from "@/lib/share";
import LoadingState from "@/components/shared/LoadingState";
import { SkeletonLeaderboardRow } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import { ROUTES } from "@/lib/routes";

type MainTab = "notifications" | "leaderboard";
type LeaderScope = "global" | "friends" | "challenge";

type NotifRow = {
  id: string;
  type: "respect" | "comment" | "follow" | "follow_request" | "rank" | "general";
  read: boolean;
  createdAt: string;
  title?: string | null;
  body?: string | null;
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
  const t = (n.title ?? "").trim();
  const b = (n.body ?? "").trim();
  if (t || b) {
    return { bold: t, rest: t && b ? ` ${b}` : b || "" };
  }
  const name = n.actorDisplayName ?? n.actorUsername ?? "Someone";
  const challengeName = String(n.metadata.challenge_title ?? n.metadata.challenge_name ?? "challenge");
  switch (n.type) {
    case "respect":
      return { bold: name, rest: ` respected your ${challengeName} check-in` };
    case "comment":
      return { bold: name, rest: ` commented — "${String(n.metadata.comment_text ?? "").slice(0, 80)}"` };
    case "follow":
      return { bold: name, rest: " started following you" };
    case "follow_request":
      return { bold: name, rest: " wants to follow you" };
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
  const [mainTab, setMainTab] = useState<MainTab>("notifications");
  const [scope, setScope] = useState<LeaderScope>("global");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [challengeScope, setChallengeScope] = useState<"friends" | "everyone">("friends");

  const notifQuery = useQuery({
    queryKey: ["activity", "notifications", user?.id],
    queryFn: () => trpcQuery(TRPC.notifications.getAll) as Promise<{ unread: NotifRow[]; earlier: NotifRow[] }>,
    enabled: !isGuest && !!user?.id && mainTab === "notifications",
    staleTime: 30 * 1000,
    retry: 2,
  });

  const friendsBoard = useQuery({
    queryKey: ["activity", "leaderboard", "friends", user?.id],
    queryFn: () => trpcQuery(TRPC.leaderboard.getFriendsBoard) as Promise<{ leaderPoints: number; entries: BoardEntry[] }>,
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "friends",
    staleTime: 60 * 1000,
    retry: 2,
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
    retry: 2,
  });

  const myActive = useQuery({
    queryKey: ["activity", "myActive", user?.id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<{ challenge_id?: string; challenges?: { id?: string; title?: string } }[]>,
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "challenge",
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
    queryKey: ["activity", "leaderboard", "challenge", selectedChallengeId, challengeScope, user?.id],
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
    enabled: !isGuest && !!user?.id && mainTab === "leaderboard" && scope === "challenge" && !!selectedChallengeId,
    staleTime: 60 * 1000,
    retry: 2,
  });

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
    challengeBoard.isRefetching ||
    myActive.isRefetching;

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

  const activityHeader = (
    <>
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
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.tabShell}>
        {mainTab === "notifications" ? (
          <NotificationsBody
            query={notifQuery}
            userId={user.id}
            listHeader={activityHeader}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <LeaderboardBody
            scope={scope}
            setScope={(s) => {
              if (s === "challenge") setChallengeScope("friends");
              setScope(s);
            }}
            userId={user.id}
            friendsBoard={friendsBoard}
            globalLeaderboard={globalLeaderboard}
            challengeBoard={challengeBoard}
            myActive={myActive}
            selectedChallengeId={selectedChallengeId}
            setSelectedChallengeId={setSelectedChallengeId}
            challengeScope={challengeScope}
            setChallengeScope={setChallengeScope}
            listHeader={activityHeader}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function NotificationsBody({
  query,
  userId,
  listHeader,
  refreshing,
  onRefresh,
}: {
  query: ReturnType<typeof useQuery<{ unread: NotifRow[]; earlier: NotifRow[] }>>;
  userId: string;
  listHeader: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
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
      }
    },
    [qc, userId]
  );

  const sections = useMemo(() => {
    const unread = query.data?.unread ?? [];
    const earlier = query.data?.earlier ?? [];
    const s: { title: string; data: NotifRow[] }[] = [];
    if (unread.length) s.push({ title: "NEW", data: unread });
    if (earlier.length) s.push({ title: "EARLIER", data: earlier });
    return s;
  }, [query.data?.unread, query.data?.earlier]);

  const renderItem = useCallback(
    ({
      item,
      section,
    }: {
      item: NotifRow;
      section: { title: string; data: NotifRow[] };
    }) => (
      <NotificationRow n={item} onFollow={onFollow} unread={section.title === "NEW"} userId={userId} />
    ),
    [onFollow, userId]
  );

  if (query.isPending) return <LoadingState message="Loading notifications..." />;
  if (query.isError) return <ErrorState message="Couldn't load notifications" onRetry={() => void query.refetch()} />;

  const unread = query.data?.unread ?? [];
  const earlier = query.data?.earlier ?? [];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => <Text style={styles.groupLabel}>{title}</Text>}
      ListHeaderComponent={<>{listHeader}</>}
      ListEmptyComponent={
        unread.length === 0 && earlier.length === 0 ? (
          <View style={styles.emptyStateFill}>
            <View style={styles.emptyIconCircle}>
              <Bell size={40} color={DS_COLORS.TEXT_MUTED} style={{ opacity: 0.4 }} />
            </View>
            <Text style={styles.emptyTitleStrong}>No notifications yet</Text>
            <Text style={styles.emptyBodyNarrow}>
              Complete a task or join a challenge to start getting updates from the community.
            </Text>
            <TouchableOpacity
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              accessibilityLabel="Start a challenge"
              accessibilityRole="button"
            >
              <Text style={styles.emptyTextCta}>Start a challenge →</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.DISCOVER_CORAL} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      stickySectionHeadersEnabled={false}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
      removeClippedSubviews={Platform.OS === "android"}
    />
  );
}

const NotificationRow = React.memo(function NotificationRow({
  n,
  onFollow,
  unread,
  userId,
}: {
  n: NotifRow;
  onFollow: (id: string) => void;
  unread: boolean;
  userId: string;
}) {
  const qc = useQueryClient();
  const [frDone, setFrDone] = useState<"accepted" | "declined" | null>(null);
  const text = getNotifText(n);
  const colors = n.actorId ? getAvatarColor(n.actorId) : getAvatarColor(n.id);
  const initial = (n.actorDisplayName ?? n.actorUsername ?? "?").charAt(0).toUpperCase();

  const onAcceptFr = useCallback(async () => {
    if (!n.actorId) return;
    try {
      await trpcMutate(TRPC.profiles.acceptFollowRequest, { requesterId: n.actorId });
      setFrDone("accepted");
      void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
    } catch (e) {
      captureError(e, "AcceptFollowRequest");
    }
  }, [n.actorId, qc, userId]);

  const onDeclineFr = useCallback(async () => {
    if (!n.actorId) return;
    try {
      await trpcMutate(TRPC.profiles.declineFollowRequest, { requesterId: n.actorId });
      setFrDone("declined");
      void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
    } catch (e) {
      captureError(e, "DeclineFollowRequest");
    }
  }, [n.actorId, qc, userId]);

  if (n.type === "follow_request" && frDone === "declined") {
    return null;
  }

  return (
    <View style={[styles.notifRow, DS_SHADOWS.cardSubtle, unread ? styles.notifUnread : styles.notifRead]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.notifAvatar, { backgroundColor: colors.bg }]}>
          <Text style={[styles.notifAvatarLetter, { color: colors.letter }]}>{n.type === "rank" ? "★" : initial}</Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                n.type === "respect"
                  ? DS_COLORS.DISCOVER_CORAL
                  : n.type === "comment"
                    ? DS_COLORS.CELEB_BONUS_PURPLE
                    : n.type === "follow" || n.type === "follow_request"
                      ? DS_COLORS.DISCOVER_GREEN
                      : n.type === "rank"
                        ? DS_COLORS.WARNING
                        : DS_COLORS.TASK_ICON_BG,
            },
          ]}
        >
          <Text style={[styles.typeBadgeText, n.type === "follow" && styles.typeBadgeFollow]}>
            {n.type === "respect" ? "🔥" : n.type === "comment" ? "💬" : n.type === "follow" || n.type === "follow_request" ? "+" : n.type === "rank" ? "★" : "•"}
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
      {n.type === "follow_request" && n.actorId ? (
        frDone === "accepted" ? (
          <Text style={styles.frAccepted}>Accepted</Text>
        ) : (
          <View style={styles.frActions}>
            <TouchableOpacity
              style={styles.frAcceptBtn}
              onPress={() => void onAcceptFr()}
              accessibilityRole="button"
              accessibilityLabel="Accept follow request"
            >
              <Text style={styles.frAcceptTxt}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.frDeclineBtn}
              onPress={() => void onDeclineFr()}
              accessibilityRole="button"
              accessibilityLabel="Decline follow request"
            >
              <Text style={styles.frDeclineTxt}>Decline</Text>
            </TouchableOpacity>
          </View>
        )
      ) : n.type === "follow" && n.actorId ? (
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
});

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
            <TouchableOpacity
              key={s}
              style={[styles.scopeTab, scope === s && styles.scopeTabOn]}
              onPress={() => setScope(s)}
              accessibilityRole="button"
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
            void myActive.refetch();
            void challengeBoard.refetch();
          }}
        />
      ) : null}

      {!loading && !err && scope === "global" ? (
        globalEntries.length === 0 ? (
          <View style={styles.emptyStateFill}>
            <View style={styles.emptyIconCircle}>
              <Trophy size={40} color={DS_COLORS.TEXT_MUTED} style={{ opacity: 0.4 }} />
            </View>
            <Text style={styles.emptyTitleStrong}>Earn your spot</Text>
            <Text style={styles.emptyBodyNarrow}>
              Complete a daily check-in to appear on the global leaderboard.
            </Text>
            <Text style={styles.emptyFootnote}>Rankings reset every Monday.</Text>
            <TouchableOpacity
              onPress={() => router.push(ROUTES.TABS_HOME as never)}
              accessibilityLabel="Go to my challenges"
              accessibilityRole="button"
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
              <Users size={40} color={DS_COLORS.TEXT_MUTED} style={{ opacity: 0.4 }} />
            </View>
            <Text style={styles.emptyTitleStrong}>No friends on GRIIT yet</Text>
            <Text style={styles.emptyBodyNarrow}>
              Invite friends to compete together on the leaderboard.
            </Text>
            <TouchableOpacity
              style={styles.emptyInvitePill}
              onPress={() => void handleInviteFriend()}
              accessibilityLabel="Invite a friend"
              accessibilityRole="button"
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
                <Target size={40} color={DS_COLORS.TEXT_MUTED} style={{ opacity: 0.4 }} />
              </View>
              <Text style={styles.emptyTitleStrong}>No active challenges</Text>
              <Text style={styles.emptyBodyNarrow}>
                Join a challenge to start competing on the leaderboard.
              </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
                accessibilityLabel="Browse challenges"
                accessibilityRole="button"
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
                  <TouchableOpacity
                    style={[styles.challengePillNew, sel ? styles.challengePillNewOn : styles.challengePillNewOff]}
                    onPress={() => cid && setSelectedChallengeId(cid)}
                    accessibilityLabel={`View leaderboard for ${title}`}
                    accessibilityRole="button"
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
              <TouchableOpacity
                onPress={() => setChallengeScope("friends")}
                accessibilityLabel="Show friends only"
                accessibilityRole="button"
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
              <TouchableOpacity
                onPress={() => setChallengeScope("everyone")}
                accessibilityLabel="Show everyone"
                accessibilityRole="button"
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
                  <TouchableOpacity
                    onPress={() => void handleInviteToThisChallenge()}
                    accessibilityLabel="Invite friends to this challenge"
                    accessibilityRole="button"
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
      style={{ flex: 1 }}
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
    <View style={{ marginBottom: 24 }}>
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
    <Pressable
      style={styles.crownCard}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityRole="button"
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
        <View style={{ flex: 1 }}>
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
        <View style={{ alignItems: "flex-end" }}>
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
    <Pressable
      style={[styles.regRow, DS_SHADOWS.cardSubtle]}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityRole="button"
      accessibilityLabel={`View profile for ${entry.displayName}`}
    >
      {isSelf ? <View style={styles.rowSelfAccent} /> : null}
      <Text style={[styles.regRank, { color: rankNumColor(entry.rank) }]}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
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
      <View style={{ alignItems: "flex-end" }}>
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
    <Pressable
      style={styles.yourCard}
      onPress={() => openProfile(viewerId, entry)}
      accessibilityRole="button"
      accessibilityLabel="View your profile"
    >
      {isSelf ? <View style={styles.rowSelfAccent} /> : null}
      <Text style={styles.yourRankNum}>#{entry.rank}</Text>
      <View style={[styles.regAvatar, { backgroundColor: colors.bg }]}>
        <Text style={[styles.regAvatarLetter, { color: colors.letter }]}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  tabShell: { flex: 1 },
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
  frActions: { flexDirection: "row", gap: 8, flexShrink: 0 },
  frAcceptBtn: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  frAcceptTxt: { fontSize: 12, fontWeight: "500", color: DS_COLORS.WHITE },
  frDeclineBtn: {
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  frDeclineTxt: { fontSize: 12, fontWeight: "500", color: DS_COLORS.TEXT_SECONDARY },
  frAccepted: { fontSize: 12, fontWeight: "500", color: DS_COLORS.PROFILE_SUCCESS },
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
  scoreNoteWarm: {
    backgroundColor: DS_COLORS.FEATURED_BG,
    borderRadius: 10,
    marginHorizontal: DS_SPACING.MD,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  scoreNoteIcon: { fontSize: 14, marginTop: 1 },
  scoreNoteText: { flex: 1, fontSize: 12, color: DS_COLORS.TEXT_SECONDARY, lineHeight: 18 },
  scoreNoteBold: { fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY },
  crownCard: {
    backgroundColor: DS_COLORS.TEXT_PRIMARY,
    borderRadius: 18,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 16,
    position: "relative",
    overflow: "hidden",
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
    backgroundColor: DS_COLORS.CELEB_BONUS_AMBER_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    opacity: 0.45,
  },
  crownStreakText: { fontSize: 9, fontWeight: "700", color: DS_COLORS.CELEB_BONUS_AMBER },
  crownSubWrap: { marginTop: 2, opacity: 0.55 },
  crownSub: { fontSize: 11, color: DS_COLORS.TEXT_ON_DARK, lineHeight: 15 },
  crownPts: { fontSize: 20, fontWeight: "700", color: DS_COLORS.CELEB_BONUS_AMBER, lineHeight: 20 },
  crownPtsLabelWrap: { opacity: 0.45 },
  crownPtsLabel: { fontSize: 9, color: DS_COLORS.TEXT_ON_DARK, fontWeight: "600" },
  regRow: {
    position: "relative",
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  rowSelfAccent: {
    position: "absolute",
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
  },
  regRank: { width: 24, textAlign: "center", fontSize: 16, fontWeight: "700" },
  regAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
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
  regSubMuted: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 2, lineHeight: 14 },
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
  dividerLine: { flex: 1, height: 1, backgroundColor: DS_COLORS.DIVIDER },
  yourRankLabel: { fontSize: 10, fontWeight: "700", color: DS_COLORS.TEXT_MUTED },
  yourCard: {
    position: "relative",
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
    overflow: "hidden",
  },
  yourRankNum: { width: 24, textAlign: "center", fontSize: 13, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  yourName: { fontSize: 12, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  yourSub: { fontSize: 10, color: DS_COLORS.TEXT_SECONDARY, marginTop: 1 },
  yourSubMuted: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 2, lineHeight: 14 },
  yourPts: { fontSize: 14, fontWeight: "700", color: DS_COLORS.DISCOVER_CORAL },
  challengePills: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  challengePillsRow: {
    paddingHorizontal: DS_SPACING.MD,
    paddingBottom: 4,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  challengePillNew: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 220,
  },
  challengePillNewOn: { backgroundColor: DS_COLORS.DISCOVER_CORAL },
  challengePillNewOff: { backgroundColor: DS_COLORS.BG_CARD_TINTED },
  challengePillNewText: { fontSize: 12, fontWeight: "500" },
  challengePillNewTextOn: { color: DS_COLORS.WHITE },
  challengePillNewTextOff: { color: DS_COLORS.TEXT_SECONDARY },
  challengeScopeToggle: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: DS_SPACING.MD,
  },
  challengeScopeTab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: DS_COLORS.BORDER,
  },
  challengeScopeTabText: { fontSize: 12, fontWeight: "500" },
  soloChallengeHint: {
    alignItems: "center",
    paddingHorizontal: DS_SPACING.XL,
    paddingBottom: 24,
    gap: 6,
  },
  soloChallengeHintText: { fontSize: 13, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
  youBadge: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  youBadgeText: { fontSize: 10, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "500" },
  youBadgeDark: {
    backgroundColor: DS_COLORS.CELEB_BONUS_AMBER_BG,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
    opacity: 0.9,
  },
  youBadgeDarkText: { fontSize: 10, color: DS_COLORS.CELEB_BONUS_AMBER, fontWeight: "500" },
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
  emptyStateFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.XL,
    paddingVertical: 48,
    minHeight: 280,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitleStrong: {
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 16,
    textAlign: "center",
  },
  emptyBodyNarrow: {
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
    marginTop: 6,
  },
  emptyFootnote: {
    fontSize: 12,
    color: DS_COLORS.TEXT_MUTED,
    marginTop: 4,
    textAlign: "center",
  },
  emptyTextCta: {
    marginTop: 20,
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.DISCOVER_CORAL,
  },
  emptyInvitePill: {
    marginTop: 20,
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  emptyInvitePillText: { color: DS_COLORS.WHITE, fontSize: 14, fontWeight: "600" },
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
