import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
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
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { useAuth } from "@/contexts/AuthContext";
import { getFeedAvatarBgFromUserId, getDisplayInitials } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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
    if (user?.id) {
      await qc.invalidateQueries({ queryKey: ["profile", user.id, "followCounts"] });
    }
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
            {item.avatar_url?.trim() ? (
              <Image source={{ uri: item.avatar_url.trim() }} style={styles.avatarImg} accessibilityIgnoresInvertColors />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: getFeedAvatarBgFromUserId(item.user_id) }]}>
                <Text style={styles.avatarLetter}>{getDisplayInitials(primary)}</Text>
              </View>
            )}
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
                <ActivityIndicator size="small" color={item.is_following ? DS_COLORS.TEXT_SECONDARY : DS_COLORS.WHITE} />
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
            <ChevronLeft size={24} color={DS_COLORS.TEXT_PRIMARY} />
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
            <ActivityIndicator size="large" color={DS_COLORS.PRIMARY} />
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  banner: {
    marginHorizontal: DS_SPACING.md,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: DS_COLORS.dangerLight,
    borderWidth: 1,
    borderColor: DS_COLORS.alertRedBorder,
  },
  bannerText: { fontSize: 13, fontWeight: "500", color: DS_COLORS.dangerDark, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.md,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  headerSpacer: { width: 28 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: DS_SPACING.md, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS.BORDER,
  },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 },
  avatarImg: { width: 44, height: 44, borderRadius: 22, backgroundColor: DS_COLORS.photoThumbBg },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 16, fontWeight: "500", color: DS_COLORS.WHITE },
  rowText: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY },
  handle: { fontSize: 12, fontWeight: "400", color: DS_COLORS.TEXT_MUTED },
  followBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: DS_COLORS.PRIMARY,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: DS_COLORS.BORDER,
  },
  followBtnTxt: { fontSize: 13, fontWeight: "500", color: DS_COLORS.WHITE },
  followBtnTxtOutline: { color: DS_COLORS.TEXT_SECONDARY },
  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 15, fontWeight: "500", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 6, textAlign: "center" },
  emptySub: { fontSize: 13, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
});
