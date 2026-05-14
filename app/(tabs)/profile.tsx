// NOTE(post-launch): Add "Drafts" section — filter challenges where status === 'draft' && creator_id === user.id
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Zap,
  CheckCircle,
  ChevronRight,
  Pencil,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { shareProfile } from "@/lib/share";
import { pickAndUploadAvatar } from "@/lib/avatar";
import { captureError } from "@/lib/sentry";
import { Avatar } from "@/components/Avatar";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { SkeletonProfile } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import Card from "@/components/shared/Card";
import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
import { profilePrimaryName, profileHandleAt } from "@/lib/profile-display";
import { BADGE_ICONS, badgeAccentFor } from "@/lib/profile-badges";
import { BadgeDetailModal, type BadgeDetailPayload } from "@/components/profile/BadgeDetailModal";
import { StreakHero } from "@/components/profile/StreakHero";
import { TodayTaskStrip } from "@/components/profile/TodayTaskStrip";
import { MiniStats } from "@/components/profile/MiniStats";
import {
  ChallengeListSheet,
  type ChallengeListSheetIconName,
} from "@/components/profile/ChallengeListSheet";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ProfileTab = "challenges" | "posts" | "badges";

type ProfileV2Mode = "self" | "public" | "friends-allowed" | "friends-blocked" | "private";

const RESPECT_DEBOUNCE_MS = 300;

type ActiveRow = {
  id: string;
  current_day?: number;
  progress_percent?: number;
  challenges?: { id?: string; title?: string; duration_days?: number };
};

type BadgeDef = {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  total: number;
  type?: string;
};

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
  const respectLastAtProfile = useRef<Map<string, number>>(new Map());

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

  const postsQuery = useQuery({
    queryKey: ["profile", user?.id, "userPosts"],
    queryFn: () => trpcQuery(TRPC.feed.getUserPosts, { userId: user!.id, limit: 30 }) as Promise<{ posts: LiveFeedPost[] }>,
    enabled: !isGuest && !!user?.id && tab === "posts",
    staleTime: 60 * 1000,
  });

  const badgesQuery = useQuery({
    queryKey: ["profile", user?.id, "badges"],
    queryFn: () => trpcQuery(TRPC.profiles.getBadges, { userId: user!.id }) as Promise<{ earned: BadgeDef[]; next: BadgeDef[] }>,
    enabled: !isGuest && !!user?.id && tab === "badges",
    staleTime: 60 * 1000,
  });

  const refreshing =
    activeListQuery.isRefetching || followCountsQuery.isRefetching || postsQuery.isRefetching || badgesQuery.isRefetching;
  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([
      activeListQuery.refetch(),
      followCountsQuery.refetch(),
      postsQuery.refetch(),
      badgesQuery.refetch(),
    ]);
  }, [refetchAll, activeListQuery, followCountsQuery, postsQuery, badgesQuery]);

  const streak = stats?.activeStreak ?? 0;
  const best = stats?.longestStreak ?? 0;
  const active = stats?.activeChallenges ?? 0;
  const done = stats?.completedChallenges ?? 0;

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

  // TODO(profile-v2): replace with profileQuery.data.activeChallenges
  const stubActiveChallengeRows = useMemo(
    (): Array<{
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }> => [
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
    (): Array<{
      id: string;
      title: string;
      subtitle: string;
      joinedCount: number;
      finishedCount?: number;
      iconBg: string;
      iconColor: string;
      iconName: ChallengeListSheetIconName;
    }> => [
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

  const onPostRespect = useCallback(
    async (post: LiveFeedPost) => {
      if (!user?.id) return;
      const now = Date.now();
      const last = respectLastAtProfile.current.get(post.id) ?? 0;
      if (now - last < RESPECT_DEBOUNCE_MS) return;
      respectLastAtProfile.current.set(post.id, now);

      const prevR = post.reactedByMe;
      const prevC = post.respectCount;
      const nextC = Math.max(0, prevC + (prevR ? -1 : 1));
      qc.setQueryData(["profile", user.id, "userPosts"], (old: { posts: LiveFeedPost[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((p) => (p.id === post.id ? { ...p, reactedByMe: !prevR, respectCount: nextC } : p)),
        };
      });
      try {
        const result = (await trpcMutate(TRPC.feed.react, { eventId: post.id })) as {
          reacted?: boolean;
          reactionCount?: number;
        };
        qc.setQueryData(["profile", user.id, "userPosts"], (old: { posts: LiveFeedPost[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p) =>
              p.id === post.id
                ? { ...p, reactedByMe: !!result.reacted, respectCount: Math.max(0, result.reactionCount ?? nextC) }
                : p
            ),
          };
        });
        await qc.invalidateQueries({ queryKey: ["liveFeed"] });
      } catch (e) {
        captureError(e, "ProfileTabRespect");
        qc.setQueryData(["profile", user.id, "userPosts"], (old: { posts: LiveFeedPost[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p) => (p.id === post.id ? { ...p, reactedByMe: prevR, respectCount: prevC } : p)),
          };
        });
      }
    },
    [user?.id, qc]
  );

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
  // TODO(profile-v2): derive from auth context + route param
  const isOwnProfile = true;
  // TODO(profile-v2): derive from route param + profile_visibility + mutual follow checks
  const profileV2ModeStub: ProfileV2Mode = "self";

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
  const keyExtractorPost = useCallback((post: LiveFeedPost) => post.id, []);
  const keyExtractorBadge = useCallback((b: BadgeDef) => b.id, []);

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
          onPress={() => item.challengeId && router.push(ROUTES.CHALLENGE_ID(item.challengeId) as never)}
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

  const renderProfilePostRow = useCallback(
    ({ item: post }: { item: LiveFeedPost }) => (
      <FeedPostCard
        post={post}
        onProfilePress={() => router.push(ROUTES.TABS_PROFILE as never)}
        onRespect={() => void onPostRespect(post)}
        onComment={() => router.push(ROUTES.POST_ID(post.id) as never)}
        onShare={() => {}}
      />
    ),
    [router, onPostRespect]
  );

  const renderEarnedBadgeItem = useCallback(
    ({ item: b }: { item: BadgeDef }) => {
      const IconComp = BADGE_ICONS[b.icon] ?? Zap;
      const accent = badgeAccentFor(b.color);
      return (
        <Pressable accessibilityRole="button"
          style={styles.badgeCard}
          onPress={() =>
            setSelectedBadge({
              id: b.id,
              name: b.name,
              icon: b.icon,
              color: b.color,
              progress: b.progress,
              total: b.total,
            })
          }
          accessibilityLabel={`${b.name} badge details`}
        >
          <View style={[styles.badgeIconOuter, { backgroundColor: accent.bg }]}>
            <IconComp size={22} color={accent.stroke} strokeWidth={2} />
          </View>
          <Text style={styles.badgeName}>{b.name}</Text>
          <Text style={styles.badgeProg}>
            {b.progress}/{b.total} {b.total === 1 ? "day" : "days"}
          </Text>
        </Pressable>
      );
    },
    [setSelectedBadge]
  );

  const renderNextBadgeItem = useCallback(
    ({ item: b }: { item: BadgeDef }) => {
      const NextIcon = BADGE_ICONS[b.icon] ?? Zap;
      return (
        <Pressable accessibilityRole="button"
          style={[styles.badgeCard, styles.badgeCardDim]}
          onPress={() =>
            setSelectedBadge({
              id: b.id,
              name: b.name,
              icon: b.icon,
              color: b.color,
              progress: b.progress,
              total: b.total,
            })
          }
          accessibilityLabel={`${b.name} badge details`}
        >
          <View style={[styles.badgeIconOuter, { backgroundColor: DS_COLORS.PROFILE_NEXT_BADGE_BG }]}>
            <NextIcon size={22} color={DS_COLORS.PROFILE_TEXT_MUTED} strokeWidth={2} />
          </View>
          <Text style={styles.badgeName}>{b.name}</Text>
          <Text style={styles.badgeProg}>
            {b.progress}/{b.total} {b.total === 1 ? "day" : "days"}
          </Text>
          <View style={styles.nextBarTrack}>
            <View style={[styles.nextBarFill, { width: `${Math.min(100, (b.progress / Math.max(1, b.total)) * 100)}%` }]} />
          </View>
        </Pressable>
      );
    },
    [setSelectedBadge]
  );

  const profileRootContent = useMemo(
    () => {
      if (!profile || !user?.id) {
        return <View />;
      }
      // TODO(profile-v2): wire tier from profile.tier once tier system ships
      const profileV2TierStub = "Builder";
      return (
      <View>
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

        <View style={styles.profileRow}>
          <View style={styles.avatarCol}>
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
          </View>
          <View style={styles.textCol}>
            <Text style={styles.username}>{primaryLine}</Text>
            <View style={styles.handleTierRow}>
              {showHandleRow && handleAt ? <Text style={styles.handleCompact}>{handleAt}</Text> : null}
              <View style={styles.v2TierChip}>
                <Text style={styles.v2TierChipText}>{profileV2TierStub}</Text>
              </View>
            </View>
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
          </View>
          <View style={styles.identityIconStack}>
            <TouchableOpacity accessibilityRole="button"
              style={styles.identityIconSq}
              onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
              accessibilityLabel="Edit profile"
              hitSlop={6}
            >
              <Pencil size={16} color={DS_COLORS.PROFILE_TEXT_PRIMARY} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button"
              style={styles.identityIconSq}
              onPress={() => void handleShare()}
              accessibilityLabel="Share profile"
              hitSlop={6}
            >
              <Share2 size={16} color={DS_COLORS.PROFILE_TEXT_PRIMARY} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TODO(profile-v2): replace stubbed streak values with profileQuery.data */}
        <StreakHero
          streakDays={7}
          bestStreak={23}
          nextBadgeIn={1}
          onShare={() => {
            /* TODO(profile-v2): wire share */
          }}
        />

        {isOwnProfile && profileV2ModeStub === "self" ? (
          <TodayTaskStrip
            taskName="5-Minute Morning Prayer"
            dayOfTotal="Day 3 of 30"
            onClear={() => {
              /* TODO(profile-v2): wire to checkin mutation */
            }}
            onTap={() => {
              /* TODO(profile-v2): navigate to task flow */
            }}
          />
        ) : null}

        <MiniStats
          bestStreak={best}
          activeCount={active}
          completedCount={done}
          onTapActive={() => setMiniActiveSheetOpen(true)}
          onTapCompleted={() => setMiniCompletedSheetOpen(true)}
        />

        <View style={styles.tabsBar}>
          {(["challenges", "posts", "badges"] as const).map((t) => (
            <Pressable accessibilityRole="tab"
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnOn]}
              onPress={() => setTab(t)}
              accessibilityState={{ selected: tab === t }}
              accessibilityLabel={t === "challenges" ? "Challenges tab" : t === "posts" ? "Posts tab" : "Badges tab"}
            >
              <Text style={[styles.tabTxt, tab === t ? styles.tabTxtOn : styles.tabTxtOff]}>
                {t === "challenges" ? "Challenges" : t === "posts" ? "Posts" : "Badges"}
              </Text>
            </Pressable>
          ))}
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
          <View style={styles.tabPad}>
            {postsQuery.isPending ? (
              <Text style={styles.emptyHint}>Loading posts…</Text>
            ) : (postsQuery.data?.posts ?? []).length === 0 ? (
              <View style={styles.postsEmpty}>
                <Text style={styles.postsEmptyTitle}>No posts yet</Text>
                <Text style={styles.postsEmptySub}>Complete a task to share your first post.</Text>
                <TouchableOpacity accessibilityRole="button"
                  onPress={() => router.push(ROUTES.TABS_HOME as never)}
                  accessibilityLabel="Go to my challenges"
                >
                  <Text style={styles.postsEmptyCta}>Go to my challenges →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={postsQuery.data?.posts ?? []}
                keyExtractor={keyExtractorPost}
                scrollEnabled={false}
                nestedScrollEnabled
                renderItem={renderProfilePostRow}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={8}
                removeClippedSubviews={Platform.OS === "android"}
              />
            )}
          </View>
        ) : null}

        {tab === "badges" ? (
          <View style={styles.tabPad}>
            {badgesQuery.isPending ? (
              <Text style={styles.emptyHint}>Loading badges…</Text>
            ) : (
              <>
                <Text style={styles.secHead}>EARNED ({badgesQuery.data?.earned.length ?? 0})</Text>
                <FlatList
                  data={badgesQuery.data?.earned ?? []}
                  keyExtractor={keyExtractorBadge}
                  numColumns={3}
                  scrollEnabled={false}
                  nestedScrollEnabled
                  columnWrapperStyle={styles.badgeGridRow}
                  renderItem={renderEarnedBadgeItem}
                  maxToRenderPerBatch={12}
                  windowSize={5}
                  initialNumToRender={12}
                  removeClippedSubviews={Platform.OS === "android"}
                />
                <Text style={[styles.secHead, { marginTop: 20 }]}>NEXT UP ({badgesQuery.data?.next.length ?? 0})</Text>
                <FlatList
                  data={badgesQuery.data?.next ?? []}
                  keyExtractor={keyExtractorBadge}
                  numColumns={3}
                  scrollEnabled={false}
                  nestedScrollEnabled
                  columnWrapperStyle={styles.badgeGridRow}
                  renderItem={renderNextBadgeItem}
                  maxToRenderPerBatch={12}
                  windowSize={5}
                  initialNumToRender={12}
                  removeClippedSubviews={Platform.OS === "android"}
                />
              </>
            )}
          </View>
        ) : null}

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
      isOwnProfile,
      profileV2ModeStub,
      router,
      handleAvatarPress,
      uploading,
      handleShare,
      streak,
      best,
      active,
      done,
      tab,
      setTab,
      activeItems,
      postsQuery.isPending,
      postsQuery.data?.posts,
      badgesQuery.isPending,
      badgesQuery.data?.earned,
      badgesQuery.data?.next,
      keyExtractorActiveChallenge,
      renderActiveChallengeItem,
      keyExtractorPost,
      renderProfilePostRow,
      keyExtractorBadge,
      renderEarnedBadgeItem,
      renderNextBadgeItem,
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
  tabBtnOn: { borderBottomWidth: 2, borderBottomColor: DS_COLORS.PRIMARY, marginBottom: -1.5 },
  tabTxt: { fontSize: 13 },
  tabTxtOn: { fontWeight: "500", color: DS_COLORS.PRIMARY },
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
  postsEmpty: { alignItems: "center", paddingVertical: 32 },
  postsEmptyTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  postsEmptySub: { fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, marginTop: 6, textAlign: "center", maxWidth: 280 },
  postsEmptyCta: { marginTop: 16, fontSize: 13, fontWeight: "500", color: DS_COLORS.PRIMARY },
  secHead: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeGridRow: { gap: 10, marginBottom: 10 },
  badgeCard: {
    width: "31%",
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  badgeCardDim: { opacity: 0.85 },
  badgeIconOuter: {
    width: 44,
    height: 44,
    borderRadius: DS_RADIUS.iconButton,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeName: { fontSize: 12, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, textAlign: "center" },
  badgeProg: { fontSize: 11, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED, marginTop: 4 },
  nextBarTrack: { width: "100%", height: 3, borderRadius: DS_RADIUS.SM, backgroundColor: DS_COLORS.PROFILE_BORDER_ALT, marginTop: 8, overflow: "hidden" },
  nextBarFill: { height: 3, borderRadius: DS_RADIUS.SM, backgroundColor: DS_COLORS.PRIMARY },
});
