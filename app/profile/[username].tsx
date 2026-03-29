import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Zap,
  Star,
  Clock,
  Check,
  CheckCircle,
  ChevronRight,
  Lock,
  Trophy,
  Target,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";
import { shareProfile } from "@/lib/share";
import { Avatar } from "@/components/Avatar";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import type { LiveFeedPost } from "@/components/feed/feedTypes";

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
type BadgeDef = { id: string; name: string; icon: string; color: string; progress: number; total: number; type?: string };

function formatJoinDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function tierPillStyle(tier: string): { bg: string; fg: string } {
  const t = tier.toLowerCase();
  if (t.includes("build")) return { bg: DS_COLORS.PROFILE_TIER_BUILDER_BG, fg: DS_COLORS.PROFILE_TIER_BUILDER_TEXT };
  if (t.includes("start")) return { bg: DS_COLORS.PROFILE_TIER_STARTER_BG, fg: DS_COLORS.PROFILE_TIER_STARTER_TEXT };
  return { bg: DS_COLORS.PROFILE_TIER_WARRIOR_BG, fg: DS_COLORS.PROFILE_TIER_WARRIOR_TEXT };
}

const BADGE_ROTATION: { bg: string; icon: string }[] = [
  { bg: DS_COLORS.PROFILE_STAT_CORAL_BG, icon: DS_COLORS.PROFILE_STAT_CORAL_ICON },
  { bg: DS_COLORS.PROFILE_STAT_AMBER_BG, icon: DS_COLORS.PROFILE_STAT_AMBER_ICON },
  { bg: DS_COLORS.PROFILE_TIER_WARRIOR_BG, icon: DS_COLORS.PROFILE_TIER_WARRIOR_TEXT },
  { bg: DS_COLORS.PROFILE_STAT_TEAL_BG, icon: DS_COLORS.PROFILE_STAT_TEAL_ICON },
  { bg: DS_COLORS.PROFILE_STAT_BLUE_BG, icon: DS_COLORS.PROFILE_STAT_BLUE_ICON },
];

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("challenges");
  const [followBusy, setFollowBusy] = useState(false);

  const decoded = useMemo(() => {
    const raw = typeof username === "string" ? username : "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [username]);

  const profileQuery = useQuery({
    queryKey: ["publicProfile", decoded],
    queryFn: () => trpcQuery(TRPC.profiles.getPublicByUsername, { username: decoded }) as Promise<PublicProfile | null>,
    enabled: !!decoded,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const profile = profileQuery.data ?? null;
  const isLoading = profileQuery.isPending;
  const isError = profileQuery.isError;

  const profileUserId = profile?.user_id ?? "";

  const followCountsQuery = useQuery({
    queryKey: ["publicProfile", profileUserId, "followCounts"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts, { userId: profileUserId }) as Promise<{ followers: number; following: number }>,
    enabled: !!profileUserId && !!user?.id,
    staleTime: 60 * 1000,
  });

  const followStatusQuery = useQuery({
    queryKey: ["followStatus", profileUserId, user?.id],
    queryFn: () => trpcQuery(TRPC.profiles.getFollowStatus, { userId: profileUserId }) as Promise<{ status: string }>,
    enabled: !!profileUserId && !!user?.id && user.id !== profileUserId,
    staleTime: 30 * 1000,
  });

  const vis = String(profile?.profile_visibility ?? "public").toLowerCase();
  const needsRequest = vis === "private" || vis === "friends";
  const isFollowing = followStatusQuery.data?.status === "following";
  const isPending = followStatusQuery.data?.status === "pending";
  const canSeeContent =
    !!profile && (vis === "public" || isFollowing || (user?.id && user.id === profile.user_id));

  const challengesQuery = useQuery({
    queryKey: ["userChallenges", profileUserId, canSeeContent],
    queryFn: () => trpcQuery(TRPC.challenges.getPublicChallenges, { userId: profileUserId }) as Promise<unknown[]>,
    enabled: Boolean(profileUserId && user?.id && canSeeContent),
    staleTime: 60 * 1000,
  });

  const postsQuery = useQuery<{ posts: LiveFeedPost[] }>({
    queryKey: ["userPosts", profileUserId, tab],
    queryFn: () => trpcQuery(TRPC.feed.getUserPosts, { userId: profileUserId, limit: 30 }) as Promise<{ posts: LiveFeedPost[] }>,
    enabled: Boolean(profileUserId && user?.id && canSeeContent && tab === "posts"),
    staleTime: 60 * 1000,
  });

  const badgesQuery = useQuery<{ earned: BadgeDef[]; next: BadgeDef[] }>({
    queryKey: ["userBadges", profileUserId, tab],
    queryFn: () => trpcQuery(TRPC.profiles.getBadges, { userId: profileUserId }) as Promise<{ earned: BadgeDef[]; next: BadgeDef[] }>,
    enabled: Boolean(profileUserId && user?.id && canSeeContent && tab === "badges"),
    staleTime: 60 * 1000,
  });

  const activeItems = useMemo(() => {
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
      const progress = row.progress_percent ?? Math.round((day / duration) * 100);
      return {
        id: row.id ?? row.challenge_id ?? "",
        challengeId: row.challenges?.id ?? row.challenge_id ?? "",
        title: row.challenges?.title ?? "Challenge",
        currentDay: day,
        durationDays: duration,
        progressPercent: Math.max(0, Math.min(100, progress)),
      };
    });
  }, [challengesQuery.data]);

  const invalidatePublic = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["publicProfile", decoded] });
    await queryClient.invalidateQueries({ queryKey: ["followStatus", profileUserId] });
    await queryClient.invalidateQueries({ queryKey: ["publicProfile", profileUserId, "followCounts"] });
    await queryClient.invalidateQueries({ queryKey: ["userChallenges", profileUserId] });
    await queryClient.invalidateQueries({ queryKey: ["userPosts", profileUserId] });
    await queryClient.invalidateQueries({ queryKey: ["userBadges", profileUserId] });
  }, [queryClient, decoded, profileUserId]);

  const handlePrimaryFollow = useCallback(async () => {
    if (!profile?.user_id || followBusy) return;
    if (!user?.id) {
      router.push(ROUTES.AUTH_LOGIN as never);
      return;
    }
    setFollowBusy(true);
    try {
      if (isFollowing) {
        Alert.alert("Unfollow", `Stop following @${profile.username}?`, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unfollow",
            style: "destructive",
            onPress: () => {
              void (async () => {
                try {
                  await trpcMutate(TRPC.profiles.unfollowUser, { userId: profile.user_id });
                  await invalidatePublic();
                } catch (e) {
                  console.error(e);
                }
              })();
            },
          },
        ]);
        setFollowBusy(false);
        return;
      }
      if (needsRequest) {
        await trpcMutate(TRPC.profiles.sendFollowRequest, { userId: profile.user_id });
      } else {
        await trpcMutate(TRPC.profiles.followUser, { userId: profile.user_id });
      }
      await invalidatePublic();
    } catch (err) {
      console.error("[PublicProfile] follow action", err);
    } finally {
      setFollowBusy(false);
    }
  }, [profile, followBusy, user?.id, router, isFollowing, needsRequest, invalidatePublic]);

  const handleShare = useCallback(async () => {
    if (!profile?.username) return;
    await shareProfile({
      username: profile.username,
      streak: profile.active_streak ?? 0,
      totalDaysSecured: profile.total_days_secured ?? 0,
      tier: profile.tier ?? "Starter",
    });
  }, [profile]);

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
    [router, user?.id, profile?.username]
  );

  if (!decoded) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.page, styles.centered]}>
          <Text style={styles.muted}>Invalid profile link</Text>
        </View>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.page, styles.centered]}>
          <ActivityIndicator size="large" color={DS_COLORS.PRIMARY} />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.page, styles.centered]}>
          <Text style={styles.muted}>Couldn&apos;t load this profile.</Text>
          <TouchableOpacity style={styles.retry} onPress={() => void profileQuery.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading profile">
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.page, styles.centered]}>
          <Text style={styles.muted}>@{decoded} not found</Text>
        </View>
      </>
    );
  }

  if (user?.id === profile.user_id) {
    router.replace(ROUTES.TABS_PROFILE as never);
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.page, styles.centered]}>
          <ActivityIndicator size="large" color={DS_COLORS.PRIMARY} />
        </View>
      </>
    );
  }

  const displayName = profile.display_name || profile.username || "User";
  const tierColors = tierPillStyle(profile.tier ?? "Starter");
  const fc = followCountsQuery.data;
  const showPrivateGate = needsRequest && !isFollowing && !isPending;
  const showPendingNote = needsRequest && isPending;
  const primaryLabel = !user?.id
    ? "Sign in to follow"
    : isFollowing
      ? "Following"
      : isPending
        ? "Requested"
        : needsRequest
          ? "Request"
          : "Follow";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={DS_COLORS.PROFILE_TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.profileRow}>
            <Avatar url={profile.avatar_url ?? null} name={displayName} userId={profile.user_id} size={80} />
            <View style={styles.textCol}>
              <Text style={styles.username}>@{profile.username}</Text>
              <View style={styles.tierRow}>
                <View style={[styles.tierPill, { backgroundColor: tierColors.bg }]}>
                  <Text style={[styles.tierPillText, { color: tierColors.fg }]}>{profile.tier}</Text>
                </View>
                {profile.created_at ? <Text style={styles.joined}>Joined {formatJoinDate(profile.created_at)}</Text> : null}
              </View>
              {profile.bio?.trim() ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            </View>
          </View>

          <View style={styles.followMeta}>
            <Text style={styles.followNum}>{fc?.followers ?? 0}</Text>
            <Text style={styles.followLbl}> followers</Text>
            <Text style={styles.followDot}> · </Text>
            <Text style={styles.followNum}>{fc?.following ?? 0}</Text>
            <Text style={styles.followLbl}> following</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.btnPrimary,
                isFollowing && styles.btnFollowing,
                isPending && styles.btnFollowing,
              ]}
              onPress={() => void handlePrimaryFollow()}
              disabled={followBusy}
              accessibilityLabel={primaryLabel}
              accessibilityRole="button"
            >
              {followBusy ? (
                <ActivityIndicator color={isFollowing || isPending ? DS_COLORS.PROFILE_TEXT_SECONDARY : DS_COLORS.WHITE} />
              ) : (
                <Text
                  style={[
                    styles.btnPrimaryTxt,
                    (isFollowing || isPending) && styles.btnFollowingTxt,
                  ]}
                >
                  {primaryLabel}
                </Text>
              )}
            </TouchableOpacity>
            {canSeeContent ? (
              <TouchableOpacity style={styles.shareSq} onPress={() => void handleShare()} accessibilityLabel="Share profile" accessibilityRole="button">
                <Share2 size={18} color={DS_COLORS.PROFILE_TEXT_SECONDARY} strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <View style={styles.shareSq} />
            )}
          </View>

          {showPendingNote ? (
            <Text style={styles.pendingNote}>Follow request sent. You&apos;ll see their profile when they accept.</Text>
          ) : null}

          {showPrivateGate ? (
            <View style={styles.gate}>
              <View style={styles.gateIcon}>
                <Lock size={28} color={DS_COLORS.PROFILE_TEXT_MUTED} strokeWidth={2} />
              </View>
              <Text style={styles.gateTitle}>This account is private</Text>
              <Text style={styles.gateBody}>
                Follow {profile.username} to see their challenges, posts, and badges.
              </Text>
            </View>
          ) : null}

          {!showPrivateGate ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_BG }]}>
                    <Zap size={14} color={DS_COLORS.PROFILE_STAT_CORAL_ICON} strokeWidth={2} />
                  </View>
                  <Text style={styles.statNum}>{profile.active_streak}</Text>
                  <Text style={styles.statLbl}>streak</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_AMBER_BG }]}>
                    <Star size={14} color={DS_COLORS.PROFILE_STAT_AMBER_ICON} strokeWidth={2} />
                  </View>
                  <Text style={styles.statNum}>{profile.longest_streak ?? 0}</Text>
                  <Text style={styles.statLbl}>best</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_TEAL_BG }]}>
                    <Clock size={14} color={DS_COLORS.PROFILE_STAT_TEAL_ICON} strokeWidth={2} />
                  </View>
                  <Text style={styles.statNum}>{profile.active_challenges_count ?? 0}</Text>
                  <Text style={styles.statLbl}>active</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_BLUE_BG }]}>
                    <Check size={14} color={DS_COLORS.PROFILE_STAT_BLUE_ICON} strokeWidth={2} />
                  </View>
                  <Text style={styles.statNum}>{profile.completed_challenges_count ?? 0}</Text>
                  <Text style={styles.statLbl}>done</Text>
                </View>
              </View>

              <View style={styles.tabsBar}>
                {(["challenges", "posts", "badges"] as const).map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.tabBtn, tab === t && styles.tabBtnOn]}
                    onPress={() => setTab(t)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === t }}
                    accessibilityLabel={t === "challenges" ? "Challenges tab" : t === "posts" ? "Posts tab" : "Badges tab"}
                  >
                    <Text style={[styles.tabTxt, tab === t ? styles.tabTxtOn : styles.tabTxtOff]}>
                      {t === "challenges" ? "Challenges" : t === "posts" ? "Posts" : "Badges"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.tabPad}>
                {tab === "challenges" ? (
                  challengesQuery.isPending ? (
                    <Text style={styles.hint}>Loading…</Text>
                  ) : activeItems.length === 0 ? (
                    <Text style={styles.hint}>No active challenges.</Text>
                  ) : (
                    activeItems.map((item) => {
                      const fillColor = item.progressPercent < 50 ? DS_COLORS.PRIMARY : DS_COLORS.PROFILE_SUCCESS;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.chCard}
                          onPress={() => item.challengeId && router.push(ROUTES.CHALLENGE_ID(item.challengeId) as never)}
                          accessibilityLabel={`Open challenge ${item.title}`}
                          accessibilityRole="button"
                        >
                          <View style={styles.chTop}>
                            <View style={styles.chIconBox}>
                              <CheckCircle size={18} color={DS_COLORS.PROFILE_STAT_TEAL_ICON} strokeWidth={2} />
                            </View>
                            <View style={styles.chMid}>
                              <Text style={styles.chTitle}>{item.title}</Text>
                              <Text style={styles.chSub}>
                                Day {item.currentDay} of {item.durationDays}
                              </Text>
                            </View>
                            <ChevronRight size={16} color={DS_COLORS.PROFILE_TEXT_MUTED} />
                          </View>
                          <View style={styles.chTrack}>
                            <View style={[styles.chFill, { width: `${item.progressPercent}%`, backgroundColor: fillColor }]} />
                          </View>
                          <View style={styles.chFoot}>
                            <Text style={styles.chFootTxt}>{item.progressPercent}% complete</Text>
                            <Text style={styles.chFootTxt}>{item.durationDays} days</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )
                ) : null}

                {tab === "posts" ? (
                  postsQuery.isPending ? (
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
                        onRespect={() => void trpcMutate(TRPC.feed.react, { eventId: post.id }).then(() => void postsQuery.refetch())}
                        onComment={() => router.push(ROUTES.POST_ID(post.id) as never)}
                        onShare={() => {}}
                      />
                    ))
                  )
                ) : null}

                {tab === "badges" ? (
                  badgesQuery.isPending ? (
                    <Text style={styles.hint}>Loading…</Text>
                  ) : (
                    <>
                      <Text style={styles.secHead}>EARNED ({badgesQuery.data?.earned.length ?? 0})</Text>
                      <View style={styles.badgeGrid}>
                        {(badgesQuery.data?.earned ?? []).map((b, i) => {
                          const rot = BADGE_ROTATION[i % BADGE_ROTATION.length]!;
                          return (
                            <View key={b.id} style={styles.badgeCard}>
                              <View style={[styles.badgeIconOuter, { backgroundColor: rot.bg }]}>
                                <Trophy size={22} color={rot.icon} strokeWidth={2} />
                              </View>
                              <Text style={styles.badgeName}>{b.name}</Text>
                              <Text style={styles.badgeProg}>
                                {b.progress}/{b.total} days
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                      <Text style={[styles.secHead, { marginTop: 20 }]}>NEXT UP ({badgesQuery.data?.next.length ?? 0})</Text>
                      <View style={styles.badgeGrid}>
                        {(badgesQuery.data?.next ?? []).map((b) => (
                          <View key={b.id} style={[styles.badgeCard, styles.badgeCardDim]}>
                            <View style={[styles.badgeIconOuter, { backgroundColor: DS_COLORS.PROFILE_NEXT_BADGE_BG }]}>
                              <Target size={22} color={DS_COLORS.PROFILE_TEXT_MUTED} strokeWidth={2} style={{ opacity: 0.5 }} />
                            </View>
                            <Text style={styles.badgeName}>{b.name}</Text>
                            <View style={styles.nextBarTrack}>
                              <View
                                style={[
                                  styles.nextBarFill,
                                  { width: `${Math.min(100, (b.progress / Math.max(1, b.total)) * 100)}%` },
                                ]}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    </>
                  )
                ) : null}
              </View>
            </>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: DS_COLORS.PROFILE_PAGE_BG },
  centered: { justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  muted: { fontSize: 15, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, textAlign: "center" },
  retry: { marginTop: 16, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12, backgroundColor: DS_COLORS.PRIMARY },
  retryTxt: { color: DS_COLORS.WHITE, fontWeight: "500", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.PROFILE_BORDER_ALT,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  headerSpacer: { width: 40 },
  scroll: { paddingBottom: 24 },
  profileRow: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 14, alignItems: "flex-start" },
  textCol: { flex: 1, minWidth: 0 },
  username: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, letterSpacing: -0.3 },
  tierRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 },
  tierPill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  tierPillText: { fontSize: 11, fontWeight: "500" },
  joined: { fontSize: 12, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED },
  bio: { marginTop: 8, fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, lineHeight: 18 },
  followMeta: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    marginTop: 16,
    marginBottom: 14,
  },
  followNum: { fontSize: 16, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  followLbl: { fontSize: 14, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY },
  followDot: { fontSize: 14, color: DS_COLORS.PROFILE_BORDER_ALT },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16, alignItems: "center" },
  btnPrimary: {
    flex: 2,
    borderRadius: 28,
    backgroundColor: DS_COLORS.PRIMARY,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnFollowing: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderWidth: 1.5,
    borderColor: DS_COLORS.PROFILE_BORDER_ALT,
  },
  btnPrimaryTxt: { fontSize: 13, fontWeight: "500", color: DS_COLORS.WHITE },
  btnFollowingTxt: { color: DS_COLORS.PROFILE_TEXT_SECONDARY },
  shareSq: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DS_COLORS.PROFILE_BORDER_ALT,
    backgroundColor: DS_COLORS.BG_CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  gate: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 24 },
  gateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DS_COLORS.SURFACE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gateTitle: { fontSize: 16, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, textAlign: "center" },
  gateBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 19,
  },
  pendingNote: {
    marginHorizontal: 24,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "400",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 18,
  },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNum: { fontSize: 24, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, lineHeight: 28 },
  statLbl: { fontSize: 11, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED, marginTop: 4, textTransform: "lowercase" },
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
  tabPad: { paddingHorizontal: 20, paddingTop: 14, gap: 10 },
  hint: { fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, textAlign: "center", paddingVertical: 12 },
  chCard: { backgroundColor: DS_COLORS.BG_CARD, borderRadius: 16, padding: 16, marginBottom: 2 },
  chTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  chIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: DS_COLORS.PROFILE_STAT_TEAL_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  chMid: { flex: 1, minWidth: 0 },
  chTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  chSub: { fontSize: 12, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, marginTop: 2 },
  chTrack: { height: 4, borderRadius: 2, backgroundColor: DS_COLORS.PROFILE_BORDER_ALT, marginTop: 12, overflow: "hidden" },
  chFill: { height: 4, borderRadius: 2 },
  chFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  chFootTxt: { fontSize: 11, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED },
  postsEmpty: { alignItems: "center", paddingVertical: 24 },
  postsEmptyTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  secHead: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS.PROFILE_TEXT_SECONDARY,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "31%",
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
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
  badgeName: { fontSize: 12, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, textAlign: "center" },
  badgeProg: { fontSize: 11, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED, marginTop: 4 },
  nextBarTrack: { width: "100%", height: 3, borderRadius: 2, backgroundColor: DS_COLORS.PROFILE_BORDER_ALT, marginTop: 8, overflow: "hidden" },
  nextBarFill: { height: 3, borderRadius: 2, backgroundColor: DS_COLORS.PRIMARY },
});
