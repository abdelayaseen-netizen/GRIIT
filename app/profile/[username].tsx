/**
 * Public profile (`/profile/[username]`).
 *
 * Composition mirrors the self profile (ProfileHeader + StreakBar + YearHeatmap
 * + tabs) with two visible additions:
 *   - `MutualFollowersRow` between header and stats, when there's overlap.
 *   - 3-dot menu (Copy link / Cancel only) — user-reports / blocking are out of
 *     scope for this PR (the existing reporting endpoint accepts challenge IDs
 *     only, not user IDs).
 *
 * Privacy gating: we hide the bio card, stats, heatmap, and tabs for private
 * accounts the viewer is not following.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
  ActionSheetIOS,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Lock,
  MoreHorizontal,
  Target,
  X,
  Zap,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";

import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { profilePrimaryName } from "@/lib/profile-display";
import { BADGE_ICONS, badgeAccentFor } from "@/lib/profile-badges";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

import { FeedPostCard } from "@/components/feed/FeedPostCard";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import {
  BadgeDetailModal,
  type BadgeDetailPayload,
} from "@/components/profile/BadgeDetailModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StreakBar } from "@/components/profile/StreakBar";
import { YearHeatmap } from "@/components/profile/YearHeatmap";
import { MutualFollowersRow } from "@/components/profile/MutualFollowersRow";

type PublicProfile = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_days_secured: number;
  tier: string;
  active_streak: number;
  longest_streak: number;
  active_challenges_count: number;
  completed_challenges_count: number;
  bio: string | null;
  created_at: string | null;
  profile_visibility: string;
};

type ProfileTab = "challenges" | "posts" | "badges";
type BadgeDef = {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  total: number;
  type?: string;
};

type HeatmapDay = { date: string; level: 0 | 1 | 2 | 3 | 4 };
type HeatmapResponse = { days: HeatmapDay[] };

const RESPECT_DEBOUNCE_MS = 300;

function formatMonthYear(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function PublicProfileScreenInner() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("challenges");
  const [followBusy, setFollowBusy] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetailPayload | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [followActionError, setFollowActionError] = useState<string | null>(null);
  const [androidMenuOpen, setAndroidMenuOpen] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const respectLastAtUserPosts = useRef<Map<string, number>>(new Map());

  const decoded = useMemo(() => {
    const raw = typeof username === "string" ? username : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [username]);

  useEffect(() => {
    if (!followActionError) return;
    const t = setTimeout(() => setFollowActionError(null), 3000);
    return () => clearTimeout(t);
  }, [followActionError]);

  useEffect(() => {
    if (!copyToast) return;
    const t = setTimeout(() => setCopyToast(null), 1800);
    return () => clearTimeout(t);
  }, [copyToast]);

  const profileQuery = useQuery({
    queryKey: ["publicProfile", decoded],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getPublicByUsername, { username: decoded }) as Promise<PublicProfile | null>,
    enabled: !!decoded,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const profile = profileQuery.data ?? null;
  const isLoading = profileQuery.isPending;
  const isError = profileQuery.isError;

  const profileUserId = profile?.user_id ?? "";
  const profileViewTracked = useRef(false);

  useEffect(() => {
    if (
      profile &&
      !profileViewTracked.current &&
      user?.id &&
      profile.user_id !== user.id
    ) {
      profileViewTracked.current = true;
      trackEvent("profile_viewed", { viewed_user_id: profile.user_id });
    }
  }, [profile, user?.id]);

  const followCountsQuery = useQuery({
    queryKey: ["publicProfile", profileUserId, "followCounts"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts, { userId: profileUserId }) as Promise<{
        followers: number;
        following: number;
      }>,
    enabled: !!profileUserId && !!user?.id,
    staleTime: 60 * 1000,
  });

  const followStatusQuery = useQuery({
    queryKey: ["followStatus", profileUserId, user?.id],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowStatus, {
        userId: profileUserId,
      }) as Promise<{ status: string }>,
    enabled: !!profileUserId && !!user?.id && user.id !== profileUserId,
    staleTime: 30 * 1000,
  });

  const blockStatusQuery = useQuery({
    queryKey: ["blockStatus", profileUserId, user?.id],
    queryFn: () =>
      trpcQuery(TRPC.profiles.isBlocked, {
        userId: profileUserId,
      }) as Promise<{ blockedByMe: boolean; blocksMe: boolean }>,
    enabled: !!profileUserId && !!user?.id && user.id !== profileUserId,
    staleTime: 30 * 1000,
  });

  const blockedByMe = blockStatusQuery.data?.blockedByMe ?? false;
  const blocksMe = blockStatusQuery.data?.blocksMe ?? false;
  const blockRelationship = blockedByMe || blocksMe;

  const vis = String(profile?.profile_visibility ?? "public").toLowerCase();
  const needsRequest = vis === "private" || vis === "friends";
  const isFollowing = followStatusQuery.data?.status === "following";
  const isPending = followStatusQuery.data?.status === "pending";
  const profileVisible =
    !!profile &&
    (vis === "public" || isFollowing || (user?.id ? user.id === profile.user_id : false));
  const showPrivateGate = needsRequest && !isFollowing && !isPending;

  const isSelf = !!user?.id && !!profile && user.id === profile.user_id;

  const challengesQuery = useQuery({
    queryKey: ["userChallenges", profileUserId, profileVisible],
    queryFn: () =>
      trpcQuery(TRPC.challenges.getPublicChallenges, {
        userId: profileUserId,
      }) as Promise<unknown[]>,
    enabled: Boolean(profileUserId && user?.id && profileVisible),
    staleTime: 60 * 1000,
  });

  const postsQuery = useQuery<{ posts: LiveFeedPost[] }>({
    queryKey: ["userPosts", profileUserId, tab],
    queryFn: () =>
      trpcQuery(TRPC.feed.getUserPosts, {
        userId: profileUserId,
        limit: 30,
      }) as Promise<{ posts: LiveFeedPost[] }>,
    enabled: Boolean(profileUserId && user?.id && profileVisible && tab === "posts"),
    staleTime: 60 * 1000,
  });

  const badgesQuery = useQuery<{ earned: BadgeDef[]; next: BadgeDef[] }>({
    queryKey: ["userBadges", profileUserId, tab],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getBadges, {
        userId: profileUserId,
      }) as Promise<{ earned: BadgeDef[]; next: BadgeDef[] }>,
    enabled: Boolean(profileUserId && user?.id && profileVisible && tab === "badges"),
    staleTime: 60 * 1000,
  });

  const heatmapQuery = useQuery({
    queryKey: ["publicProfile", profileUserId, "heatmap", 365],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getCheckinHeatmap, {
        userId: profileUserId,
        days: 365,
      }) as Promise<HeatmapResponse>,
    enabled: Boolean(profileUserId && user?.id && profileVisible),
    staleTime: 5 * 60 * 1000,
  });

  const mutualsQuery = useQuery({
    queryKey: ["publicProfile", profileUserId, "mutuals"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getMutualFollowers, {
        targetUserId: profileUserId,
        limit: 3,
      }) as Promise<{ topNames: string[]; totalCount: number }>,
    enabled: Boolean(profileUserId && user?.id && !isSelf),
    staleTime: 60 * 1000,
  });

  const heatmapDays: HeatmapDay[] = useMemo(
    () => heatmapQuery.data?.days ?? [],
    [heatmapQuery.data],
  );
  const heatmapTotalSecured = useMemo(
    () => heatmapDays.filter((d) => d.level > 0).length,
    [heatmapDays],
  );
  const rangeLabels = useMemo(() => {
    const today = new Date();
    const start = new Date(Date.now() - 365 * 86400000);
    return { start: formatMonthYear(start), end: formatMonthYear(today) };
  }, []);

  type ActiveItem = {
    id: string;
    challengeId: string;
    title: string;
    currentDay: number;
    durationDays: number;
    progressPercent: number;
  };

  const activeItems: ActiveItem[] = useMemo(() => {
    const rows = (challengesQuery.data ?? []) as {
      id?: string;
      challenge_id?: string;
      current_day?: number;
      progress_percent?: number;
      challenges?: { id?: string; title?: string; duration_days?: number };
    }[];
    return rows.map((row) => {
      const duration = Math.max(1, row.challenges?.duration_days ?? 1);
      const day = Math.min(duration, Math.max(1, row.current_day ?? 1));
      const rawProgress =
        row.progress_percent != null && !Number.isNaN(Number(row.progress_percent))
          ? Number(row.progress_percent)
          : (day / duration) * 100;
      const progressPercent = Math.max(0, Math.min(100, Math.round(rawProgress)));
      return {
        id: row.id ?? row.challenge_id ?? "",
        challengeId: row.challenges?.id ?? row.challenge_id ?? "",
        title: row.challenges?.title ?? "Challenge",
        currentDay: day,
        durationDays: duration,
        progressPercent,
      };
    });
  }, [challengesQuery.data]);

  const invalidatePublic = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["publicProfile", decoded] });
    await queryClient.invalidateQueries({ queryKey: ["followStatus", profileUserId] });
    await queryClient.invalidateQueries({
      queryKey: ["publicProfile", profileUserId, "followCounts"],
    });
    await queryClient.invalidateQueries({ queryKey: ["userChallenges", profileUserId] });
    await queryClient.invalidateQueries({ queryKey: ["userPosts", profileUserId] });
    await queryClient.invalidateQueries({ queryKey: ["userBadges", profileUserId] });
    await queryClient.invalidateQueries({
      queryKey: ["publicProfile", profileUserId, "mutuals"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["publicProfile", profileUserId, "heatmap", 365],
    });
  }, [queryClient, decoded, profileUserId]);

  const handleConfirmUnfollow = useCallback(async () => {
    if (!profile?.user_id) return;
    setShowUnfollowConfirm(false);
    setFollowBusy(true);
    try {
      await trpcMutate(TRPC.profiles.unfollowUser, { userId: profile.user_id });
      await invalidatePublic();
    } catch (e) {
      captureError(e, "PublicProfileUnfollow");
      setFollowActionError("Could not unfollow. Try again.");
    } finally {
      setFollowBusy(false);
    }
  }, [profile?.user_id, invalidatePublic]);

  const handlePrimaryFollow = useCallback(async () => {
    if (!profile?.user_id || followBusy) return;
    if (!user?.id) {
      router.push(ROUTES.AUTH_LOGIN as never);
      return;
    }
    if (isFollowing) {
      setShowUnfollowConfirm(true);
      return;
    }
    setFollowBusy(true);
    try {
      if (needsRequest) {
        await trpcMutate(TRPC.profiles.sendFollowRequest, { userId: profile.user_id });
      } else {
        await trpcMutate(TRPC.profiles.followUser, { userId: profile.user_id });
      }
      await invalidatePublic();
    } catch (err) {
      captureError(err, "PublicProfileFollow");
      setFollowActionError("Could not update follow. Try again.");
    } finally {
      setFollowBusy(false);
    }
  }, [profile, followBusy, user?.id, router, isFollowing, needsRequest, invalidatePublic]);

  const handleCopyLink = useCallback(async () => {
    if (!profile?.username) return;
    const link = `https://griit.app/u/${profile.username}`;
    try {
      await Clipboard.setStringAsync(link);
      setCopyToast("Link copied");
    } catch (e) {
      captureError(e, "PublicProfileCopyLink");
    }
  }, [profile?.username]);

  const handleConfirmBlock = useCallback(async () => {
    if (!profile?.user_id) return;
    setShowBlockConfirm(false);
    setBlockBusy(true);
    try {
      await trpcMutate(TRPC.profiles.blockUser, { userId: profile.user_id });
      await queryClient.invalidateQueries({ queryKey: ["blockStatus", profile.user_id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      await invalidatePublic();
    } catch (e) {
      captureError(e, "PublicProfileBlock");
      setFollowActionError("Could not block. Try again.");
    } finally {
      setBlockBusy(false);
    }
  }, [profile?.user_id, queryClient, invalidatePublic]);

  const handleUnblock = useCallback(async () => {
    if (!profile?.user_id) return;
    setBlockBusy(true);
    try {
      await trpcMutate(TRPC.profiles.unblockUser, { userId: profile.user_id });
      await queryClient.invalidateQueries({ queryKey: ["blockStatus", profile.user_id] });
      await invalidatePublic();
    } catch (e) {
      captureError(e, "PublicProfileUnblock");
      setFollowActionError("Could not unblock. Try again.");
    } finally {
      setBlockBusy(false);
    }
  }, [profile?.user_id, queryClient, invalidatePublic]);

  const onPressMore = useCallback(() => {
    const blockLabel = profile ? `Block @${profile.username}` : "Block";
    if (Platform.OS === "ios") {
      // Never offer block on your own profile (this screen redirects self-views).
      const options = blockedByMe
        ? ["Copy link", "Cancel"]
        : ["Copy link", blockLabel, "Cancel"];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          ...(blockedByMe ? {} : { destructiveButtonIndex: 1 }),
        },
        (buttonIndex) => {
          if (buttonIndex === 0) void handleCopyLink();
          else if (!blockedByMe && buttonIndex === 1) setShowBlockConfirm(true);
        },
      );
    } else {
      setAndroidMenuOpen(true);
    }
  }, [handleCopyLink, profile, blockedByMe]);

  const onUserPostRespect = useCallback(
    async (post: LiveFeedPost) => {
      if (!profileUserId || tab !== "posts") return;
      const now = Date.now();
      const last = respectLastAtUserPosts.current.get(post.id) ?? 0;
      if (now - last < RESPECT_DEBOUNCE_MS) return;
      respectLastAtUserPosts.current.set(post.id, now);

      const prevR = post.reactedByMe;
      const prevC = post.respectCount;
      const nextC = Math.max(0, prevC + (prevR ? -1 : 1));
      queryClient.setQueryData(
        ["userPosts", profileUserId, tab],
        (old: { posts: LiveFeedPost[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p) =>
              p.id === post.id
                ? { ...p, reactedByMe: !prevR, respectCount: nextC }
                : p,
            ),
          };
        },
      );
      try {
        const result = (await trpcMutate(TRPC.feed.react, { eventId: post.id })) as {
          reacted?: boolean;
          reactionCount?: number;
        };
        queryClient.setQueryData(
          ["userPosts", profileUserId, tab],
          (old: { posts: LiveFeedPost[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              posts: old.posts.map((p) =>
                p.id === post.id
                  ? {
                      ...p,
                      reactedByMe: !!result.reacted,
                      respectCount: Math.max(0, result.reactionCount ?? nextC),
                    }
                  : p,
              ),
            };
          },
        );
        await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      } catch (e) {
        captureError(e, "PublicProfilePostRespect");
        queryClient.setQueryData(
          ["userPosts", profileUserId, tab],
          (old: { posts: LiveFeedPost[] } | undefined) => {
            if (!old) return old;
            return {
              ...old,
              posts: old.posts.map((p) =>
                p.id === post.id
                  ? { ...p, reactedByMe: prevR, respectCount: prevC }
                  : p,
              ),
            };
          },
        );
      }
    },
    [profileUserId, tab, queryClient],
  );

  const navigateToProfile = useCallback(
    (post: LiveFeedPost) => {
      if (post.userId === user?.id) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = post.username?.trim();
      if (!u || u.length < 2) return;
      if (u === profile?.username) return;
      if (/^user_[0-9a-f]+$/i.test(u)) return;
      router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
    },
    [router, user?.id, profile?.username],
  );

  if (!decoded) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.fillCenter, styles.padX24]}>
          <Text style={styles.muted}>Invalid profile link</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.fillCenter}>
          <ActivityIndicator size="large" color={DS_COLORS_V2.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.fillCenter, styles.padX24]}>
          <Text style={styles.muted}>Couldn&apos;t load this profile.</Text>
          <Pressable
            style={styles.retry}
            onPress={() => void profileQuery.refetch()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile"
          >
            <Text style={styles.retryTxt}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.fillCenter, styles.padX24]}>
          <Text style={styles.muted}>@{decoded} not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSelf) {
    router.replace(ROUTES.TABS_PROFILE as never);
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.fillCenter}>
          <ActivityIndicator size="large" color={DS_COLORS_V2.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Block relationship (either direction) → minimal unavailable state, mirroring
  // the private-account gate. If I blocked them, offer Unblock.
  if (blockRelationship) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <Pressable
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace(ROUTES.TABS_HOME as never)
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={styles.iconBtn}
          >
            <ChevronLeft size={20} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.handle} numberOfLines={1}>{`@${profile.username}`}</Text>
          </View>
          <View style={styles.iconBtnGhost} />
        </View>
        <View style={[styles.fillCenter, styles.padX24]}>
          <View style={styles.gateIcon}>
            <Ban size={28} color={DS_COLORS_V2.text.tertiary} strokeWidth={2} />
          </View>
          <Text style={styles.gateTitle}>Profile unavailable</Text>
          <Text style={styles.gateBody}>
            {blockedByMe
              ? `You blocked @${profile.username}. Unblock to see their profile again.`
              : "This profile isn't available."}
          </Text>
          {blockedByMe ? (
            <Pressable
              style={styles.retry}
              onPress={() => void handleUnblock()}
              disabled={blockBusy}
              accessibilityRole="button"
              accessibilityLabel={`Unblock @${profile.username}`}
            >
              <Text style={styles.retryTxt}>{blockBusy ? "Unblocking…" : "Unblock"}</Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  const primaryLine = profilePrimaryName(profile, null);
  const fc = followCountsQuery.data;
  const mutuals = mutualsQuery.data;

  return (
    <ErrorBoundary>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace(ROUTES.TABS_HOME as never)
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={styles.iconBtn}
            >
              <ChevronLeft
                size={20}
                color={DS_COLORS_V2.text.primary}
                strokeWidth={2}
              />
            </Pressable>
            <View style={styles.topBarCenter}>
              <Text style={styles.handle} numberOfLines={1}>
                {`@${profile.username}`}
              </Text>
              {needsRequest ? (
                <Lock
                  size={11}
                  color={DS_COLORS_V2.text.secondary}
                  strokeWidth={2}
                />
              ) : null}
            </View>
            <Pressable
              onPress={onPressMore}
              accessibilityRole="button"
              accessibilityLabel="More options"
              hitSlop={12}
              style={styles.iconBtn}
            >
              <MoreHorizontal
                size={18}
                color={DS_COLORS_V2.text.primary}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          <ProfileHeader
            mode="public"
            userId={profile.user_id}
            username={profile.username}
            displayName={profile.display_name ?? profile.username}
            bio={profile.bio}
            avatarUrl={profile.avatar_url}
            isPrivate={needsRequest}
            currentStreak={profile.active_streak ?? 0}
            followersCount={fc?.followers ?? 0}
            followingCount={fc?.following ?? 0}
            completedChallenges={profile.completed_challenges_count ?? 0}
            isFollowing={isFollowing}
            followPending={isPending}
            followBusy={followBusy}
            onPressFollow={() => void handlePrimaryFollow()}
            onPressFollowers={() =>
              router.push(
                ROUTES.FOLLOW_LIST(
                  profile.user_id,
                  "followers",
                  profile.username,
                ) as never,
              )
            }
            onPressFollowing={() =>
              router.push(
                ROUTES.FOLLOW_LIST(
                  profile.user_id,
                  "following",
                  profile.username,
                ) as never,
              )
            }
            onPressCompleted={() => {
              // Public profile completed list — surfacing read-only is a follow-up.
              // For now this is a no-op so the count stays a stable read-only stat.
            }}
          />

          <View style={styles.contentPad}>
            {mutuals && mutuals.totalCount > 0 ? (
              <MutualFollowersRow
                topNames={mutuals.topNames}
                totalCount={mutuals.totalCount}
                targetDisplayName={profile.display_name?.trim() || profile.username}
              />
            ) : null}

            {followActionError ? (
              <View
                style={styles.inlineErrorBanner}
                accessibilityRole="alert"
              >
                <Text style={styles.inlineErrorText}>{followActionError}</Text>
              </View>
            ) : null}

            {showPrivateGate ? (
              <View style={styles.gate}>
                <View style={styles.gateIcon}>
                  <Lock
                    size={28}
                    color={DS_COLORS_V2.text.tertiary}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.gateTitle}>This account is private</Text>
                <Text style={styles.gateBody}>
                  Follow {profile.username} to see their activity.
                </Text>
              </View>
            ) : (
              <>
                <StreakBar
                  currentStreak={profile.active_streak ?? 0}
                  longestStreak={profile.longest_streak ?? 0}
                  activeCount={profile.active_challenges_count ?? 0}
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
                        style={[
                          styles.tabTxt,
                          tab === t && styles.tabTxtActive,
                        ]}
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
                    {challengesQuery.isPending ? (
                      <Text style={styles.hint}>Loading…</Text>
                    ) : activeItems.length === 0 ? (
                      <Text style={styles.hint}>No active challenges.</Text>
                    ) : (
                      <View style={styles.activeList}>
                        {activeItems.map((item) => (
                          <Pressable
                            key={item.id}
                            onPress={() => {
                              if (item.challengeId) {
                                router.push(
                                  ROUTES.CHALLENGE_ID(item.challengeId) as never,
                                );
                              } else {
                                router.push(
                                  ROUTES.CHALLENGE_ACTIVE(item.id) as never,
                                );
                              }
                            }}
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
                                <Text
                                  style={styles.activeRowTitle}
                                  numberOfLines={1}
                                >
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
                    {postsQuery.isPending ? (
                      <Text style={styles.hint}>Loading…</Text>
                    ) : (postsQuery.data?.posts ?? []).length === 0 ? (
                      <View style={styles.postsEmpty}>
                        <Text style={styles.postsEmptyTitle}>No posts yet</Text>
                      </View>
                    ) : (
                      (postsQuery.data?.posts ?? []).map((post) => (
                        <FeedPostCard
                          key={post.id}
                          post={post}
                          onProfilePress={() => navigateToProfile(post)}
                          onRespect={() => void onUserPostRespect(post)}
                          onShare={() => {
                            // Share is handled inside FeedPostCard via shareSheet; no-op here.
                          }}
                          onCommentCountChange={(n) => {
                            if (!profileUserId || tab !== "posts") return;
                            queryClient.setQueryData(
                              ["userPosts", profileUserId, tab],
                              (old: { posts: LiveFeedPost[] } | undefined) => {
                                if (!old) return old;
                                return {
                                  ...old,
                                  posts: old.posts.map((p) =>
                                    p.id === post.id ? { ...p, commentCount: n } : p,
                                  ),
                                };
                              },
                            );
                          }}
                        />
                      ))
                    )}
                  </View>
                ) : null}

                {tab === "badges" ? (
                  <View style={styles.tabBody}>
                    {badgesQuery.isPending ? (
                      <Text style={styles.hint}>Loading…</Text>
                    ) : (
                      <>
                        <Text style={styles.secHead}>
                          EARNED ({badgesQuery.data?.earned.length ?? 0})
                        </Text>
                        <View style={styles.badgeGrid}>
                          {(badgesQuery.data?.earned ?? []).map((b) => {
                            const IconComp = BADGE_ICONS[b.icon] ?? Zap;
                            const accent = badgeAccentFor(b.color);
                            return (
                              <Pressable
                                key={b.id}
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
                                accessibilityRole="button"
                                accessibilityLabel={`${b.name} badge details`}
                              >
                                <View
                                  style={[
                                    styles.badgeIconOuter,
                                    { backgroundColor: accent.bg },
                                  ]}
                                >
                                  <IconComp
                                    size={22}
                                    color={accent.stroke}
                                    strokeWidth={2}
                                  />
                                </View>
                                <Text style={styles.badgeName}>{b.name}</Text>
                                <Text style={styles.badgeProg}>
                                  {b.progress}/{b.total}{" "}
                                  {b.total === 1 ? "day" : "days"}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        <Text style={[styles.secHead, styles.secHeadGap]}>
                          NEXT UP ({badgesQuery.data?.next.length ?? 0})
                        </Text>
                        <View style={styles.badgeGrid}>
                          {(badgesQuery.data?.next ?? []).map((b) => {
                            const NextIcon = BADGE_ICONS[b.icon] ?? Zap;
                            return (
                              <Pressable
                                key={b.id}
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
                                accessibilityRole="button"
                                accessibilityLabel={`${b.name} badge details`}
                              >
                                <View
                                  style={[
                                    styles.badgeIconOuter,
                                    {
                                      backgroundColor:
                                        DS_COLORS_V2.surface.cardSubtle,
                                    },
                                  ]}
                                >
                                  <NextIcon
                                    size={22}
                                    color={DS_COLORS_V2.text.tertiary}
                                    strokeWidth={2}
                                  />
                                </View>
                                <Text style={styles.badgeName}>{b.name}</Text>
                                <Text style={styles.badgeProg}>
                                  {b.progress}/{b.total}{" "}
                                  {b.total === 1 ? "day" : "days"}
                                </Text>
                                <View style={styles.nextBarTrack}>
                                  <View
                                    style={[
                                      styles.nextBarFill,
                                      {
                                        width: `${Math.min(
                                          100,
                                          (b.progress / Math.max(1, b.total)) *
                                            100,
                                        )}%`,
                                      },
                                    ]}
                                  />
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      </>
                    )}
                  </View>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.bottomGap} />
        </ScrollView>

        {copyToast ? (
          <View pointerEvents="none" style={styles.toast}>
            <Text style={styles.toastText}>{copyToast}</Text>
          </View>
        ) : null}

        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />

        <ConfirmDialog
          visible={showUnfollowConfirm}
          title="Unfollow"
          message={profile ? `Stop following @${profile.username}?` : ""}
          cancelLabel="Cancel"
          confirmLabel="Unfollow"
          destructive
          onCancel={() => setShowUnfollowConfirm(false)}
          onConfirm={() => void handleConfirmUnfollow()}
        />

        <ConfirmDialog
          visible={showBlockConfirm}
          title={profile ? `Block @${profile.username}?` : ""}
          message="They won't see your posts and you won't see theirs. They won't be notified."
          cancelLabel="Cancel"
          confirmLabel="Block"
          destructive
          onCancel={() => setShowBlockConfirm(false)}
          onConfirm={() => void handleConfirmBlock()}
        />

        <Modal
          visible={androidMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setAndroidMenuOpen(false)}
        >
          <Pressable
            style={styles.androidBackdrop}
            onPress={() => setAndroidMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          >
            <View style={styles.androidSheet}>
              <Pressable
                onPress={() => {
                  setAndroidMenuOpen(false);
                  void handleCopyLink();
                }}
                accessibilityRole="button"
                accessibilityLabel="Copy link"
                style={styles.androidRow}
              >
                <Text style={styles.androidRowText}>Copy link</Text>
              </Pressable>
              {blockedByMe ? null : (
                <Pressable
                  onPress={() => {
                    setAndroidMenuOpen(false);
                    setShowBlockConfirm(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Block @${profile.username}`}
                  style={styles.androidRow}
                >
                  <Ban size={16} color={DS_COLORS_V2.semantic.danger} strokeWidth={2} />
                  <Text style={styles.androidRowDanger}>{`Block @${profile.username}`}</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => setAndroidMenuOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={[styles.androidRow, styles.androidRowLast]}
              >
                <X size={16} color={DS_COLORS_V2.text.secondary} strokeWidth={2} />
                <Text style={styles.androidRowMuted}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* `primaryLine` is referenced by tests/screen-reader (full display name). */}
        <View accessibilityElementsHidden style={styles.hiddenA11y}>
          <Text>{primaryLine}</Text>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

export default function PublicProfileScreen() {
  return (
    <ErrorBoundary>
      <PublicProfileScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  scroll: { paddingBottom: 24 },
  fillCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  padX24: { paddingHorizontal: 24 },
  muted: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  retryTxt: {
    color: DS_COLORS_V2.brand.primaryText,
    fontWeight: "500",
    fontSize: 14,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  handle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.1,
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
  iconBtnGhost: { width: 32, height: 32 },

  contentPad: {
    paddingHorizontal: DS_SPACING_V2.md,
  },

  inlineErrorBanner: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.semantic.danger,
  },
  inlineErrorText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
    textAlign: "center",
  },

  gate: {
    alignItems: "center",
    paddingVertical: 24,
  },
  gateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gateTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
  },
  gateBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 19,
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
  tabBtnActive: { backgroundColor: DS_COLORS_V2.surface.canvas },
  tabTxt: {
    fontSize: 12,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  tabTxtActive: {
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },

  tabBody: { paddingBottom: DS_SPACING_V2.md, gap: 12 },
  hint: {
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    paddingVertical: 12,
  },

  activeList: { gap: DS_SPACING_V2.sm },
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
  activeRowPressed: { opacity: 0.85 },
  activeRowIcon: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activeRowBody: { flex: 1, minWidth: 0, gap: 6 },
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

  postsEmpty: { alignItems: "center", paddingVertical: 24 },
  postsEmptyTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },

  secHead: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  secHeadGap: { marginTop: 20 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "31%",
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  badgeCardDim: { opacity: 0.85 },
  badgeIconOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
  },
  badgeProg: {
    fontSize: 11,
    fontWeight: "400",
    color: DS_COLORS_V2.text.tertiary,
    marginTop: 4,
  },
  nextBarTrack: {
    width: "100%",
    height: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.surface.divider,
    marginTop: 8,
    overflow: "hidden",
  },
  nextBarFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },

  bottomGap: { height: 32 },

  toast: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: DS_RADIUS_V2.md,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },

  androidBackdrop: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.overlay.photoGradientMid,
    justifyContent: "flex-end",
  },
  androidSheet: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.lg,
    borderTopRightRadius: DS_RADIUS_V2.lg,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.md,
  },
  androidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: DS_SPACING_V2.md,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS_V2.surface.divider,
  },
  androidRowLast: { borderBottomWidth: 0 },
  androidRowText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  androidRowMuted: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  androidRowDanger: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
  },

  hiddenA11y: { height: 0, width: 0, overflow: "hidden" },
});
