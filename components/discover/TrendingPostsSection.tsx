import React, { useCallback } from "react";
import { View, StyleSheet, Pressable, Text, Share } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MilestonePostCard } from "@/components/feed/MilestonePostCard";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import SectionHeader from "@/components/shared/SectionHeader";
import { SkeletonFeedCard } from "@/components/skeletons";
import { captureError } from "@/lib/sentry";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent, track } from "@/lib/analytics";

type TrendingResponse = { posts: LiveFeedPost[] };

const RESPECT_DEBOUNCE_MS = 300;

function TrendingPostsSectionInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const respectLastAt = React.useRef<Map<string, number>>(new Map());

  const trendingQuery = useQuery({
    queryKey: ["discover", "trending", user?.id ?? ""],
    queryFn: () =>
      trpcQuery(TRPC.feed.getTrending, { limit: 6 }) as Promise<TrendingResponse>,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (trendingQuery.isError) captureError(trendingQuery.error, "Discover.Trending");

  const updatePost = useCallback(
    (postId: string, updater: (p: LiveFeedPost) => LiveFeedPost) => {
      queryClient.setQueryData(
        ["discover", "trending", user?.id ?? ""],
        (old: TrendingResponse | undefined) => {
          if (!old) return old;
          return { ...old, posts: old.posts.map((p) => (p.id === postId ? updater(p) : p)) };
        }
      );
    },
    [queryClient, user?.id]
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
        captureError(e, "Discover.Trending.Respect");
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
      try {
        track({ name: "share_completed", content_type: "discover_trending" });
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") captureError(err, "Discover.Trending.Share");
    }
  }, []);

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
      trackEvent("discover_trending_post_tapped", { post_id: post.id });
      router.push(ROUTES.POST_ID(post.id) as never);
    },
    [router]
  );

  if (!user?.id) return null;

  const posts = trendingQuery.data?.posts ?? [];

  if (trendingQuery.isPending) {
    return (
      <View>
        <SectionHeader title="Trending this week" />
        <View style={styles.list}>
          <SkeletonFeedCard />
          <SkeletonFeedCard />
        </View>
      </View>
    );
  }

  if (posts.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Trending this week" />
      <View style={styles.list}>
        {posts.map((post) => {
          const baseProps = {
            post,
            onProfilePress: () => navigateProfile(post),
            onRespect: () => void onRespect(post),
            onShare: () => void onShare(post),
          };
          const milestoneProps = {
            ...baseProps,
            onComment: () => openPost(post),
          };
          return (
            <View key={post.id} style={styles.cardWrap}>
              {post.eventType === "thought" || post.eventType === "motivation" ? (
                <Pressable
                  onPress={() => openPost(post)}
                  accessibilityRole="button"
                  accessibilityLabel="Open post"
                  style={styles.thoughtCard}
                >
                  <Text style={styles.thoughtCaption} numberOfLines={4}>
                    {post.caption ?? ""}
                  </Text>
                </Pressable>
              ) : post.isCompleted ? (
                <MilestonePostCard {...milestoneProps} />
              ) : (
                <FeedPostCard {...baseProps} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const TrendingPostsSection = React.memo(TrendingPostsSectionInner);
export default TrendingPostsSection;

const styles = StyleSheet.create({
  list: {
    gap: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.sm,
  },
  cardWrap: {
    marginBottom: 0,
  },
  thoughtCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    padding: DS_SPACING.md,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  thoughtCaption: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
});
