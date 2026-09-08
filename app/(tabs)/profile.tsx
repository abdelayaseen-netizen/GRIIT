/**
 * Own profile v2 — identity, streak, consistency, Challenges / Proofs / Badges.
 * Record strings come from profiles.getRecord. No proof CTA except empty Proofs tab.
 */
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { shareInvite, shareProfile } from "@/lib/share";
import { captureError } from "@/lib/sentry";
import { profilePrimaryName } from "@/lib/profile-display";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import { DS_V3 } from "@/lib/design-system";
import EmptyState from "@/components/ds/EmptyState";
import Skeleton from "@/components/ds/Skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { badgeItemsFromRows, ProfileV3 } from "@/components/profile/ProfileV3";
import { badgeRowsFromProgress } from "@/lib/profile-v2-badges";
import { GriitFade } from "@/components/profile-v2/GriitFade";

type ProfileTab = "challenges" | "proofs" | "badges";

type RecordPayload = ProfileRecord & {
  timezone: string;
  todayKey: string;
  elapsedMs: number;
};

function isProfileTab(value: string | undefined): value is ProfileTab {
  return value === "challenges" || value === "proofs" || value === "badges";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, refetchAll } = useApp();

  const [tab, setTab] = useState<ProfileTab>(isProfileTab(tabParam) ? tabParam : "challenges");

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
  }, [profile?.username, record?.streak.current, record?.detail.totalVerified]);

  const handleInvite = useCallback(async () => {
    trackEvent("share_tapped", { content_type: "invite" });
    try {
      await shareInvite();
    } catch (e) {
      captureError(e, "Profile.handleInvite");
    }
  }, []);

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <Text style={styles.guestTitle}>Sign in to view your profile</Text>
          <Text style={styles.guestSub}>Track streaks, rank, and activity in one place.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((profileLoading && !profile) || (!profile && !isError)) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.skel}>
          <Skeleton />
          <View style={styles.skelGap} />
          <Skeleton />
        </View>
      </SafeAreaView>
    );
  }

  if ((isError || profileMissing) && !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
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
      </SafeAreaView>
    );
  }

  if (!profile || !user?.id) return null;

  const handle = profile.username?.trim() ?? "";
  const name = profilePrimaryName(profile) || handle;
  const bio = (profile.bio ?? "").trim();
  const followers = followCountsQuery.isError ? 0 : (followCountsQuery.data?.followers ?? 0);
  const following = followCountsQuery.isError ? 0 : (followCountsQuery.data?.following ?? 0);
  const v3Tab = tab === "proofs" ? "Proofs" : tab === "badges" ? "Badges" : "Challenges";
  const joined = (record?.runs.length ?? 0) > 0;
  const streak = record?.streak.current ?? 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <GriitFade fadeKey={`own-${tab}-${record?.todayKey ?? "none"}`}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={DS_V3.color.brand}
            />
          }
        >
          <ProfileV3
            title={name}
            handle={handle}
            avatarUrl={profile.avatar_url}
            followers={followers}
            following={following}
            bio={bio}
            streak={streak}
            best={record?.streak.best ?? 0}
            consistency={record?.consistency.rate ?? "No due days"}
            consistencySub={
              joined
                ? "Post every day. Missed days count."
                : "Join a challenge and the strip starts filling."
            }
            tab={v3Tab}
            onChangeTab={(next) => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTab(
                next === "Proofs" ? "proofs" : next === "Badges" ? "badges" : "challenges",
              );
            }}
            runs={(record?.runs ?? []).map((r) => ({
              id: r.id,
              name: r.name,
              day: r.day,
              length: r.length,
            }))}
            proofs={proofs}
            badges={badgeItemsFromRows(
              // Old: 99b1cc4 app/(tabs)/profile.tsx:393
              //   <BadgeRows rows={record?.badges ?? []} />
              // New: same `record.badges` (badgeRowsFromProgress). Empty
              // record still yields the five marks.
              record?.badges ??
                badgeRowsFromProgress({
                  bestStreak: record?.streak.best ?? 0,
                  verifiedDays: record?.detail.totalVerified ?? 0,
                }),
            )}
            onShare={() => void handleShare()}
            onSettings={() => router.push(ROUTES.SETTINGS as never)}
            onEditProfile={() => router.push(ROUTES.EDIT_PROFILE as never)}
            onInvite={() => void handleInvite()}
            onFollowers={() =>
              router.push(ROUTES.FOLLOW_LIST(user.id, "followers", handle) as never)
            }
            onFollowing={() =>
              router.push(ROUTES.FOLLOW_LIST(user.id, "following", handle) as never)
            }
            onSeeRecord={() => router.push(ROUTES.PROFILE_CONSISTENCY as never)}
            onDiscover={() => router.push(ROUTES.TABS_DISCOVER as never)}
            onOpenRun={(id) => router.push(ROUTES.CHALLENGE_ACTIVE(id) as never)}
          />
        </ScrollView>
        </GriitFade>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  scroll: { paddingBottom: DS_V3.space.xs * 30 },
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
  skel: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.lg },
  skelGap: { height: DS_V3.space.gutter },
});
