import React, { useCallback, useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Screen from "@/components/ds/Screen";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/contexts/AuthContext";
import { postViewerTitle } from "@/lib/profile-header";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import PostViewer, { postPhotos } from "@/components/profile/PostViewer";
import { captureError } from "@/lib/sentry";
import { logLikeFailure } from "@/lib/like-error";

function param(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return "";
}

// Build 92 07.1 / 07.5: the list itself lives in PostViewer (fixed layout, recycled images, native scroll).
export default function ProfilePostsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ userId?: string; startId?: string; challenge?: string }>();
  const userId = param(params.userId);
  const startId = param(params.startId);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const postsQuery = useQuery({
    queryKey: ["profilePosts", userId],
    queryFn: () =>
      trpcQuery(TRPC.feed.getUserPosts, { userId, limit: 50 }) as Promise<{ posts: LiveFeedPost[] }>,
    enabled: userId.length > 0,
  });
  const posts = postsQuery.data?.posts ?? [];

  // Warm the first photos around the opened post once; the list recycles decoded images from there.
  useEffect(() => {
    if (posts.length === 0) return;
    const i = Math.max(0, posts.findIndex((p) => p.id === startId));
    const urls = posts.slice(i, i + 3).flatMap((p) => postPhotos(p));
    if (urls.length) void Image.prefetch(urls);
  }, [posts, startId]);

  const toggleLike = useCallback((item: LiveFeedPost, on: boolean) => {
    setLiked((prev) => ({ ...prev, [item.id]: !on }));
    void trpcMutate(TRPC.feed.react, { eventId: item.id }).catch((err) => {
      logLikeFailure(err, "ProfilePostLike");
      captureError(err, "ProfilePostLike");
      setLiked((prev) => ({ ...prev, [item.id]: item.reactedByMe }));
    });
  }, []);

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <PostViewer
        title={postViewerTitle(param(params.challenge))}
        posts={posts}
        startId={startId}
        isOwner={Boolean(user?.id) && user?.id === userId}
        liked={liked}
        isPending={postsQuery.isPending}
        refreshing={postsQuery.isRefetching}
        onRefresh={() => void queryClient.invalidateQueries({ queryKey: ["profilePosts", userId] })}
        onBack={() => router.back()}
        onLike={toggleLike}
        onOpenPost={(id) => router.push(ROUTES.POST_ID(id) as never)}
      />
    </Screen>
  );
}
