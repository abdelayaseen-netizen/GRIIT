/**
 * Own profile v2 — identity, streak, consistency, Challenges / Proofs / Badges.
 * Record strings come from profiles.getRecord. No proof CTA except empty Proofs tab.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Settings, Share2 } from "lucide-react-native";
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
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { Avatar } from "@/components/shared/Avatar";
import { SkeletonProfile } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import Card from "@/components/shared/Card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreakCard } from "@/components/profile-v2/StreakCard";
import { ConsistencyCard } from "@/components/profile-v2/ConsistencyCard";
import { ChallengeRow, CompletedRow } from "@/components/profile-v2/ChallengeRow";
import { BadgeRows } from "@/components/profile-v2/BadgeRows";
import { ProofsTab } from "@/components/profile-v2/ProofsTab";

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
  const [bioOpen, setBioOpen] = useState(false);

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

  const postsQuery = useQuery({
    queryKey: ["profile", user?.id, "proofPosts"],
    queryFn: () =>
      trpcQuery(TRPC.feed.getUserPosts, { userId: user!.id, limit: 50 }) as Promise<{
        posts: { created_at?: string; photoUrl?: string | null; proofPhotoUrl?: string | null }[];
      }>,
    staleTime: 60 * 1000,
    enabled: !isGuest && !!user?.id,
  });

  const refreshing = recordQuery.isRefetching || followCountsQuery.isRefetching;

  const onRefresh = useCallback(async () => {
    await refetchAll();
    await Promise.all([recordQuery.refetch(), followCountsQuery.refetch(), postsQuery.refetch()]);
  }, [refetchAll, recordQuery, followCountsQuery, postsQuery]);

  const record = recordQuery.data;
  const photoByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of postsQuery.data?.posts ?? []) {
      const key = (p.created_at ?? "").slice(0, 10);
      const url = p.photoUrl ?? p.proofPhotoUrl;
      if (key && url) map.set(key, url);
    }
    return map;
  }, [postsQuery.data]);

  const proofs = useMemo(
    () =>
      (record?.proofs ?? []).map((p) => ({
        ...p,
        imageUrl: photoByDate.get(p.dateKey) ?? null,
      })),
    [record?.proofs, photoByDate]
  );

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

  const weekStartLabel = record?.detail.months[record.detail.months.length - 1]?.label ?? "";

  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centerGuest}>
          <Card containerStyle={styles.guestCard}>
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
        <View style={[styles.centerGuest, styles.errorPad]}>
          <ErrorState
            message="Couldn't load profile"
            onRetry={() => {
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
  const name = profilePrimaryName(profile);
  const bio = (profile.bio ?? "").trim();
  const fc = followCountsQuery.data;

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
              tintColor={PROFILE_V2_COLOR.orange}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.handle} numberOfLines={1}>
              @{handle}
            </Text>
            <View style={styles.headerBtns}>
              <Pressable
                onPress={() => void handleShare()}
                accessibilityRole="button"
                accessibilityLabel="Share my profile"
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnOn]}
              >
                <Share2 size={18} color={PROFILE_V2_COLOR.ink} strokeWidth={1.6} />
              </Pressable>
              <Pressable
                onPress={() => router.push(ROUTES.SETTINGS as never)}
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnOn]}
              >
                <Settings size={18} color={PROFILE_V2_COLOR.ink} strokeWidth={1.6} />
              </Pressable>
            </View>
          </View>

          <View style={styles.gutter}>
            <View style={styles.identity}>
              <Avatar
                url={profile.avatar_url}
                name={name || handle}
                size={76}
                userId={user.id}
              />
              <View style={styles.idCol}>
                <Text style={styles.displayName}>{name || handle}</Text>
                <View style={styles.counts}>
                  <Pressable
                    onPress={() =>
                      router.push(ROUTES.FOLLOW_LIST(user.id, "followers", handle) as never)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${fc?.followers ?? 0} followers`}
                    hitSlop={8}
                  >
                    <Text style={styles.count}>
                      <Text style={styles.countN}>{fc?.followers ?? 0}</Text> Followers
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      router.push(ROUTES.FOLLOW_LIST(user.id, "following", handle) as never)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${fc?.following ?? 0} following`}
                    hitSlop={8}
                  >
                    <Text style={styles.count}>
                      <Text style={styles.countN}>{fc?.following ?? 0}</Text> Following
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {bio ? (
              <Pressable onPress={() => setBioOpen((v) => !v)} accessibilityRole="button">
                <Text style={styles.bio} numberOfLines={bioOpen ? undefined : 3}>
                  {bio}
                  {!bioOpen && bio.length > 90 ? " more" : ""}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
                accessibilityRole="button"
                accessibilityLabel="Add a line about what you are building"
                style={styles.bioPromptHit}
              >
                <Text style={styles.bioPrompt}>Add a line about what you are building</Text>
              </Pressable>
            )}

            <View style={styles.actions}>
              <Pressable
                onPress={() => router.push(ROUTES.EDIT_PROFILE as never)}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                style={styles.btnDark}
              >
                <Text style={styles.btnDarkTxt}>Edit profile</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleInvite()}
                accessibilityRole="button"
                accessibilityLabel="Invite friends"
                style={styles.btnGhost}
              >
                <Text style={styles.btnGhostTxt}>Invite friends</Text>
              </Pressable>
            </View>

            <StreakCard
              current={record?.streak.current ?? 0}
              best={record?.streak.best ?? 0}
              note={record?.streak.note ?? "Post today to start."}
            />

            <View style={{ height: 10 }} />

            <ConsistencyCard
              consistency={
                record?.consistency ?? {
                  rate: "No due days",
                  verdict: "",
                  line: "Join a challenge and the strip starts filling.",
                  strip: [],
                  weeks: Array.from({ length: 26 }, () => null),
                  weeklyAverage: 0,
                  dueDayKeys: [],
                  closedDueDays: 0,
                  verifiedClosed: 0,
                  dueToday: false,
                  showWindowControl: false,
                }
              }
              weekStartLabel={weekStartLabel}
              onOpenDetail={() => router.push(ROUTES.PROFILE_CONSISTENCY as never)}
            />

            <View style={styles.tabs}>
              {(["challenges", "proofs", "badges"] as const).map((t) => {
                const on = tab === t;
                const label = t === "challenges" ? "Challenges" : t === "proofs" ? "Proofs" : "Badges";
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTab(t);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${label} tab`}
                    style={[styles.tab, on && styles.tabOn]}
                  >
                    <Text style={[styles.tabTxt, on && styles.tabTxtOn]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {tab === "challenges" ? (
              <View style={styles.tabBody}>
                {(record?.runs.length ?? 0) === 0 ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>No active challenge</Text>
                    <Text style={styles.emptyBody}>
                      Start one from Discover. Day 1 begins the morning after you join.
                    </Text>
                    <Pressable
                      onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
                      accessibilityRole="button"
                      accessibilityLabel="Go to Discover"
                      style={styles.emptyCta}
                    >
                      <Text style={styles.emptyCtaTxt}>Go to Discover</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.stack}>
                    {record?.runs.map((r) => (
                      <ChallengeRow
                        key={r.id}
                        name={r.name}
                        dayLabel={r.dayLabel}
                        meta={r.meta}
                        days={r.days}
                        onPress={() => router.push(ROUTES.CHALLENGE_ACTIVE(r.id) as never)}
                      />
                    ))}
                    {(record?.completed.length ?? 0) > 0 ? (
                      <>
                        <Text style={styles.microhead}>COMPLETED · {record?.completed.length}</Text>
                        {record?.completed.map((c) => (
                          <CompletedRow
                            key={c.id}
                            name={c.name}
                            value={c.value}
                            onPress={() => router.push(ROUTES.CHALLENGE_ACTIVE(c.id) as never)}
                          />
                        ))}
                      </>
                    ) : null}
                  </View>
                )}
              </View>
            ) : null}

            {tab === "proofs" ? (
              <View style={styles.tabBody}>
                <ProofsTab
                  proofs={proofs}
                  hasRun={(record?.runs.length ?? 0) > 0}
                  onPostProof={() => router.push(ROUTES.TABS_HOME as never)}
                  onDiscover={() => router.push(ROUTES.TABS_DISCOVER as never)}
                  onSelect={() => {
                    /* proof detail is not designed here */
                  }}
                />
              </View>
            ) : null}

            {tab === "badges" ? (
              <View style={styles.tabBody}>
                <BadgeRows rows={record?.badges ?? []} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  scroll: { paddingBottom: 34 },
  centerGuest: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  guestCard: { width: "100%" },
  guestTitle: { fontSize: 18, fontWeight: "500", color: PROFILE_V2_COLOR.ink, textAlign: "center" },
  guestSub: { marginTop: 8, fontSize: 13, color: PROFILE_V2_COLOR.muted, textAlign: "center" },
  errorPad: { paddingHorizontal: 24 },
  header: {
    height: 48,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  handle: { fontSize: 17, fontWeight: "400", letterSpacing: -0.2, color: PROFILE_V2_COLOR.ink },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PROFILE_V2_COLOR.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnOn: { backgroundColor: PROFILE_V2_COLOR.sunken },
  gutter: { paddingHorizontal: 28, gap: 0 },
  identity: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 },
  idCol: { flex: 1, minWidth: 0 },
  displayName: {
    fontSize: 27,
    fontWeight: "500",
    letterSpacing: -0.9,
    lineHeight: 28,
    color: PROFILE_V2_COLOR.ink,
  },
  counts: { flexDirection: "row", gap: 16, marginTop: 8 },
  count: { fontSize: 13, color: PROFILE_V2_COLOR.muted },
  countN: { fontWeight: "500", color: PROFILE_V2_COLOR.ink },
  bio: { marginTop: 14, fontSize: 14, lineHeight: 20, color: PROFILE_V2_COLOR.body },
  bioPromptHit: { marginTop: 14, minHeight: 44, justifyContent: "center" },
  bioPrompt: {
    fontSize: 14,
    color: PROFILE_V2_COLOR.mutedLight,
    textDecorationLine: "underline",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 14 },
  btnDark: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: PROFILE_V2_COLOR.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDarkTxt: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.surface },
  btnGhost: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostTxt: { fontSize: 15, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  tabs: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 14 },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: { backgroundColor: PROFILE_V2_COLOR.surface, borderColor: PROFILE_V2_COLOR.orange },
  tabTxt: { fontSize: 14, fontWeight: "400", color: PROFILE_V2_COLOR.muted },
  tabTxtOn: { color: PROFILE_V2_COLOR.orange },
  tabBody: { paddingBottom: 16 },
  stack: { gap: 10 },
  microhead: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.8,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  empty: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  emptyBody: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: PROFILE_V2_COLOR.muted,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: PROFILE_V2_COLOR.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCtaTxt: { fontSize: 15, fontWeight: "500", color: PROFILE_V2_COLOR.surface },
});
