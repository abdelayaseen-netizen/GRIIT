import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Settings,
  Camera,
  Share2,
  Zap,
  Star,
  Clock,
  Check,
  CheckCircle,
  ChevronRight,
  Trophy,
  Target,
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
import { DS_COLORS } from "@/lib/design-system";

type ProfileTab = "challenges" | "posts" | "badges";

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

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const isGuest = useIsGuest();
  const { user } = useAuth();
  const { profile, profileLoading, profileMissing, isError, stats, refetchAll } = useApp();
  const [tab, setTab] = useState<ProfileTab>("challenges");
  const [uploading, setUploading] = useState(false);

  const activeListQuery = useQuery({
    queryKey: ["profile", user?.id, "activeChallenges"],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !isGuest && !!user?.id,
    placeholderData: (previousData) => previousData,
  });

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
      const progress = row.progress_percent ?? Math.round((day / duration) * 100);
      return {
        id: row.id,
        challengeId: row.challenges?.id ?? "",
        title: row.challenges?.title ?? "Challenge",
        currentDay: day,
        durationDays: duration,
        progressPercent: Math.max(0, Math.min(100, progress)),
      };
    });
  }, [activeListQuery.data]);

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

  const onAvatarPick = useCallback(async () => {
    if (!user?.id) return;
    setUploading(true);
    try {
      const url = await pickAndUploadAvatar(user.id);
      if (url) {
        await qc.invalidateQueries({ queryKey: ["profile"] });
        await refetchAll();
      }
    } catch (e) {
      captureError(e, "ProfileAvatarPick");
    } finally {
      setUploading(false);
    }
  }, [user?.id, qc, refetchAll]);

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

  const displayName = (profile.display_name || profile.username || "User").trim();
  const tier = stats?.tier ?? "Starter";
  const tierColors = tierPillStyle(tier);
  const fc = followCountsQuery.data;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.PRIMARY} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle} accessibilityRole="header">
            Profile
          </Text>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.SETTINGS as never)}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            hitSlop={10}
          >
            <Settings size={22} color={DS_COLORS.PROFILE_TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatarCol}>
            <Pressable
              onPress={() => void onAvatarPick()}
              disabled={uploading}
              accessibilityLabel="Change profile photo"
              accessibilityRole="button"
            >
              <Avatar url={profile.avatar_url ?? null} name={displayName} userId={user.id} size={80} />
              <View style={styles.cameraBadge}>
                {uploading ? (
                  <Text style={styles.cameraBadgeText}>…</Text>
                ) : (
                  <Camera size={13} color={DS_COLORS.WHITE} strokeWidth={2} />
                )}
              </View>
            </Pressable>
          </View>
          <View style={styles.textCol}>
            <Text style={styles.username}>{profile.username ? `@${profile.username}` : displayName}</Text>
            <View style={styles.tierRow}>
              <View style={[styles.tierPill, { backgroundColor: tierColors.bg }]}>
                <Text style={[styles.tierPillText, { color: tierColors.fg }]}>{tier}</Text>
              </View>
              {profile.created_at ? <Text style={styles.joined}>Joined {formatJoinDate(profile.created_at)}</Text> : null}
            </View>
            <Text style={[styles.bio, !profile.bio?.trim() && styles.bioPlaceholder]}>
              {profile.bio?.trim() ? profile.bio : "Add a bio…"}
            </Text>
          </View>
        </View>

        <View style={styles.followMeta}>
          <TouchableOpacity
            style={styles.followMetaInner}
            onPress={() => router.push(`${ROUTES.PROFILE_FOLLOW_LIST}?kind=followers` as never)}
            accessibilityLabel="View followers"
            accessibilityRole="button"
          >
            <Text style={styles.followNum}>{fc?.followers ?? 0}</Text>
            <Text style={styles.followLbl}> followers</Text>
          </TouchableOpacity>
          <Text style={styles.followDot}> · </Text>
          <TouchableOpacity
            style={styles.followMetaInner}
            onPress={() => router.push(`${ROUTES.PROFILE_FOLLOW_LIST}?kind=following` as never)}
            accessibilityLabel="View following"
            accessibilityRole="button"
          >
            <Text style={styles.followNum}>{fc?.following ?? 0}</Text>
            <Text style={styles.followLbl}> following</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Text style={styles.btnOutlineText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnGhost}
            onPress={() => void handleShare()}
            accessibilityLabel="Share profile"
            accessibilityRole="button"
          >
            <Share2 size={14} color={DS_COLORS.PROFILE_TEXT_SECONDARY} strokeWidth={2} />
            <Text style={styles.btnGhostText}> Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_BG }]}>
              <Zap size={14} color={DS_COLORS.PROFILE_STAT_CORAL_ICON} strokeWidth={2} />
            </View>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLbl}>streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_AMBER_BG }]}>
              <Star size={14} color={DS_COLORS.PROFILE_STAT_AMBER_ICON} strokeWidth={2} />
            </View>
            <Text style={styles.statNum}>{best}</Text>
            <Text style={styles.statLbl}>best</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_TEAL_BG }]}>
              <Clock size={14} color={DS_COLORS.PROFILE_STAT_TEAL_ICON} strokeWidth={2} />
            </View>
            <Text style={styles.statNum}>{active}</Text>
            <Text style={styles.statLbl}>active</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: DS_COLORS.PROFILE_STAT_BLUE_BG }]}>
              <Check size={14} color={DS_COLORS.PROFILE_STAT_BLUE_ICON} strokeWidth={2} />
            </View>
            <Text style={styles.statNum}>{done}</Text>
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

        {tab === "challenges" ? (
          <View style={styles.tabPad}>
            {activeItems.length === 0 ? (
              <Text style={styles.emptyHint}>No active challenges. Discover one to get started.</Text>
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
                <TouchableOpacity
                  onPress={() => router.push(ROUTES.TABS_HOME as never)}
                  accessibilityLabel="Go to my challenges"
                  accessibilityRole="button"
                >
                  <Text style={styles.postsEmptyCta}>Go to my challenges →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              (postsQuery.data?.posts ?? []).map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onProfilePress={() => router.push(ROUTES.TABS_PROFILE as never)}
                  onRespect={() => void trpcMutate(TRPC.feed.react, { eventId: post.id }).then(() => void postsQuery.refetch())}
                  onComment={() => router.push(ROUTES.POST_ID(post.id) as never)}
                  onShare={() => {}}
                />
              ))
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
                        <View style={[styles.nextBarFill, { width: `${Math.min(100, (b.progress / Math.max(1, b.total)) * 100)}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.PROFILE_PAGE_BG },
  scroll: { paddingBottom: 24 },
  centerGuest: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  guestTitle: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, textAlign: "center" },
  guestSub: { marginTop: 8, fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED, textAlign: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topBarTitle: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  profileRow: { flexDirection: "row", paddingHorizontal: 20, gap: 14, alignItems: "flex-start" },
  avatarCol: { position: "relative" },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DS_COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: DS_COLORS.PROFILE_PAGE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadgeText: { color: DS_COLORS.WHITE, fontSize: 12 },
  textCol: { flex: 1, minWidth: 0 },
  username: { fontSize: 18, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY, letterSpacing: -0.3 },
  tierRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 },
  tierPill: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  tierPillText: { fontSize: 11, fontWeight: "500" },
  joined: { fontSize: 12, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_MUTED },
  bio: { marginTop: 8, fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, lineHeight: 18 },
  bioPlaceholder: { fontStyle: "italic" },
  followMeta: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  followMetaInner: { flexDirection: "row", alignItems: "baseline" },
  followNum: { fontSize: 16, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_PRIMARY },
  followLbl: { fontSize: 14, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY },
  followDot: { fontSize: 14, color: DS_COLORS.PROFILE_BORDER_ALT },
  actionRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 18 },
  btnOutline: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: DS_COLORS.PRIMARY,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.BG_CARD,
  },
  btnOutlineText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.PRIMARY },
  btnGhost: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: DS_COLORS.PROFILE_BORDER_ALT,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.BG_CARD,
  },
  btnGhostText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.PROFILE_TEXT_SECONDARY },
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
  emptyHint: { fontSize: 13, fontWeight: "400", color: DS_COLORS.PROFILE_TEXT_SECONDARY, textAlign: "center", paddingVertical: 16 },
  chCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 2,
  },
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
