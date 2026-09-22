import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { useAuth } from "@/contexts/AuthContext";
import { invalidateAfterFollow } from "@/lib/follow-invalidate";
import Avatar from "@/components/ds/Avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type FollowRow = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
};

function paramString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return "";
}

export default function FollowListScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ userId?: string; mode?: string; username?: string }>();
  const userId = paramString(params.userId);
  const mode = paramString(params.mode) === "following" ? "following" : "followers";
  const username = paramString(params.username);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [unfollowTarget, setUnfollowTarget] = useState<FollowRow | null>(null);

  const validUserId = useMemo(() => {
    const re =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return re.test(userId) ? userId : "";
  }, [userId]);

  const listQuery = useQuery({
    queryKey: ["followList", validUserId, mode],
    queryFn: () =>
      trpcQuery(mode === "followers" ? TRPC.profiles.getFollowers : TRPC.profiles.getFollowing, {
        userId: validUserId,
      }) as Promise<FollowRow[]>,
    enabled: !!validUserId,
  });

  useEffect(() => {
    if (!bannerError) return;
    const t = setTimeout(() => setBannerError(null), 3000);
    return () => clearTimeout(t);
  }, [bannerError]);

  const titlePrefix = username ? `${username}'s ` : "";
  const headerTitle = mode === "followers" ? `${titlePrefix}Followers` : `${titlePrefix}Following`;

  const invalidateFollow = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["followList"] });
    await qc.invalidateQueries({ queryKey: ["publicProfile"] });
    if (user?.id) await invalidateAfterFollow(qc, user.id);
  }, [qc, user?.id]);

  const runUnfollow = useCallback(
    async (row: FollowRow) => {
      setBusyId(row.user_id);
      try {
        await trpcMutate(TRPC.profiles.unfollowUser, { userId: row.user_id });
        await invalidateFollow();
      } catch {
        setBannerError("Could not unfollow.");
      } finally {
        setBusyId(null);
      }
    },
    [invalidateFollow]
  );

  const onToggleFollow = useCallback(
    async (row: FollowRow) => {
      if (!user?.id || row.user_id === user.id) return;
      if (!row.is_following) {
        setBusyId(row.user_id);
        try {
          await trpcMutate(TRPC.profiles.followUser, { userId: row.user_id });
          await invalidateFollow();
        } catch {
          try {
            await trpcMutate(TRPC.profiles.sendFollowRequest, { userId: row.user_id });
            await invalidateFollow();
          } catch {
            setBannerError("Could not follow. Try again from their profile.");
          }
        } finally {
          setBusyId(null);
        }
        return;
      }
      setUnfollowTarget(row);
    },
    [user?.id, invalidateFollow]
  );

  const confirmUnfollow = useCallback(() => {
    const row = unfollowTarget;
    setUnfollowTarget(null);
    if (row) void runUnfollow(row);
  }, [unfollowTarget, runUnfollow]);

  const users = listQuery.data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: FollowRow }) => {
      const primary = item.display_name?.trim() || item.username;
      const busy = busyId === item.user_id;
      return (
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.rowMain}
            onPress={() => {
              if (item.user_id === user?.id) {
                router.push(ROUTES.TABS_PROFILE as never);
              } else {
                router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(item.username)) as never);
              }
            }}
            accessibilityLabel={`View ${item.username}'s profile`}
            accessibilityRole="button"
          >
            <Avatar
              size={DS_V3.size.avatar.sm}
              uri={item.avatar_url?.trim() || undefined}
              displayName={item.display_name}
            />
            <View style={styles.rowText}>
              <Text style={styles.name}>{primary}</Text>
              <Text style={styles.handle}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
          {user?.id && item.user_id !== user.id ? (
            <TouchableOpacity
              style={[styles.followBtn, item.is_following && styles.followBtnOutline]}
              onPress={() => void onToggleFollow(item)}
              disabled={busy}
              accessibilityLabel={item.is_following ? `Unfollow ${item.username}` : `Follow ${item.username}`}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator size="small" color={item.is_following ? DS_V3.color.textSecondary : DS_V3.color.textPrimary} />
              ) : (
                <Text style={[styles.followBtnTxt, item.is_following && styles.followBtnTxtOutline]}>
                  {item.is_following ? "Following" : "Follow"}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      );
    },
    [busyId, onToggleFollow, router, user?.id]
  );

  const listEmpty = useCallback(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{mode === "followers" ? "No followers yet" : "Not following anyone yet"}</Text>
        <Text style={styles.emptySub}>
          {mode === "followers"
            ? "Share your profile to get followers."
            : "Discover people to follow on the leaderboard."}
        </Text>
      </View>
    ),
    [mode]
  );

  return (
    <ErrorBoundary>
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {bannerError ? (
          <View style={styles.banner} accessibilityRole="alert">
            <Text style={styles.bannerText}>{bannerError}</Text>
          </View>
        ) : null}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={DS_V3.color.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!validUserId ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Invalid link</Text>
          </View>
        ) : listQuery.isPending ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={DS_V3.color.primary} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.user_id}
            renderItem={renderItem}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android"}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
      <ConfirmDialog
        visible={unfollowTarget !== null}
        title="Unfollow"
        message={
          unfollowTarget ? `Stop following @${unfollowTarget.username}?` : ""
        }
        cancelLabel="Cancel"
        confirmLabel="Unfollow"
        destructive
        onCancel={() => setUnfollowTarget(null)}
        onConfirm={confirmUnfollow}
      />
    </>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  banner: {
    marginHorizontal: DS_V3.space.md,
    marginTop: DS_V3.space.sm,
    paddingVertical: 10,
    paddingHorizontal: DS_V3.space.md,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.danger,
  },
  bannerText: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_V3.space.md,
    paddingBottom: DS_V3.space.md,
    gap: DS_V3.space.md,
  },
  backBtn: { padding: DS_V3.space.xs },
  headerTitle: {
    flex: 1,
    fontSize: DS_V3.type.heading.fontSize,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  headerSpacer: { width: 28 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: DS_V3.space.md, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DS_V3.space.md,
    gap: DS_V3.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_V3.color.border,
  },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: DS_V3.space.md, minWidth: 0 },
  rowText: { flex: 1, minWidth: 0 },
  name: {
    fontSize: DS_V3.type.secondary.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  handle: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  followBtn: {
    paddingVertical: 6,
    paddingHorizontal: DS_V3.space.lg,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.primary,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnOutline: {
    backgroundColor: DS_V3.color.canvas,
    borderWidth: 1.5,
    borderColor: DS_V3.color.border,
  },
  followBtnTxt: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  followBtnTxtOutline: { color: DS_V3.color.textSecondary },
  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: {
    fontSize: DS_V3.type.secondary.fontSize,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySub: {
    fontSize: DS_V3.type.caption.fontSize,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
