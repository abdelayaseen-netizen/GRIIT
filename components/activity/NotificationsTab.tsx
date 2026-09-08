import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, SectionList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { DS_V3 } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { ROUTES } from "@/lib/routes";
import type { NotifRow } from "@/components/activity/types";
import Avatar from "@/components/ds/Avatar";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";
import ListRow from "@/components/ds/ListRow";
import Skeleton from "@/components/ds/Skeleton";

const ICON = DS_V3.space.xs * 6;

function dayFromMeta(n: NotifRow): number | null {
  const md = n.metadata;
  if (typeof md.day_number === "number") return md.day_number;
  if (typeof md.current_day === "number") return md.current_day;
  if (typeof md.day_label === "string") {
    const m = md.day_label.match(/(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
}

function notifTitle(n: NotifRow): string {
  const name = n.actorDisplayName ?? n.actorUsername ?? null;
  const day = dayFromMeta(n);
  switch (n.type) {
    case "respect":
      if (name) {
        return day != null
          ? `${name} liked your day ${day} proof`
          : `${name} liked your proof`;
      }
      break;
    case "comment":
      if (name) {
        return day != null
          ? `${name} commented on your day ${day} proof`
          : `${name} commented on your proof`;
      }
      break;
    case "follow":
      if (name) return `${name} started following you`;
      break;
    case "follow_request":
      if (name) return `${name} wants to follow you`;
      break;
    case "rank": {
      const challengeName = String(
        n.metadata.challenge_title ?? n.metadata.challenge_name ?? "challenge",
      );
      const rank = n.metadata.rank;
      const gap = n.metadata.rankGap;
      return `You're #${rank} on ${challengeName}. ${gap} pts behind #${Number(rank) - 1}`;
    }
    default:
      break;
  }
  const t = (n.title ?? "").trim();
  const b = (n.body ?? "").trim();
  if (t || b) return [t, b].filter(Boolean).join(" ");
  return "Notification";
}

function NotificationsBody({
  query,
  userId,
  refreshing,
  onRefresh,
}: {
  query: ReturnType<typeof useQuery<{ unread: NotifRow[]; earlier: NotifRow[] }>>;
  userId: string;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  const qc = useQueryClient();
  const router = useRouter();

  const onFollow = useCallback(
    async (actorId: string) => {
      try {
        await trpcMutate(TRPC.profiles.followUser, { userId: actorId });
        void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
      } catch (e) {
        captureError(e, "ActivityFollowUser");
      }
    },
    [qc, userId],
  );

  const sections = useMemo(() => {
    const unread = query.data?.unread ?? [];
    const earlier = query.data?.earlier ?? [];
    const s: { title: string; data: NotifRow[] }[] = [];
    if (unread.length) s.push({ title: "NEW", data: unread });
    if (earlier.length) s.push({ title: "EARLIER", data: earlier });
    return s;
  }, [query.data?.unread, query.data?.earlier]);

  const renderItem = useCallback(
    ({ item }: { item: NotifRow }) => (
      <NotificationRow
        n={item}
        onFollow={onFollow}
        userId={userId}
        onPress={
          (item.type === "respect" || item.type === "comment") && item.metadata?.event_id
            ? () => router.push(ROUTES.POST_ID(String(item.metadata.event_id)) as never)
            : item.type === "follow" || item.type === "follow_request"
              ? item.actorId
                ? () => {
                    const uname = item.actorUsername?.trim();
                    if (uname && uname !== "?" && uname.length >= 2) {
                      router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(uname)) as never);
                    } else if (item.actorId) {
                      router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(item.actorId)) as never);
                    }
                  }
                : undefined
              : undefined
        }
      />
    ),
    [onFollow, userId, router],
  );

  if (query.isPending) {
    return (
      <View style={styles.skel}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </View>
    );
  }
  if (query.isError) {
    return (
      <View style={styles.emptyPad}>
        <EmptyState
          heading="Couldn't load notifications"
          body="Check your connection and try again."
          actionLabel="Retry"
          variant="error"
          onRetry={() => void query.refetch()}
        />
      </View>
    );
  }

  const unread = query.data?.unread ?? [];
  const earlier = query.data?.earlier ?? [];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={() => null}
      ListEmptyComponent={
        unread.length === 0 && earlier.length === 0 ? (
          <View style={styles.emptyPad}>
            <EmptyState
              icon={
                <Bell
                  size={ICON}
                  color={DS_V3.color.textPrimary}
                  accessibilityLabel="Notifications"
                />
              }
              heading="No notifications yet"
              body="Join a challenge and updates from your circle land here."
              actionLabel="Find a challenge"
              onAction={() => router.push(ROUTES.TABS_DISCOVER as never)}
            />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={DS_V3.color.brand}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      stickySectionHeadersEnabled={false}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}

const NotificationRow = React.memo(function NotificationRow({
  n,
  onFollow,
  userId,
  onPress,
}: {
  n: NotifRow;
  onFollow: (id: string) => void;
  userId: string;
  onPress?: () => void;
}) {
  const qc = useQueryClient();
  const [frDone, setFrDone] = useState<"accepted" | "declined" | null>(null);
  const title = notifTitle(n);
  const who = n.actorDisplayName ?? n.actorUsername ?? null;

  const onAcceptFr = useCallback(async () => {
    if (!n.actorId) return;
    try {
      await trpcMutate(TRPC.profiles.acceptFollowRequest, { requesterId: n.actorId });
      setFrDone("accepted");
      void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
    } catch (e) {
      captureError(e, "AcceptFollowRequest");
    }
  }, [n.actorId, qc, userId]);

  const onDeclineFr = useCallback(async () => {
    if (!n.actorId) return;
    try {
      await trpcMutate(TRPC.profiles.declineFollowRequest, { requesterId: n.actorId });
      setFrDone("declined");
      void qc.invalidateQueries({ queryKey: ["activity", "notifications", userId] });
    } catch (e) {
      captureError(e, "DeclineFollowRequest");
    }
  }, [n.actorId, qc, userId]);

  if (n.type === "follow_request" && frDone === "declined") {
    return null;
  }

  let trailing: React.ReactNode = null;
  if (n.type === "follow_request" && n.actorId) {
    trailing =
      frDone === "accepted" ? (
        <Button label="Accepted" variant="secondary" size="small" disabled />
      ) : (
        <View style={styles.frActions}>
          <Button
            label="Accept"
            variant="secondary"
            size="small"
            onPress={() => void onAcceptFr()}
          />
          <Button
            label="Decline"
            variant="tertiary"
            size="small"
            onPress={() => void onDeclineFr()}
          />
        </View>
      );
  } else if (n.type === "follow" && n.actorId) {
    trailing = (
      <Button
        label="Follow"
        variant="secondary"
        size="small"
        onPress={() => onFollow(n.actorId!)}
      />
    );
  }

  return (
    <ListRow
      icon={
        <Avatar
          size={DS_V3.size.avatar.sm}
          uri={n.actorAvatarUrl}
          displayName={who}
        />
      }
      title={title}
      subtitle={relativeTime(n.createdAt)}
      trailing={trailing}
      onPress={onPress}
    />
  );
});

export interface NotificationsTabProps {
  userId: string;
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
  const notifQuery = useQuery({
    queryKey: ["activity", "notifications", userId],
    queryFn: () =>
      trpcQuery(TRPC.notifications.getAll) as Promise<{
        unread: NotifRow[];
        earlier: NotifRow[];
      }>,
    enabled: !!userId,
    staleTime: 30 * 1000,
    retry: 2,
  });

  const refreshing = notifQuery.isRefetching;

  const onRefresh = useCallback(async () => {
    await notifQuery.refetch();
  }, [notifQuery]);

  return (
    <NotificationsBody
      query={notifQuery}
      userId={userId}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: DS_V3.space.gutter * 6,
    paddingTop: DS_V3.space.md,
  },
  emptyPad: {
    paddingTop: DS_V3.space.gutter * 3 + DS_V3.space.xs,
    paddingHorizontal: DS_V3.space.gutter,
  },
  skel: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  frActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
});
