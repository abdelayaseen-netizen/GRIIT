import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Flame } from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { Avatar } from "@/components/Avatar";
import {
  DS_COLORS,
  DS_COLORS_V2,
  DS_RADIUS,
  DS_RADIUS_V2,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";
import { useAuth } from "@/contexts/AuthContext";

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

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onCountChange?: (n: number) => void;
};

function threadTotal(nodes: CommentThreadNode[]): number {
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

export function CommentsSheet({ visible, eventId, onClose, onCountChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentThreadNode | null>(null);
  const [respectBusy, setRespectBusy] = useState<string | null>(null);

  const queryKey = useMemo(() => ["commentThread", eventId] as const, [eventId]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      trpcQuery(TRPC.feed.getCommentThread, { eventId }) as Promise<CommentThreadNode[]>,
    enabled: visible && !!eventId,
    staleTime: 15_000,
  });

  const thread = query.data ?? [];
  const total = threadTotal(thread);

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
    if (!text || sending) return;
    setSending(true);
    try {
      await trpcMutate(TRPC.feed.comment, {
        eventId,
        text,
        parentCommentId: replyingTo?.id,
      });
      setDraft("");
      setReplyingTo(null);
      const refreshed = await query.refetch();
      const nextTotal = threadTotal(refreshed.data ?? []);
      onCountChange?.(nextTotal);
      void queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", eventId] });
    } finally {
      setSending(false);
    }
  }, [draft, sending, eventId, replyingTo, query, queryClient, onCountChange]);

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

  const handleClose = useCallback(() => {
    setDraft("");
    setReplyingTo(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss comments"
        />
        <View style={styles.sheet}>
          <Pressable
            onPress={handleClose}
            style={styles.handleHit}
            accessibilityRole="button"
            accessibilityLabel="Drag to dismiss"
          >
            <View style={styles.handle} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Comments {total > 0 ? total : ""}</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close comments"
            >
              <X size={20} color={DS_COLORS_V2.text.secondary} />
            </Pressable>
          </View>

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
              style={styles.list}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_40,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.xl,
    borderTopRightRadius: DS_RADIUS_V2.xl,
    maxHeight: "85%",
    minHeight: 280,
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
  },
  handleHit: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS_V2.surface.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS_V2.text.primary,
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
  listContent: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    paddingBottom: 8,
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
