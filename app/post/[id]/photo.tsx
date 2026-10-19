import React, { useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { proofSource } from "@/lib/proof-cache-key";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { DS_V3 } from "@/lib/design-system";
import Screen from "@/components/ds/Screen";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { useAuth } from "@/contexts/AuthContext";
import { optimisticRespect, rollbackRespect, settleRespect } from "@/lib/feed-respect";
import { captureError } from "@/lib/sentry";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

type LiveFeedResponse = { posts?: LiveFeedPost[]; pages?: { posts?: LiveFeedPost[] }[] };

/** Photo zoom. Swipe down past 120pt to dismiss. */
export default function PostPhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; uri?: string; name?: string; context?: string }>();
  const uri = typeof params.uri === "string" ? params.uri : "";
  const name = typeof params.name === "string" ? params.name : "";
  const context = typeof params.context === "string" ? params.context : "";
  const dragging = useRef(false);
  const [release, setRelease] = React.useState(false);
  const id = typeof params.id === "string" ? params.id : "";
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Build 92 04.4: double-tap likes here too. The post comes from the caches the feed and detail already hold.
  const cachedPost = React.useMemo<LiveFeedPost | null>(() => {
    const direct = queryClient.getQueryData<LiveFeedPost>(["feed", "post", id]);
    if (direct) return direct;
    for (const [, data] of queryClient.getQueriesData<LiveFeedResponse>({ queryKey: ["liveFeed"] })) {
      const posts = data?.posts ?? data?.pages?.flatMap((pg) => pg.posts ?? []) ?? [];
      const p = posts.find((x) => x.id === id);
      if (p) return p;
    }
    return null;
  }, [queryClient, id]);
  const [liked, setLiked] = React.useState(Boolean(cachedPost?.reactedByMe));
  const ownPost = Boolean(user?.id && cachedPost && cachedPost.userId === user.id);
  const likeOnce = async () => {
    if (!id || liked) return;
    setLiked(true);
    const prev = { reactedByMe: Boolean(cachedPost?.reactedByMe), respectCount: cachedPost?.respectCount ?? 0 };
    const next = optimisticRespect(prev);
    queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...next } : p));
    try {
      // mode "like": the server never removes a like for a double tap, whatever this screen's cache says.
      const result = (await trpcMutate(TRPC.feed.react, { eventId: id, mode: "like" })) as { reacted?: boolean; reactionCount?: number };
      queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...settleRespect(result, next) } : p));
      void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    } catch (e) {
      captureError(e, "PostPhotoLike");
      setLiked(prev.reactedByMe);
      queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...rollbackRespect(prev) } : p));
    }
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        dragging.current = true;
        setRelease(g.dy > 120);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 1.1) router.back();
        else setRelease(false);
      },
    }),
  ).current;

  return (
    <Screen edges={[]} style={styles.root}>
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
      {uri ? (
        <View style={StyleSheet.absoluteFill}>
          <DoubleTapRespect
            respected={liked}
            onRespect={() => void likeOnce()}
            onOpen={() => undefined}
            ownPost={ownPost}
            testID="post-photo-full"
            accessibilityLabel="Photo"
            burstSize={120}
            style={styles.full}
          >
            <Image source={proofSource(uri)} style={StyleSheet.absoluteFill} contentFit="contain" cachePolicy="memory-disk" />
          </DoubleTapRespect>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}
        style={[styles.close, { top: insets.top + 8 }]}
      >
        <X size={22} color={DS_V3.color.textPrimary} />
      </Pressable>
      {release ? <Text style={styles.release}>Release to close</Text> : null}
      <View style={[styles.fade, { paddingBottom: insets.bottom + 16 }]}>
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {context ? <Text style={styles.context}>{context}</Text> : null}
      </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  full: { flex: 1 },
  close: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  release: {
    position: "absolute",
    top: "46%",
    alignSelf: "center",
    color: DS_V3.color.textPrimary,
    fontSize: 15,
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 4,
  },
  name: { color: DS_V3.color.textPrimary, fontSize: 17, fontWeight: "600" },
  context: { color: DS_V3.color.textSecondary, fontSize: 15 },
});
