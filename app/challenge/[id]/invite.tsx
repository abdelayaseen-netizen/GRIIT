import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_V3 } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { inviteToChallenge } from "@/lib/share";
import { captureError } from "@/lib/sentry";
import {
  GROUP_CAP,
  mergeFollowGraph,
  pickerCaption,
  pickerRowState,
  type FollowPerson,
} from "@/lib/group-ui";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import Divider from "@/components/ds/Divider";
import MemberRow from "@/components/ds/MemberRow";
import PushedHeader from "@/components/ds/PushedHeader";
import Skeleton from "@/components/ds/Skeleton";

const ICON = DS_V3.space.gutter;

type MembersPayload = {
  members: { userId: string }[];
  pendingInvites: { userId: string }[];
};

type ChallengeTitleRow = { title?: string | null };

export default function ChallengeInviteScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [localInvited, setLocalInvited] = useState<string[]>([]);

  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery(TRPC.challenges.getById, { id: id! }) as Promise<ChallengeTitleRow>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const membersQuery = useQuery({
    queryKey: ["groups", "members", id],
    queryFn: () => trpcQuery(TRPC.groups.members, { challengeId: id! }) as Promise<MembersPayload>,
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  const followingQuery = useQuery({
    queryKey: ["followList", user?.id, "following"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowing, { userId: user!.id }) as Promise<FollowPerson[]>,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const followersQuery = useQuery({
    queryKey: ["followList", user?.id, "followers"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getFollowers, { userId: user!.id }) as Promise<FollowPerson[]>,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const people = useMemo(
    () =>
      mergeFollowGraph(followingQuery.data ?? [], followersQuery.data ?? [], user?.id),
    [followingQuery.data, followersQuery.data, user?.id],
  );

  const enrolled = useMemo(() => {
    const set = new Set((membersQuery.data?.members ?? []).map((m) => m.userId));
    return set;
  }, [membersQuery.data?.members]);

  const invited = useMemo(() => {
    const set = new Set((membersQuery.data?.pendingInvites ?? []).map((p) => p.userId));
    for (const uid of localInvited) set.add(uid);
    return set;
  }, [membersQuery.data?.pendingInvites, localInvited]);

  const memberCount = membersQuery.data?.members.length ?? 0;
  const full = memberCount >= GROUP_CAP;
  const title = challengeQuery.data?.title?.trim() || "Challenge";

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const onInvite = useCallback(
    async (userId: string) => {
      if (!id || full || enrolled.has(userId) || invited.has(userId)) return;
      try {
        await trpcMutate(TRPC.groups.invite, { challengeId: id, userId });
        setLocalInvited((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        void qc.invalidateQueries({ queryKey: ["groups", "members", id] });
      } catch (e) {
        captureError(e, "GroupInvite");
      }
    },
    [id, full, enrolled, invited, qc],
  );

  const onShareLink = useCallback(() => {
    if (!id) return;
    void inviteToChallenge({ name: title, id }, user?.id);
  }, [id, title, user?.id]);

  const loading =
    (followingQuery.isPending && !followingQuery.data) ||
    (followersQuery.isPending && !followersQuery.data) ||
    (membersQuery.isPending && !membersQuery.data);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PushedHeader title={`Invite to ${title}`} onBack={goBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.caption}>{pickerCaption(memberCount)}</Text>
        {full ? (
          <View style={styles.cardWrap}>
            <Card>
              <Text style={styles.cardBody}>
                This group is full. Ten is the cap, and someone has to leave before you can invite
                again.
              </Text>
            </Card>
          </View>
        ) : null}
        {loading ? (
          <View style={styles.skel}>
            <Skeleton />
            <Skeleton />
          </View>
        ) : people.length === 0 && !full ? (
          <View style={styles.cardWrap}>
            <Card>
              <Text style={styles.emptyTitle}>Follow people to invite them here.</Text>
              <Text style={styles.cardBody}>A link works on anyone, follower or not.</Text>
            </Card>
          </View>
        ) : (
          people.map((p, i) => {
            const state = pickerRowState({
              enrolled: enrolled.has(p.user_id),
              invited: invited.has(p.user_id),
            });
            const actionable = state === "invite" && !full;
            return (
              <MemberRow
                key={p.user_id}
                displayName={p.display_name?.trim() || p.username}
                caption={`@${p.username}`}
                avatarUri={p.avatar_url}
                trailing={state}
                full={full}
                dimmed={full}
                divider={i < people.length - 1}
                onPress={actionable ? () => void onInvite(p.user_id) : undefined}
              />
            );
          })
        )}
        <View style={styles.footerClear} />
      </ScrollView>
      <View style={styles.share}>
        <Divider />
        <View style={styles.sharePad}>
          <Button
            label="Share a link"
            variant="secondary"
            icon={<Link size={ICON} color={DS_V3.color.textPrimary} />}
            onPress={onShareLink}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DS_V3.space.gutter,
  },
  caption: {
    paddingTop: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  cardWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  emptyTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  cardBody: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  skel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  footerClear: {
    height: DS_V3.size.button + DS_V3.space.section,
  },
  share: {
    backgroundColor: DS_V3.color.canvas,
  },
  sharePad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    paddingBottom: DS_V3.space.gutter,
  },
});
