/**
 * Own profile — build 92 chunk 07 (Option A, P2-01 / P2-09): header with 3 numbers and the record row,
 * then the proof grid. Challenges, Badges and Stats live on "Your record" (`app/profile/record.tsx`).
 * The header renders from a cached snapshot while profiles.getRecord loads; only the grid shows skeletons.
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "@/components/ds/Screen";
import ScreenChrome from "@/components/ds/ScreenChrome";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { useHomeBootstrap } from "@/lib/use-home-bootstrap";
import { cachedProofUrl, proofPrefetchUrls } from "@/lib/proof-url-cache";
import { getTodayDateKey } from "@/lib/date-utils";
import { resolveHomeTimeZone } from "@/lib/home-streak";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { homeSecuredToday } from "@/lib/home-secured-visuals";
import { EMPTY_SECURED_HEADER, type ProofsHeader } from "@/lib/secured-since";
import { type DaySource } from "@/lib/day-state";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { shareInvite, shareProfile } from "@/lib/share";
import { captureError } from "@/lib/sentry";
import { profilePrimaryName } from "@/lib/profile-display";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import type { UserStatsFields } from "@/types";
import { DS_V3 } from "@/lib/design-system";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import EmptyState from "@/components/ds/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProfileV3 } from "@/components/profile/ProfileV3";
import { ProfileHeaderSkeleton } from "@/components/profile/ProfileHeader";
import ProfileProofs, { ProofGridSkeleton } from "@/components/profile/ProfileProofs";
import type { ProofsDayIn } from "@/lib/day-cell";
import type { V42BadgeState } from "@/lib/v42-badges";
import { GriitFade } from "@/components/profile-v2/GriitFade";
import { todayTaskCounts, type CountableEnrollment } from "@/lib/today-counts";
import { useProfileHeaderCache } from "@/lib/profile-header-cache";
import { recordCountsFromRecord } from "@/lib/profile-record";
import {
  joinedBioLine,
  nextUnearnedBadge,
  showJoinedBioPlaceholder,
  weekdayFromCreatedAt,
} from "@/lib/g3-profile";

type RecordPayload = ProfileRecord & {
  timezone: string;
  todayKey: string;
  elapsedMs: number;
  daySource?: DaySource;
  header?: ProofsHeader;
  monthKey?: string;
  days?: ProofsDayIn[];
  badgeGrid?: V42BadgeState[];
  /** Build 92 06.2 */
  user_stats?: UserStatsFields | null;
};

function isEventId(id: string | null | undefined): id is string {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, refetchAll } = useApp();
  const bootstrap = useHomeBootstrap(isGuest ? undefined : user?.id);

  // 07.6: time from mount to the first header paint, logged once in dev for the ≤300 ms gate.
  const mountedAt = useRef(Date.now());
  const headerLogged = useRef(false);
  const logHeaderVisible = useCallback((source: "cache" | "live") => {
    if (headerLogged.current || !__DEV__) return;
    headerLogged.current = true;
    console.log(`[b92-07] profile header visible after ${Date.now() - mountedAt.current} ms (${source})`);
  }, []);

  const recordQuery = useQuery({
    queryKey: ["profiles", "getRecord", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.profiles.getRecord) as Promise<RecordPayload>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  if (recordQuery.isError) captureError(recordQuery.error, "Profile.getRecord");

  const followCountsQuery = useQuery({
    queryKey: ["profile", user?.id, "followCounts"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts, { userId: user!.id }) as Promise<{
        followers: number;
        following: number;
        friends?: number;
        friendFaces?: { userId: string; username: string; displayName: string; avatarUrl: string | null }[];
      }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });

  const refreshing = recordQuery.isRefetching || followCountsQuery.isRefetching;

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([recordQuery.refetch(), followCountsQuery.refetch()]);
  }, [refetchAll, recordQuery, followCountsQuery]);

  const record = recordQuery.data;
  const proofs = record?.proofs ?? [];
  const proofTiles = useMemo(
    () =>
      proofs.map((p, i) => {
        const id = isEventId(p.eventId) ? p.eventId : `no-event-${p.dateKey}-${i}`;
        return {
          id,
          dateKey: p.dateKey,
          imageUrl: cachedProofUrl(id, p.imageUrl) ?? p.imageUrl,
          taskName: p.taskName ?? p.challengeName,
          shared: p.shared,
          shareState: p.shareState,
          bytes: p.bytes,
        };
      }),
    [proofs],
  );
  useEffect(() => {
    for (const url of proofPrefetchUrls(proofTiles.map((tile) => tile.imageUrl))) {
      void Image.prefetch(url);
    }
  }, [proofTiles]);

  const handleShare = useCallback(async () => {
    if (!profile?.username) return;
    trackEvent("share_tapped", { content_type: "profile" });
    try {
      await shareProfile({
        username: profile.username,
        streak: record?.streak.current ?? 0,
        totalDaysSecured: record?.detail.totalVerified ?? 0,
        tier: "Starter",
      });
    } catch (e) {
      captureError(e, "Profile.handleShare");
    }
  }, [profile?.username, record?.streak, record?.detail.totalVerified]);

  const handleInvite = useCallback(async () => {
    trackEvent("share_tapped", { content_type: "invite" });
    try {
      await shareInvite();
    } catch (e) {
      captureError(e, "Profile.handleInvite");
    }
  }, []);

  // Build 92 06.2 / 07.2: header numbers read user_stats (getStats via the bootstrap, else getRecord).
  const userStats = bootstrap.data?.stats?.user_stats ?? record?.user_stats ?? null;
  const streak = userStats?.current_streak ?? bootstrap.data?.stats?.activeStreak ?? record?.streak.current ?? 0;
  const best = userStats?.best_streak ?? bootstrap.data?.stats?.longestStreak ?? record?.streak.best ?? 0;
  const securedDaysTotal = userStats?.secured_days ?? bootstrap.data?.stats?.totalDaysSecured ?? 0;
  const verifiedDays = userStats?.verified_days ?? 0;
  const proofsCount = userStats?.proofs_count ?? 0;
  const bootstrapFollows = bootstrap.data?.followCounts;
  const followers =
    bootstrapFollows?.followers ??
    (followCountsQuery.isError ? 0 : (followCountsQuery.data?.followers ?? 0));
  const following =
    bootstrapFollows?.following ??
    (followCountsQuery.isError ? 0 : (followCountsQuery.data?.following ?? 0));
  const recordCounts = useMemo(() => recordCountsFromRecord(record), [record]);
  // 07.6: the snapshot is complete only once the record (counts) and the profile have loaded.
  const liveHeader = useMemo(
    () =>
      profile && record && userStats
        ? {
            displayName: profilePrimaryName(profile) || (profile.username?.trim() ?? ""),
            username: profile.username?.trim() ?? "",
            avatarUrl: profile.avatar_url ?? null,
            bio: (profile.bio ?? "").trim() || null,
            streak,
            best,
            secured: securedDaysTotal,
            verified: verifiedDays,
            followers,
            following,
            running: recordCounts.running,
            finished: recordCounts.finished,
            badges: recordCounts.badges,
          }
        : null,
    [profile, record, userStats, streak, best, securedDaysTotal, verifiedDays, followers, following, recordCounts],
  );
  const headerCache = useProfileHeaderCache(isGuest ? null : user?.id, liveHeader);
  useEffect(() => {
    if (profile && user?.id) logHeaderVisible("live");
    else if (headerCache.cached) logHeaderVisible("cache");
  }, [profile, user?.id, headerCache.cached, logHeaderVisible]);

  if (isGuest) {
    return (
      <ScreenChrome>
      <Screen style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <Text style={styles.guestTitle}>Sign in to view your profile</Text>
          <Text style={styles.guestSub}>Track streaks, rank, and activity in one place.</Text>
        </View>
      </Screen>
      </ScreenChrome>
    );
  }

  if ((profileLoading && !profile) || (!profile && !isError)) {
    const c = headerCache.cached;
    return (
      <ScreenChrome>
      <Screen style={styles.safe} edges={["top"]}>
        {c && user?.id ? (
          <ProfileV3
            userId={user.id}
            title={c.displayName}
            handle={c.username}
            avatarUrl={c.avatarUrl}
            followers={c.followers}
            following={c.following}
            bio={c.bio ?? ""}
            streak={c.streak}
            best={c.best}
            totalDaysSecured={c.secured}
            verifiedDays={c.verified}
            record={{ running: c.running, finished: c.finished, badges: c.badges }}
            onRecord={() => router.push(ROUTES.PROFILE_RECORD as never)}
            onShare={() => undefined}
            onSettings={() => router.push(ROUTES.SETTINGS as never)}
            onEditProfile={() => router.push(ROUTES.EDIT_PROFILE as never)}
            onFindFriends={() => router.push(ROUTES.TABS_DISCOVER as never)}
            onFollowers={() => undefined}
            onFollowing={() => undefined}
          />
        ) : (
          <ProfileHeaderSkeleton />
        )}
        <ProofGridSkeleton />
      </Screen>
      </ScreenChrome>
    );
  }

  if ((isError || profileMissing) && !profile) {
    return (
      <ScreenChrome>
      <Screen style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <EmptyState
            heading="Profile did not load"
            body="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => {
              void refetchAll();
              void recordQuery.refetch();
            }}
          />
        </View>
      </Screen>
      </ScreenChrome>
    );
  }

  if (!profile || !user?.id) return null;

  const handle = profile.username?.trim() ?? "";
  const name = profilePrimaryName(profile) || handle;
  const bio = (profile.bio ?? "").trim();
  const homeTimeZone = resolveHomeTimeZone(profile.timezone, getDeviceIanaTimeZone());
  const securedDateKeys = Array.isArray(bootstrap.data?.securedDateKeys)
    ? bootstrap.data.securedDateKeys
    : [];
  const todayKey = record?.todayKey ?? getTodayDateKey(homeTimeZone);
  const todaySecured = homeSecuredToday(securedDateKeys, todayKey);
  const header = record?.header ?? EMPTY_SECURED_HEADER;
  // 05.4: one source of truth for "tasks left today", shared with Home's card.
  const todayCounts = todayTaskCounts({
    activeChallenges: (bootstrap.data?.activeChallenges ?? []) as CountableEnrollment[],
    todayCheckins: bootstrap.data?.todayCheckinsForUser ?? [],
    todayKey,
    timeZone: homeTimeZone,
  });
  // The Today tile reads the bootstrap counts (Home's source); the record query can lag a
  // join by a screen. The run count only stands in while the bootstrap has not loaded.
  const bootstrapLoaded = Array.isArray(bootstrap.data?.activeChallenges);
  const tasksLeft = bootstrapLoaded ? todayCounts.left : (record?.runs.length ?? 0);
  const todayOpen =
    !todaySecured && (bootstrapLoaded ? todayCounts.total > 0 : (record?.runs.length ?? 0) > 0);
  const bioPlaceholder = showJoinedBioPlaceholder({
    bio,
    createdAt: profile.created_at,
  })
    ? joinedBioLine(
        weekdayFromCreatedAt(profile.created_at ?? "", homeTimeZone),
        record?.runs[0]?.name ?? "",
      )
    : null;

  return (
    <ErrorBoundary>
      <ScreenChrome>
      <Screen style={styles.safe} edges={["top"]}>
        <GriitFade fadeKey={`own-${record?.todayKey ?? "none"}`}>
        <FlatList
          data={[]}
          keyExtractor={() => "profile"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarContentPad(insets.bottom) }]}
          ListHeaderComponent={
          <>
          <ProfileV3
            userId={user.id}
            title={name}
            handle={handle}
            avatarUrl={profile.avatar_url}
            followers={followers}
            following={following}
            bio={bio}
            bioPlaceholder={bioPlaceholder}
            streak={streak}
            best={best}
            totalDaysSecured={securedDaysTotal}
            verifiedDays={verifiedDays}
            record={recordCounts}
            onRecord={() => router.push(ROUTES.PROFILE_RECORD as never)}
            onShare={() => void handleShare()}
            onInvite={() => void handleInvite()}
            onSettings={() => router.push(ROUTES.SETTINGS as never)}
            onEditProfile={() => router.push(ROUTES.EDIT_PROFILE as never)}
            onFindFriends={() => router.push(ROUTES.TABS_DISCOVER as never)}
            onFollowers={() =>
              router.push(ROUTES.FOLLOW_LIST(user.id, "followers", handle) as never)
            }
            onFollowing={() =>
              router.push(ROUTES.FOLLOW_LIST(user.id, "following", handle) as never)
            }
          />
          {record ? (
            <ProfileProofs
              proofs={proofTiles}
              isOwner
              todayOpen={todayOpen}
              tasksLeft={tasksLeft}
              monthKey={record.monthKey ?? todayKey.slice(0, 7)}
              days={record.days ?? []}
              header={header}
              offline={false}
              onOpenDay={(tile) => {
                if (!isEventId(tile.id)) return;
                router.push(ROUTES.PROFILE_POSTS(user.id, tile.id) as never);
              }}
              onToday={() => router.push(ROUTES.TABS_HOME as never)}
              onFindChallenge={() => router.push(ROUTES.TABS_DISCOVER as never)}
              nextBadge={nextUnearnedBadge(record.badgeGrid ?? [])}
              securedDays={header.secured}
              proofCount={proofsCount}
              onNextBadge={() => router.push(ROUTES.PROFILE_RECORD_TAB("Badges") as never)}
            />
          ) : recordQuery.isError ? (
            <ProfileProofs
              proofs={[]}
              isOwner
              monthKey={todayKey.slice(0, 7)}
              days={[]}
              header={header}
              offline
              onRetry={() => void recordQuery.refetch()}
              onOpenDay={() => undefined}
              securedDays={securedDaysTotal}
              proofCount={proofsCount}
            />
          ) : (
            <ProofGridSkeleton />
          )}
          </>
          }
          renderItem={() => null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={DS_V3.color.textSecondary}
            />
          }
        />
        </GriitFade>
      </Screen>
      </ScreenChrome>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  scroll: {},
  foot: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  centerGuest: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
  guestTitle: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  guestSub: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
