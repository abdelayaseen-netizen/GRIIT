import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "@/components/ds/Screen";
import { ArrowUp } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_V3 } from "@/lib/design-system";
import PushedHeader from "@/components/ds/PushedHeader";
import ProofImage from "@/components/ds/ProofImage";
import Avatar from "@/components/ds/Avatar";
import Divider from "@/components/ds/Divider";
import TextField from "@/components/ds/TextField";
import Skeleton from "@/components/ds/Skeleton";
import CommentRow from "@/components/ds/CommentRow";
import { relativeTime } from "@/lib/utils/relativeTime";
import { captureError } from "@/lib/sentry";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { commentRowParts } from "@/lib/comment-row";
import {
  COMMENT_PLACEHOLDER,
  COMMENTS_EMPTY,
  POST_DETAIL_TITLE,
  commentsCountLabel,
  commentsSectionKind,
  composerFieldGround,
  completionLine,
  postDetailLoading,
  postDetailPhotoUri,
  postDetailStamp,
  sendComposerArmed,
} from "@/lib/post-detail";
import { replyComposerPlaceholder, threadRows } from "@/lib/post-thread";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

type CommentItem = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  parent_id: string | null;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 5;

function PostThreadScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [deleteCommentTargetId, setDeleteCommentTargetId] = useState<string | null>(null);

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
  const loading = postDetailLoading({
    postPending: postQuery.isPending,
    hasPost: Boolean(displayPost),
  });

  const commentsQuery = useQuery({
    queryKey: ["feed", "comments", id],
    queryFn: () =>
      trpcQuery(TRPC.feed.getComments, { eventId: id, limit: 100 }) as Promise<CommentItem[]>,
    enabled: !!id,
  });

  const comments = commentsQuery.data ?? [];
  const rows = useMemo(
    () => threadRows(comments.map((item) => ({ ...item, parent_id: item.parent_id ?? null }))),
    [comments],
  );
  const section = commentsSectionKind(commentsQuery.isPending, comments.length);
  const sendArmed = sendComposerArmed(draft);
  const placeholder = replyTo ? replyComposerPlaceholder(replyTo.name) : COMMENT_PLACEHOLDER;

  const onRefresh = useCallback(() => {
    void Promise.all([postQuery.refetch(), commentsQuery.refetch()]);
  }, [postQuery, commentsQuery]);

  const commentMutation = useMutation({
    mutationFn: (input: { text: string; parentId?: string }) =>
      trpcMutate(TRPC.feed.comment, {
        eventId: id,
        text: input.text,
        ...(input.parentId ? { parentId: input.parentId } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      void postQuery.refetch();
      setDraft("");
      setReplyTo(null);
    },
    onError: (e) => {
      captureError(e, "PostThreadComment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => trpcMutate(TRPC.feed.deleteComment, { commentId }),
    onSuccess: async () => {
      setDeleteCommentTargetId(null);
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      void postQuery.refetch();
    },
    onError: (e) => {
      captureError(e, "PostThreadDeleteComment");
    },
  });

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !id) return;
    commentMutation.mutate({ text: t, parentId: replyTo?.id });
  }, [draft, id, commentMutation, replyTo]);

  const listHeader = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.stack}>
          <View style={styles.gutter}>
            <Skeleton variant="proof" />
          </View>
          <Skeleton lines={2} />
          <Skeleton lines={2} />
        </View>
      );
    }
    if (postQuery.isError && !displayPost) {
      return (
        <Text style={styles.missing}>
          {postQuery.error instanceof Error ? postQuery.error.message : "Couldn't load this post."}
        </Text>
      );
    }
    if (!displayPost) {
      return <Text style={styles.missing}>Post not found.</Text>;
    }
    const author = displayPost.displayName || displayPost.username;
    const stamp = postDetailStamp(displayPost);
    const proofUri = postDetailPhotoUri(displayPost);
    return (
      <View>
        <View style={styles.gutter}>
          {proofUri ? <ProofImage uri={proofUri} size="feed" stamp={stamp} /> : null}
          <View style={styles.authorRow}>
            <Avatar
              size={DS_V3.size.avatar.sm}
              uri={displayPost.avatarUrl}
              displayName={author}
            />
            <View style={styles.authorCopy}>
              <Text style={styles.author}>{author}</Text>
              <Text style={styles.time}>{relativeTime(displayPost.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.completion}>
            {completionLine({
              challenge: displayPost.challengeName,
              day: displayPost.currentDay,
              total: displayPost.totalDays,
              task: displayPost.taskName,
            })}
          </Text>
          {commentsCountLabel(displayPost.commentCount) ? (
            <Text style={styles.count}>{commentsCountLabel(displayPost.commentCount)}</Text>
          ) : null}
        </View>
        {section === "loading" ? (
          <View style={styles.commentSkeletons}>
            <Skeleton lines={2} />
            <Skeleton lines={2} />
          </View>
        ) : null}
      </View>
    );
  }, [loading, displayPost, postQuery.isError, postQuery.error, section]);

  const renderCommentItem = useCallback(
    ({ item: row, index }: { item: { item: CommentItem; depth: 0 | 1 }; index: number }) => {
      const item = row.item;
      const isMine = Boolean(user?.id && item.user_id === user.id);
      const parts = commentRowParts({
        displayName: item.display_name,
        username: item.username,
        createdAt: item.created_at,
        text: item.text,
        formatTime: relativeTime,
      });
      const next = rows[index + 1];
      return (
        <View style={row.depth > 0 ? styles.reply : undefined}>
          {row.depth > 0 ? <View style={styles.threadLine} /> : null}
          <View style={styles.replyBody}>
          <Pressable
            onPress={() => setReplyTo({ id: item.id, name: parts.name })}
            onLongPress={isMine ? () => setDeleteCommentTargetId(item.id) : undefined}
            delayLongPress={450}
            accessibilityRole="button"
            accessibilityLabel={
              isMine
                ? "Your comment — long press to delete"
                : `Reply to ${parts.name}`
            }
          >
            <CommentRow
              displayName={parts.name}
              time={parts.time}
              body={parts.body}
              avatarUri={item.avatar_url}
            />
          </Pressable>
          {deleteCommentTargetId === item.id ? (
            <View style={styles.deleteBar}>
              <Pressable
                onPress={() => setDeleteCommentTargetId(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel delete"
              >
                <Text style={styles.deleteCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => deleteCommentMutation.mutate(item.id)}
                disabled={deleteCommentMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete comment"
              >
                <Text style={styles.deleteConfirm}>Delete</Text>
              </Pressable>
            </View>
          ) : null}
          {next && next.depth === 0 ? <Divider /> : null}
          </View>
        </View>
      );
    },
    [user?.id, deleteCommentTargetId, deleteCommentMutation, rows],
  );

  return (
    <Screen style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PushedHeader title={POST_DETAIL_TITLE} onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? DS_V3.size.tap : 0}
      >
        <FlatList
          data={section === "list" ? rows : []}
          keyExtractor={(row) => row.item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            !loading && displayPost && section === "empty" ? (
              <Text style={styles.empty}>{COMMENTS_EMPTY}</Text>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={
                (commentsQuery.isRefetching && !commentsQuery.isPending) ||
                (postQuery.isRefetching && !postQuery.isPending)
              }
              onRefresh={onRefresh}
              tintColor={DS_V3.color.textPrimary}
            />
          }
          renderItem={renderCommentItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, DS_V3.space.lg) }]}>
          {replyTo ? (
            <Pressable
              onPress={() => setReplyTo(null)}
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
            >
              <Text style={styles.cancelReply}>Cancel reply</Text>
            </Pressable>
          ) : null}
          <View style={styles.field}>
            <TextField
              value={draft}
              onChangeText={setDraft}
              placeholder={placeholder}
              accessibilityLabel={placeholder}
              ground={composerFieldGround("route")}
              maxLength={200}
              multiline
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={commentMutation.isPending || !sendArmed}
            style={[styles.send, sendArmed ? styles.sendArmed : styles.sendIdle]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
            accessibilityState={{ disabled: !sendArmed }}
          >
            <ArrowUp
              size={ICON}
              color={sendArmed ? DS_V3.color.textPrimary : DS_V3.color.textSecondary}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
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
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  flex: { flex: 1 },
  list: { paddingBottom: DS_V3.space.lg },
  stack: { gap: DS_V3.space.lg, paddingBottom: DS_V3.space.lg },
  gutter: { paddingHorizontal: DS_V3.space.gutter, gap: DS_V3.space.lg },
  reply: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingLeft: DS_V3.space.gutter,
  },
  threadLine: {
    width: 2,
    backgroundColor: DS_V3.color.hairline,
    marginRight: DS_V3.space.sm,
  },
  replyBody: { flex: 1 },
  cancelReply: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
    paddingBottom: DS_V3.space.sm,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  authorCopy: { flex: 1, gap: PT },
  author: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  time: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  completion: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  count: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: DS_V3.type.label.textTransform,
    color: DS_V3.color.textSecondary,
  },
  commentSkeletons: { gap: DS_V3.space.lg, paddingHorizontal: DS_V3.space.gutter },
  empty: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  missing: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.lg,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  deleteBar: {
    flexDirection: "row",
    gap: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.lg,
  },
  deleteCancel: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  deleteConfirm: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.danger,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    backgroundColor: DS_V3.color.canvas,
  },
  field: { flex: 1 },
  send: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIdle: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  sendArmed: {
    backgroundColor: DS_V3.color.primary,
  },
});
