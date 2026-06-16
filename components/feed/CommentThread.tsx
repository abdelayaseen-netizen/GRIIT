import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { X, Flame } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { Avatar } from "@/components/Avatar";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/lib/analytics";

const QUICK_CHIPS = ["respect", "let's go", "keep going"] as const;

export type CommentThreadNode = {
  id: string;
  eventId: string;
  userId: string;
  text: string;
  createdAt: string;
  parentCommentId: string | null;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  respectCount: number;
  reactedByMe: boolean;
  replies: CommentThreadNode[];
};

export function getCommentThreadQueryKey(eventId: string) {
  return ["commentThread", eventId] as const;
}

export function threadTotal(nodes: CommentThreadNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + threadTotal(n.replies), 0);
}

function patchCommentRespect(
  nodes: CommentThreadNode[],
  commentId: string,
  reacted: boolean,
  respectCount: number
): CommentThreadNode[] {
  return nodes.map((n) => {
    if (n.id === commentId) {
      return { ...n, reactedByMe: reacted, respectCount };
    }
    if (n.replies.length) {
      return { ...n, replies: patchCommentRespect(n.replies, commentId, reacted, respectCount) };
    }
    return n;
  });
}

function appendOptimisticComment(
  nodes: CommentThreadNode[],
  optimistic: CommentThreadNode,
  parentId?: string
): CommentThreadNode[] {
  if (!parentId) return [...nodes, optimistic];
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, replies: [...n.replies, optimistic] };
    }
    return n;
  });
}

type CommentRowProps = {
  node: CommentThreadNode;
  isReply?: boolean;
  onReply: (node: CommentThreadNode) => void;
  onRespect: (node: CommentThreadNode) => void;
  respectBusy: string | null;
};

function CommentRow({ node, isReply, onReply, onRespect, respectBusy }: CommentRowProps) {
  return (
    <View style={[styles.commentRow, isReply ? styles.replyRow : null]}>
      <Avatar
        url={node.avatarUrl}
        name={node.displayName || node.username || "?"}
        userId={node.userId}
        size={isReply ? 28 : 32}
      />
      <View style={styles.commentBody}>
        <View style={styles.commentMeta}>
          <Text style={styles.commentName} numberOfLines={1}>
            {node.displayName || node.username}
          </Text>
          <Text style={styles.commentTime}>{relativeTime(node.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{node.text}</Text>
        <View style={styles.commentActions}>
          {!isReply ? (
            <Pressable
              onPress={() => onReply(node)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Reply to ${node.displayName || node.username}`}
            >
              <Text style={styles.replyBtn}>Reply</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => onRespect(node)}
            disabled={respectBusy === node.id}
            style={styles.respectBtn}
            accessibilityRole="button"
            accessibilityLabel={node.reactedByMe ? "Remove respect" : "Respect comment"}
            accessibilityState={{ selected: node.reactedByMe }}
          >
            <Flame
              size={14}
              color={
                node.reactedByMe
                  ? DS_COLORS_V2.brand.primary
                  : DS_COLORS_V2.text.tertiary
              }
              fill={node.reactedByMe ? DS_COLORS_V2.brand.primary : "none"}
            />
            {node.respectCount > 0 ? (
              <Text
                style={[
                  styles.respectCount,
                  node.reactedByMe ? styles.respectCountActive : null,
                ]}
              >
                {node.respectCount}
              </Text>
            ) : null}
          </Pressable>
        </View>
        {node.replies.map((reply) => (
          <CommentRow
            key={reply.id}
            node={reply}
            isReply
            onReply={onReply}
            onRespect={onRespect}
            respectBusy={respectBusy}
          />
        ))}
      </View>
    </View>
  );
}

type Props = {
  eventId: string;
  onCountChange?: (n: number) => void;
  onTotalChange?: (n: number) => void;
  autoFocus?: boolean;
  enabled?: boolean;
  embedded?: boolean;
};

export function CommentThread({
  eventId,
  onCountChange,
  onTotalChange,
  autoFocus = false,
  enabled = true,
  embedded = false,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentThreadNode | null>(null);
  const [respectBusy, setRespectBusy] = useState<string | null>(null);

  const queryKey = useMemo(() => getCommentThreadQueryKey(eventId), [eventId]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      trpcQuery(TRPC.feed.getCommentThread, { eventId }) as Promise<CommentThreadNode[]>,
    enabled: enabled && !!eventId,
    staleTime: 15_000,
  });

  const thread = query.data ?? [];
  const total = threadTotal(thread);

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  const handleRespect = useCallback(
    async (node: CommentThreadNode) => {
      if (respectBusy) return;
      setRespectBusy(node.id);
      const prevReacted = node.reactedByMe;
      const prevCount = node.respectCount;
      const optimisticReacted = !prevReacted;
      const optimisticCount = Math.max(0, prevCount + (optimisticReacted ? 1 : -1));
      queryClient.setQueryData<CommentThreadNode[]>(queryKey, (old) =>
        old ? patchCommentRespect(old, node.id, optimisticReacted, optimisticCount) : old
      );
      try {
        const result = (await trpcMutate(TRPC.feed.reactComment, {
          commentId: node.id,
        })) as { reacted: boolean; respectCount: number };
        queryClient.setQueryData<CommentThreadNode[]>(queryKey, (old) =>
          old
            ? patchCommentRespect(old, node.id, result.reacted, result.respectCount)
            : old
        );
        if (result.reacted) {
          try {
            track({ name: "comment_respected", comment_id: node.id });
          } catch {
            /* non-fatal */
          }
        }
      } catch {
        queryClient.setQueryData<CommentThreadNode[]>(queryKey, (old) =>
          old ? patchCommentRespect(old, node.id, prevReacted, prevCount) : old
        );
      } finally {
        setRespectBusy(null);
      }
    },
    [queryClient, queryKey, respectBusy]
  );

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !user?.id) return;
    setSending(true);
    const parentId = replyingTo?.id;
    const snapshot = queryClient.getQueryData<CommentThreadNode[]>(queryKey);
    const optimisticNode: CommentThreadNode = {
      id: `optimistic-${Date.now()}`,
      eventId,
      userId: user.id,
      text,
      createdAt: new Date().toISOString(),
      parentCommentId: parentId ?? null,
      displayName:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email ??
        "You",
      username: (user.user_metadata?.username as string | undefined) ?? "you",
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      respectCount: 0,
      reactedByMe: false,
      replies: [],
    };
    queryClient.setQueryData<CommentThreadNode[]>(queryKey, (old) =>
      appendOptimisticComment(old ?? [], optimisticNode, parentId)
    );
    const optimisticTotal = threadTotal(
      appendOptimisticComment(snapshot ?? [], optimisticNode, parentId)
    );
    onCountChange?.(optimisticTotal);

    try {
      await trpcMutate(TRPC.feed.comment, {
        eventId,
        text,
        parentCommentId: parentId,
      });
      setDraft("");
      setReplyingTo(null);
      try {
        if (parentId) {
          track({ name: "comment_reply_posted", post_id: eventId, parent_comment_id: parentId });
        } else {
          track({ name: "comment_posted", post_id: eventId });
        }
      } catch {
        /* non-fatal */
      }
      const refreshed = await query.refetch();
      const nextTotal = threadTotal(refreshed.data ?? []);
      onCountChange?.(nextTotal);
      void queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", eventId] });
    } catch {
      queryClient.setQueryData(queryKey, snapshot);
      onCountChange?.(threadTotal(snapshot ?? []));
    } finally {
      setSending(false);
    }
  }, [draft, sending, eventId, replyingTo, query, queryClient, queryKey, onCountChange, user]);

  const renderThreadItem = useCallback(
    ({ item }: { item: CommentThreadNode }) => (
      <CommentRow
        node={item}
        onReply={setReplyingTo}
        onRespect={handleRespect}
        respectBusy={respectBusy}
      />
    ),
    [handleRespect, respectBusy]
  );

  return (
    <View style={[styles.root, embedded ? styles.rootEmbedded : null]}>
      {query.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={DS_COLORS_V2.brand.primary} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{"Couldn't load comments"}</Text>
        </View>
      ) : thread.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Be the first to comment.</Text>
        </View>
      ) : (
        <FlatList
          style={[styles.list, embedded ? styles.listEmbedded : null]}
          data={thread}
          keyExtractor={(item) => item.id}
          renderItem={renderThreadItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.composer}>
        <View style={styles.chipRow}>
          {QUICK_CHIPS.map((chip) => (
            <Pressable
              key={chip}
              style={styles.chip}
              onPress={() => setDraft(chip)}
              accessibilityRole="button"
              accessibilityLabel={`Use quick comment: ${chip}`}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </Pressable>
          ))}
        </View>

        {replyingTo ? (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText} numberOfLines={1}>
              Replying to {replyingTo.displayName || replyingTo.username}
            </Text>
            <Pressable
              onPress={() => setReplyingTo(null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
            >
              <X size={14} color={DS_COLORS_V2.text.tertiary} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <Avatar
            url={user?.user_metadata?.avatar_url ?? null}
            name={
              (user?.user_metadata?.display_name as string | undefined) ??
              user?.email ??
              "You"
            }
            userId={user?.id}
            size={28}
          />
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
            value={draft}
            onChangeText={setDraft}
            maxLength={200}
            autoFocus={autoFocus}
            returnKeyType="send"
            onSubmitEditing={() => void handleSend()}
          />
          <Pressable
            onPress={() => void handleSend()}
            disabled={!draft.trim() || sending}
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            <Text style={styles.sendText}>{sending ? "..." : "Post"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 0,
  },
  rootEmbedded: {
    flex: 1,
    paddingHorizontal: 16,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    minHeight: 120,
  },
  emptyText: {
    fontSize: 14,
    color: DS_COLORS_V2.text.tertiary,
  },
  list: {
    flexGrow: 0,
    maxHeight: 360,
  },
  listEmbedded: {
    flex: 1,
    maxHeight: undefined,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
  },
  replyRow: {
    marginTop: 6,
    paddingLeft: 4,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentName: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    flexShrink: 1,
  },
  commentTime: {
    fontSize: 11,
    color: DS_COLORS_V2.text.tertiary,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: DS_COLORS_V2.text.primary,
    marginTop: 2,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 6,
  },
  replyBtn: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  respectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  respectCount: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.tertiary,
  },
  respectCountActive: {
    color: DS_COLORS_V2.brand.primary,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_COLORS_V2.surface.divider,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 4 : 8,
    backgroundColor: DS_COLORS_V2.surface.card,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  replyingText: {
    flex: 1,
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: DS_COLORS_V2.text.primary,
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
    borderRadius: DS_RADIUS_V2.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS_V2.brand.primaryText,
  },
});
