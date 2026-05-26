/**
 * Self profile (tab) — composition: ProfileHeader + StreakBar + YearHeatmap +
 * tab segmented (challenges / posts / badges).
 *
 * Replaces the legacy 1236-line StreakHero + MiniStats + StreakHeatmap +
 * TodayTaskStrip stack. The data hooks (`useApp().stats`, follow counts,
 * heatmap, badges) carry over unchanged — only the layout was re-thought.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Settings,
  Share2,
  Lock,
  Target,
  ChevronRight,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { shareInvite, shareProfile } from "@/lib/share";
import { pickAndUploadAvatar } from "@/lib/avatar";
import { captureError } from "@/lib/sentry";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

import { SkeletonProfile } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import Card from "@/components/shared/Card";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import {
  BadgeDetailModal,
  type BadgeDetailPayload,
} from "@/components/profile/BadgeDetailModal";
import { PostsGrid } from "@/components/profile/PostsGrid";
import { BadgesGrid, type BadgeGridRow } from "@/components/profile/BadgesGrid";
import {
  ChallengeListSheet,
  type ChallengeListSheetIconName,
} from "@/components/profile/ChallengeListSheet";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StreakBar } from "@/components/profile/StreakBar";
import { YearHeatmap } from "@/components/profile/YearHeatmap";

type ProfileTab = "challenges" | "posts" | "badges";

type HeatmapDay = { date: string; level: 0 | 1 | 2 | 3 | 4 };
type HeatmapResponse = { days: HeatmapDay[] };

type ActiveRow = {
  id: string;
  current_day?: number;
  progress_percent?: number;
  challenges?: { id?: string; title?: string; duration_days?: number };
};

function isProfileTab(value: string | undefined): value is ProfileTab {
  return value === "challenges" || value === "posts" || value === "badges";
}

function formatMonthYear(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default function ProfileScreen() {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const qc = useQueryClient();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const {
    profile,
    profileLoading,
    profileMissing,
    isError,
    stats,
    refetchAll,
  } = useApp();

  const [tab, setTab] = useState<ProfileTab>(
    isProfileTab(tabParam) ? tabParam : "challenges",
  );

  useEffect(() => {
    if (isProfileTab(tabParam) && tabParam !== tab) {
      setTab(tabParam);
    }
    // tab intentionally excluded — only react to query-param changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const [uploading, setUploading] = useState(false);
  const [avatarInlineError, setAvatarInlineError] = useState<string | null>(null);
  const [avatarDisplayOverride, setAvatarDisplayOverride] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetailPayload | null>(null);
  const [miniActiveSheetOpen, setMiniActiveSheetOpen] = useState(false);
  const [miniCompletedSheetOpen, setMiniCompletedSheetOpen] = useState(false);

  useEffect(() => {
    if (!avatarInlineError) return;
    const t = setTimeout(() => setAvatarInlineError(null), 4000);
    return () => clearTimeout(t);
  }, [avatarInlineError]);

  useEffect(() => {
    const fromServer = profile?.avatar_url?.trim();
    if (!fromServer || !avatarDisplayOverride) return;
    if (fromServer.split("?")[0] === avatarDisplayOverride.split("?")[0]) {
      setAvatarDisplayOverride(null);
    }
  }, [profile?.avatar_url, avatarDisplayOverride]);

  const activeListQuery = useQuery({
    queryKey: ["profile", user?.id, "activeChallenges"],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isGuest && !!user?.id,
    placeholderData: (previousData) => previousData,
  });
  if (activeListQuery.isError)
    captureError(activeListQuery.error, "Profile.activeChallenges");

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

  type BadgeProcRow = {
    id: string;
    name: string;
    icon: string;
    color: string;
    dimension: string;
    description: string;
    progress: number;
    total: number;
  };

  const badgesQuery = useQuery({
    queryKey: ["profile", user?.id, "badges"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getBadges, { userId: user!.id }) as Promise<{
        earned: BadgeProcRow[];
        next: BadgeProcRow[];
      }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  if (badgesQuery.isError) captureError(badgesQuery.error, "Profile.getBadges");

  const heatmapQuery = useQuery({
    queryKey: ["profile", user?.id, "heatmap", 365],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getCheckinHeatmap, { days: 365 }) as Promise<HeatmapResponse>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  if (heatmapQuery.isError)
    captureError(heatmapQuery.error, "Profile.getCheckinHeatmap");

  const refreshing =
    activeListQuery.isRefetching ||
    followCountsQuery.isRefetching ||
    heatmapQuery.isRefetching ||
    badgesQuery.isRefetching;

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([
      activeListQuery.refetch(),
      followCountsQuery.refetch(),
      heatmapQuery.refetch(),
      badgesQuery.refetch(),
    ]);
  }, [refetchAll, activeListQuery, followCountsQuery, heatmapQuery, badgesQuery]);

  const streak = stats?.activeStreak ?? 0;
  const best = stats?.longestStreak ?? 0;
  const active = stats?.activeChallenges ?? 0;
  const done = stats?.completedChallenges ?? 0;

  const heatmapDays: HeatmapDay[] = useMemo(() => {
    return heatmapQuery.data?.days ?? [];
  }, [heatmapQuery.data]);

  const heatmapTotalSecured = useMemo(
    () => heatmapDays.filter((d) => d.level > 0).length,
    [heatmapDays],
  );

  const rangeLabels = useMemo(() => {
    const today = new Date();
    const start = new Date(Date.now() - 365 * 86400000);
    return {
      start: formatMonthYear(start),
      end: formatMonthYear(today),
    };
  }, []);

  const activeItems = useMemo(() => {
    const rows = (activeListQuery.data ?? []) as ActiveRow[];
    return rows.map((row) => {
      const duration = Math.max(1, row.challenges?.duration_days ?? 1);
      const day = Math.min(duration, Math.max(1, row.current_day ?? 1));
      const rawProgress =
        row.progress_percent != null && !Number.isNaN(Number(row.progress_percent))
          ? Number(row.progress_percent)
          : (day / duration) * 100;
      const progressPercent = Math.max(0, Math.min(100, Math.round(rawProgress)));
      return {
        id: row.id,
        challengeId: row.challenges?.id ?? "",
        title: row.challenges?.title ?? "Challenge",
        currentDay: day,
        durationDays: duration,
        progressPercent,
      };
    });
  }, [activeListQuery.data]);

  const navigateMiniActiveChallenge = useCallback(
    (id: string) => {
      setMiniActiveSheetOpen(false);
      router.push(ROUTES.CHALLENGE_ACTIVE(id) as never);
    },
    [router],
  );

  const navigateMiniCompletedChallenge = useCallback(
    (id: string) => {
      setMiniCompletedSheetOpen(false);
      router.push(ROUTES.CHALLENGE_ACTIVE(id) as never);
    },
    [router],
  );

  // Stub rows for the bottom sheets (kept in V1 tone — separate cleanup PR).
  const stubActiveRows = useMemo(
    (): {
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }[] =>
      activeItems.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: `Day ${row.currentDay} of ${row.durationDays}`,
        joinedCount: 0,
        iconBg: DS_COLORS_V2.brand.primarySoft,
        iconColor: DS_COLORS_V2.brand.primary,
        iconName: "target",
      })),
    [activeItems],
  );

  const stubCompletedRows = useMemo(
    (): {
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }[] => [],
    [],
  );

  const badgeRows = useMemo((): BadgeGridRow[] => {
    const earned = (badgesQuery.data?.earned ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      iconName: (b.icon ?? "").toLowerCase(),
      unlocked: true,
    }));
    const next = (badgesQuery.data?.next ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      iconName: (b.icon ?? "").toLowerCase(),
      unlocked: false,
    }));
    return [...earned, ...next].slice(0, 6);
  }, [badgesQuery.data]);

  const profileV2PostsStub = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: `profile-v2-post-${i + 1}`,
        imageUrl: `https://picsum.photos/seed/grit-${i + 101}/320/400`,
        challengeTitle:
          ["Morning Lift", "Run Club", "Prayer Pace", "Journal Jam", "Cold Plunge", "Hydration", "Macros", "Steps", "Read"][i] ??
          `Challenge ${i + 1}`,
        dayOfTotal:
          [
            "Day 1 of 21",
            "Day 7 of 30",
            "Day 3 of 30",
            "Day 12 of 14",
            "Day 20 of 30",
            "Day 4 of 10",
            "Day 15 of 60",
            "Day 9 of 21",
            "Day 11 of 40",
          ][i] ?? `Day ${i + 2} of 21`,
      })),
    [],
  );

  const handleShare = useCallback(async () => {
    if (!profile?.username) return;
    trackEvent("share_tapped", { content_type: "profile" });
    try {
      await shareProfile({
        username: profile.username,
        streak,
        totalDaysSecured: stats?.totalDaysSecured ?? 0,
        tier: stats?.tier ?? "Starter",
      });
    } catch (e) {
      captureError(e, "Profile.handleShare");
    }
  }, [profile?.username, streak, stats?.totalDaysSecured, stats?.tier]);

  const handleInvite = useCallback(async () => {
    trackEvent("share_tapped", { content_type: "invite" });
    try {
      await shareInvite();
    } catch (e) {
      captureError(e, "Profile.handleInvite");
    }
  }, []);

  const handleAvatarPress = useCallback(async () => {
    if (!user?.id) return;
    setAvatarInlineError(null);
    setUploading(true);
    try {
      const outcome = await pickAndUploadAvatar(user.id);
      if (outcome.status === "ok") {
        setAvatarDisplayOverride(outcome.url);
        await qc.invalidateQueries({ queryKey: ["profile", user?.id] });
        await refetchAll();
        return;
      }
      if (outcome.status === "denied") {
        setAvatarInlineError("Allow photo access in Settings to change your avatar.");
        return;
      }
      if (outcome.status === "failed") {
        setAvatarInlineError(outcome.message);
        return;
      }
    } catch (e) {
      captureError(e, "Profile.AvatarPick");
      setAvatarInlineError("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  }, [user?.id, qc, refetchAll]);

  const fc = followCountsQuery.data;
  const listUsername = profile?.username?.trim() ?? "";

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <Card containerStyle={styles.guestCard}>
            <Text style={styles.guestTitle}>Sign in to view your profile</Text>
            <Text style={styles.guestSub}>
              Track streaks, rank, and activity in one place.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if ((profileLoading && !profile) || (!profile && !isError)) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <SkeletonProfile />
      </SafeAreaView>
    );
  }

  if ((isError || profileMissing) && !profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.centerGuest, styles.errorPad]}>
          <ErrorState
            message="Couldn't load profile"
            onRetry={() => {
              void refetchAll();
              void activeListQuery.refetch();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !user?.id) return null;

  const isPrivate = profile.profile_visibility === "private";

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={DS_COLORS_V2.brand.primary}
            />
          }
        >
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.handle} numberOfLines={1}>
                {`@${listUsername}`}
              </Text>
              {isPrivate ? (
                <Lock
                  size={11}
                  color={DS_COLORS_V2.text.secondary}
                  strokeWidth={2}
                />
              ) : null}
            </View>
            <View style={styles.topBarRight}>
              <Pressable
                onPress={() => void handleShare()}
                accessibilityRole="button"
                accessibilityLabel="Share my profile"
                hitSlop={8}
                style={styles.iconBtn}
              >
                <Share2
                  size={16}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
              <Pressable
                onPress={() => router.push(ROUTES.SETTINGS as never)}
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                hitSlop={8}
                style={styles.iconBtn}
              >
                <Settings
                  size={16}
                  color={DS_COLORS_V2.text.primary}
                  strokeWidth={2}
                />
              </Pressable>
            </View>
          </View>

          {avatarInlineError ? (
            <Pressable
              style={styles.avatarErrorBanner}
              accessibilityRole="alert"
              accessibilityLabel={avatarInlineError}
              onPress={() => {
                if (avatarInlineError.includes("Settings")) {
                  void Linking.openSettings();
                }
              }}
            >
              <Text style={styles.avatarErrorText}>{avatarInlineError}</Text>
              {avatarInlineError.includes("Settings") ? (
                <Text style={styles.avatarErrorLink}>Tap to open Settings →</Text>
              ) : null}
            </Pressable>
          ) : null}

          <ProfileHeader
            mode="self"
            userId={user.id}
            username={profile.username ?? ""}
            displayName={profile.display_name ?? ""}
            bio={profile.bio}
            avatarUrl={avatarDisplayOverride ?? profile.avatar_url}
            isPrivate={isPrivate}
            currentStreak={streak}
            followersCount={fc?.followers ?? 0}
            followingCount={fc?.following ?? 0}
            completedChallenges={done}
            onPressAvatar={uploading ? undefined : () => void handleAvatarPress()}
            onPressEditProfile={() => router.push(ROUTES.EDIT_PROFILE as never)}
            onPressInvite={() => void handleInvite()}
            onPressFollowers={() =>
              router.push(
                ROUTES.FOLLOW_LIST(user.id, "followers", listUsername) as never,
              )
            }
            onPressFollowing={() =>
              router.push(
                ROUTES.FOLLOW_LIST(user.id, "following", listUsername) as never,
              )
            }
            onPressCompleted={() => setMiniCompletedSheetOpen(true)}
          />

          <View style={styles.contentPad}>
            <StreakBar
              currentStreak={streak}
              longestStreak={best}
              activeCount={active}
              onPressActive={() => setMiniActiveSheetOpen(true)}
            />

            <YearHeatmap
              days={heatmapDays}
              totalSecured={heatmapTotalSecured}
              rangeLabelStart={rangeLabels.start}
              rangeLabelEnd={rangeLabels.end}
            />

            <View style={styles.tabBar}>
              {(["challenges", "posts", "badges"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    t === "challenges"
                      ? "Challenges tab"
                      : t === "posts"
                        ? "Posts tab"
                        : "Badges tab"
                  }
                  accessibilityState={{ selected: tab === t }}
                  style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                >
                  <Text
                    style={[styles.tabTxt, tab === t && styles.tabTxtActive]}
                  >
                    {t === "challenges"
                      ? "Challenges"
                      : t === "posts"
                        ? "Posts"
                        : "Badges"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === "challenges" ? (
              <View style={styles.tabBody}>
                {activeItems.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No active challenges</Text>
                    <Text style={styles.emptySub}>
                      Tap Discover to start one.
                    </Text>
                    <Pressable
                      onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
                      accessibilityRole="button"
                      accessibilityLabel="Open Discover"
                      style={styles.emptyCta}
                    >
                      <Text style={styles.emptyCtaText}>Open Discover</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.activeList}>
                    {activeItems.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() =>
                          router.push(ROUTES.CHALLENGE_ACTIVE(item.id) as never)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title}, day ${item.currentDay} of ${item.durationDays}`}
                        style={({ pressed }) => [
                          styles.activeRow,
                          pressed ? styles.activeRowPressed : null,
                        ]}
                      >
                        <View style={styles.activeRowIcon}>
                          <Target
                            size={18}
                            color={DS_COLORS_V2.brand.primary}
                            strokeWidth={2}
                          />
                        </View>
                        <View style={styles.activeRowBody}>
                          <View style={styles.activeRowTopline}>
                            <Text style={styles.activeRowTitle} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={styles.activeRowDay}>
                              Day {item.currentDay}
                            </Text>
                          </View>
                          <View style={styles.activeRowProgressTrack}>
                            <View
                              style={[
                                styles.activeRowProgressFill,
                                { width: `${item.progressPercent}%` },
                              ]}
                            />
                          </View>
                        </View>
                        <ChevronRight
                          size={16}
                          color={DS_COLORS_V2.text.tertiary}
                          strokeWidth={2}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            {tab === "posts" ? (
              <View style={styles.tabBody}>
                <PostsGrid
                  posts={profileV2PostsStub}
                  onSelect={(postId) => {
                    router.push(ROUTES.POST_ID(postId) as never);
                  }}
                />
              </View>
            ) : null}

            {tab === "badges" ? (
              <View style={styles.tabBody}>
                <BadgesGrid
                  badges={badgeRows}
                  onBadgePress={(payload) => setSelectedBadge(payload)}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
        <ChallengeListSheet
          visible={miniActiveSheetOpen}
          title="Active challenges"
          items={stubActiveRows}
          onClose={() => setMiniActiveSheetOpen(false)}
          onSelect={navigateMiniActiveChallenge}
        />
        <ChallengeListSheet
          visible={miniCompletedSheetOpen}
          title="Completed challenges"
          items={stubCompletedRows}
          onClose={() => setMiniCompletedSheetOpen(false)}
          onSelect={navigateMiniCompletedChallenge}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  scroll: { paddingBottom: 32 },
  centerGuest: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  guestCard: { width: "100%" },
  guestTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
  },
  guestSub: {
    marginTop: 8,
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
  errorPad: { paddingHorizontal: 24 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  handle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.1,
  },
  topBarRight: {
    flexDirection: "row",
    gap: DS_SPACING_V2.sm,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },

  avatarErrorBanner: {
    marginHorizontal: DS_SPACING_V2.md,
    marginTop: DS_SPACING_V2.xs,
    marginBottom: DS_SPACING_V2.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.semantic.danger,
  },
  avatarErrorText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
  },
  avatarErrorLink: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
    marginTop: 4,
  },

  contentPad: {
    paddingHorizontal: DS_SPACING_V2.md,
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: DS_RADIUS_V2.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnActive: {
    backgroundColor: DS_COLORS_V2.surface.canvas,
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  tabTxtActive: {
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },

  tabBody: {
    paddingBottom: DS_SPACING_V2.md,
  },

  activeList: {
    gap: DS_SPACING_V2.sm,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  activeRowPressed: {
    opacity: 0.85,
  },
  activeRowIcon: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activeRowBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  activeRowTopline: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 6,
  },
  activeRowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  activeRowDay: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  activeRowProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.surface.divider,
    overflow: "hidden",
  },
  activeRowProgressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },

  emptyCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    padding: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  emptySub: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
});
