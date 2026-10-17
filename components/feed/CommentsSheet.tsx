import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ArrowUp } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { feedAuthorHref } from "@/lib/feed-tap-targets";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { fetchComments } from "@/lib/hidden-comments";
import { useReportComment } from "@/components/feed/useReportComment";
import { CANCEL_REPORT_LABEL, REPORT_COMMENT_LABEL, REPORT_COMMENT_PROMPT, commentLongPressAction } from "@/lib/comment-report";
import { DS_V3 } from "@/lib/design-system";
import Sheet from "@/components/ds/Sheet";
import CommentRow from "@/components/ds/CommentRow";
import Divider from "@/components/ds/Divider";
import Spinner from "@/components/ds/Spinner";
import TextField from "@/components/ds/TextField";
import { relativeTime } from "@/lib/utils/relativeTime";
import { commentRowParts } from "@/lib/comment-row";
import { captureError } from "@/lib/sentry";
import {
  COMMENT_PLACEHOLDER,
  COMMENTS_EMPTY,
  COMMENTS_HEADING,
  commentsSectionKind,
  composerFieldGround,
  sendComposerArmed,
} from "@/lib/post-detail";

type CommentItem = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 5;

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
};

export function CommentsSheet({ visible, eventId, onClose }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  // 07.1: a refused comment says why, under the field. 07.3: long press → report.
  const [sendError, setSendError] = useState<string | null>(null);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const reportComment = useReportComment(eventId);

  // 05.1: a comment author opens their profile. The sheet closes first so the
  // profile is not pushed under a Modal.
  const openAuthor = useCallback(
    (item: Pick<CommentItem, "user_id" | "username">) => {
      const href = feedAuthorHref({ viewerUserId: user?.id, authorUserId: item.user_id, username: item.username });
      onClose();
      router.push(href as never);
    },
    [onClose, router, user?.id],
  );

  const query = useQuery({
    queryKey: ["feed", "comments", eventId],
    queryFn: () => fetchComments(eventId, 100) as Promise<CommentItem[]>,
    enabled: visible && !!eventId,
  });

  const rows = query.data ?? [];
  const section = commentsSectionKind(query.isPending, rows.length);
  const sendArmed = sendComposerArmed(draft);
  const fieldGround = composerFieldGround("sheet");

  const commentMutation = useMutation({
    mutationFn: (text: string) => trpcMutate(TRPC.feed.comment, { eventId, text }),
    onSuccess: async () => {
      setDraft("");
      setSendError(null);
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    },
    onError: (e) => {
      captureError(e, "CommentsSheetSend");
      setSendError(e instanceof Error && e.message ? e.message : "Couldn't send. Try again.");
    },
  });

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !eventId) return;
    commentMutation.mutate(t);
  }, [draft, eventId, commentMutation]);

  return (
    <Sheet
      visible={visible}
      onDismiss={onClose}
      heading={COMMENTS_HEADING}
      footer={
        <View>
          {reportComment.notice || sendError ? (
            <Text
              style={[styles.note, sendError ? styles.noteError : null]}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {sendError ?? reportComment.notice}
            </Text>
          ) : null}
        <View style={styles.composer}>
          <View style={styles.field}>
            <TextField
              value={draft}
              onChangeText={(t) => {
                setDraft(t);
                if (sendError) setSendError(null);
              }}
              placeholder={COMMENT_PLACEHOLDER}
              accessibilityLabel={COMMENT_PLACEHOLDER}
              ground={fieldGround}
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
        </View>
      }
    >
      {section === "loading" ? (
        <View style={styles.center}>
          <Spinner size={44} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.meta}>{"Couldn't load comments"}</Text>
        </View>
      ) : section === "empty" ? (
        <View style={styles.center}>
          <Text style={styles.meta}>{COMMENTS_EMPTY}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={rows}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => {
            const parts = commentRowParts({
              displayName: item.display_name,
              username: item.username,
              createdAt: item.created_at,
              text: item.text,
              formatTime: relativeTime,
            });
            const longPress = commentLongPressAction(user?.id, item.user_id);
            return (
              <View>
                <Pressable
                  onLongPress={longPress === "report" ? () => setReportTargetId(item.id) : undefined}
                  delayLongPress={450}
                  accessible={false}
                >
                  <CommentRow
                    displayName={parts.name}
                    time={parts.time}
                    body={parts.body}
                    avatarUri={item.avatar_url}
                    onPressAuthor={() => openAuthor(item)}
                  />
                </Pressable>
                {reportTargetId === item.id ? (
                  <View style={styles.reportBar}>
                    <Text style={styles.reportMuted}>{REPORT_COMMENT_PROMPT}</Text>
                    <Pressable
                      onPress={() => setReportTargetId(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel report"
                    >
                      <Text style={styles.reportMuted}>{CANCEL_REPORT_LABEL}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setReportTargetId(null);
                        reportComment.report(item.id);
                      }}
                      disabled={reportComment.pending}
                      accessibilityRole="button"
                      accessibilityLabel={REPORT_COMMENT_LABEL}
                    >
                      <Text style={styles.reportConfirm}>Report</Text>
                    </Pressable>
                  </View>
                ) : null}
                {index < rows.length - 1 ? <Divider /> : null}
              </View>
            );
          }}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    maxHeight: DS_V3.space.xs * 90,
    marginHorizontal: -DS_V3.space.gutter,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_V3.space.section,
  },
  meta: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.sm,
  },
  note: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingBottom: DS_V3.space.sm,
  },
  noteError: {
    color: DS_V3.color.danger,
  },
  reportBar: {
    flexDirection: "row",
    gap: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.lg,
  },
  reportMuted: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  reportConfirm: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
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
    backgroundColor: DS_V3.color.canvas,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  sendArmed: {
    backgroundColor: DS_V3.color.primary,
  },
});
