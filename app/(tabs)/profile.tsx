// NOTE(post-launch): Add "Drafts" section — filter challenges where status === 'draft' && creator_id === user.id
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  Camera,
  Share2,
  CheckCircle,
  ChevronRight,
  Pencil,
  Target,
  LayoutGrid,
  Award,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { sharePlainMessage, shareProfile } from "@/lib/share";
import { pickAndUploadAvatar } from "@/lib/avatar";
import { captureError } from "@/lib/sentry";
import { SkeletonProfile } from "@/components/skeletons";
import { Avatar } from "@/components/Avatar";
import ErrorState from "@/components/shared/ErrorState";
import Card from "@/components/shared/Card";
import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system"
import { profilePrimaryName, profileHandleAt } from "@/lib/profile-display";
import { BadgeDetailModal, type BadgeDetailPayload } from "@/components/profile/BadgeDetailModal";
import { PostsGrid } from "@/components/profile/PostsGrid";
import { BadgesGrid, type BadgeGridRow } from "@/components/profile/BadgesGrid";
import { StreakHero } from "@/components/profile/StreakHero";
import { TodayTaskStrip } from "@/components/profile/TodayTaskStrip";
import { MiniStats } from "@/components/profile/MiniStats";
import {
  ChallengeListSheet,
  type ChallengeListSheetIconName,
} from "@/components/profile/ChallengeListSheet";
import { StreakHeatmap } from "@/components/profile/StreakHeatmap";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ProfileTab = "challenges" | "posts" | "badges";

type ProfileV2Mode = "self" | "public" | "friends-allowed" | "friends-blocked" | "private";



type ActiveRow = {
  id: string;
  current_day?: number;
  progress_percent?: number;
  challenges?: { id?: string; title?: string; duration_days?: number };
};

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, stats, refetchAll } = useApp();
  const [tab, setTab] = useState<ProfileTab>("challenges");
  const [uploading, setUploading] = useState(false);
  const [avatarInlineError, setAvatarInlineError] = useState<string | null>(null);
  const [avatarDisplayOverride, setAvatarDisplayOverride] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetailPayload | null>(null);
  const [miniActiveSheetOpen, setMiniActiveSheetOpen] = useState(false);
  const [miniCompletedSheetOpen, setMiniCompletedSheetOpen] = useState(false);
  const [profileV2PreviewMode, setProfileV2PreviewMode] = useState<ProfileV2Mode>('self');
  /** Dev preview alias; use this name so visibility checks (`mode === '…'`) are grep-friendly for PR verification. */
  const mode = profileV2PreviewMode;

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

  // user!.id below: queries are gated by `enabled: !!user?.id`, so queryFn
  // only runs when user.id is defined. The non-null assertion is a TS hint.
  const followCountsQuery = useQuery({
    queryKey: ["profile", user?.id, "followCounts"],
    queryFn: () => trpcQuery(TRPC.profiles.getFollowCounts, { userId: user!.id }) as Promise<{ followers: number; following: number }>,
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
  if (badgesQuery.isError) captureError(badgesQuery.error, "ProfileV2.getBadges");

  type HeatmapDay = { date: string; level: 0 | 1 | 2 | 3 | 4 };

  const heatmapQuery = useQuery({
    queryKey: ["profile", user?.id, "heatmap"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getCheckinHeatmap, { days: 30 }) as Promise<{
        days: HeatmapDay[];
      }>,
    staleTime: 5 * 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  if (heatmapQuery.isError) captureError(heatmapQuery.error, "ProfileV2.getCheckinHeatmap");

  const refreshing = activeListQuery.isRefetching || followCountsQuery.isRefetching;
  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([activeListQuery.refetch(), followCountsQuery.refetch()]);
  }, [refetchAll, activeListQuery, followCountsQuery]);

  const streak = stats?.activeStreak ?? 0;
  const best = stats?.longestStreak ?? 0;
  const active = stats?.activeChallenges ?? 0;
  const done = stats?.completedChallenges ?? 0;

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak) ?? null;
  const nextBadgeIn = nextMilestone === null ? null : nextMilestone - streak;

  const handleShareStreak = useCallback(async () => {
    if (streak <= 0) return;
    try {
      await sharePlainMessage(`${streak} day streak on GRIIT 🔥`);
    } catch {
      // Swallow: user cancellation is not an error path.
    }
  }, [streak]);

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
    [router]
  );

  const navigateMiniCompletedChallenge = useCallback(
    (id: string) => {
      setMiniCompletedSheetOpen(false);
      router.push(ROUTES.CHALLENGE_ACTIVE(id) as never);
    },
    [router]
  );

  const noopMiniStatsNavigate = useCallback(() => {}, []);

  // TODO(profile-v2): replace with profileQuery.data.activeChallenges
  const stubActiveChallengeRows = useMemo(
    (): {
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }[] => [
      {
        id: "morning-workout",
        title: "Morning workout",
        subtitle: "Day 1 of 21",
        joinedCount: 1284,
        iconBg: DS_COLORS.ACCENT_TINT,
        iconColor: DS_COLORS.ACCENT,
        iconName: "target",
      },
      {
        id: "morning-prayer",
        title: "5-Minute Morning Prayer",
        subtitle: "Day 3 of 30",
        joinedCount: 3041,
        iconBg: DS_COLORS.ACCENT_GREEN_BG,
        iconColor: DS_COLORS.GREEN,
        iconName: "sun",
      },
    ],
    []
  );

  // TODO(profile-v2): replace with profileQuery.data.completedChallenges
  const stubCompletedChallengeRows = useMemo(
    (): {
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }[] => [
      {
        id: "hydration-push",
        title: "Hydration streak",
        subtitle: "Finished May 1, 2026",
        joinedCount: 812,
        finishedCount: 540,
        iconBg: DS_COLORS.CATEGORY_PEACH,
        iconColor: DS_COLORS.DISCOVER_CORAL,
        iconName: "droplet",
      },
      {
        id: "sleep-reset",
        title: "Sleep reset challenge",
        subtitle: "Finished Apr 26, 2026",
        joinedCount: 1902,
        finishedCount: 1201,
        iconBg: DS_COLORS.ONBOARDING_ACCENT_LIGHT,
        iconColor: DS_COLORS.TEXT_PRIMARY,
        iconName: "bed",
      },
      {
        id: "daily-read",
        title: "12 pages daily",
        subtitle: "Finished Apr 12, 2026",
        joinedCount: 4033,
        finishedCount: 2200,
        iconBg: DS_COLORS.WARNING_BG,
        iconColor: DS_COLORS.WARNING,
        iconName: "book",
      },
      {
        id: "green-walk",
        title: "10k steps green week",
        subtitle: "Finished Mar 29, 2026",
        joinedCount: 5120,
        finishedCount: 3300,
        iconName: "leaf",
        iconBg: DS_COLORS.ACCENT_GREEN_BG,
        iconColor: DS_COLORS.ACCENT_GREEN,
      },
      {
        id: "trail-sprint",
        title: "Weekend warrior",
        subtitle: "Finished Feb 13, 2026",
        joinedCount: 2877,
        finishedCount: 1900,
        iconBg: DS_COLORS.SUGGESTED_CARD_ACCENT_LIFESTYLE,
        iconColor: DS_COLORS.CATEGORY_DISCIPLINE,
        iconName: "walk",
      },
    ],
    []
  );

  // TODO(profile-v2): replace with checkinsQuery.data
  // Real 30-day check-in heatmap. Falls back to all-zero levels while loading
  // so day-0 users do not see fake orange activity.
  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    if (heatmapQuery.data?.days) return heatmapQuery.data.days;
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      level: 0 as const,
    }));
  }, [heatmapQuery.data]);

  // Top active challenge for the swipe-to-clear strip (self view only).
  // Semantic: "current challenge at a glance," NOT "incomplete today" — that
  // would require a second fan-out to getTodayCheckinsForUser, deferred to a
  // follow-up where incompleteChallenges can be lifted to useApp() context.
  const topInProgressTask = useMemo(() => {
    if (mode !== 'self') return null;
    const rows = (activeListQuery.data ?? []) as ActiveRow[];
    const first = rows[0];
    if (!first) return null;
    const title = first.challenges?.title ?? "Challenge";
    const currentDay = first.current_day ?? 1;
    const totalDays = first.challenges?.duration_days ?? 1;
    return {
      taskName: title,
      dayOfTotal: `Day ${currentDay} of ${totalDays}`,
    };
  }, [mode, activeListQuery.data]);

  // TODO(profile-v2): replace with postsQuery.data (new endpoint)
  const profileV2PostsStub = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: `profile-v2-post-${i + 1}`,
        imageUrl: `https://picsum.photos/seed/grit-${i + 101}/320/400`,
        challengeTitle: ["Morning Lift", "Run Club", "Prayer Pace", "Journal Jam", "Cold Plunge", "Hydration", "Macros", "Steps", "Read"][i] ?? `Challenge ${i + 1}`,
        dayOfTotal:
          ["Day 1 of 21", "Day 7 of 30", "Day 3 of 30", "Day 12 of 14", "Day 20 of 30", "Day 4 of 10", "Day 15 of 60", "Day 9 of 21", "Day 11 of 40"][i] ??
          `Day ${i + 2} of 21`,
      })),
    []
  );

  // Real badges from profiles.getBadges. Maps procedure shape -> BadgeGridRow.
  // Procedure returns icon names in PascalCase ("Zap"); BadgesGrid ICONS map
  // keys are lowercase, so we lowercase here. Cap to 6 to match prior grid size.
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

  const handleShare = useCallback(async () => {
    if (!profile?.username) return;
    trackEvent("share_tapped", { content_type: "profile" });
    await shareProfile({
      username: profile.username,
      streak,
      totalDaysSecured: stats?.totalDaysSecured ?? 0,
      tier: stats?.tier ?? "Starter",
    });
  }, [profile?.username, streak, stats?.totalDaysSecured, stats?.tier]);

  /** Picker + FormData upload (`lib/uploadAvatar`) + `profiles.update` + context refetch. */
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
      captureError(e, "ProfileAvatarPick");
      setAvatarInlineError("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  }, [user?.id, qc, refetchAll]);

  const emailLocal = user?.email?.includes("@") ? user.email.split("@")[0] : undefined;
  const primaryLine = profile ? profilePrimaryName(profile, emailLocal) : "";
  const handleAt = profile ? profileHandleAt(profile) : null;
  const showHandleRow = (() => {
    if (!profile || !handleAt) return false;
    const dn = profile.display_name?.trim();
    const un = profile.username?.trim();
    if (!dn || !un) return false;
    return dn !== un;
  })();
  const avatarUri = profile ? (avatarDisplayOverride ?? profile.avatar_url)?.trim() ?? "" : "";
  const listUsername = profile ? profile.username?.trim() || primaryLine : "";
  const fc = followCountsQuery.data;

  type ProfileActiveChallengeRow = {
    id: string;
    challengeId: string;
    title: string;
    currentDay: number;
    durationDays: number;
    progressPercent: number;
  };

  const keyExtractorProfileRoot = useCallback((item: { key: string }) => item.key, []);
  const keyExtractorActiveChallenge = useCallback((item: ProfileActiveChallengeRow) => item.id, []);

  const renderActiveChallengeItem = useCallback(
    ({ item }: { item: ProfileActiveChallengeRow }) => {
      const p = item.progressPercent;
      const fillColor = p < 50 ? DS_COLORS.PRIMARY : DS_COLORS.PROFILE_SUCCESS;
      const a11yLabel =
        p === 100
          ? `Open challenge ${item.title}, complete`
          : p > 0
            ? `Open challenge ${item.title}, ${p} percent complete`
            : `Open challenge ${item.title}`;
      return (
        <TouchableOpacity accessibilityRole="button"
          style={styles.chCard}
          onPress={() => router.push(ROUTES.CHALLENGE_ACTIVE(item.id) as never)}
          accessibilityLabel={a11yLabel}
        >
          <View style={styles.chTop}>
            <View style={styles.chIconBox}>
              <CheckCircle size={18} color={DS_COLORS.PROFILE_STAT_TEAL_ICON} strokeWidth={2} />
            </View>
            <View style={styles.chMid}>
              <Text style={styles.chTitle}>{item.title}</Text>
              <Text style={styles.chSub}>
                {p === 100 ? "Complete" : `Day ${item.currentDay} of ${item.durationDays}`}
              </Text>
            </View>
            {p > 0 ? (
              <Text
                style={[
                  styles.chPctBadge,
                  { color: p === 100 ? DS_COLORS.PROFILE_SUCCESS : DS_COLORS.PRIMARY },
                ]}
              >
                {p === 100 ? "Done" : `${p}%`}
              </Text>
            ) : null}
            <ChevronRight size={16} color={DS_COLORS.PROFILE_TEXT_MUTED} />
          </View>
          <View style={styles.chTrack}>
            <View style={[styles.chFill, { width: `${p}%`, backgroundColor: fillColor }]} />
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  const profileRootContent = useMemo(
    () => {
      if (!profile || !user?.id) {
        return <View />;
      }

      const profileContentUnlocked =
        mode === 'self' || mode === 'public' || mode === 'friends-allowed';

      // Tier from stats (self view only). Other modes hide the chip per privacy
      // until viewer-visible tier exposure is decided in a follow-up.
      const tierLabel =
        mode === 'self' ? (stats?.tier ?? "Starter") : "";

      return (
      <View>
        {mode === 'self' ? (
          <View style={styles.topBar}>
            <View style={{ width: 22 }} />
            <TouchableOpacity accessibilityRole="button"
              onPress={() => router.push(ROUTES.SETTINGS as never)}
              accessibilityLabel="Open settings"
              hitSlop={10}
            >
              <Settings size={22} color={DS_COLORS.PROFILE_TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.topBarPreview}>
            <View style={{ width: 54 }} accessibilityElementsHidden />
            <Text style={styles.topBarPreviewTitle} accessibilityRole="header" numberOfLines={1}>
              {primaryLine.trim() || listUsername}
            </Text>
            <View style={styles.topBarPreviewTrail}>
              {mode === 'public' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Follow profile preview stub"
                  onPress={() => {
                    /* TODO(profile-v2): wire follow mutation */
                  }}
                  style={styles.previewTrailBtn}
                >
                  <Text style={styles.previewTrailBtnTxt}>Follow</Text>
                </Pressable>
              ) : null}
              {mode === 'friends-allowed' ? (
                <Text accessibilityRole="text" accessibilityLabel="Following preview stub" style={styles.previewFollowingTxt}>
                  Following
                </Text>
              ) : null}
              {mode === 'friends-blocked' ? (
                <View style={{ width: 54 }} accessibilityElementsHidden />
              ) : null}
              {mode === 'private' ? (
                <View style={{ width: 54 }} accessibilityElementsHidden />
              ) : null}
            </View>
          </View>
        )}

        {avatarInlineError ? (
          <TouchableOpacity
            style={styles.avatarErrorBanner}
            accessibilityRole="alert"
            accessibilityLabel={avatarInlineError}
            accessibilityHint={
              avatarInlineError.includes("Settings") ? "Tap to open Settings" : undefined
            }
            onPress={() => {
              if (avatarInlineError.includes("Settings")) {
                Linking.openSettings();
              }
            }}
            activeOpacity={avatarInlineError.includes("Settings") ? 0.7 : 1}
          >
            <Text style={styles.avatarErrorText}>{avatarInlineError}</Text>
            {avatarInlineError.includes("Settings") ? (
              <Text style={styles.avatarErrorLink}>Tap to open Settings →</Text>
            ) : null}
          </TouchableOpacity>
        ) : null}

        {__DEV__ ? (
          <View
            style={styles.devProfilePreviewBar}
            accessibilityLabel="Developer profile preview mode switcher"
          >
            {([
              ["self", "Self"],
              ["public", "Pub"],
              ["friends-allowed", "Fri ✓"],
              ["friends-blocked", "Blocked"],
              ["private", "Pvt"],
            ] as readonly [ProfileV2Mode, string][]).map(([value, lbl]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === value }}
                accessibilityLabel={`Preview as ${value}`}
                hitSlop={6}
                onPress={() => setProfileV2PreviewMode(value)}
                style={[styles.devProfilePreviewChip, mode === value && styles.devProfilePreviewChipOn]}
              >
                <Text style={[styles.devProfilePreviewChipTxt, mode === value && styles.devProfilePreviewChipTxtOn]}>
                  {lbl}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.profileRow}>
          <View style={styles.avatarCol}>
            {mode === 'self' ? (
              <Pressable accessibilityRole="button"
                onPress={() => void handleAvatarPress()}
                disabled={uploading}
                accessibilityLabel="Change profile photo"
              >
                <View pointerEvents="none">
                  <Avatar
                    url={avatarUri.trim() ? avatarUri : null}
                    name={primaryLine}
                    userId={user.id}
                    size={64}
                  />
                </View>
                <View style={styles.cameraBadge}>
                  {uploading ? (
                    <Text style={styles.cameraBadgeText}>…</Text>
                  ) : (
                    <Camera size={12} color={DS_COLORS.WHITE} strokeWidth={2} />
                  )}
                </View>
              </Pressable>
            ) : (
              <View accessibilityRole="image" accessibilityLabel={`Profile photo for ${primaryLine.trim()}`}>
                <Avatar
                  url={avatarUri.trim() ? avatarUri : null}
                  name={primaryLine}
                  userId={user.id}
                  size={64}
                />
              </View>
            )}
          </View>
          <View style={styles.textCol}>
            <Text style={styles.username}>{primaryLine}</Text>
            <View style={styles.handleTierRow}>
              {showHandleRow && handleAt ? <Text style={styles.handleCompact}>{handleAt}</Text> : null}
              {profileContentUnlocked && tierLabel ? (
                <View style={styles.v2TierChip}>
                  <Text style={styles.v2TierChipText}>{tierLabel}</Text>
                </View>
              ) : null}
            </View>
            {profileContentUnlocked ? (
              <View style={styles.followRowCompact}>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.followInlineBtn}
                  onPress={() => router.push(ROUTES.FOLLOW_LIST(user.id, "followers", listUsername) as never)}
                  accessibilityLabel="View followers"
                >
                  <Text style={styles.followCompactNum}>{fc?.followers ?? 0}</Text>
                  <Text style={styles.followCompactLbl}> followers</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                  style={styles.followInlineBtn}
                  onPress={() => router.push(ROUTES.FOLLOW_LIST(user.id, "following", listUsername) as never)}
                  accessibilityLabel="View following"
                >
                  <Text style={styles.followCompactNum}>{fc?.following ?? 0}</Text>
                  <Text style={styles.followCompactLbl}> following</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <View style={styles.identityIconStack}>
            {mode === 'self' ? (
              <TouchableOpacity accessibilityRole="button"
                style={styles.identityIconSq}
                onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
                accessibilityLabel="Edit profile"
                hitSlop={6}
              >
                <Pencil size={16} color={DS_COLORS.PROFILE_TEXT_PRIMARY} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
            {profileContentUnlocked ? (
              <TouchableOpacity accessibilityRole="button"
                style={styles.identityIconSq}
                onPress={() => void handleShare()}
                accessibilityLabel="Share profile"
                hitSlop={6}
              >
                <Share2 size={16} color={DS_COLORS.PROFILE_TEXT_PRIMARY} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {profileContentUnlocked ? (
          <>
            <StreakHero
              streakDays={streak}
              bestStreak={best}
              nextBadgeIn={nextBadgeIn}
              onShare={() => void handleShareStreak()}
            />

            {mode === 'self' && topInProgressTask ? (
              <TodayTaskStrip
                taskName={topInProgressTask.taskName}
                dayOfTotal={topInProgressTask.dayOfTotal}
                onClear={() => {
                  /* TODO(profile-v2): wire to checkin mutation in follow-up PR */
                }}
                onTap={() => {
                  /* TODO(profile-v2): navigate to task flow in follow-up PR */
                }}
              />
            ) : null}

            <MiniStats
              bestStreak={best}
              activeCount={active}
              completedCount={done}
              onTapActive={
                mode === 'self'
                  ? () => setMiniActiveSheetOpen(true)
                  : noopMiniStatsNavigate
              }
              onTapCompleted={
                mode === 'self'
                  ? () => setMiniCompletedSheetOpen(true)
                  : noopMiniStatsNavigate
              }
            />

            <StreakHeatmap days={heatmapDays} />

            <View style={styles.tabsBar}>
              <Pressable
                accessibilityRole="tab"
                style={[styles.tabBtn, tab === "challenges" && styles.tabBtnOn]}
                onPress={() => setTab("challenges")}
                accessibilityState={{ selected: tab === "challenges" }}
                accessibilityLabel="Challenges tab"
              >
                <View style={styles.tabInner}>
                  <Target
                    size={18}
                    color={tab === "challenges" ? DS_COLORS.ACCENT : DS_COLORS.TEXT_MUTED}
                    strokeWidth={2}
                  />
                  <Text style={[styles.tabTxt, tab === "challenges" ? styles.tabTxtOn : styles.tabTxtOff]}>Challenges</Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                style={[styles.tabBtn, tab === "posts" && styles.tabBtnOn]}
                onPress={() => setTab("posts")}
                accessibilityState={{ selected: tab === "posts" }}
                accessibilityLabel="Posts tab"
              >
                <View style={styles.tabInner}>
                  <LayoutGrid
                    size={18}
                    color={tab === "posts" ? DS_COLORS.ACCENT : DS_COLORS.TEXT_MUTED}
                    strokeWidth={2}
                  />
                  <Text style={[styles.tabTxt, tab === "posts" ? styles.tabTxtOn : styles.tabTxtOff]}>Posts</Text>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="tab"
                style={[styles.tabBtn, tab === "badges" && styles.tabBtnOn]}
                onPress={() => setTab("badges")}
                accessibilityState={{ selected: tab === "badges" }}
                accessibilityLabel="Badges tab"
              >
                <View style={styles.tabInner}>
                  <Award
                    size={18}
                    color={tab === "badges" ? DS_COLORS.ACCENT : DS_COLORS.TEXT_MUTED}
                    strokeWidth={2}
                  />
                  <Text style={[styles.tabTxt, tab === "badges" ? styles.tabTxtOn : styles.tabTxtOff]}>Badges</Text>
                </View>
              </Pressable>
            </View>

            {tab === "challenges" ? (
              <View style={styles.tabPad}>
                {activeItems.length === 0 ? (
                  <Text style={styles.emptyHint}>No active challenges. Discover one to get started.</Text>
                ) : (
                  <FlatList
                    data={activeItems}
                    keyExtractor={keyExtractorActiveChallenge}
                    scrollEnabled={false}
                    nestedScrollEnabled
                    contentContainerStyle={styles.chListContent}
                    renderItem={renderActiveChallengeItem}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    initialNumToRender={8}
                    removeClippedSubviews={Platform.OS === "android"}
                  />
                )}
              </View>
            ) : null}

            {tab === "posts" ? (
              <PostsGrid
                posts={profileV2PostsStub}
                onSelect={(postId) => {
                  void postId;
                  // TODO(profile-v2): open v4 post card navigation
                }}
              />
            ) : null}

            {tab === "badges" ? (
              <BadgesGrid badges={badgeRows} onBadgePress={(payload) => setSelectedBadge(payload)} />
            ) : null}
          </>
        ) : (
          <View style={styles.restrictedProfileCard}>
            {mode === 'private' ? (
              <>
                <Text style={styles.restrictedProfileTitle}>This account is private</Text>
                {/* TODO(profile-v2): derive copy from follower / request API */}
                <Text style={styles.restrictedProfileBody}>
                  Requests and approvals ship with the follower flow.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Request to follow preview stub"
                  style={styles.restrictedPrimaryBtn}
                  onPress={() => {
                    /* TODO(profile-v2): request follow mutation */
                  }}
                >
                  <Text style={styles.restrictedPrimaryBtnTxt}>Request to follow</Text>
                </Pressable>
              </>
            ) : null}
            {mode === 'friends-blocked' ? (
              <>
                <Text style={styles.restrictedProfileTitle}>Profile unavailable</Text>
                <Text style={styles.restrictedProfileBody}>
                  You cannot view posts and activity for this profile.
                </Text>
              </>
            ) : null}
          </View>
        )}

        <View style={{ height: 32 }} />
      </View>
      );
    },
    [
      profile,
      user?.id,
      avatarInlineError,
      avatarUri,
      primaryLine,
      showHandleRow,
      handleAt,
      fc,
      listUsername,
      mode,
      router,
      noopMiniStatsNavigate,
      handleAvatarPress,
      uploading,
      handleShare,
      streak,
      best,
      nextBadgeIn,
      handleShareStreak,
      active,
      done,
      stats?.tier,
      heatmapDays,
      topInProgressTask,
      tab,
      setTab,
      setMiniActiveSheetOpen,
      setMiniCompletedSheetOpen,
      setProfileV2PreviewMode,
      activeItems,
      profileV2PostsStub,
      badgeRows,
      keyExtractorActiveChallenge,
      renderActiveChallengeItem,
    ]
  );

  const renderProfileRootItem = useCallback(() => profileRootContent, [profileRootContent]);

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <Card containerStyle={{ width: "100%" }}>
            <Text style={styles.guestTitle}>Sign in to view your profile</Text>
            <Text style={styles.guestSub}>Track streaks, rank, and activity in one place.</Text>
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
        <View style={[styles.centerGuest, { paddingHorizontal: 24 }]}>
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

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={[{ key: "profile-root" }]}
        keyExtractor={keyExtractorProfileRoot}
        renderItem={renderProfileRootItem}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.PRIMARY} />}
        contentContainerStyle={styles.scroll}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={1}
        removeClippedSubviews={false}
      />
      <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <ChallengeListSheet
        visible={miniActiveSheetOpen}
        title="Active challenges"
        items={stubActiveChallengeRows}
        onClose={() => setMiniActiveSheetOpen(false)}
        onSelect={navigateMiniActiveChallenge}
      />
      <ChallengeListSheet
        visible={miniCompletedSheetOpen}
        title="Completed challenges"
        items={stubCompletedChallengeRows}
        onClose={() => setMiniCompletedSheetOpen(false)}
        onSelect={navigateMiniCompletedChallenge}
      />
    </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  scroll: { paddingBottom: 24, backgroundColor: DS_COLORS.BG_PAGE },
  centerGuest: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  guestTitle: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, textAlign: "center" },
  guestSub: { marginTop: 8, fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED, textAlign: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 6,
  },
  topBarPreviewTitle: {
    flex: 1,
    flexShrink: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: DS_COLORS.PROFILE_TEXT_PRIMARY,
  },
  topBarPreviewTrail: {
    minWidth: 58,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  previewTrailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: DS_RADIUS.SM,
  },
  previewTrailBtnTxt: { fontSize: 13, fontWeight: "700", color: DS_COLORS.ACCENT },
  previewFollowingTxt: { fontSize: 12, fontWeight: "600", color: DS_COLORS.PROFILE_TEXT_SECONDARY },

  devProfilePreviewBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginBottom: DS_SPACING.sm,
  },
  devProfilePreviewChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    borderColor: DS_COLORS.PROFILE_BORDER_ALT,
    backgroundColor: DS_COLORS.BG_CARD,
  },
  devProfilePreviewChipOn: {
    borderColor: DS_COLORS.ACCENT,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  devProfilePreviewChipTxt: {
    fontSize: 11,
    fontWeight: "600",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
  },
  devProfilePreviewChipTxtOn: { color: DS_COLORS.ACCENT },

  restrictedProfileCard: {
    marginHorizontal: DS_SPACING.screenHorizontal,
    marginTop: DS_SPACING.md,
    padding: DS_SPACING.md,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.BG_CARD,
    gap: 10,
    alignItems: "center",
  },
  restrictedProfileTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: DS_COLORS.PROFILE_TEXT_PRIMARY,
    textAlign: "center",
  },
  restrictedProfileBody: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 18,
  },
  restrictedPrimaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: DS_SPACING.lg,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.ACCENT,
  },
  restrictedPrimaryBtnTxt: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_ON_ACCENT },
  avatarErrorBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.dangerLight,
    borderWidth: 1,
    borderColor: DS_COLORS.alertRedBorder,
  },
  avatarErrorText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.dangerDark, textAlign: "center" },
  avatarErrorLink: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.DISCOVER_CORAL,
    textAlign: "center",
    marginTop: 4,
  },
  profileRow: { flexDirection: "row", paddingHorizontal: 20, gap: 14, alignItems: "flex-start" },
  avatarCol: { position: "relative" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DS_COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: DS_COLORS.BG_PAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadgeText: { color: DS_COLORS.WHITE, fontSize: 12 },
  textCol: { flex: 1, minWidth: 0 },
  username: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, letterSpacing: -0.3 },
  handleTierRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  handleCompact: { fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY },
  v2TierChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.ACCENT,
    alignSelf: "flex-start",
  },
  v2TierChipText: {
    fontSize: 9,
    fontWeight: "700",
    color: DS_COLORS.TEXT_ON_ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  followRowCompact: { flexDirection: "row", gap: 12, marginTop: 6 },
  followInlineBtn: { flexDirection: "row", alignItems: "baseline" },
  followCompactNum: { fontSize: 12, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  followCompactLbl: { fontSize: 12, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY },
  identityIconStack: { gap: 8, marginTop: 2 },
  identityIconSq: {
    width: 32,
    height: 32,
    borderRadius: DS_RADIUS.SM,
    borderWidth: 1,
    borderColor: DS_COLORS.PROFILE_BORDER_ALT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.BG_CARD,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statGridCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.MD,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statGridIconWrap: {
    width: 32,
    height: 32,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
    justifyContent: "center",
  },
  statGridNum: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, lineHeight: 22 },
  statGridLbl: { fontSize: 10, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED },
  tabsBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: DS_COLORS.PROFILE_BORDER_ALT,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabInner: { alignItems: "center", gap: 6 },
  tabBtnOn: { borderBottomWidth: 2, borderBottomColor: DS_COLORS.ACCENT, marginBottom: -1.5 },
  tabTxt: { fontSize: 13 },
  tabTxtOn: { fontWeight: "500", color: DS_COLORS.ACCENT },
  tabTxtOff: { fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED },
  tabPad: { paddingHorizontal: 20, paddingTop: 14, gap: 12 },
  chListContent: { gap: 12 },
  emptyHint: { fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, textAlign: "center", paddingVertical: 16 },
  chCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    padding: 16,
    paddingBottom: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  chTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  chIconBox: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.PROFILE_STAT_TEAL_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  chMid: { flex: 1, minWidth: 0 },
  chTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  chSub: { fontSize: 12, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, marginTop: 2 },
  chTrack: { height: 4, borderRadius: DS_RADIUS.SM, backgroundColor: DS_COLORS.PROFILE_BORDER_ALT, marginTop: 12, overflow: "hidden" },
  chFill: { height: 4, borderRadius: DS_RADIUS.SM },
  chPctBadge: { fontSize: 13, fontWeight: "500", flexShrink: 0 },
});
