import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import {
  groupBrokeYesterdayLine,
  groupSecuredTodayLine,
  groupStreakUnit,
  rosterTrailing,
  memberStreakCaption,
  membersInGroupLabel,
  pendingTrailing,
  showInvitedSection,
  sortRoster,
  type RosterMember,
} from "@/lib/group-ui";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import EmptyState from "@/components/ds/EmptyState";
import MemberRow from "@/components/ds/MemberRow";
import PushedHeader from "@/components/ds/PushedHeader";
import Skeleton from "@/components/ds/Skeleton";

const ICON = DS_V3.space.gutter;

type MembersPayload = {
  cap: number;
  groupStreak: number;
  groupStreakBrokeBy?: string | null;
  members: (RosterMember & { avatar?: string | null })[];
  pendingInvites: {
    inviteId: string;
    userId: string;
    displayName: string;
    avatar?: string | null;
  }[];
};

type ChallengeTitleRow = { title?: string | null };

export default function ChallengeMembersScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

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

  const refetchMembers = membersQuery.refetch;
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      void refetchMembers();
    }, [id, refetchMembers]),
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const isCreator = useMemo(() => {
    const members = membersQuery.data?.members ?? [];
    return members.some((m) => m.userId === user?.id && m.role === "creator");
  }, [membersQuery.data?.members, user?.id]);

  const roster = useMemo(
    () => sortRoster(membersQuery.data?.members ?? []),
    [membersQuery.data?.members],
  );

  const pending = membersQuery.data?.pendingInvites ?? [];
  const memberCount = roster.length;
  const securedToday = roster.filter((m) => m.securedToday).length;
  const groupStreak = membersQuery.data?.groupStreak ?? 0;
  const groupStreakBrokeBy = membersQuery.data?.groupStreakBrokeBy ?? null;
  const justYou = memberCount <= 1 && pending.length === 0;
  const title = challengeQuery.data?.title?.trim() || "Challenge";

  const onCancel = useCallback(
    async (inviteId: string) => {
      try {
        await trpcMutate(TRPC.groups.cancel, { inviteId });
        void qc.invalidateQueries({ queryKey: ["groups", "members", id] });
      } catch (e) {
        captureError(e, "GroupCancelInvite");
      }
    },
    [id, qc],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PushedHeader title={title} onBack={goBack} />
      {membersQuery.isError ? (
        <View style={styles.errorWrap}>
          <EmptyState
            heading="Couldn't load the group"
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onRetry={() => void membersQuery.refetch()}
          />
        </View>
      ) : (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {membersQuery.isPending && !membersQuery.data ? (
              <View style={styles.skel}>
                <Skeleton />
                <Skeleton />
              </View>
            ) : (
              <>
                <Text style={styles.label}>Group streak</Text>
                <View style={styles.streakRow}>
                  <DisplayNumber value={groupStreak} size="home" />
                  <Text style={styles.unit}>{groupStreakUnit(groupStreak)}</Text>
                </View>
                <Text style={styles.securedLine}>
                  {groupStreakBrokeBy
                    ? groupBrokeYesterdayLine(groupStreakBrokeBy)
                    : groupSecuredTodayLine(securedToday, memberCount)}
                </Text>
                <Text style={styles.caption}>Counts only days every member secured.</Text>
                <Text style={styles.section}>{membersInGroupLabel(memberCount)}</Text>
                {justYou ? (
                  <View style={styles.emptyCard}>
                    <Card>
                      <Text style={styles.emptyTitle}>Just you so far.</Text>
                      <Text style={styles.emptyBody}>
                        Up to nine more can join. The group streak starts on the first day all of you
                        secure.
                      </Text>
                    </Card>
                  </View>
                ) : (
                  roster.map((m, i) => (
                    <MemberRow
                      key={m.userId}
                      displayName={m.displayName}
                      caption={memberStreakCaption(m.currentStreak)}
                      avatarUri={(m as { avatar?: string | null }).avatar}
                      nameAside={m.role === "creator" ? "Creator" : undefined}
                      trailing={rosterTrailing({
                        securedToday: m.securedToday,
                        yesterdayState: m.yesterdayState,
                      })}
                      divider={i < roster.length - 1 || pending.length > 0}
                    />
                  ))
                )}
                {showInvitedSection(pending.length) ? (
                  <>
                    <Text style={styles.section}>Invited</Text>
                    {pending.map((p, i) => (
                      <MemberRow
                        key={p.inviteId}
                        displayName={p.displayName}
                        avatarUri={p.avatar}
                        trailing={pendingTrailing(isCreator)}
                        divider={i < pending.length - 1}
                        onPress={
                          isCreator ? () => void onCancel(p.inviteId) : undefined
                        }
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
            <View style={styles.footerClear} />
          </ScrollView>
          <View style={styles.footer}>
            <Button
              label="Invite"
              icon={<UserPlus size={ICON} color={DS_V3.color.onBrand} />}
              onPress={() => {
                if (id) router.push(ROUTES.CHALLENGE_INVITE(id) as never);
              }}
            />
          </View>
        </>
      )}
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
  skel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  label: {
    paddingTop: DS_V3.space.section,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  streakRow: {
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  unit: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  securedLine: {
    paddingTop: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  caption: {
    paddingTop: DS_V3.space.xs,
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  section: {
    paddingTop: DS_V3.space.section,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.sm,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  emptyCard: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  emptyTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  emptyBody: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footerClear: {
    height: DS_V3.size.button + DS_V3.space.section,
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.gutter,
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
});
