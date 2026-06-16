import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Share,
  ActionSheetIOS,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MilestonePostCard } from "@/components/feed/MilestonePostCard";
import { CommentThread } from "@/components/feed/CommentThread";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InlineError } from "@/components/InlineError";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

const RESPECT_DEBOUNCE_MS = 300;

function PostThreadScreenInner() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const queryClient = useQueryClient();
  const [androidMenuOpen, setAndroidMenuOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
  const respectLastAt = useRef<Map<string, number>>(new Map());

  const cachedPost = useMemo(() => {
    if (!id) return null;
    const all = queryClient.getQueriesData<LiveFeedResponse>({ queryKey: ["liveFeed"] });
    for (const [, data] of all) {
      const p = data?.posts?.find((x) => x.id === id);
      if (p) return p;
    }
    return null;
  }, [queryClient, id]);

  const postQuery = useQuery({
    queryKey: ["feed", "post", id],
    queryFn: () => trpcQuery(TRPC.feed.getPost, { eventId: id }) as Promise<LiveFeedPost>,
    enabled: !!id,
    staleTime: 30 * 1000,
    retry: 1,
    placeholderData: cachedPost ?? undefined,
  });

  const displayPost = postQuery.data ?? null;

  const updateCachedPost = useCallback(
    (updater: (p: LiveFeedPost) => LiveFeedPost) => {
      queryClient.setQueryData(["feed", "post", id], (old: LiveFeedPost | undefined) => {
        if (!old) return old;
        return updater(old);
      });
    },
    [queryClient, id]
  );

  const onRefresh = useCallback(() => {
    void postQuery.refetch();
  }, [postQuery]);

  const navigateProfile = useCallback(
    (post: LiveFeedPost) => {
      if (post.userId === user?.id) {
        router.push(ROUTES.TABS_PROFILE as never);
        return;
      }
      const u = post.username?.trim();
      if (!u || /^user_[0-9a-f]+$/i.test(u)) return;
      router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
    },
    [router, user?.id]
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
      updateCachedPost((p) => ({ ...p, reactedByMe: !prevR, respectCount: nextC }));
      try {
        const result = (await trpcMutate(TRPC.feed.react, { eventId: post.id })) as {
          reacted?: boolean;
          reactionCount?: number;
        };
        updateCachedPost((p) => ({
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
        await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      } catch (e) {
        captureError(e, "PostThreadRespect");
        updateCachedPost((p) => ({ ...p, reactedByMe: prevR, respectCount: prevC }));
      }
    },
    [updateCachedPost, queryClient]
  );

  const onShare = useCallback(async (post: LiveFeedPost) => {
    try {
      const handle = post.username || post.displayName || "Someone";
      await Share.share({
        message: `${handle} is on Day ${post.currentDay} of ${post.challengeName} on GRIIT! 💪`,
        ...(post.photoUrl ? { url: post.photoUrl } : {}),
      });
      try {
        track({ name: "share_completed", content_type: "post" });
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (msg !== "User did not share") {
        captureError(err, "PostThreadShare");
      }
    }
  }, []);

  const handleDeletePost = useCallback(
    async (post: LiveFeedPost) => {
      try {
        await trpcMutate(TRPC.feed.deletePost, { eventId: post.id });
        await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
        queryClient.removeQueries({ queryKey: ["feed", "post", id] });
        router.back();
      } catch (e) {
        captureError(e, "PostThreadDeletePost");
        const msg = e instanceof Error ? e.message : "Couldn't delete post. Try again.";
        setDeleteErr(msg);
      }
    },
    [queryClient, id, router]
  );

  const openMenu = useCallback(
    (post: LiveFeedPost) => {
      if (!user?.id) return;
      const isOwn = post.userId === user.id;
      const runOwn = (index: number) => {
        if (index === 0) void handleDeletePost(post);
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
            else if (buttonIndex === 1) router.back();
          }
        );
      } else {
        setAndroidMenuOpen(true);
      }
    },
    [user?.id, handleDeletePost, router]
  );

  const title = displayPost?.challengeName ?? "Post";

  const postCard = useMemo(() => {
    if (postQuery.isPending && !displayPost) {
      return (
        <View style={styles.postHeaderWrap}>
          <ActivityIndicator style={{ marginVertical: 24 }} color={DS_COLORS.DISCOVER_CORAL} />
        </View>
      );
    }
    if (postQuery.isError && !displayPost) {
      return (
        <View style={styles.postHeaderWrap}>
          <Text style={styles.postError}>
            {postQuery.error instanceof Error ? postQuery.error.message : "Couldn't load this post."}
          </Text>
        </View>
      );
    }
    if (!displayPost) {
      return (
        <View style={styles.postHeaderWrap}>
          <Text style={styles.postError}>Post not found.</Text>
        </View>
      );
    }
    const p = displayPost;
    const common = {
      post: p,
      onProfilePress: () => navigateProfile(p),
      onRespect: () => void onRespect(p),
      onShare: () => void onShare(p),
      onMenuPress: () => openMenu(p),
      onCommentPress: () => {},
      onCommentCountChange: (n: number) =>
        updateCachedPost((post) => ({ ...post, commentCount: n })),
    };
    return (
      <View style={styles.postHeaderWrap}>
        {p.isCompleted ? (
          <MilestonePostCard {...common} onComment={() => {}} />
        ) : (
          <FeedPostCard {...common} />
        )}
      </View>
    );
  }, [
    displayPost,
    postQuery.isPending,
    postQuery.isError,
    postQuery.error,
    navigateProfile,
    onRespect,
    onShare,
    openMenu,
    updateCachedPost,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {deleteErr ? <InlineError message={deleteErr} onDismiss={() => setDeleteErr("")} /> : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
            <ChevronLeft size={22} color={DS_COLORS.TEXT_PRIMARY} />
          </Pressable>
          {displayPost?.challengeId ? (
            <Pressable
              onPress={() => {
                track({
                  name: "post_detail_challenge_tapped",
                  postId: id,
                  challengeId: displayPost.challengeId ?? "",
                });
                router.push(
                  ROUTES.CHALLENGE_ID(displayPost.challengeId ?? "") as never,
                );
              }}
              style={styles.topTitleWrap}
              accessibilityRole="link"
              accessibilityLabel={`Go to ${title} challenge`}
              hitSlop={8}
            >
              <Text style={styles.topTitle} numberOfLines={1}>
                {title}
              </Text>
              <ChevronRight
                size={14}
                color={DS_COLORS.FEED_USERNAME}
                style={styles.topTitleChevron}
                strokeWidth={2}
              />
            </Pressable>
          ) : (
            <Text style={styles.topTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={postQuery.isRefetching && !postQuery.isPending}
              onRefresh={onRefresh}
              tintColor={DS_COLORS.DISCOVER_CORAL}
            />
          }
        >
          {postCard}
          {id && displayPost ? (
            <CommentThread
              eventId={id}
              embedded
              onCountChange={(n) =>
                updateCachedPost((p) => ({ ...p, commentCount: n }))
              }
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={androidMenuOpen} transparent animationType="fade" onRequestClose={() => setAndroidMenuOpen(false)}>
        <View style={styles.androidMenuRoot}>
          <Pressable
            style={styles.androidMenuBackdrop}
            onPress={() => setAndroidMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close post actions menu"
          />
          <View style={styles.androidMenuSheet}>
            {displayPost && user?.id && displayPost.userId !== user.id ? (
              <>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Report post"
                >
                  <Text style={styles.androidMenuDefault}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuOpen(false);
                    router.back();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Hide post and go back"
                >
                  <Text style={styles.androidMenuDefault}>Hide post</Text>
                </TouchableOpacity>
              </>
            ) : displayPost && user?.id && displayPost.userId === user.id ? (
              <TouchableOpacity
                style={styles.androidMenuRow}
                onPress={() => {
                  setAndroidMenuOpen(false);
                  void handleDeletePost(displayPost);
                }}
                accessibilityRole="button"
                accessibilityLabel="Delete post"
              >
                <Text style={styles.androidMenuDestructive}>Delete post</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.androidMenuRow}
              onPress={() => setAndroidMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Text style={styles.androidMenuCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function PostThreadScreen() {
  return (
    <ErrorBoundary>
      <PostThreadScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.md,
    paddingBottom: 8,
  },
  back: { padding: 8, marginLeft: -8 },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.FEED_USERNAME,
    textAlign: "center",
  },
  topTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  topTitleChevron: {
    opacity: 0.4,
  },
  postHeaderWrap: { paddingHorizontal: DS_SPACING.sm, marginBottom: 8 },
  postError: { paddingVertical: 16, fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
  androidMenuRoot: { flex: 1, justifyContent: "flex-end" },
  androidMenuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: DS_COLORS.OVERLAY_BLACK_40 },
  androidMenuSheet: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 24,
  },
  androidMenuRow: { paddingVertical: 16, paddingHorizontal: 20 },
  androidMenuDefault: { fontSize: 16, color: DS_COLORS.TEXT_PRIMARY },
  androidMenuDestructive: { fontSize: 16, color: DS_COLORS.DISCOVER_CORAL, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD },
  androidMenuCancel: { fontSize: 16, color: DS_COLORS.TEXT_MUTED, textAlign: "center" },
});
