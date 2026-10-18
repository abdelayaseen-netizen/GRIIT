import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Screen from "@/components/ds/Screen";
import { GlassTopBar, TOP_BAR_ROW_HEIGHT } from "@/components/ds/glass";
import { DS_V3 } from "@/lib/design-system";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { audienceBadge } from "@/lib/post-audience";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";
import { captureError } from "@/lib/sentry";
import { logLikeFailure } from "@/lib/like-error";

function param(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return "";
}

function postDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProfilePostsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const listRef = useRef<FlashListRef<LiveFeedPost>>(null);
  const params = useLocalSearchParams<{ userId?: string; startId?: string }>();
  const userId = param(params.userId);
  const startId = param(params.startId);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [laidOut, setLaidOut] = useState(false);
  // Build 92 01.5 (P0-04): the top bar is transparent at rest and glass by 8 pt of scroll.
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }),
    [scrollY],
  );

  const postsQuery = useQuery({
    queryKey: ["profilePosts", userId],
    queryFn: () =>
      trpcQuery(TRPC.feed.getUserPosts, { userId, limit: 50 }) as Promise<{ posts: LiveFeedPost[] }>,
    enabled: userId.length > 0,
  });

  const posts = postsQuery.data?.posts ?? [];
  const startIndex = useMemo(() => {
    const i = posts.findIndex((p) => p.id === startId);
    return i >= 0 ? i : 0;
  }, [posts, startId]);

  useEffect(() => {
    if (!laidOut || posts.length === 0 || !startId) return;
    listRef.current?.scrollToIndex({ index: startIndex, animated: false });
  }, [laidOut, posts.length, startId, startIndex]);

  const toggleLike = useCallback((item: LiveFeedPost, on: boolean) => {
    setLiked((prev) => ({ ...prev, [item.id]: !on }));
    void trpcMutate(TRPC.feed.react, { eventId: item.id }).catch((err) => {
      logLikeFailure(err, "ProfilePostLike");
      captureError(err, "ProfilePostLike");
      setLiked((prev) => ({ ...prev, [item.id]: item.reactedByMe }));
    });
  }, []);

  const onViewable = useCallback((info: { viewableItems: { index: number | null }[] }) => {
    const indexes = info.viewableItems.map((v) => v.index).filter((n): n is number => n != null);
    const next = indexes.length ? Math.max(...indexes) + 1 : 0;
    const urls = posts.slice(next, next + 3).map((p) => p.photoUrl).filter((u): u is string => Boolean(u));
    if (urls.length) void Image.prefetch(urls);
  }, [posts]);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <GlassTopBar title="Posts" scrollY={scrollY} onBack={() => router.back()} />
      <FlashList
        ref={listRef}
        data={posts}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_ROW_HEIGHT, paddingBottom: insets.bottom }}
        keyExtractor={(item) => item.id}
        onLoad={() => setLaidOut(true)}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => {
          const on = liked[item.id] ?? item.reactedByMe;
          const extra = on === item.reactedByMe ? 0 : on ? 1 : -1;
          return (
            <View style={styles.card}>
              {item.photoUrl ? (
                <DoubleTapRespect
                  respected={on}
                  onRespect={() => toggleLike(item, on)}
                  onOpen={() => undefined}
                >
                  <Image source={{ uri: item.photoUrl }} style={styles.photo} contentFit="cover" />
                </DoubleTapRespect>
              ) : null}
              <Text style={styles.line}>
                {item.challengeName} · Day {item.currentDay} of {item.totalDays}
              </Text>
              <Text style={styles.meta}>{postDate(item.createdAt)}</Text>
              {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
              {audienceBadge(item.audience) ? <Text style={styles.meta}>{audienceBadge(item.audience)}</Text> : null}
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={on ? "Liked by you" : "Like"}
                  onPress={() => toggleLike(item, on)}
                  style={styles.action}
                >
                  <Heart size={18} color={DS_V3.color.textPrimary} fill={on ? DS_V3.color.textPrimary : "transparent"} />
                  <Text style={styles.meta}>{Math.max(0, item.respectCount + extra)}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Comment"
                  onPress={() => router.push(ROUTES.POST_ID(item.id) as never)}
                  style={styles.action}
                >
                  <MessageCircle size={18} color={DS_V3.color.textPrimary} />
                  <Text style={styles.meta}>{item.commentCount}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Post actions"
                  onPress={() => router.push(ROUTES.POST_ID(item.id) as never)}
                  style={styles.action}
                >
                  <MoreHorizontal size={18} color={DS_V3.color.textPrimary} />
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          postsQuery.isPending ? null : <Text style={styles.meta}>No posts yet.</Text>
        }
        onRefresh={() => {
          void queryClient.invalidateQueries({ queryKey: ["profilePosts", userId] });
        }}
        refreshing={postsQuery.isRefetching}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  photo: { width: "100%", aspectRatio: 1, borderRadius: 16, backgroundColor: DS_V3.color.surface },
  line: { fontSize: 16, fontWeight: "600", color: DS_V3.color.textPrimary },
  caption: { fontSize: 15, lineHeight: 21, color: DS_V3.color.textPrimary },
  meta: { fontSize: 13, color: DS_V3.color.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: 16, minHeight: 44 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
});
