import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
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
import { ChevronLeft } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";
import { relativeTime } from "@/lib/utils/relativeTime";
import { captureError } from "@/lib/sentry";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { MilestonePostCard } from "@/components/feed/MilestonePostCard";
import { useAuth } from "@/contexts/AuthContext";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

type CommentRow = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

const RESPECT_DEBOUNCE_MS = 300;

export default function PostThreadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [androidMenuOpen, setAndroidMenuOpen] = useState(false);
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

  const commentsQuery = useQuery({
    queryKey: ["feed", "comments", id],
    queryFn: () => trpcQuery(TRPC.feed.getComments, { eventId: id, limit: 100 }) as Promise<CommentRow[]>,
    enabled: !!id,
  });

  const onRefresh = useCallback(() => {
    void Promise.all([postQuery.refetch(), commentsQuery.refetch()]);
  }, [postQuery, commentsQuery]);

  const commentMutation = useMutation({
    mutationFn: (text: string) => trpcMutate(TRPC.feed.comment, { eventId: id, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      void postQuery.refetch();
      setDraft("");
    },
    onError: (e) => {
      captureError(e, "PostThreadComment");
    },
  });

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !id) return;
    commentMutation.mutate(t);
  }, [draft, id, commentMutation]);

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

  const listHeader = useMemo(() => {
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
      onComment: () => {},
      onShare: () => void onShare(p),
      onMenuPress: () => openMenu(p),
    };
    return (
      <View style={styles.postHeaderWrap}>
        {p.isCompleted ? <MilestonePostCard {...common} /> : <FeedPostCard {...common} />}
      </View>
    );
  }, [displayPost, postQuery.isPending, postQuery.isError, postQuery.error, navigateProfile, onRespect, onShare, openMenu]);

  const renderCommentItem = useCallback(
    ({ item }: { item: CommentRow }) => (
      <View style={styles.commentRow}>
        <Avatar
          url={item.avatar_url}
          name={item.display_name || item.username}
          userId={item.user_id}
          size={36}
        />
        <View style={styles.commentMain}>
          <Text style={styles.commentName}>{item.display_name || item.username}</Text>
          <Text style={styles.commentBody}>{item.text}</Text>
          <Text style={styles.commentTime}>{relativeTime(item.created_at)}</Text>
        </View>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
            <ChevronLeft size={22} color={DS_COLORS.TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {commentsQuery.isPending && !commentsQuery.data ? (
          <ActivityIndicator style={styles.loader} color={DS_COLORS.DISCOVER_CORAL} />
        ) : (
          <FlatList
            data={commentsQuery.data ?? []}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={listHeader}
            refreshControl={
              <RefreshControl
                refreshing={
                  (commentsQuery.isRefetching && !commentsQuery.isPending) ||
                  (postQuery.isRefetching && !postQuery.isPending)
                }
                onRefresh={onRefresh}
                tintColor={DS_COLORS.DISCOVER_CORAL}
              />
            }
            ListEmptyComponent={<Text style={styles.empty}>No comments yet. Say something kind.</Text>}
            renderItem={renderCommentItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === "android"}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment…"
            placeholderTextColor={DS_COLORS.INPUT_PLACEHOLDER}
            value={draft}
            onChangeText={setDraft}
            maxLength={200}
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={commentMutation.isPending || !draft.trim()}
            style={[styles.send, (!draft.trim() || commentMutation.isPending) && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color={DS_COLORS.TEXT_ON_DARK} />
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={androidMenuOpen} transparent animationType="fade" onRequestClose={() => setAndroidMenuOpen(false)}>
        <View style={styles.androidMenuRoot}>
          <Pressable style={styles.androidMenuBackdrop} onPress={() => setAndroidMenuOpen(false)} />
          <View style={styles.androidMenuSheet}>
            {displayPost && user?.id && displayPost.userId !== user.id ? (
              <>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuOpen(false);
                  }}
                >
                  <Text style={styles.androidMenuDefault}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.androidMenuRow}
                  onPress={() => {
                    setAndroidMenuOpen(false);
                    router.back();
                  }}
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
              >
                <Text style={styles.androidMenuDestructive}>Delete post</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.androidMenuRow} onPress={() => setAndroidMenuOpen(false)}>
              <Text style={styles.androidMenuCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  flex: { flex: 1 },
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
    fontWeight: "600",
    color: DS_COLORS.FEED_USERNAME,
    textAlign: "center",
  },
  postHeaderWrap: { paddingHorizontal: DS_SPACING.sm, marginBottom: 8 },
  postError: { paddingVertical: 16, fontSize: 14, color: DS_COLORS.TEXT_SECONDARY, textAlign: "center" },
  loader: { marginTop: 24 },
  list: { paddingHorizontal: DS_SPACING.lg, paddingBottom: 16 },
  empty: { textAlign: "center", color: DS_COLORS.FEED_META_MUTED, marginTop: 24, fontSize: 14 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  commentMain: { flex: 1 },
  commentName: { fontSize: 14, fontWeight: "600", color: DS_COLORS.FEED_USERNAME },
  commentBody: { fontSize: 14, color: DS_COLORS.TEXT_PRIMARY, marginTop: 2 },
  commentTime: { fontSize: 11, color: DS_COLORS.FEED_META_MUTED, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: DS_SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.FEED_COMMENT_BORDER,
    backgroundColor: DS_COLORS.BG_CARD,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: DS_COLORS.INPUT_BG,
    borderWidth: 1,
    borderColor: DS_COLORS.INPUT_BORDER,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  send: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: DS_COLORS.TEXT_ON_DARK, fontWeight: "600", fontSize: 15 },
  androidMenuRoot: { flex: 1, justifyContent: "flex-end" },
  androidMenuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  androidMenuSheet: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 24,
  },
  androidMenuRow: { paddingVertical: 16, paddingHorizontal: 20 },
  androidMenuDefault: { fontSize: 16, color: DS_COLORS.TEXT_PRIMARY },
  androidMenuDestructive: { fontSize: 16, color: DS_COLORS.DISCOVER_CORAL, fontWeight: "600" },
  androidMenuCancel: { fontSize: 16, color: DS_COLORS.TEXT_MUTED, textAlign: "center" },
});
