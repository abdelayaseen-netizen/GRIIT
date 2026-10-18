import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  RefreshControl,
  ActionSheetIOS,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "@/components/ds/Screen";
import { ArrowUp, MoreHorizontal } from "lucide-react-native";
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
import ShareStickerSheet from "@/components/share/ShareStickerSheet";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";
import { PostResultRow } from "@/components/feed/PostResult";
import { postBadge } from "@/lib/post-result";
import {
  AUDIENCE_CHOICES,
  AUDIENCE_VALUES,
  POST_MENU_CANCEL,
  POST_MENU_DELETE,
  POST_MENU_DELETE_NOTE,
  ownerMenuAction,
  ownerMenuOptions,
} from "@/lib/post-menu";
import { optimisticRespect, rollbackRespect, settleRespect } from "@/lib/feed-respect";
import { relativeTime } from "@/lib/utils/relativeTime";
import { captureError } from "@/lib/sentry";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { commentRowParts } from "@/lib/comment-row";
import { fetchComments } from "@/lib/hidden-comments";
import { useReportComment } from "@/components/feed/useReportComment";
import { CANCEL_REPORT_LABEL, REPORT_COMMENT_LABEL, REPORT_COMMENT_PROMPT, commentLongPressAction } from "@/lib/comment-report";
import {
  COMMENT_PLACEHOLDER,
  COMMENTS_EMPTY,
  POST_DETAIL_TITLE,
  commentsCountLabel,
  visibleCommentCount,
  commentsSectionKind,
  composerFieldGround,
  completionLine,
  postDetailLoading,
  postDetailPhotoUri,
  sendComposerArmed,
} from "@/lib/post-detail";
import { replyComposerPlaceholder, threadRows } from "@/lib/post-thread";
import { ROUTES } from "@/lib/routes";
import { feedAuthorHref } from "@/lib/feed-tap-targets";
import { audienceBadge, type PostAudience } from "@/lib/post-audience";

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
  // 07.3: long press on someone else's comment offers a report; 07.1: a refused comment says why.
  const [reportCommentTargetId, setReportCommentTargetId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const reportComment = useReportComment(id);
  // Build 92 04.6: the list scrolls to the latest comment when the keyboard opens or a comment is sent.
  const listRef = useRef<FlatList<{ item: CommentItem; depth: 0 | 1 }>>(null);
  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);
  const [keyboardUp, setKeyboardUp] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardUp(true);
      scrollToLatest();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [scrollToLatest]);

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
    queryFn: () => fetchComments(id, 100) as Promise<CommentItem[]>,
    enabled: !!id,
  });

  const comments = commentsQuery.data ?? [];
  const visibleCount = visibleCommentCount(commentsQuery.data ? comments.length : null, displayPost?.commentCount ?? 0);
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
      setSendError(null);
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      void postQuery.refetch();
      setDraft("");
      setReplyTo(null);
      scrollToLatest();
    },
    onError: (e) => {
      captureError(e, "PostThreadComment");
      // The text stays in the field; the line under it says what the server refused.
      setSendError(e instanceof Error && e.message ? e.message : "Couldn't send. Try again.");
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

  const audienceMutation = useMutation({
    mutationFn: (audience: PostAudience) =>
      trpcMutate(TRPC.checkins.setPostAudience, { eventId: id, audience }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed", "post", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    },
  });

  // Build 92 04.6: Back returns to where the post was opened from; Home when there is no history.
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  const deletePostMutation = useMutation({
    mutationFn: () => trpcMutate(TRPC.checkins.unshareProof, { eventId: id }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      goBack();
    },
    onError: (e) => captureError(e, "PostThreadDeletePost"),
  });

  // Build 92 04.4: a double tap on the photo likes once (never unlikes; nothing on your own post).
  const likeFromPhoto = useCallback(async () => {
    const post = postQuery.data;
    if (!post || post.reactedByMe) return;
    const prev = { reactedByMe: post.reactedByMe, respectCount: post.respectCount };
    const next = optimisticRespect(prev);
    queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...next } : p));
    try {
      const result = (await trpcMutate(TRPC.feed.react, { eventId: id, mode: "like" })) as { reacted?: boolean; reactionCount?: number };
      queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...settleRespect(result, next) } : p));
      void queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    } catch (e) {
      captureError(e, "PostThreadLike");
      queryClient.setQueryData<LiveFeedPost>(["feed", "post", id], (p) => (p ? { ...p, ...rollbackRespect(prev) } : p));
    }
  }, [postQuery.data, queryClient, id]);

  const openPhoto = useCallback(() => {
    const post = postQuery.data;
    const uri = post ? postDetailPhotoUri(post) : null;
    if (!post || !uri) return;
    router.push({
      pathname: ROUTES.POST_PHOTO(id),
      params: { uri, name: post.displayName ?? "", context: `${post.challengeName} · Day ${post.currentDay}` },
    } as never);
  }, [postQuery.data, router, id]);

  // Build 92 04.6: the owner's "…" menu — Who sees this · Share · Delete post.
  const openOwnerMenu = useCallback(() => {
    const post = postQuery.data;
    if (!post || Platform.OS !== "ios") return;
    const canRetarget = post.audience === "friends" || post.audience === "everyone" || post.audience === "only_me";
    const pickAudience = () =>
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...AUDIENCE_CHOICES, POST_MENU_CANCEL], cancelButtonIndex: AUDIENCE_CHOICES.length },
        (i) => {
          const next = AUDIENCE_VALUES[i];
          if (next) audienceMutation.mutate(next);
        },
      );
    const confirmDelete = () =>
      ActionSheetIOS.showActionSheetWithOptions(
        { title: POST_MENU_DELETE_NOTE, options: [POST_MENU_DELETE, POST_MENU_CANCEL], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
        (i) => {
          if (i === 0) deletePostMutation.mutate();
        },
      );
    const options = ownerMenuOptions(canRetarget);
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: options.indexOf(POST_MENU_DELETE) },
      (i) => {
        const action = ownerMenuAction(canRetarget, i);
        if (action === "who_sees") pickAudience();
        else if (action === "share") setShareOpen(true);
        else if (action === "delete") confirmDelete();
      },
    );
  }, [postQuery.data, audienceMutation, deletePostMutation]);

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !id) return;
    commentMutation.mutate({ text: t, parentId: replyTo?.id });
  }, [draft, id, commentMutation, replyTo]);

  // 05.1: the author header and every comment author open the person.
  const openPerson = useCallback(
    (authorUserId: string, username: string | null | undefined) => {
      router.push(feedAuthorHref({ viewerUserId: user?.id, authorUserId, username }) as never);
    },
    [router, user?.id],
  );

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
    const proofUri = postDetailPhotoUri(displayPost);
    const own = Boolean(user?.id && displayPost.userId === user.id);
    return (
      <View>
        <View style={styles.gutter}>
          {proofUri ? (
            <DoubleTapRespect
              respected={displayPost.reactedByMe}
              onRespect={() => void likeFromPhoto()}
              onOpen={openPhoto}
              ownPost={own}
              testID="post-detail-photo"
              accessibilityLabel="Open photo"
            >
              <ProofImage uri={proofUri} size="feed" />
            </DoubleTapRespect>
          ) : null}
          <PostResultRow result={displayPost.result} badge={postBadge(displayPost)} compact />
          <Pressable
            testID="post-author"
            accessibilityRole="button"
            accessibilityLabel={`${author} profile`}
            onPress={() => openPerson(displayPost.userId, displayPost.username)}
            style={styles.authorRow}
          >
            <Avatar
              size={DS_V3.size.avatar.sm}
              uri={displayPost.avatarUrl}
              displayName={author}
            />
            <View style={styles.authorCopy}>
              <Text style={styles.author}>{author}</Text>
              <Text style={styles.time}>{relativeTime(displayPost.createdAt)}</Text>
            </View>
          </Pressable>
          <Text style={styles.completion}>
            {completionLine({
              challenge: displayPost.challengeName,
              day: displayPost.currentDay,
              total: displayPost.totalDays,
              task: displayPost.taskName,
            })}
          </Text>
          {audienceBadge(displayPost.audience) && !(user?.id && displayPost.userId === user.id) ? (
            <Text style={styles.count}>{audienceBadge(displayPost.audience)}</Text>
          ) : null}
          {/* Build 92 04.6: no Done here. The owner's audience, Share and Delete live in the "…" menu. */}
          {commentsCountLabel(visibleCount) ? (
            <Text style={styles.count}>{commentsCountLabel(visibleCount)}</Text>
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
  }, [loading, displayPost, visibleCount, postQuery.isError, postQuery.error, section, user?.id, openPerson, likeFromPhoto, openPhoto]);

  const ownPost = Boolean(user?.id && displayPost && displayPost.userId === user.id);

  const renderCommentItem = useCallback(
    ({ item: row, index }: { item: { item: CommentItem; depth: 0 | 1 }; index: number }) => {
      const item = row.item;
      const isMine = Boolean(user?.id && item.user_id === user.id);
      const longPress = commentLongPressAction(user?.id, item.user_id);
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
            onLongPress={
              longPress === "delete"
                ? () => setDeleteCommentTargetId(item.id)
                : longPress === "report"
                  ? () => setReportCommentTargetId(item.id)
                  : undefined
            }
            delayLongPress={450}
            // 05.1: not an accessible element itself, so the author tap target and the
            // comment text inside stay reachable (an accessible wrapper flattens them
            // into one "Reply to" button for VoiceOver and UI tests).
            accessible={false}
            accessibilityRole="button"
            accessibilityLabel={
              isMine
                ? "Your comment — long press to delete"
                : `Reply to ${parts.name} — long press to report`
            }
          >
            <CommentRow
              displayName={parts.name}
              time={parts.time}
              body={parts.body}
              avatarUri={item.avatar_url}
              onPressAuthor={() => openPerson(item.user_id, item.username)}
            />
          </Pressable>
          {reportCommentTargetId === item.id ? (
            <View style={styles.deleteBar}>
              <Text style={styles.deleteCancel}>{REPORT_COMMENT_PROMPT}</Text>
              <Pressable
                onPress={() => setReportCommentTargetId(null)}
                accessibilityRole="button"
                accessibilityLabel="Cancel report"
              >
                <Text style={styles.deleteCancel}>{CANCEL_REPORT_LABEL}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setReportCommentTargetId(null);
                  reportComment.report(item.id);
                }}
                disabled={reportComment.pending}
                accessibilityRole="button"
                accessibilityLabel={REPORT_COMMENT_LABEL}
              >
                <Text style={styles.deleteConfirm}>Report</Text>
              </Pressable>
            </View>
          ) : null}
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
    [user?.id, deleteCommentTargetId, reportCommentTargetId, deleteCommentMutation, reportComment, rows, openPerson],
  );

  return (
    <Screen style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Build 92 04.6: the title is the challenge, the author under it; never the route word. */}
      <PushedHeader
        title={displayPost?.challengeName ?? POST_DETAIL_TITLE}
        titleSlot={
          displayPost ? (
            <View style={styles.titleSlot}>
              <Text style={styles.headerTitle} numberOfLines={1}>{displayPost.challengeName}</Text>
              <Text style={styles.headerSub} numberOfLines={1}>{displayPost.displayName || displayPost.username}</Text>
            </View>
          ) : undefined
        }
        onBack={goBack}
        trailing={
          ownPost ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More"
              testID="post-menu"
              onPress={openOwnerMenu}
              style={styles.more}
            >
              <MoreHorizontal size={ICON} color={DS_V3.color.textPrimary} />
            </Pressable>
          ) : undefined
        }
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        // The composer sits on the keyboard. This view's layout already runs to the bottom of the
        // window (the Screen pads the top inset and the header sits above), so no extra offset: build
        // 90's 44 left a 44pt gap between the composer and the keyboard.
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
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

        {reportComment.notice || sendError ? (
          <Text
            style={[styles.composerNote, sendError ? styles.composerNoteError : null]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {sendError ?? reportComment.notice}
          </Text>
        ) : null}
        <View style={[styles.composer, { paddingBottom: keyboardUp ? DS_V3.space.sm : Math.max(insets.bottom, DS_V3.space.lg) }]}>
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
              onChangeText={(t) => {
                setDraft(t);
                if (sendError) setSendError(null);
              }}
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
      {ownPost && displayPost ? (
        <ShareStickerSheet
          visible={shareOpen}
          onDismiss={() => setShareOpen(false)}
          variant="day"
          moment={postDetailPhotoUri(displayPost) ? "photo_proof" : "self_reported"}
          streak={displayPost.streakCount}
          day={{
            challenge: displayPost.challengeName,
            task: displayPost.taskName ?? undefined,
            day: displayPost.currentDay,
            durationDays: displayPost.totalDays,
            proof: postDetailPhotoUri(displayPost) ? "camera" : "self",
            photoUri: postDetailPhotoUri(displayPost),
            photoShared: true,
            username: displayPost.username,
          }}
        />
      ) : null}
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
  titleSlot: { alignItems: "center" },
  headerTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  headerSub: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  more: { width: DS_V3.size.tap, height: DS_V3.size.tap, alignItems: "center", justifyContent: "center" },
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
  composerNote: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    backgroundColor: DS_V3.color.canvas,
  },
  composerNoteError: {
    color: DS_V3.color.danger,
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
