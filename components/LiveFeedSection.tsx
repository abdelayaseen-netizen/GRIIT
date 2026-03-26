import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Share, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import { SkeletonFeedCard } from "@/components/skeletons";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MilestonePostCard } from "@/components/feed/MilestonePostCard";
import type { FeedCommentPreview, LiveFeedPost } from "@/components/feed/feedTypes";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

const RESPECT_DEBOUNCE_MS = 300;

export default function LiveFeedSection() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<"following" | "everyone">("everyone");
  const respectLastAt = useRef<Map<string, number>>(new Map());
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotOpacity]);

  const feedQuery = useQuery({
    queryKey: ["liveFeed", scope, user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.feed.getLiveFeed, { scope, limit: 20 }) as Promise<LiveFeedResponse>,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const myActiveQuery = useQuery({
    queryKey: ["challenges", "listMyActive", user?.id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const posts = (feedQuery.data?.posts ?? []).filter((post) => {
    if (post.visibility === "private" && post.userId !== user?.id) return false;
    return true;
  });

  const seen = new Set<string>();
  const dedupedFeed = posts.filter((post) => {
    const dayKey = new Date(post.createdAt).toDateString();
    const challengeKey = post.challengeId ?? post.challengeName ?? "unknown";
    const key = `${post.userId}-${challengeKey}-${dayKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const diverseFeed = dedupedFeed.filter((post, i, arr) => {
    if (i === 0) return true;
    return post.userId !== arr[i - 1]?.userId;
  });
  const finalFeed = diverseFeed.slice(0, 20);
  const activeChallengesCount = Array.isArray(myActiveQuery.data) ? myActiveQuery.data.length : 0;

  const postsWithComments = useMemo(() => finalFeed.filter((p) => p.commentCount > 0), [finalFeed]);

  const commentPreviewResults = useQueries({
    queries: postsWithComments.map((p) => ({
      queryKey: ["feedCommentPreview", p.id],
      queryFn: async () => {
        const rows = (await trpcQuery(TRPC.feed.getComments, { eventId: p.id, limit: 100 })) as Array<{
          user_id: string;
          text: string;
          created_at: string;
          display_name: string;
          username: string;
        }>;
        const last = rows[rows.length - 1];
        if (!last) return null;
        return {
          userId: last.user_id,
          username: last.username,
          displayName: last.display_name,
          text: last.text,
          createdAt: last.created_at,
        } satisfies FeedCommentPreview;
      },
      enabled: !!user?.id && p.commentCount > 0,
      staleTime: 60 * 1000,
    })),
  });

  const previewByPostId = useMemo(() => {
    const map = new Map<string, FeedCommentPreview>();
    postsWithComments.forEach((p, i) => {
      const d = commentPreviewResults[i]?.data;
      if (d) map.set(p.id, d);
    });
    return map;
  }, [postsWithComments, commentPreviewResults]);

  const updatePost = useCallback(
    (postId: string, updater: (p: LiveFeedPost) => LiveFeedPost) => {
      queryClient.setQueryData(
        ["liveFeed", scope, user?.id ?? ""],
        (old: LiveFeedResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((p) => (p.id === postId ? updater(p) : p)),
          };
        }
      );
    },
    [queryClient, scope, user?.id]
  );

  const onRespect = useCallback(
    async (post: LiveFeedPost) => {
      const now = Date.now();
      const last = respectLastAt.current.get(post.id) ?? 0;
      if (now - last < RESPECT_DEBOUNCE_MS) return;
      respectLastAt.current.set(post.id, now);

      const prevR = post.reactedByMe;
      const prevC = post.respectCount;
      const nextC = Math.max(0, prevC + (prevR ? -1 : 1));
      updatePost(post.id, (p) => ({ ...p, reactedByMe: !prevR, respectCount: nextC }));
      try {
        const result = (await trpcMutate(TRPC.feed.react, { eventId: post.id })) as {
          reacted?: boolean;
          reactionCount?: number;
        };
        updatePost(post.id, (p) => ({
          ...p,
          reactedByMe: !!result.reacted,
          respectCount: Math.max(0, result.reactionCount ?? nextC),
        }));
      } catch (e) {
        captureError(e, "LiveFeedRespect");
        console.error("[LiveFeedSection] respect failed", e);
        updatePost(post.id, (p) => ({ ...p, reactedByMe: prevR, respectCount: prevC }));
      }
    },
    [updatePost]
  );

  const onShare = useCallback(async (post: LiveFeedPost) => {
    try {
      const handle = post.username || post.displayName || "Someone";
      await Share.share({
        message: `${handle} is on Day ${post.currentDay} of ${post.challengeName} on GRIIT! 💪`,
        ...(post.photoUrl ? { url: post.photoUrl } : {}),
      });
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") {
        captureError(err, "LiveFeedShare");
        console.error("[LiveFeedSection] share failed", err);
      }
    }
  }, []);

  const navigateProfile = useCallback(
    (post: LiveFeedPost) => {
      if (post.userId === user?.id) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = post.username?.trim();
      if (u) router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
    },
    [router, user?.id]
  );

  const openPost = useCallback(
    (post: LiveFeedPost) => {
      router.push(ROUTES.POST_ID(post.id) as never);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: LiveFeedPost }) => {
      const preview = previewByPostId.get(item.id) ?? null;
      const common = {
        post: item,
        onProfilePress: () => navigateProfile(item),
        onRespect: () => void onRespect(item),
        onComment: () => openPost(item),
        onShare: () => void onShare(item),
      };
      if (item.isCompleted) {
        return <MilestonePostCard {...common} />;
      }
      return <FeedPostCard {...common} previewComment={preview} />;
    },
    [navigateProfile, onRespect, onShare, openPost, previewByPostId]
  );

  const listEmpty = useMemo(() => {
    if (feedQuery.isPending) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No activity yet</Text>
        <Text style={styles.emptySub}>Be the first to check in today</Text>
      </View>
    );
  }, [feedQuery.isPending]);

  if (!user?.id) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.feedHeader}>
        <View style={styles.feedHeaderLeft}>
          <View style={styles.feedTitleRow}>
            <Text style={styles.feedTitle}>Feed</Text>
            <View style={styles.liveRow}>
              <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
              <Text style={styles.liveCountMeta}>{activeChallengesCount} live</Text>
            </View>
          </View>
        </View>
        <View style={styles.feedToggle}>
          <Pressable
            onPress={() => setScope("following")}
            style={[styles.togglePill, scope === "following" && styles.togglePillActive]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from people you follow"
            accessibilityState={{ selected: scope === "following" }}
          >
            <Text style={[styles.toggleText, scope === "following" && styles.toggleTextActive]}>Following</Text>
          </Pressable>
          <Pressable
            onPress={() => setScope("everyone")}
            style={[styles.togglePill, scope === "everyone" && styles.togglePillActive]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from everyone"
            accessibilityState={{ selected: scope === "everyone" }}
          >
            <Text style={[styles.toggleText, scope === "everyone" && styles.toggleTextActive]}>Everyone</Text>
          </Pressable>
        </View>
      </View>

      {feedQuery.isPending ? (
        <View style={{ gap: 10 }}>
          <SkeletonFeedCard />
          <SkeletonFeedCard />
          <SkeletonFeedCard />
        </View>
      ) : feedQuery.isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn&apos;t load feed</Text>
          <Pressable onPress={() => void feedQuery.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading feed">
            <Text style={styles.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={finalFeed}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            <DiscoverCTA variant="feed" onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
          }
          removeClippedSubviews
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={10}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 14,
  },
  feedHeaderLeft: { flex: 1 },
  feedTitleRow: { flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" },
  feedTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: DS_COLORS.FEED_USERNAME,
    letterSpacing: -0.3,
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.FEED_BADGE_GREEN,
  },
  liveCountMeta: { fontSize: 11, color: DS_COLORS.FEED_LIVE_LABEL, fontWeight: "500" },
  feedToggle: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.FEED_TAB_INACTIVE_BG,
    borderRadius: 22,
    padding: 3,
  },
  togglePill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: DS_COLORS.TRANSPARENT,
  },
  togglePillActive: {
    backgroundColor: DS_COLORS.FEED_TAB_ACTIVE_BG,
  },
  toggleText: { fontSize: 12, color: DS_COLORS.FEED_ENGAGEMENT_MUTED, fontWeight: "500" },
  toggleTextActive: { color: DS_COLORS.FEED_TAB_ACTIVE_TEXT, fontWeight: "500" },
  listContent: { paddingHorizontal: 10, paddingBottom: 8 },
  empty: { paddingVertical: 32, alignItems: "center" },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: DS_COLORS.TEXT_PRIMARY, marginBottom: 6 },
  emptySub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY },
  retry: { fontSize: 13, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600", marginTop: 8 },
});
