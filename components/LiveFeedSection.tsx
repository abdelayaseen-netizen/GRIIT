import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Share,
  Animated,
  ActionSheetIOS,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
import { captureError } from "@/lib/sentry";
import { SkeletonFeedCard } from "@/components/skeletons";
import DiscoverCTA from "@/components/home/DiscoverCTA";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MilestonePostCard } from "@/components/feed/MilestonePostCard";
import { FeedCardHeader } from "@/components/feed/FeedCardHeader";
import { FeedEngagementRow } from "@/components/feed/FeedEngagementRow";
import { Avatar } from "@/components/Avatar";
import type { FeedCommentPreview, LiveFeedPost } from "@/components/feed/feedTypes";
import { track, trackEvent } from "@/lib/analytics";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

const RESPECT_DEBOUNCE_MS = 300;

type LiveFeedSectionProps = {
  onScrollToFeed?: () => void;
};

function LiveFeedSection({ onScrollToFeed }: LiveFeedSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<"following" | "everyone">("everyone");
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [androidMenuPost, setAndroidMenuPost] = useState<LiveFeedPost | null>(null);
  const [feedSnack, setFeedSnack] = useState<string | null>(null);
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
    if (hiddenPostIds.includes(post.id)) return false;
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
  const feedViewTracked = useRef(false);

  useEffect(() => {
    const postCount = feedQuery.data?.posts?.length ?? 0;
    if (postCount > 0 && !feedViewTracked.current) {
      feedViewTracked.current = true;
      trackEvent("feed_viewed", { post_count: postCount });
    }
  }, [feedQuery.data?.posts?.length]);
  const activeChallengesCount = Array.isArray(myActiveQuery.data) ? myActiveQuery.data.length : 0;

  const postsWithComments = useMemo(() => finalFeed.filter((p) => p.commentCount > 0), [finalFeed]);

  const commentPreviewResults = useQueries({
    queries: postsWithComments.map((p) => ({
      queryKey: ["feedCommentPreview", p.id],
      queryFn: async () => {
        const rows = (await trpcQuery(TRPC.feed.getComments, { eventId: p.id, limit: 100 })) as {
          user_id: string;
          text: string;
          created_at: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
        }[];
        const last = rows[rows.length - 1];
        if (!last) return null;
        return {
          userId: last.user_id,
          username: last.username,
          displayName: last.display_name,
          text: last.text,
          createdAt: last.created_at,
          avatarUrl: last.avatar_url ?? null,
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
        if (!prevR) {
          try {
            track({
              name: "respect_sent",
              toUserId: post.userId ?? (post as { user_id?: string }).user_id,
            });
          } catch {
            /* non-fatal */
          }
        }
        void queryClient.invalidateQueries({ queryKey: ["whoRespected", post.id] });
      } catch (e) {
        captureError(e, "LiveFeedRespect");
        updatePost(post.id, (p) => ({ ...p, reactedByMe: prevR, respectCount: prevC }));
      }
    },
    [updatePost, queryClient]
  );

  const onShare = useCallback(async (post: LiveFeedPost) => {
    try {
      const handle = post.username || post.displayName || "Someone";
      await Share.share({
        message: `${handle} is on Day ${post.currentDay} of ${post.challengeName} on GRIIT! 💪`,
        ...(post.photoUrl ? { url: post.photoUrl } : {}),
      });
      try {
        track({ name: "share_completed", content_type: "feed" });
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") {
        captureError(err, "LiveFeedShare");
      }
    }
  }, []);

  const submitComment = useCallback(
    async (postId: string, text: string) => {
      try {
        await trpcMutate(TRPC.feed.comment, { eventId: postId, text });
        updatePost(postId, (p) => ({ ...p, commentCount: p.commentCount + 1 }));
        void queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", postId] });
        void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      } catch (e) {
        captureError(e, "LiveFeedQuickComment");
        throw e;
      }
    },
    [updatePost, queryClient]
  );

  const navigateProfile = useCallback(
    (post: LiveFeedPost) => {
      if (!post.userId) return;
      if (post.userId === user?.id) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = post.username?.trim();
      const hasRealUsername =
        u && u !== "?" && u !== "Someone" && u.length >= 2 && !/^user_[0-9a-f]+$/i.test(u);
      if (hasRealUsername) {
        router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
      } else {
        router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(post.userId)) as never);
      }
    },
    [router, user?.id]
  );

  const openPost = useCallback(
    (post: LiveFeedPost) => {
      router.push(ROUTES.POST_ID(post.id) as never);
    },
    [router]
  );

  const handleDeletePost = useCallback(
    async (post: LiveFeedPost) => {
      try {
        await trpcMutate(TRPC.feed.deletePost, { eventId: post.id });
        await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
        setFeedSnack("Post removed.");
        setTimeout(() => setFeedSnack(null), 2500);
      } catch (e) {
        captureError(e, "LiveFeedDeletePost");
        setFeedSnack("Couldn't delete post. Try again.");
        setTimeout(() => setFeedSnack(null), 2500);
      }
    },
    [queryClient]
  );

  const openPostMenu = useCallback(
    (post: LiveFeedPost) => {
      if (!user?.id) return;
      const isOwn = post.userId === user.id;

      const runOwn = (index: number) => {
        if (index === 0) void handleDeletePost(post);
      };
      const runOther = (index: number) => {
        if (index === 0) {
          setFeedSnack("Reported. Thanks for helping keep GRIIT safe.");
          setTimeout(() => setFeedSnack(null), 2500);
        } else if (index === 1) {
          setHiddenPostIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));
        }
      };

      if (Platform.OS === "ios") {
        const options = isOwn ? ["Delete post", "Cancel"] : ["Report", "Hide post", "Cancel"];
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: options.length - 1,
            ...(isOwn ? { destructiveButtonIndex: 0 } : {}),
          },
          (buttonIndex) => {
            if (isOwn) runOwn(buttonIndex);
            else runOther(buttonIndex);
          }
        );
      } else {
        setAndroidMenuPost(post);
      }
    },
    [user?.id, handleDeletePost]
  );

  const renderItem = useCallback(
    ({ item }: { item: LiveFeedPost }) => {
      const preview = previewByPostId.get(item.id) ?? null;
      const baseCardProps = {
        post: item,
        onProfilePress: () => navigateProfile(item),
        onRespect: () => void onRespect(item),
        onComment: () => openPost(item),
        onShare: () => void onShare(item),
        onMenuPress: () => openPostMenu(item),
      };
      if (item.eventType === "thought" || item.eventType === "motivation") {
        return (
          <View style={styles.thoughtCard}>
            <FeedCardHeader post={item} onProfilePress={() => navigateProfile(item)} onMenuPress={() => openPostMenu(item)} />
            <Text style={styles.thoughtEyebrow}>💭 Daily thought</Text>
            <View style={styles.thoughtQuote}>
              <Text style={styles.thoughtQuoteText}>{item.caption ?? ""}</Text>
            </View>
            <FeedEngagementRow
              respectCount={item.respectCount}
              reactedByMe={item.reactedByMe}
              commentCount={item.commentCount}
              onRespect={() => void onRespect(item)}
              onComment={() => openPost(item)}
              onShare={() => void onShare(item)}
            />
          </View>
        );
      }
      if (item.isCompleted) {
        return <MilestonePostCard {...baseCardProps} />;
      }
      return (
        <FeedPostCard
          {...baseCardProps}
          previewComment={preview}
          onSubmitComment={(text) => submitComment(item.id, text)}
        />
      );
    },
    [navigateProfile, onRespect, onShare, openPost, openPostMenu, previewByPostId, submitComment]
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
            accessibilityLabel="Show feed from friends you follow"
            accessibilityState={{ selected: scope === "following" }}
          >
            <Text style={[styles.toggleText, scope === "following" && styles.toggleTextActive]}>Friends</Text>
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

      {finalFeed.length > 0 ? (
        <Pressable
          style={styles.digestCard}
          onPress={() => onScrollToFeed?.()}
          accessibilityRole="button"
          accessibilityLabel="While you were away summary"
        >
          <View style={styles.digestAvatars}>
            {Array.from(new Map(finalFeed.map((p) => [p.userId, p])).values())
              .slice(0, 3)
              .map((p, i) => (
                <View key={p.userId} style={[styles.digestAvatarWrap, i === 0 && { marginLeft: 0 }]}>
                  <Avatar url={p.avatarUrl} name={p.displayName || p.username} userId={p.userId} size={28} />
                </View>
              ))}
          </View>
          <Text style={styles.digestText} numberOfLines={2}>
            While you were away, your network kept moving — catch up below.
          </Text>
        </Pressable>
      ) : null}

      {feedQuery.isPending ? (
        <View style={styles.feedSkeletonStack}>
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
          ItemSeparatorComponent={FeedSeparator}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            <DiscoverCTA variant="feed" onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} />
          }
          removeClippedSubviews={false}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {feedSnack ? (
        <Text style={styles.feedSnack} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {feedSnack}
        </Text>
      ) : null}

      <Modal
        visible={androidMenuPost !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAndroidMenuPost(null)}
      >
        <View style={styles.androidMenuRoot}>
          <Pressable
            style={styles.androidMenuBackdrop}
            onPress={() => setAndroidMenuPost(null)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss post actions menu"
          />
          <View style={styles.androidMenuSheet}>
            {androidMenuPost && androidMenuPost.userId === user.id ? (
              <>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuPost(null);
                    void handleDeletePost(androidMenuPost);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Delete post"
                >
                  <Text style={styles.androidMenuDestructive}>Delete post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => setAndroidMenuPost(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                >
                  <Text style={styles.androidMenuCancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : androidMenuPost ? (
              <>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuPost(null);
                    setFeedSnack("Reported. Thanks for helping keep GRIIT safe.");
                    setTimeout(() => setFeedSnack(null), 2500);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Report post"
                >
                  <Text style={styles.androidMenuDefault}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    const p = androidMenuPost;
                    setAndroidMenuPost(null);
                    setHiddenPostIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Hide post"
                >
                  <Text style={styles.androidMenuDefault}>Hide post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => setAndroidMenuPost(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close menu"
                >
                  <Text style={styles.androidMenuCancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.FEED_BADGE_GREEN,
  },
  liveCountMeta: { fontSize: 11, color: DS_COLORS.FEED_LIVE_LABEL, fontWeight: "500" },
  feedToggle: {
    flexDirection: "row",
    backgroundColor: DS_COLORS.FEED_TAB_INACTIVE_BG,
    borderRadius: DS_RADIUS.iconButton,
    padding: 3,
  },
  togglePill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: DS_RADIUS.XL,
    backgroundColor: DS_COLORS.TRANSPARENT,
  },
  togglePillActive: {
    backgroundColor: DS_COLORS.FEED_TAB_ACTIVE_BG,
  },
  toggleText: { fontSize: 12, color: DS_COLORS.FEED_ENGAGEMENT_MUTED, fontWeight: "500" },
  toggleTextActive: { color: DS_COLORS.FEED_TAB_ACTIVE_TEXT, fontWeight: "500" },
  listContent: { paddingHorizontal: 10, paddingBottom: 8 },
  feedSkeletonStack: { gap: 10 },
  listItemSeparator: { height: 8 },
  empty: { paddingVertical: 32, alignItems: "center" },
  emptyTitle: { fontSize: 14, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.TEXT_PRIMARY, marginBottom: 6 },
  emptySub: { fontSize: 12, color: DS_COLORS.TEXT_SECONDARY },
  retry: { fontSize: 13, color: DS_COLORS.DISCOVER_CORAL, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, marginTop: 8 },
  feedSnack: {
    textAlign: "center",
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  androidMenuRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  androidMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_45,
  },
  androidMenuSheet: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  androidMenuRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  androidMenuDefault: { fontSize: 17, color: DS_COLORS.TEXT_PRIMARY, fontWeight: "500" },
  androidMenuDestructive: { fontSize: 17, color: DS_COLORS.errorText, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD },
  androidMenuCancel: { fontSize: 17, color: DS_COLORS.TEXT_SECONDARY, fontWeight: "500" },
  digestCard: {
    marginHorizontal: DS_SPACING.sm,
    marginBottom: DS_SPACING.sm,
    padding: DS_SPACING.md,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
  },
  digestAvatars: { flexDirection: "row", alignItems: "center" },
  digestAvatarWrap: {
    marginLeft: -10,
    borderWidth: 2,
    borderColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.LG,
  },
  digestText: {
    flex: 1,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    lineHeight: 18,
  },
  thoughtCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.XL,
    overflow: "hidden",
    paddingBottom: DS_SPACING.sm,
  },
  thoughtEyebrow: {
    fontSize: 9,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  thoughtQuote: {
    marginHorizontal: 14,
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
    borderLeftWidth: 3,
    borderLeftColor: DS_COLORS.ACCENT,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  thoughtQuoteText: {
    fontSize: 11,
    fontStyle: "italic",
    color: DS_COLORS.TEXT_SECONDARY,
    lineHeight: 17,
  },
});

const FeedSeparator = React.memo(function FeedSeparator() {
  return <View style={styles.listItemSeparator} />;
});

export default React.memo(LiveFeedSection);
