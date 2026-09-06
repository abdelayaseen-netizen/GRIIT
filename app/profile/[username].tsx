/**
 * Visitor profile v2 — identity always; record gated server-side.
 * Follow only (no Requested). Lock card + Hidden tiles when profile is closed.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lock, MessageCircle, MoreHorizontal } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";

import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { shareProfile } from "@/lib/share";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import type { ProfileRelationship, VisibilityLevel } from "@/lib/profile-v2-visibility";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";
import { Avatar } from "@/components/shared/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StreakCard } from "@/components/profile-v2/StreakCard";
import { ConsistencyCard } from "@/components/profile-v2/ConsistencyCard";
import { ChallengeRow } from "@/components/profile-v2/ChallengeRow";
import { GriitFade } from "@/components/profile-v2/GriitFade";

type RecordPayload = ProfileRecord & {
  timezone: string;
  todayKey: string;
  elapsedMs: number;
  identity: {
    userId: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string | null;
  };
  viewer: { relationship: ProfileRelationship; preview: boolean };
  visibility: {
    profile: VisibilityLevel;
    challenges: VisibilityLevel;
    activity: VisibilityLevel;
  };
  gate: { profile: boolean; challenges: boolean; activity: boolean };
};

export default function VisitorProfileScreen() {
  const { username, preview } = useLocalSearchParams<{ username?: string; preview?: string }>();
  const decoded = decodeURIComponent(username ?? "").trim();
  const previewStranger = preview === "stranger";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [followBusy, setFollowBusy] = useState(false);
  const [showUnfollow, setShowUnfollow] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);

  const publicQ = useQuery({
    queryKey: ["publicProfile", decoded],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getPublicByUsername, { username: decoded }) as Promise<{
        user_id: string;
        username: string;
        display_name: string | null;
        avatar_url: string | null;
        bio: string | null;
        profile_visibility: string;
      } | null>,
    enabled: !!decoded,
  });

  const ownerId = publicQ.data?.user_id ?? "";
  const isSelf = !!user?.id && ownerId === user.id;

  useEffect(() => {
    if (isSelf && !previewStranger && publicQ.data?.username) {
      router.replace(ROUTES.TABS_PROFILE as never);
    }
  }, [isSelf, previewStranger, publicQ.data?.username, router]);

  const recordQ = useQuery({
    queryKey: ["profiles", "getRecord", ownerId, previewStranger ? "stranger" : "live"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord, {
        userId: ownerId,
        ...(previewStranger ? { preview: "stranger" as const } : {}),
      }) as Promise<RecordPayload>,
    enabled: !!ownerId && (!isSelf || previewStranger),
    staleTime: 60 * 1000,
  });
  if (recordQ.isError) captureError(recordQ.error, "Visitor.getRecord");

  const followQ = useQuery({
    queryKey: ["followStatus", ownerId],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowStatus, { userId: ownerId }) as Promise<{
        status: "none" | "pending" | "following";
      }>,
    enabled: !!ownerId && !!user?.id && !isSelf,
  });

  const rec = recordQ.data;
  const name = rec?.identity.displayName || publicQ.data?.display_name || decoded;
  const handle = rec?.identity.username || publicQ.data?.username || decoded;
  const bio = (rec?.identity.bio || publicQ.data?.bio || "").trim();
  const avatar = rec?.identity.avatarUrl ?? publicQ.data?.avatar_url ?? null;
  const gate = rec?.gate ?? { profile: false, challenges: false, activity: false };
  const vis = rec?.visibility.profile ?? parseVis(publicQ.data?.profile_visibility);
  const following = followQ.data?.status === "following";
  const weekStartLabel = rec?.detail.months[rec.detail.months.length - 1]?.label ?? "";

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["followStatus", ownerId] });
    await queryClient.invalidateQueries({
      queryKey: ["profiles", "getRecord", ownerId, previewStranger ? "stranger" : "live"],
    });
    await queryClient.invalidateQueries({ queryKey: ["publicProfile", decoded] });
  }, [queryClient, ownerId, previewStranger, decoded]);

  const onFollow = async () => {
    if (!ownerId || followBusy || isSelf) return;
    if (!user?.id) {
      router.push(ROUTES.AUTH_LOGIN as never);
      return;
    }
    if (following) {
      setShowUnfollow(true);
      return;
    }
    setFollowBusy(true);
    try {
      if (vis === "friends" || vis === "private") {
        await trpcMutate(TRPC.profiles.sendFollowRequest, { userId: ownerId });
      } else {
        await trpcMutate(TRPC.profiles.followUser, { userId: ownerId });
      }
      await invalidate();
    } catch (e) {
      captureError(e, "VisitorFollow");
    } finally {
      setFollowBusy(false);
    }
  };

  const onUnfollow = async () => {
    setShowUnfollow(false);
    if (!ownerId) return;
    setFollowBusy(true);
    try {
      await trpcMutate(TRPC.profiles.unfollowUser, { userId: ownerId });
      await invalidate();
    } catch (e) {
      captureError(e, "VisitorUnfollow");
    } finally {
      setFollowBusy(false);
    }
  };

  const onMore = () => {
    const opts = isSelf ? ["Share", "Cancel"] : ["Share", `Block @${handle}`, "Cancel"];
    const run = (i: number) => {
      if (i === 0) {
        void shareProfile({
          username: handle,
          streak: rec?.streak.current ?? 0,
          totalDaysSecured: rec?.detail.totalVerified ?? 0,
          tier: "Starter",
        });
      } else if (!isSelf && i === 1) setShowBlock(true);
    };
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: opts,
          cancelButtonIndex: opts.length - 1,
          ...(isSelf ? {} : { destructiveButtonIndex: 1 }),
        },
        run
      );
    } else {
      Alert.alert("More", undefined, [
        { text: "Share", onPress: () => run(0) },
        ...(!isSelf
          ? [{ text: `Block @${handle}`, style: "destructive" as const, onPress: () => run(1) }]
          : []),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const lockTitle =
    vis === "private" ? "This profile is private" : "Visible to their circle";
  const lockBody =
    vis === "private"
      ? `${name} keeps this record private. Nothing is shown, and requests are not accepted automatically.`
      : `${name} shows the streak, activity and proofs to people they have accepted. Follow to see the record.`;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.nav}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.iconBtn}
          >
            <ChevronLeft size={22} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />
          </Pressable>
          <Pressable
            onPress={onMore}
            accessibilityRole="button"
            accessibilityLabel="More"
            style={styles.iconBtn}
          >
            <MoreHorizontal size={22} color={PROFILE_V2_COLOR.ink} strokeWidth={1.6} />
          </Pressable>
        </View>

        <GriitFade fadeKey={`visitor-${handle}-${gate.profile}-${following}`}>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.identity}>
              <Avatar url={avatar} name={name || handle} size={76} userId={ownerId || undefined} />
              <View style={styles.idCol}>
                <Text style={styles.displayName}>{name || handle}</Text>
                <Text style={styles.handle}>@{handle}</Text>
              </View>
            </View>
            {bio ? (
              <Pressable onPress={() => setBioOpen((v) => !v)} accessibilityRole="button">
                <Text style={styles.bio} numberOfLines={bioOpen ? undefined : 3}>
                  {bio}
                </Text>
              </Pressable>
            ) : null}

            {!isSelf ? (
              <View style={styles.actions}>
                <Pressable
                  onPress={() => void onFollow()}
                  disabled={followBusy}
                  accessibilityRole="button"
                  accessibilityLabel={following ? "Following" : "Follow"}
                  style={[styles.follow, following && styles.followOn]}
                >
                  <Text style={[styles.followTxt, following && styles.followTxtOn]}>
                    {following ? "Following" : "Follow"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Message"
                  style={styles.msg}
                  onPress={() => {
                    /* no DM surface in the app */
                  }}
                >
                  <MessageCircle size={20} color={PROFILE_V2_COLOR.body} strokeWidth={1.6} />
                </Pressable>
              </View>
            ) : null}

            {previewStranger ? (
              <Text style={styles.previewNote}>Preview · how a stranger sees this profile</Text>
            ) : null}

            {!gate.profile ? (
              <>
                <View style={styles.lock}>
                  <Lock size={22} color={PROFILE_V2_COLOR.muted} strokeWidth={1.6} />
                  <Text style={styles.lockTitle}>{lockTitle}</Text>
                  <Text style={styles.lockBody}>{lockBody}</Text>
                </View>
                <View style={styles.hiddenRow}>
                  <HiddenTile label="STREAK" />
                  <HiddenTile label="CONSISTENCY" />
                </View>
              </>
            ) : (
              <>
                <StreakCard
                  current={rec?.streak.current ?? 0}
                  best={rec?.streak.best ?? 0}
                  note={rec?.streak.note ?? ""}
                />
                <View style={{ height: 10 }} />
                {gate.activity ? (
                  <ConsistencyCard
                    consistency={rec!.consistency}
                    weekStartLabel={weekStartLabel}
                    onOpenDetail={() =>
                      router.push({
                        pathname: ROUTES.PROFILE_CONSISTENCY as never,
                        params: { userId: ownerId },
                      } as never)
                    }
                  />
                ) : null}
                {gate.challenges ? (
                  <View style={styles.runs}>
                    <Text style={styles.micro}>ACTIVE RUNS</Text>
                    {(rec?.runs ?? []).map((r) => (
                      <ChallengeRow
                        key={r.id}
                        name={r.name}
                        dayLabel={r.dayLabel}
                        meta={r.meta}
                        days={r.days}
                        onPress={() => router.push(ROUTES.CHALLENGE_ACTIVE(r.id) as never)}
                      />
                    ))}
                  </View>
                ) : null}
                {gate.activity ? (
                  <View style={styles.strip}>
                    {(rec?.proofs ?? []).slice(0, 6).map((p) => (
                      <View key={p.dateKey} style={styles.tile}>
                        {p.imageUrl ? (
                          <Image source={{ uri: p.imageUrl }} style={styles.tileImg} contentFit="cover" />
                        ) : (
                          <View style={styles.tileText}>
                            <Text style={styles.tileTextLbl}>Text proof</Text>
                          </View>
                        )}
                        <View style={styles.chip}>
                          <Text style={styles.chipTxt}>Day {p.day}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        </GriitFade>

        <ConfirmDialog
          visible={showUnfollow}
          title="Unfollow?"
          message={`Stop following @${handle}?`}
          confirmLabel="Unfollow"
          destructive
          onConfirm={() => void onUnfollow()}
          onCancel={() => setShowUnfollow(false)}
        />
        <ConfirmDialog
          visible={showBlock}
          title={`Block @${handle}?`}
          message="They will not see your profile or activity."
          confirmLabel="Block"
          destructive
          onConfirm={async () => {
            setShowBlock(false);
            if (!ownerId) return;
            try {
              await trpcMutate(TRPC.profiles.blockUser, { userId: ownerId });
              router.back();
            } catch (e) {
              captureError(e, "VisitorBlock");
            }
          }}
          onCancel={() => setShowBlock(false)}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

function parseVis(raw: string | undefined): VisibilityLevel {
  const s = String(raw ?? "public").toLowerCase();
  if (s === "friends" || s === "private") return s;
  return "public";
}

function HiddenTile({ label }: { label: string }) {
  return (
    <View style={styles.hidden}>
      <Text style={styles.hiddenLbl}>{label}</Text>
      <Text style={styles.hiddenVal}>Hidden</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PROFILE_V2_COLOR.canvas },
  nav: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 28, paddingBottom: 34 },
  identity: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  idCol: { flex: 1, minWidth: 0 },
  displayName: {
    fontSize: 27,
    fontWeight: "500",
    letterSpacing: -0.9,
    lineHeight: 28,
    color: PROFILE_V2_COLOR.ink,
  },
  handle: { marginTop: 6, fontSize: 13, color: PROFILE_V2_COLOR.mutedLight },
  bio: { marginTop: 14, fontSize: 14, lineHeight: 20, color: PROFILE_V2_COLOR.body },
  actions: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 14 },
  follow: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: PROFILE_V2_COLOR.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  followOn: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.borderStrong,
  },
  followTxt: { fontSize: 15, color: PROFILE_V2_COLOR.surface },
  followTxtOn: { color: PROFILE_V2_COLOR.ink },
  msg: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_V2_COLOR.surface,
  },
  previewNote: {
    marginBottom: 12,
    fontSize: 12,
    color: PROFILE_V2_COLOR.mutedLight,
  },
  lock: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderWidth: 2,
    borderColor: PROFILE_V2_COLOR.border,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  lockTitle: { fontSize: 17, color: PROFILE_V2_COLOR.ink, textAlign: "center" },
  lockBody: {
    fontSize: 13,
    lineHeight: 20,
    color: PROFILE_V2_COLOR.muted,
    textAlign: "center",
  },
  hiddenRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  hidden: {
    flex: 1,
    backgroundColor: PROFILE_V2_COLOR.sunken,
    borderRadius: 16,
    padding: 16,
    minHeight: 72,
  },
  hiddenLbl: { fontSize: 11, letterSpacing: 0.8, color: PROFILE_V2_COLOR.mutedLight },
  hiddenVal: { marginTop: 8, fontSize: 19, fontWeight: "500", color: PROFILE_V2_COLOR.mutedLight },
  runs: { marginTop: 18, gap: 10 },
  micro: { fontSize: 11, letterSpacing: 1.4, color: PROFILE_V2_COLOR.mutedLight },
  strip: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 18 },
  tile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: PROFILE_V2_COLOR.sunken,
  },
  tileImg: { width: "100%", height: "100%" },
  tileText: { flex: 1, alignItems: "center", justifyContent: "center" },
  tileTextLbl: { fontSize: 11, color: PROFILE_V2_COLOR.mutedLight },
  chip: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  chipTxt: { fontSize: 10, color: PROFILE_V2_COLOR.ink },
});
