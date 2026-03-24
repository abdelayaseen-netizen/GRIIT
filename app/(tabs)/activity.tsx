import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useApp } from "@/contexts/AppContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import PostCard, { FeedPost } from "@/components/PostCard";
import CommentSheet, { FeedComment } from "@/components/CommentSheet";

type FeedEvent = {
  id: string;
  challenge_id: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  reaction_count: number;
  reacted_by_me: boolean;
  comment_count: number;
};

type FeedPage = { items: FeedEvent[]; nextCursor: string | null };

function mapPost(event: FeedEvent): FeedPost {
  const md = event.metadata ?? {};
  return {
    id: event.id,
    challenge_id: event.challenge_id,
    challengeTitle: String(md.challenge_name ?? "Challenge"),
    display_name: event.display_name,
    username: event.username,
    avatar_url: event.avatar_url,
    created_at: event.created_at,
    taskName: String(md.task_name ?? "Task completed"),
    caption: typeof md.caption === "string" ? md.caption : null,
    imageUrl: typeof md.photo_url === "string" ? md.photo_url : null,
    reaction_count: event.reaction_count ?? 0,
    reacted_by_me: !!event.reacted_by_me,
    comment_count: event.comment_count ?? 0,
  };
}

export default function ActivityScreen() {
  const router = useRouter();
  const { currentUser } = useApp();
  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const activityQuery = useInfiniteQuery({
    queryKey: ["community", "feed", currentUser?.id],
    queryFn: async ({ pageParam }: { pageParam?: string }) =>
      (await trpcQuery(TRPC.feed.list, {
        limit: 20,
        cursor: pageParam,
      })) as FeedPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const posts = useMemo(() => (activityQuery.data?.pages ?? []).flatMap((p) => p.items).map(mapPost), [activityQuery.data?.pages]);
  const empty = !activityQuery.isPending && !activityQuery.isError && posts.length === 0;
  const isInitialLoading = activityQuery.isPending && !activityQuery.data;

  const commentsQuery = useQuery({
    queryKey: ["community", "comments", selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost?.id) return [] as FeedComment[];
      return (await trpcQuery(TRPC.feed.getComments, { eventId: selectedPost.id, limit: 100 })) as FeedComment[];
    },
    enabled: !!selectedPost?.id,
  });

  const updatePostCache = useCallback((postId: string, updater: (post: FeedEvent) => FeedEvent) => {
    queryClient.setQueryData(
      ["community", "feed", currentUser?.id],
      (oldData: { pages: FeedPage[]; pageParams: unknown[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((it) => (it.id === postId ? updater(it) : it)),
          })),
        };
      }
    );
  }, [queryClient, currentUser?.id]);

  const onPressRespect = useCallback(async (postId: string, reacted: boolean, currentCount: number) => {
    const optimisticCount = Math.max(0, currentCount + (reacted ? -1 : 1));
    updatePostCache(postId, (post) => ({ ...post, reacted_by_me: !reacted, reaction_count: optimisticCount }));
    try {
      const result = await trpcMutate(TRPC.feed.react, { eventId: postId }) as { reacted?: boolean; reactionCount?: number };
      updatePostCache(postId, (post) => ({
        ...post,
        reacted_by_me: !!result.reacted,
        reaction_count: Math.max(0, result.reactionCount ?? optimisticCount),
      }));
    } catch (error) {
      console.error("[CommunityFeed] respect toggle failed:", error);
      updatePostCache(postId, (post) => ({ ...post, reacted_by_me: reacted, reaction_count: currentCount }));
    }
  }, [updatePostCache]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.headerTitle}>Community</Text>

      {activityQuery.isError ? (
        <ErrorState message="Couldn't load activity" onRetry={() => void activityQuery.refetch()} />
      ) : isInitialLoading ? (
        <LoadingState message="Loading community..." />
      ) : empty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCard}>
            <Flame size={48} color={DS_COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete a challenge task to share with the community.
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push("/(tabs)/discover" as never)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Browse available challenges"
            >
              <Text style={styles.emptyCtaText}>Browse Challenges</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPressRespect={onPressRespect}
              onPressComment={(post) => setSelectedPost(post)}
            />
          )}
          refreshControl={<RefreshControl refreshing={activityQuery.isRefetching} onRefresh={() => void activityQuery.refetch()} />}
          onEndReached={() => {
            if (activityQuery.hasNextPage && !activityQuery.isFetchingNextPage) {
              void activityQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            activityQuery.isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={DS_COLORS.ACCENT} />
              </View>
            ) : null
          }
        />
      )}
      <CommentSheet
        visible={!!selectedPost}
        postTitle={selectedPost?.challengeTitle ?? "Post"}
        comments={commentsQuery.data ?? []}
        loading={commentsQuery.isPending}
        submitting={commentSubmitting}
        onClose={() => setSelectedPost(null)}
        onSubmit={async (text) => {
          if (!selectedPost) return;
          setCommentSubmitting(true);
          try {
            const result = await trpcMutate(TRPC.feed.comment, { eventId: selectedPost.id, text }) as { comment?: FeedComment };
            queryClient.setQueryData(
              ["community", "comments", selectedPost.id],
              (prev: FeedComment[] | undefined) => [...(prev ?? []), ...(result.comment ? [result.comment] : [])]
            );
            updatePostCache(selectedPost.id, (post) => ({ ...post, comment_count: (post.comment_count ?? 0) + 1 }));
          } catch (error) {
            console.error("[CommunityFeed] comment failed:", error);
          } finally {
            setCommentSubmitting(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GRIIT_COLORS.background,
  },
  headerTitle: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.sm,
    ...DS_TYPOGRAPHY.sectionTitle,
    color: DS_COLORS.challengeHeaderDark,
  },
  listContent: {
    paddingBottom: DS_SPACING.xl,
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.md,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyCard: {
    alignItems: "center",
    maxWidth: 300,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: DS_COLORS.challengeHeaderDark,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
    maxWidth: 260,
  },
  emptyCta: {
    marginTop: 14,
    borderRadius: DS_RADIUS.joinCta,
    backgroundColor: DS_COLORS.ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...DS_SHADOWS.button,
  },
  emptyCtaText: {
    fontSize: 14,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
  },
  footerLoader: {
    paddingVertical: DS_SPACING.md,
  },
});
