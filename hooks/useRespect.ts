import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import type { LiveFeedPost } from "@/components/feed/feedTypes";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

type ReactResult = {
  reacted?: boolean;
  reactionCount?: number;
};

const RESPECT_DEBOUNCE_MS = 300;

function applyToCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (p: LiveFeedPost) => LiveFeedPost,
) {
  queryClient.setQueriesData<LiveFeedResponse>({ queryKey: ["liveFeed"] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      posts: old.posts.map((p) => (p.id === postId ? updater(p) : p)),
    };
  });
  queryClient.setQueryData(["feed", "post", postId], (old: LiveFeedPost | undefined) =>
    old ? updater(old) : old,
  );
}

export function useRespect() {
  const queryClient = useQueryClient();
  const lastAt = useRef<Map<string, number>>(new Map());

  const mutation = useMutation({
    mutationFn: (post: LiveFeedPost) =>
      trpcMutate(TRPC.feed.react, { eventId: post.id }) as Promise<ReactResult>,
    onMutate: async (post) => {
      const prevR = post.reactedByMe;
      const prevC = post.respectCount;
      const nextC = Math.max(0, prevC + (prevR ? -1 : 1));
      applyToCaches(queryClient, post.id, (p) => ({
        ...p,
        reactedByMe: !prevR,
        respectCount: nextC,
      }));
      return { prevR, prevC, nextC };
    },
    onError: (error, post, ctx) => {
      captureError(error, "Respect");
      if (!ctx) return;
      applyToCaches(queryClient, post.id, (p) => ({
        ...p,
        reactedByMe: ctx.prevR,
        respectCount: ctx.prevC,
      }));
    },
    onSuccess: (result, post, ctx) => {
      applyToCaches(queryClient, post.id, (p) => ({
        ...p,
        reactedByMe: !!result.reacted,
        respectCount: Math.max(0, result.reactionCount ?? ctx?.nextC ?? p.respectCount),
      }));
      if (!ctx?.prevR) {
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
    },
  });

  const respect = useCallback(
    (post: LiveFeedPost) => {
      const now = Date.now();
      const last = lastAt.current.get(post.id) ?? 0;
      if (now - last < RESPECT_DEBOUNCE_MS) return;
      lastAt.current.set(post.id, now);
      mutation.mutate(post);
    },
    [mutation],
  );

  return { respect };
}
