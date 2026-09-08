/**
 * Visitor profile v2 — identity always; record gated server-side.
 * Public: Follow / Following. Friends/Private: Request to follow / Requested / Following.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MoreHorizontal } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { shareProfile } from "@/lib/share";
import { DS_V3 } from "@/lib/design-system";
import type { ProfileRecord } from "@/lib/profile-v2-record";
import type { ProfileRelationship, VisibilityLevel } from "@/lib/profile-v2-visibility";
import { visitorFollowControl } from "@/lib/profile-v2-visibility";
import HeaderIcon from "@/components/ds/HeaderIcon";
import PushedHeader from "@/components/ds/PushedHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { badgeItemsFromRows, ProfileV3 } from "@/components/profile/ProfileV3";
import { badgeRowsFromProgress } from "@/lib/profile-v2-badges";
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
  const [tab, setTab] = useState<"Challenges" | "Proofs" | "Badges">("Challenges");

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

  const followCountsQuery = useQuery({
    queryKey: ["profile", ownerId, "followCounts"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowCounts, { userId: ownerId }) as Promise<{
        followers: number;
        following: number;
      }>,
    staleTime: 60 * 1000,
    enabled: !!ownerId,
  });

  const rec = recordQ.data;
  const name = rec?.identity.displayName || publicQ.data?.display_name || decoded;
  const handle = rec?.identity.username || publicQ.data?.username || decoded;
  const bio = (rec?.identity.bio || publicQ.data?.bio || "").trim();
  const avatar = rec?.identity.avatarUrl ?? publicQ.data?.avatar_url ?? null;
  const gate = rec?.gate ?? { profile: false, challenges: false, activity: false };
  const vis = rec?.visibility.profile ?? parseVis(publicQ.data?.profile_visibility);
  const followStatus = followQ.data?.status ?? "none";
  const followCtrl = visitorFollowControl(vis, followStatus);
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
    if (followCtrl.action === "idle") return;
    if (followCtrl.action === "unfollow") {
      setShowUnfollow(true);
      return;
    }
    setFollowBusy(true);
    try {
      if (followCtrl.action === "request") {
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

  const joined = (rec?.runs.length ?? 0) > 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <PushedHeader
          title={name || handle}
          onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
          trailing={
            <HeaderIcon accessibilityLabel="More" onPress={onMore}>
              <MoreHorizontal size={DS_V3.space.xs * 6} color={DS_V3.color.textPrimary} />
            </HeaderIcon>
          }
        />

        <GriitFade fadeKey={`visitor-${handle}-${gate.profile}-${followCtrl.label}`}>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {previewStranger ? (
              <Text style={styles.previewNote}>Preview · how a stranger sees this profile</Text>
            ) : null}
            <ProfileV3
              title={name || handle}
              handle={handle}
              avatarUrl={avatar}
              followers={followCountsQuery.isError ? 0 : (followCountsQuery.data?.followers ?? 0)}
              following={followCountsQuery.isError ? 0 : (followCountsQuery.data?.following ?? 0)}
              bio={bio}
              streak={rec?.streak.current ?? 0}
              best={rec?.streak.best ?? 0}
              consistency={rec?.consistency.rate ?? "No due days"}
              consistencySub={
                joined
                  ? "Post every day. Missed days count."
                  : "Join a challenge and the strip starts filling."
              }
              tab={tab}
              onChangeTab={setTab}
              runs={(rec?.runs ?? []).map((r) => ({
                id: r.id,
                name: r.name,
                day: r.day,
                length: r.length,
              }))}
              proofs={rec?.proofs ?? []}
              badges={badgeItemsFromRows(
                rec?.badges ??
                  badgeRowsFromProgress({
                    bestStreak: rec?.streak.best ?? 0,
                    verifiedDays: rec?.detail.totalVerified ?? 0,
                  }),
              )}
              onShare={() =>
                void shareProfile({
                  username: handle,
                  streak: rec?.streak.current ?? 0,
                  totalDaysSecured: rec?.detail.totalVerified ?? 0,
                  tier: "Starter",
                })
              }
              onFollowers={() =>
                ownerId
                  ? router.push(ROUTES.FOLLOW_LIST(ownerId, "followers", handle) as never)
                  : undefined
              }
              onFollowing={() =>
                ownerId
                  ? router.push(ROUTES.FOLLOW_LIST(ownerId, "following", handle) as never)
                  : undefined
              }
              onSeeRecord={() =>
                router.push({
                  pathname: ROUTES.PROFILE_CONSISTENCY as never,
                  params: { userId: ownerId },
                } as never)
              }
              onDiscover={() => router.push(ROUTES.TABS_DISCOVER as never)}
              onOpenRun={(id) => router.push(ROUTES.CHALLENGE_ACTIVE(id) as never)}
              followLabel={isSelf ? undefined : followCtrl.label}
              onFollow={isSelf ? undefined : () => void onFollow()}
              followDisabled={followBusy || followCtrl.action === "idle"}
              showRootHeader={false}
              locked={
                gate.profile
                  ? null
                  : { heading: lockTitle, body: lockBody }
              }
            />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { paddingBottom: DS_V3.space.xs * 30 },
  previewNote: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
