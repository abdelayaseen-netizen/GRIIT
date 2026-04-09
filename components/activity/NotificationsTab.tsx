import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  SectionList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { DS_COLORS, DS_SHADOWS } from "@/lib/design-system";
import { getAvatarColor } from "@/lib/avatar";
import { relativeTime } from "@/lib/utils/relativeTime";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { ROUTES } from "@/lib/routes";
import { styles } from "@/components/activity/activity-styles";
import type { NotifRow } from "@/components/activity/types";

function getNotifText(n: NotifRow): { bold: string; rest: string } {
  const t = (n.title ?? "").trim();
  const b = (n.body ?? "").trim();
  if (t || b) {
    return { bold: t, rest: t && b ? ` ${b}` : b || "" };
  }
  const name = n.actorDisplayName ?? n.actorUsername ?? "Someone";
  const challengeName = String(n.metadata.challenge_title ?? n.metadata.challenge_name ?? "challenge");
  switch (n.type) {
    case "respect": {
      const dayLabel = typeof n.metadata.day_label === "string" && n.metadata.day_label ? ` ${n.metadata.day_label}` : "";
      return { bold: name, rest: ` respected your${dayLabel} ${challengeName} post` };
    }
    case "comment": {
      const commentText = String(n.metadata.comment_text ?? "").slice(0, 80);
      const commentChallenge = String(n.metadata.challenge_title ?? challengeName);
      return { bold: name, rest: ` commented on your ${commentChallenge} post — "${commentText}"` };
    }
    case "follow":
      return { bold: name, rest: " started following you" };
    case "follow_request":
      return { bold: name, rest: " wants to follow you" };
    case "rank":
      return {
        bold: "",
        rest: `You're #${n.metadata.rank} on ${challengeName} — ${n.metadata.rankGap} pts behind #${Number(n.metadata.rank) - 1}`,
      };
    default:
      return { bold: "", rest: "Notification" };
  }
}

function NotificationsBody({
  query,
  userId,
  listHeader,
  refreshing,
  onRefresh,
}: {
  query: ReturnType<typeof useQuery<{ unread: NotifRow[]; earlier: NotifRow[] }>>;
  userId: string;
  listHeader: React.ReactNode;
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
    [qc, userId]
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
    ({
      item,
      section,
    }: {
      item: NotifRow;
      section: { title: string; data: NotifRow[] };
    }) => (
      <NotificationRow
        n={item}
        onFollow={onFollow}
        unread={section.title === "NEW"}
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
    [onFollow, userId, router]
  );

  if (query.isPending) return <LoadingState message="Loading notifications..." />;
  if (query.isError) return <ErrorState message="Couldn't load notifications" onRetry={() => void query.refetch()} />;

  const unread = query.data?.unread ?? [];
  const earlier = query.data?.earlier ?? [];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => <Text style={styles.groupLabel}>{title}</Text>}
      ListHeaderComponent={<>{listHeader}</>}
      ListEmptyComponent={
        unread.length === 0 && earlier.length === 0 ? (
          <View style={styles.emptyStateFill}>
            <View style={styles.emptyIconCircle}>
              <Bell size={40} color={DS_COLORS.TEXT_MUTED} style={styles.iconMuted} />
            </View>
            <Text style={styles.emptyTitleStrong}>No notifications yet</Text>
            <Text style={styles.emptyBodyNarrow}>
              Complete a task or join a challenge to start getting updates from the community.
            </Text>
            <TouchableOpacity accessibilityRole="button"
              onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
              accessibilityLabel="Start a challenge"
            >
              <Text style={styles.emptyTextCta}>Start a challenge →</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={DS_COLORS.DISCOVER_CORAL} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      stickySectionHeadersEnabled={false}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
      removeClippedSubviews={Platform.OS === "android"}
    />
  );
}

const NotificationRow = React.memo(function NotificationRow({
  n,
  onFollow,
  unread,
  userId,
  onPress,
}: {
  n: NotifRow;
  onFollow: (id: string) => void;
  unread: boolean;
  userId: string;
  onPress?: () => void;
}) {
  const qc = useQueryClient();
  const [frDone, setFrDone] = useState<"accepted" | "declined" | null>(null);
  const text = getNotifText(n);
  const colors = n.actorId ? getAvatarColor(n.actorId) : getAvatarColor(n.id);
  const initial = (n.actorDisplayName ?? n.actorUsername ?? "?").charAt(0).toUpperCase();
  const notifA11yLabel = (() => {
    if (!onPress) return "Notification";
    if ((n.type === "respect" || n.type === "comment") && n.metadata?.event_id) return "View related post";
    if (n.type === "follow" || n.type === "follow_request") {
      const who = n.actorDisplayName ?? n.actorUsername ?? "user";
      return `View profile for ${who}`;
    }
    return "Open notification";
  })();

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

  return (
    <Pressable accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={notifA11yLabel}
      accessibilityState={{ disabled: !onPress }}
      style={[styles.notifRow, DS_SHADOWS.cardSubtle, unread ? styles.notifUnread : styles.notifRead]}
    >
      <View style={styles.avatarWrap}>
        <View style={[styles.notifAvatar, { backgroundColor: colors.bg }]}>
          <Text style={[styles.notifAvatarLetter, { color: colors.letter }]}>{n.type === "rank" ? "★" : initial}</Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                n.type === "respect"
                  ? DS_COLORS.DISCOVER_CORAL
                  : n.type === "comment"
                    ? DS_COLORS.CELEB_BONUS_PURPLE
                    : n.type === "follow" || n.type === "follow_request"
                      ? DS_COLORS.DISCOVER_GREEN
                      : n.type === "rank"
                        ? DS_COLORS.WARNING
                        : DS_COLORS.TASK_ICON_BG,
            },
          ]}
        >
          <Text style={[styles.typeBadgeText, n.type === "follow" && styles.typeBadgeFollow]}>
            {n.type === "respect" ? "🔥" : n.type === "comment" ? "💬" : n.type === "follow" || n.type === "follow_request" ? "+" : n.type === "rank" ? "★" : "•"}
          </Text>
        </View>
      </View>
      <View style={styles.notifBody}>
        <Text style={styles.notifMain}>
          {text.bold ? <Text style={styles.notifBold}>{text.bold}</Text> : null}
          {text.rest}
        </Text>
        <Text style={styles.notifTime}>{relativeTime(n.createdAt)}</Text>
      </View>
      {n.type === "follow_request" && n.actorId ? (
        frDone === "accepted" ? (
          <Text style={styles.frAccepted}>Accepted</Text>
        ) : (
          <View style={styles.frActions}>
            <TouchableOpacity accessibilityRole="button"
              style={styles.frAcceptBtn}
              onPress={() => void onAcceptFr()}
              accessibilityLabel="Accept follow request"
            >
              <Text style={styles.frAcceptTxt}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button"
              style={styles.frDeclineBtn}
              onPress={() => void onDeclineFr()}
              accessibilityLabel="Decline follow request"
            >
              <Text style={styles.frDeclineTxt}>Decline</Text>
            </TouchableOpacity>
          </View>
        )
      ) : n.type === "follow" && n.actorId ? (
        <TouchableOpacity accessibilityRole="button"
          style={styles.followBtn}
          onPress={() => onFollow(n.actorId!)}
          accessibilityLabel="Follow back"
        >
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      ) : n.type === "respect" || n.type === "comment" ? (
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.thumbEmoji}>📸</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

export interface NotificationsTabProps {
  userId: string;
  listHeader: React.ReactNode;
}

export function NotificationsTab({ userId, listHeader }: NotificationsTabProps) {
  const notifQuery = useQuery({
    queryKey: ["activity", "notifications", userId],
    queryFn: () => trpcQuery(TRPC.notifications.getAll) as Promise<{ unread: NotifRow[]; earlier: NotifRow[] }>,
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
      listHeader={listHeader}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
